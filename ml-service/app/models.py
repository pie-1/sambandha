"""Training and prediction for the three Sambandh health models (scikit-learn).

Mirrors the semantics of the Node reference implementations in
server/services/ml/ so the app can switch engines transparently:
  - success  : logistic regression, standardized features, holdout metrics
  - impact   : per-program linear regression (budget, remoteness -> coverage gain)
  - claims   : multiple linear regression on demographics -> annual claim cost
"""

import json
import math
import os
import time

import joblib
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import log_loss, mean_absolute_error, mean_squared_error, r2_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from .data import CLAIM_FEATURES, HEALTH_PROGRAMS, POLICY_FEATURES, PROVINCE_HEALTH

ENGINE = "sklearn-python"
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

HOLDOUT_SEED = 20260412
POLICY_EVALUATION_EPOCHS = 4000
CLAIMS_EPOCHS = 6000


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


class _ModelStore:
    """In-memory trained models + JSON metadata, persisted to disk with joblib."""

    def __init__(self):
        self.policy = None  # {scaler, model, meta}
        self.impact = None  # {programs: [{program, scaler, model, meta}]}
        self.claims = None  # {scaler, model, meta}
        self.projects = []  # development ledger pushed at /train

    @property
    def trained(self):
        return self.policy is not None and self.impact is not None and self.claims is not None

    def load_from_disk(self):
        try:
            path = os.path.join(MODELS_DIR, "models.joblib")
            with open(path, "rb") as fh:
                data = joblib.load(fh)
            self.policy, self.impact, self.claims = data[:3]
            self.projects = data[3] if len(data) > 3 else []
            return True
        except Exception:
            return False

    def save_to_disk(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        path = os.path.join(MODELS_DIR, "models.joblib")
        with open(path, "wb") as fh:
            joblib.dump((self.policy, self.impact, self.claims, self.projects), fh)
        meta_path = os.path.join(MODELS_DIR, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as fh:
            json.dump(self.metadata(), fh, indent=2)

    def metadata(self):
        if not self.trained:
            return {"engine": ENGINE, "trained": False}
        return {
            "engine": ENGINE,
            "trained": True,
            "trainedAt": self.policy["meta"].get("trainedAt"),
            "models": {
                "success": {
                    "sampleSize": self.policy["meta"]["sampleSize"],
                    "accuracy": round(self.policy["meta"]["holdout"]["accuracy"], 3),
                    "auc": round(self.policy["meta"]["holdout"]["auc"], 3),
                    "finalLoss": round(self.policy["meta"]["finalLoss"], 4),
                    "epochs": POLICY_EVALUATION_EPOCHS,
                },
                "impact": {
                    "sampleSize": self.impact["meta"]["sampleSize"],
                    "r2": self.impact["meta"]["r2"],
                    "marginalPerCrore": self.impact["meta"]["marginalPerCrore"],
                    "mae": self.impact["meta"]["mae"],
                },
                "claims": {
                    "sampleSize": self.claims["meta"]["sampleSize"],
                    "r2": self.claims["meta"]["r2"],
                    "mae": self.claims["meta"]["mae"],
                    "finalLoss": self.claims["meta"]["finalLoss"],
                    "epochs": CLAIMS_EPOCHS,
                },
            },
            "development": {"datasetSize": len(self.projects)},
        }


store = _ModelStore()


def _standardize(fit_rows):
    scaler = StandardScaler()
    scaler.fit(np.asarray(fit_rows, dtype=float))
    return scaler


# ---------------------------------------------------------------- success model

def train_policy(records):
    keys = [f["key"] for f in POLICY_FEATURES]
    X = np.asarray([[r[k] for k in keys] for r in records], dtype=float)
    y = np.asarray([r["success"] for r in records], dtype=float)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=HOLDOUT_SEED, stratify=y if len(set(y)) > 1 else None
    )

    scaler = _standardize(X_train)
    model = LogisticRegression(max_iter=POLICY_EVALUATION_EPOCHS, C=25.0, solver="lbfgs", random_state=HOLDOUT_SEED)
    model.fit(scaler.transform(X_train), y_train)

    train_proba = model.predict_proba(scaler.transform(X_train))[:, 1]
    final_loss = float(log_loss(y_train, train_proba, labels=[0, 1]))

    val_proba = model.predict_proba(scaler.transform(X_val))[:, 1]
    val_pred = (val_proba >= 0.5).astype(int)
    holdout_accuracy = float((val_pred == y_val).mean())
    holdout_auc = float(roc_auc_score(y_val, val_proba)) if len(set(y_val)) > 1 else 0.5

    meta = {
        "sampleSize": len(records),
        "finalLoss": final_loss,
        "epochs": POLICY_EVALUATION_EPOCHS,
        "baseRate": float(y.mean()),
        "holdout": {"accuracy": holdout_accuracy, "auc": holdout_auc, "size": len(y_val)},
        "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "scalerMeans": scaler.mean_.tolist(),
        "scalerStds": scaler.scale_.tolist(),
        "coefficients": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
    }
    store.policy = {"scaler": scaler, "model": model, "meta": meta}
    return store.policy


def predict_policy(inputs):
    m = store.policy
    if m is None:
        raise RuntimeError("Policy model not trained — call /train first")
    keys = [f["key"] for f in POLICY_FEATURES]
    x = m["scaler"].transform(np.asarray([[inputs[k] for k in keys]], dtype=float))[0]
    probability = float(m["model"].predict_proba([x])[0][1])
    prediction = "High" if probability >= 0.5 else "Low"
    intercept = m["meta"]["intercept"]
    coefficients = m["meta"]["coefficients"]

    drivers = []
    for j, f in enumerate(POLICY_FEATURES):
        impact = coefficients[j] * x[j]
        drivers.append({
            "key": f["key"],
            "label": f["label"],
            "value": inputs[f["key"]],
            "coefficient": round(coefficients[j], 3),
            "impact": round(impact, 3),
            "direction": "positive" if impact >= 0 else "negative",
            "interpretation": f["direction"],
        })
    drivers.sort(key=lambda d: abs(d["impact"]), reverse=True)

    return {
        "probability": round(probability, 3),
        "prediction": prediction,
        "drivers": drivers,
        "coefficients": [{"key": f["key"], "label": f["label"], "value": round(coefficients[j], 3)} for j, f in enumerate(POLICY_FEATURES)],
        "holdout": m["meta"]["holdout"],
        "sampleSize": m["meta"]["sampleSize"],
        "finalLoss": round(m["meta"]["finalLoss"], 4),
        "epochs": m["meta"]["epochs"],
        "baseRate": round(m["meta"]["baseRate"], 3),
    }


# ---------------------------------------------------------------- impact model

def train_impact(records):
    program_models = []
    for program in HEALTH_PROGRAMS:
        rows = [r for r in records if r.get("program") == program]
        if len(rows) < 5:
            continue
        X = np.asarray([[r["budget"], r["remoteShare"]] for r in rows], dtype=float)
        y = np.asarray([r["gain"] for r in rows], dtype=float)
        scaler = _standardize(X)
        model = LinearRegression()
        model.fit(scaler.transform(X), y)
        preds = model.predict(scaler.transform(X))
        marginal_per_crore = float(model.coef_[0] / scaler.scale_[0])
        program_models.append({
            "program": program,
            "scaler": scaler,
            "model": model,
            "meta": {
                "marginalPerCrore": round(marginal_per_crore, 3),
                "r2": round(float(r2_score(y, preds)), 3),
                "mae": round(float(mean_absolute_error(y, preds)), 2),
                "sampleSize": len(rows),
                "finalLoss": round(float(mean_squared_error(y, preds)), 3),
                "intercept": float(model.intercept_),
                "coefficients": model.coef_.tolist(),
                "scalerMeans": scaler.mean_.tolist(),
                "scalerStds": scaler.scale_.tolist(),
            },
        })

    avg = lambda key: sum(pm["meta"][key] for pm in program_models) / len(program_models)
    store.impact = {
        "programs": program_models,
        "meta": {
            "sampleSize": len(records),
            "r2": round(avg("r2"), 3),
            "mae": round(avg("mae"), 2),
            "marginalPerCrore": round(avg("marginalPerCrore"), 3),
            "finalLoss": round(avg("finalLoss"), 3),
            "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
    }
    return store.impact


def _project_coverage(program, budget, province):
    m = store.impact
    if m is None:
        raise RuntimeError("Impact model not trained — call /train first")
    base = PROVINCE_HEALTH[province]
    pm = next(pm for pm in m["programs"] if pm["program"] == program)
    z = (np.asarray([[budget, base["remote"]]], dtype=float) - np.asarray(pm["meta"]["scalerMeans"])) / np.asarray(pm["meta"]["scalerStds"])
    predicted_gain = float(pm["model"].predict(z)[0])
    projected = _clamp(base["coverage"] + predicted_gain, 20, 99)
    return {
        "program": program,
        "budget": budget,
        "baselineCoverage": round(float(base["coverage"]), 1),
        "remoteShare": round(float(base["remote"]), 1),
        "currentCoverage": round(float(base["coverage"]), 1),
        "projectedCoverage": round(projected, 1),
        "marginalPerCrore": pm["meta"]["marginalPerCrore"],
        "programR2": pm["meta"]["r2"],
    }


def predict_impact(province, budget):
    m = store.impact
    if m is None:
        raise RuntimeError("Impact model not trained — call /train first")
    programs = [_project_coverage(p, budget, province) for p in HEALTH_PROGRAMS]
    for p in programs:
        p["gain"] = round(p["projectedCoverage"] - p["currentCoverage"], 1)
    programs.sort(key=lambda p: p["gain"], reverse=True)
    return {
        "programs": programs,
        "best": programs[0] if programs else None,
        "model": {k: v for k, v in m["meta"].items() if k != "trainedAt"},
    }


# ---------------------------------------------------------------- claims model

def train_claims(records):
    keys = [f["key"] for f in CLAIM_FEATURES]
    X = np.asarray([[r[k] for k in keys] for r in records], dtype=float)
    y = np.asarray([r["claim"] for r in records], dtype=float)
    scaler = _standardize(X)
    model = LinearRegression()
    model.fit(scaler.transform(X), y)
    preds = model.predict(scaler.transform(X))
    store.claims = {
        "scaler": scaler,
        "model": model,
        "meta": {
            "sampleSize": len(records),
            "r2": round(float(r2_score(y, preds)), 3),
            "mae": round(float(mean_absolute_error(y, preds)), 0),
            "finalLoss": round(float(mean_squared_error(y, preds)), 2),
            "epochs": CLAIMS_EPOCHS,
            "intercept": float(model.intercept_),
            "coefficients": model.coef_.tolist(),
            "scalerMeans": scaler.mean_.tolist(),
            "scalerStds": scaler.scale_.tolist(),
            "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
    }
    return store.claims


def predict_claims(inputs):
    m = store.claims
    if m is None:
        raise RuntimeError("Claims model not trained — call /train first")
    keys = [f["key"] for f in CLAIM_FEATURES]
    x = m["scaler"].transform(np.asarray([[inputs[k] for k in keys]], dtype=float))[0]
    forecast = float(m["model"].predict([x])[0])
    intercept = m["meta"]["intercept"]
    coefficients = m["meta"]["coefficients"]

    breakdown = []
    for j, f in enumerate(CLAIM_FEATURES):
        breakdown.append({
            "key": f["key"],
            "label": f["label"],
            "value": inputs[f["key"]],
            "contribution": round(coefficients[j] * x[j], 0),
        })
    breakdown.sort(key=lambda b: abs(b["contribution"]), reverse=True)

    risk = "High" if forecast >= 400000 else "Elevated" if forecast >= 220000 else "Moderate" if forecast >= 120000 else "Low"

    return {
        "forecast": round(forecast),
        "risk": risk,
        "baseline": round(intercept),
        "breakdown": breakdown,
        "model": {
            "r2": m["meta"]["r2"],
            "mae": m["meta"]["mae"],
            "sampleSize": m["meta"]["sampleSize"],
            "finalLoss": m["meta"]["finalLoss"],
            "epochs": m["meta"]["epochs"],
        },
    }


def train_all(policy_records, budget_records, claim_records):
    train_policy(policy_records)
    train_impact(budget_records)
    train_claims(claim_records)
    store.save_to_disk()
    return store.metadata()
