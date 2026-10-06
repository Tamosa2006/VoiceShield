from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    raw_logs: str = Field(..., min_length=5, description="Raw security logs to analyze")
    context_notes: Optional[str] = Field(None, description="Optional notes or voice dictation from analyst")
    incident_title: Optional[str] = Field(None, description="Optional title or tag")

class EvidenceItem(BaseModel):
    ioc_type: str = Field(..., description="e.g. IP Address, User Account, Payload, CVE, Command")
    value: str = Field(..., description="The exact indicator or entity value")
    description: str = Field(..., description="Why this evidence is suspicious or significant")
    severity: str = Field(default="HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    raw_line: Optional[str] = Field(None, description="Excerpt from the log where this occurred")

class ResponseAction(BaseModel):
    step: int = Field(..., description="Step order in triage sequence")
    title: str = Field(..., description="Short action summary")
    category: str = Field(default="Containment", description="Containment, Investigation, Remediation, Hardening")
    description: str = Field(..., description="Detailed instructions for the security engineer")
    priority: str = Field(default="High", description="Immediate, High, Medium, Low")
    command: Optional[str] = Field(None, description="Terminal / CLI command to execute if applicable")

class AnalysisResult(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Overall risk score 0 to 100")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    threat_type: str = Field(..., description="Specific detected threat classification")
    mitre_attack: List[str] = Field(default_factory=list, description="MITRE ATT&CK technique IDs and names")
    confidence: int = Field(..., ge=0, le=100, description="Confidence percentage")
    summary: str = Field(..., description="Executive plain-English investigation summary")
    voice_briefing_script: str = Field(..., description="Short spoken audio script for the SOC voice briefing")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Extracted indicators and evidence")
    response_actions: List[ResponseAction] = Field(default_factory=list, description="Prioritized mitigation playbook")
    source: str = Field(default="heuristic_engine", description="LLM model or fallback heuristic engine used")

class IncidentSaveRequest(BaseModel):
    id: Optional[str] = None
    title: str
    raw_logs: str
    analysis: AnalysisResult
    status: Optional[str] = "New"

class StatusUpdateRequest(BaseModel):
    status: str

class SampleScenario(BaseModel):
    id: str
    name: str
    badge: str
    category: str
    description: str
    logs: str
