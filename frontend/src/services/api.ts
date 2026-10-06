import type { AnalysisResult, HealthStatus, IncidentRecord, SampleScenario } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to reach backend health endpoint');
  return res.json();
}

export async function fetchSamples(): Promise<SampleScenario[]> {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to load sample scenarios');
  return res.json();
}

export async function analyzeLogs(
  rawLogs: string, 
  contextNotes?: string, 
  incidentTitle?: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_logs: rawLogs,
      context_notes: contextNotes || undefined,
      incident_title: incidentTitle || undefined
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Analysis failed. Please verify input logs.');
  }
  return res.json();
}

export async function saveIncidentToDb(
  title: string,
  rawLogs: string,
  analysis: AnalysisResult
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      raw_logs: rawLogs,
      analysis,
      status: 'New'
    })
  });
  if (!res.ok) throw new Error('Failed to save incident record');
  return res.json();
}

export async function fetchIncidents(search?: string, severity?: string): Promise<IncidentRecord[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  
  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incident history');
  const data = await res.json();
  return data.incidents;
}

export async function fetchIncidentDetail(id: string): Promise<IncidentRecord> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident details');
  return res.json();
}

export async function updateIncidentStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update incident status');
}

export async function deleteIncidentFromDb(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/incidents/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete incident');
}
