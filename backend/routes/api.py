import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..models import (
    AnalyzeRequest, 
    AnalysisResult, 
    IncidentSaveRequest, 
    StatusUpdateRequest,
    SampleScenario
)
from ..services.llm_analyzer import analyze_logs
from ..services.samples import get_sample_scenarios
from ..database import (
    save_incident, 
    get_incidents, 
    get_incident, 
    update_incident_status, 
    delete_incident
)
from ..config import settings

router = APIRouter(prefix="/api")

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "VoiceShield SOC Assistant",
        "llm_provider": (
            "OpenAI" if settings.has_openai else 
            "Google Gemini" if settings.has_gemini else 
            "Offline Heuristic Engine (100% Reliable Demo Mode)"
        ),
        "llm_active": settings.has_any_llm,
        "database": "SQLite (Ready)"
    }

@router.get("/samples", response_model=List[SampleScenario])
async def list_samples():
    return get_sample_scenarios()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_security_logs(request: AnalyzeRequest):
    if not request.raw_logs or len(request.raw_logs.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please provide valid security logs to investigate.")
    
    result = await analyze_logs(request.raw_logs, request.context_notes)
    return result

@router.post("/incidents")
async def create_saved_incident(request: IncidentSaveRequest):
    incident_id = request.id or f"inc-{uuid.uuid4().hex[:8]}"
    
    incident_data = {
        "id": incident_id,
        "title": request.title,
        "threat_type": request.analysis.threat_type,
        "severity": request.analysis.severity,
        "risk_score": request.analysis.risk_score,
        "confidence": request.analysis.confidence,
        "summary": request.analysis.summary,
        "raw_logs": request.raw_logs,
        "source": request.analysis.source,
        "status": request.status or "New",
        "analysis": request.analysis.model_dump()
    }
    
    saved = save_incident(incident_data)
    return {"message": "Incident saved successfully", "id": incident_id, "data": saved}

@router.get("/incidents")
async def list_saved_incidents(
    search: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    incidents = get_incidents(search=search, severity=severity, limit=limit)
    return {"incidents": incidents, "count": len(incidents)}

@router.get("/incidents/{incident_id}")
async def get_incident_detail(incident_id: str):
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found")
    return incident

@router.patch("/incidents/{incident_id}/status")
async def update_status(incident_id: str, request: StatusUpdateRequest):
    allowed_statuses = ["New", "Investigating", "Contained", "Resolved", "False Positive"]
    if request.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed_statuses}")
        
    updated = update_incident_status(incident_id, request.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident record not found")
    return {"message": "Status updated successfully", "status": request.status}

@router.delete("/incidents/{incident_id}")
async def delete_saved_incident(incident_id: str):
    deleted = delete_incident(incident_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Incident record not found")
    return {"message": "Incident deleted successfully"}
