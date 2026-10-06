import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from .config import settings

def get_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            confidence INTEGER NOT NULL,
            summary TEXT NOT NULL,
            raw_logs TEXT NOT NULL,
            source TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            analysis_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_incidents_created_at 
        ON incidents(created_at DESC)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_incidents_severity 
        ON incidents(severity)
    """)
    conn.commit()
    conn.close()

def save_incident(incident: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    created_at = incident.get("created_at") or datetime.now(timezone.utc).isoformat()
    analysis_json = json.dumps(incident.get("analysis", {}))
    
    cursor.execute("""
        INSERT INTO incidents (
            id, title, threat_type, severity, risk_score, confidence,
            summary, raw_logs, source, status, analysis_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident["id"],
        incident.get("title", "Security Incident"),
        incident["threat_type"],
        incident["severity"],
        incident["risk_score"],
        incident["confidence"],
        incident["summary"],
        incident["raw_logs"],
        incident.get("source", "fallback_heuristic"),
        incident.get("status", "New"),
        analysis_json,
        created_at
    ))
    conn.commit()
    conn.close()
    return incident

def get_incidents(
    search: Optional[str] = None, 
    severity: Optional[str] = None, 
    limit: int = 50
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT id, title, threat_type, severity, risk_score, confidence, summary, source, status, created_at FROM incidents WHERE 1=1"
    params = []
    
    if severity and severity.upper() != "ALL":
        query += " AND UPPER(severity) = ?"
        params.append(severity.upper())
        
    if search:
        query += " AND (title LIKE ? OR threat_type LIKE ? OR summary LIKE ?)"
        like_search = f"%{search}%"
        params.extend([like_search, like_search, like_search])
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    data = dict(row)
    try:
        data["analysis"] = json.loads(data["analysis_json"])
    except Exception:
        data["analysis"] = {}
    return data

def update_incident_status(incident_id: str, status: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE incidents SET status = ? WHERE id = ?", (status, incident_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def delete_incident(incident_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM incidents WHERE id = ?", (incident_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected
