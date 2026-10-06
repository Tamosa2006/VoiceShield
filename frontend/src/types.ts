export interface EvidenceItem {
  ioc_type: string;
  value: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  raw_line?: string | null;
}

export interface ResponseAction {
  step: number;
  title: string;
  category: 'Containment' | 'Investigation' | 'Remediation' | 'Hardening' | string;
  description: string;
  priority: 'Immediate' | 'High' | 'Medium' | 'Low' | string;
  command?: string | null;
}

export interface AnalysisResult {
  risk_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threat_type: string;
  mitre_attack: string[];
  confidence: number;
  summary: string;
  voice_briefing_script: string;
  evidence: EvidenceItem[];
  response_actions: ResponseAction[];
  source: string;
}

export interface SampleScenario {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  logs: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  threat_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  confidence: number;
  summary: string;
  source: string;
  status: 'New' | 'Investigating' | 'Contained' | 'Resolved' | 'False Positive';
  created_at: string;
  raw_logs?: string;
  analysis?: AnalysisResult;
}

export interface HealthStatus {
  status: string;
  service: string;
  llm_provider: string;
  llm_active: boolean;
  database: string;
}
