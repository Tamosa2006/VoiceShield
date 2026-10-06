import json
import logging
import httpx
from typing import Optional
from ..config import settings
from ..models import AnalysisResult, EvidenceItem, ResponseAction
from .fallback_analyzer import analyze_logs_heuristically

logger = logging.getLogger("voiceshield.analyzer")

ANALYSIS_SYSTEM_PROMPT = """You are VoiceShield, an elite AI cybersecurity incident investigation assistant in a Security Operations Center (SOC).
Analyze the provided security logs and return a structured JSON object with the following schema:

{
  "risk_score": integer (0 to 100),
  "severity": string (must be exactly one of: "CRITICAL", "HIGH", "MEDIUM", "LOW"),
  "threat_type": string (concise name of detected threat, e.g. "Distributed SSH Brute Force", "SQL Injection Data Exfiltration", "AWS IAM Privilege Escalation", "Ransomware Activity"),
  "mitre_attack": list of strings (e.g. ["T1110.001 - Password Guessing", "T1078 - Valid Accounts"]),
  "confidence": integer (0 to 100, confidence percentage in analysis),
  "summary": string (clear 2-4 sentence executive summary of what happened, attacker actions, and potential impact),
  "voice_briefing_script": string (concise 2-3 sentence verbal briefing meant to be spoken aloud by a SOC voice assistant, starting with 'Alert: ...' or 'Investigation Briefing: ...'),
  "evidence": [
    {
      "ioc_type": string (e.g. "Attacker IP", "Compromised Account", "Malicious Payload", "CVE"),
      "value": string (the exact IP, hash, user, or payload),
      "description": string (why this is significant),
      "severity": string ("CRITICAL", "HIGH", "MEDIUM", or "LOW"),
      "raw_line": string or null (matching snippet or line number from log)
    }
  ],
  "response_actions": [
    {
      "step": integer (1, 2, 3...),
      "title": string (short action title),
      "category": string ("Containment", "Investigation", "Remediation", or "Hardening"),
      "description": string (actionable instructions for the security engineer),
      "priority": string ("Immediate", "High", "Medium", or "Low"),
      "command": string or null (ready-to-run CLI/bash/PowerShell command to remediate or block if applicable)
    }
  ]
}

Respond ONLY with valid JSON. Do not include markdown code block backticks."""

async def analyze_logs(logs: str, context_notes: Optional[str] = None) -> AnalysisResult:
    # Try OpenAI if configured
    if settings.has_openai:
        try:
            result = await _call_openai(logs, context_notes)
            if result:
                return result
        except Exception as e:
            logger.warning(f"OpenAI call failed, falling back to heuristic: {e}")

    # Try Gemini if configured
    if settings.has_gemini:
        try:
            result = await _call_gemini(logs, context_notes)
            if result:
                return result
        except Exception as e:
            logger.warning(f"Gemini call failed, falling back to heuristic: {e}")

    # Default to heuristic analyzer
    return analyze_logs_heuristically(logs, context_notes)


async def _call_openai(logs: str, context_notes: Optional[str]) -> Optional[AnalysisResult]:
    user_content = f"SECURITY LOGS TO ANALYZE:\n{logs}"
    if context_notes:
        user_content += f"\n\nANALYST NOTES / CONTEXT:\n{context_notes}"

    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            parsed["source"] = f"llm:{settings.OPENAI_MODEL}"
            return AnalysisResult(**parsed)
    return None


async def _call_gemini(logs: str, context_notes: Optional[str]) -> Optional[AnalysisResult]:
    user_content = f"{ANALYSIS_SYSTEM_PROMPT}\n\nSECURITY LOGS TO ANALYZE:\n{logs}"
    if context_notes:
        user_content += f"\n\nANALYST NOTES / CONTEXT:\n{context_notes}"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": user_content}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean possible markdown wrapping
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            parsed["source"] = f"llm:{settings.GEMINI_MODEL}"
            return AnalysisResult(**parsed)
    return None
