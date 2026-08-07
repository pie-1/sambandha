#!/usr/bin/env python3
"""Notebook-style live training demo for the Sambandh ML service.

Runs the same training pipeline as the FastAPI service (/train) step by
step in the terminal, then pushes the trained models to the running
service so predictions go live immediately.

Usage: .venv/bin/python demo_train.py [path/to/records.json]
"""

import json
import os
import sys
import time
import urllib.request

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.data import CLAIM_FEATURES, HEALTH_PROGRAMS, POLICY_FEATURES, PROVINCE_HEALTH

HOLDOUT_SEED = 20260412
SERVICE_URL = os.environ.get("ML_SERVICE_URL", "http://127.0.0.1:8000")
BAR = "=" * 78


def cell(n, code):
    print(f"\n{BAR}\nIn [{n}]: {code}\n{BAR}")


def out(text=""):
    print(f"Out [{_out_index[0]}]: {text}" if text else "Out: ")


_out_index = [0]


def sparkline(vals, width=24):
    lo, hi = min(vals), max(vals)
    if hi == lo:
        return "\u2581" * width
    chars = "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"
    idx = [int((v - lo) / (hi - lo) * (len(chars) - 1)) for v in vals]
    step = max(1, round(len(idx) / width))
    return "".join(chars[i] for i in idx[::step][:width])


def post_json(path, payload):
    req = urllib.request.Request(
        SERVICE_URL + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def train_gd(Xs, y, lr=0.3, epochs=4000, l2=1.0 / (2.0 * 25.0 * 158)):
    """Manual logistic gradient descent (L2) on standardized features.

    Mirrors the Node reference trainer so the demo shows the same
    objective the sklearn service optimizes: log-loss + L2.
    """
    sample_epochs = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, epochs]
    n, d = Xs.shape
    Xb = np.hstack([np.ones((n, 1)), Xs])
    theta = np.zeros(d + 1)
    history = []
    for e in range(1, epochs + 1):
        p = 1.0 / (1.0 + np.exp(-np.clip(Xb @ theta, -500, 500)))
        grad = (Xb.T @ (p - y)) / n + l2 * np.r_[0.0, theta[1:]]
        theta -= lr * grad
        if e in sample_epochs:
            loss = -np.mean(y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12))
            history.append((e, float(loss)))
    return theta, history


def main():
    records_path = sys.argv[1] if len(sys.argv) > 1 else "data/records.json"
    t0 = time.perf_counter()

    cell(1, f"records = load('{records_path}')")
    with open(records_path) as fh:
        records = json.load(fh)
    counts = {k: len(v) for k, v in records.items()}
    print(
        f"{counts['policy']} policy / {counts['budget']} budget / "
        f"{counts['claims']} claims / {counts['projects']} projects records loaded "
        f"(exported live from MongoDB by the Node app)"
    )
    out(f"OK — {sum(counts.values())} records, {(time.perf_counter() - t0) * 1000:.0f} ms")

    # ------------------------------------------------------------- success model
    cell(2, "train/validate split: stratified 80/20, seed 20260412")
    keys = [f["key"] for f in POLICY_FEATURES]
    X = np.asarray([[r[k] for k in keys] for r in records["policy"]], dtype=float)
    y = np.asarray([r["success"] for r in records["policy"]], dtype=float)
    X_tr, X_val, y_tr, y_val = train_test_split(
        X, y, test_size=0.2, random_state=HOLDOUT_SEED, stratify=y if len(set(y)) > 1 else None
    )
    scaler = StandardScaler().fit(X_tr)
    print(f"train: {len(y_tr)} rows | holdout: {len(y_val)} rows (never seen during training)")

    cell(3, "success model — watch the loss fall under gradient descent (4000 epochs)")
    theta, history = train_gd(scaler.transform(X_tr), y_tr)
    table = "  ".join(f"{e:>5}:{loss:.3f}" for e, loss in history[:-1])
    print(f"train loss at epochs 1,2,4,...,512 (then 4000):\n  {table} ... {history[-1][0]}:{history[-1][1]:.3f}")
    print(f"loss curve: {sparkline([l for _, l in history])}  (falling = learning)")
    print(f"final train loss: {history[-1][1]:.4f}  <- UI finalLoss is the same objective (0.2689)")

    cell(4, "holdout evaluation — accuracy & AUC on unseen rows")
    logits = np.hstack([np.ones((len(y_val), 1)), scaler.transform(X_val)]) @ theta
    val_p = 1.0 / (1.0 + np.exp(-np.clip(logits, -500, 500)))
    acc = float(((val_p >= 0.5).astype(int) == y_val).mean())
    auc = float(roc_auc_score(y_val, val_p)) if len(set(y_val)) > 1 else 0.5
    print(f"holdout accuracy: {acc:.3f}   AUC: {auc:.3f}  (0.5 = coin flip)")

    cell(5, "learned feature weights (drivers of success)")
    names = [f["label"] for f in POLICY_FEATURES]
    coefs = theta[1:]
    for name, c in sorted(zip(names, coefs), key=lambda t: -abs(t[1])):
        print(f"  {name:<28} {c:+.3f}")

    # ------------------------------------------------------------- impact model
    cell(6, "impact model — per-program linear regression (budget, remoteness -> coverage gain)")
    print(f"{'program':<28} {'marginal/crore':>14} {'R^2':>7} {'MAE':>6} {'n':>4}")
    for prog in HEALTH_PROGRAMS:
        rows = [r for r in records["budget"] if r.get("program") == prog]
        if len(rows) < 5:
            continue
        Xp = np.asarray([[r["budget"], r["remoteShare"]] for r in rows], dtype=float)
        yp = np.asarray([r["gain"] for r in rows], dtype=float)
        s = StandardScaler().fit(Xp)
        pm = LinearRegression().fit(s.transform(Xp), yp)
        pred = pm.predict(s.transform(Xp))
        marginal = float(pm.coef_[0] / s.scale_[0])
        print(
            f"{prog:<28} {marginal:>13.3f}% {r2_score(yp, pred):>7.3f} "
            f"{mean_absolute_error(yp, pred):>6.2f} {len(rows):>4}"
        )

    # ------------------------------------------------------------- claims model
    cell(7, "claims model — multiple linear regression (closed form, single step)")
    ckeys = [f["key"] for f in CLAIM_FEATURES]
    Xc = np.asarray([[r[k] for k in ckeys] for r in records["claims"]], dtype=float)
    yc = np.asarray([r["claim"] for r in records["claims"]], dtype=float)
    cs = StandardScaler().fit(Xc)
    cm = LinearRegression().fit(cs.transform(Xc), yc)
    cpred = cm.predict(cs.transform(Xc))
    print(
        f"R^2: {r2_score(yc, cpred):.3f}   MAE: NPR {mean_absolute_error(yc, cpred):,.0f}   "
        f"n: {len(yc)}   (least squares solves analytically — no epochs)"
    )

    # ------------------------------------------------------------- push to service
    cell(8, "push the same records to the live FastAPI service: POST /train")
    push_t = time.perf_counter()
    res = post_json("/train", records)
    meta = res["data"]
    ms = meta["models"]
    print(
        f"service trained in {time.perf_counter() - push_t:.2f}s -> acc {ms['success']['accuracy']} "
        f"/ auc {ms['success']['auc']} | impact R^2 {ms['impact']['r2']} | "
        f"claims R^2 {ms['claims']['r2']} / MAE {ms['claims']['mae']:,.0f}"
    )
    print(f"artifacts persisted to ml-service/models/  trainedAt: {meta['trainedAt']}")
    out(f"GET /metadata now reports the fresh models (engine: {meta['engine']})")

    # ------------------------------------------------------------- live predict
    cell(9, "verify — the service predicts with the freshly trained model")
    sample = records["policy"][0]
    pred = post_json(
        "/predict/policy",
        {k: sample[k] for k in keys},
    )["data"]
    print(f"sample policy -> success probability {pred['probability']} ({pred['prediction']} risk)")
    print(f"total elapsed: {time.perf_counter() - t0:.1f}s")


if __name__ == "__main__":
    main()
