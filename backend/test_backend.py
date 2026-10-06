import asyncio
import json
from backend.database import init_db, save_incident, get_incidents, get_incident, update_incident_status, delete_incident
from backend.services.samples import get_sample_scenarios
from backend.services.fallback_analyzer import analyze_logs_heuristically
from backend.services.llm_analyzer import analyze_logs
from backend.models import AnalyzeRequest, IncidentSaveRequest, StatusUpdateRequest

async def run_tests():
    print("=== Testing VoiceShield Backend ===")
    
    # 1. Database Init
    print("\n[1] Initializing SQLite database...")
    init_db()
    print("[OK] SQLite initialized successfully.")

    # 2. Sample Scenarios
    print("\n[2] Checking sample scenarios...")
    samples = get_sample_scenarios()
    assert len(samples) == 5, f"Expected 5 samples, found {len(samples)}"
    for s in samples:
        print(f"  * Found scenario: {s.name} ({s.badge})")
    print("[OK] All sample scenarios validated.")

    # 3. Fallback Heuristic Analysis on each sample
    print("\n[3] Testing heuristic analysis on all 5 scenarios...")
    for s in samples:
        res = analyze_logs_heuristically(s.logs)
        assert res.risk_score >= 0 and res.risk_score <= 100
        assert res.severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        assert len(res.threat_type) > 0
        assert len(res.summary) > 0
        assert len(res.voice_briefing_script) > 0
        assert len(res.evidence) > 0
        assert len(res.response_actions) > 0
        print(f"  [OK] {s.id}: Severity={res.severity}, Risk={res.risk_score}, Conf={res.confidence}%, Threat={res.threat_type}")
    print("[OK] Heuristic analyzer passed all scenario checks.")

    # 4. LLM Analyzer (with fallback)
    print("\n[4] Testing analyze_logs function (graceful fallback)...")
    res = await analyze_logs(samples[0].logs, "Analyst noted suspicious spike in alerts")
    print(f"  [OK] Source: {res.source}, Severity: {res.severity}, Risk: {res.risk_score}")
    assert res.source is not None

    # 5. Database CRUD
    print("\n[5] Testing database persistence...")
    test_id = "test-inc-001"
    save_data = {
        "id": test_id,
        "title": "Automated Test Incident",
        "threat_type": res.threat_type,
        "severity": res.severity,
        "risk_score": res.risk_score,
        "confidence": res.confidence,
        "summary": res.summary,
        "raw_logs": samples[0].logs,
        "source": res.source,
        "status": "New",
        "analysis": res.model_dump()
    }
    save_incident(save_data)
    print(f"  [OK] Saved incident {test_id}")

    fetched = get_incident(test_id)
    assert fetched is not None, "Failed to retrieve saved incident"
    assert fetched["threat_type"] == res.threat_type
    assert "analysis" in fetched
    print("  [OK] Retrieved incident details from SQLite")

    update_incident_status(test_id, "Investigating")
    updated = get_incident(test_id)
    assert updated["status"] == "Investigating"
    print("  [OK] Updated status to 'Investigating'")

    list_res = get_incidents()
    assert any(i["id"] == test_id for i in list_res)
    print(f"  [OK] Listed {len(list_res)} incident(s) in database")

    delete_incident(test_id)
    assert get_incident(test_id) is None
    print(f"  [OK] Deleted incident {test_id}")

    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
