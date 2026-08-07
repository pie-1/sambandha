"""Sambandh ML microservice — FastAPI.

Training pipeline in real Python/scikit-learn; the Node app calls this
service for training data export and inference, and falls back to its
reference JS models when this service is unreachable.

Run:  uv run uvicorn app.main:app --port 8000
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .data import CLAIM_FEATURES, HEALTH_PROGRAMS, POLICY_FEATURES, PROVINCES, PROVINCE_HEALTH, SOURCES
from . import models as ml
from .development import engine as development_engine

app = FastAPI(title="Sambandh ML Service", version="0.1.0")


class TrainRequest(BaseModel):
    policy: list[dict]
    budget: list[dict]
    claims: list[dict]
    projects: list[dict] = []


class PolicyPredictRequest(BaseModel):
    budget: float
    coverageGap: float
    remoteShare: float
    infraIndex: float
    diseaseBurden: float
    priorTrack: float


class ImpactPredictRequest(BaseModel):
    province: str
    budget: float


class ClaimsPredictRequest(BaseModel):
    age: float
    familySize: float
    incomeBand: float
    regionRisk: float
    preExisting: int
    healthIndex: float


class DevelopmentPredictRequest(BaseModel):
    province: str
    sectorName: str
    budget: float


class SectorAnalysisRequest(BaseModel):
    sectorName: str


@app.on_event("startup")
def _load_artifacts():
    if not ml.store.trained:
        ml.store.load_from_disk()
    if not development_engine.trained:
        development_engine.set_dataset(ml.store.projects or [])


@app.get("/")
def root():
    return {
        "service": "sambandha-ml-service",
        "engine": ml.ENGINE,
        "endpoints": ["/health", "/metadata", "/train", "/predict/policy", "/predict/budget", "/predict/claims", "/predict/development", "/sector/analysis"],
        "sources": SOURCES,
    }


@app.get("/health")
def health():
    return {"status": "ok", "engine": ml.ENGINE, "trained": ml.store.trained}


@app.get("/metadata")
def metadata():
    return {"success": True, "data": ml.store.metadata()}


@app.post("/train")
def train(req: TrainRequest):
    if not req.policy or not req.budget or not req.claims:
        raise HTTPException(status_code=400, detail="policy, budget and claims record lists are required")
    try:
        result = ml.train_all(req.policy, req.budget, req.claims)
        if req.projects:
            development_engine.set_dataset(req.projects)
            ml.store.projects = list(req.projects)
            ml.store.save_to_disk()
        result["development"] = {"datasetSize": development_engine.trained and len(development_engine.dataset) or 0}
        return {"success": True, "data": result}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/predict/policy")
def predict_policy(req: PolicyPredictRequest):
    try:
        result = ml.predict_policy(req.model_dump())
        result["engine"] = ml.ENGINE
        return {"success": True, "data": result}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/predict/development")
def predict_development(req: DevelopmentPredictRequest):
    if req.province not in PROVINCES:
        raise HTTPException(status_code=400, detail=f"Unknown province {req.province}")
    try:
        return {"success": True, "data": development_engine.run(req.province, req.sectorName, req.budget)}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/sector/analysis")
def sector_analysis(req: SectorAnalysisRequest):
    try:
        return {"success": True, "data": development_engine.sector_analysis(req.sectorName)}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/predict/budget")
def predict_budget(req: ImpactPredictRequest):
    if req.province not in PROVINCES:
        raise HTTPException(status_code=400, detail=f"Unknown province {req.province}")
    try:
        result = ml.predict_impact(req.province, req.budget)
        result["engine"] = ml.ENGINE
        return {"success": True, "data": result}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/predict/claims")
def predict_claims(req: ClaimsPredictRequest):
    try:
        result = ml.predict_claims(req.model_dump())
        result["engine"] = ml.ENGINE
        return {"success": True, "data": result}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
