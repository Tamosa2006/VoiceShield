# VoiceShield: AI-Powered Security Incident Investigation Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)

**VoiceShield** is a cybersecurity incident investigation assistant designed for the **HackerHouse Goa shortlisting task**. It transforms raw, chaotic security logs into clear, actionable intelligence within seconds.

Security analysts and developers paste raw security logs (or speak context via voice), and VoiceShield correlates indicators of compromise (IOCs), maps threats to the **MITRE ATT&CK** framework, calculates risk scores, and generates step-by-step mitigation playbooks with an interactive checklist and an AI-spoken voice briefing.

---

## Key Features

1. **Automated Threat Detection & MITRE ATT&CK Mapping**
   - Accurately classifies multi-stage threats: SSH credential brute-forcing & root privilege escalation, SQL injection exfiltration, AWS IAM abuse, Log4Shell (CVE-2021-44228), and endpoint ransomware activity.
   - Maps detected behaviors to specific MITRE tactics (e.g. `T1110.001`, `T1190`, `T1078.004`, `T1490`).

2. **Risk Scoring & Severity Assessment**
   - Dynamic 0–100 numerical risk gauge and color-coded severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - Confidence scoring based on telemetry corroboration.

3. **Supporting Evidence & Extracted IOCs**
   - High-speed regex and heuristic extraction of attacker IPv4 addresses, affected accounts, malicious payload signatures, and offending log lines.

4. **Recommended Response Playbooks & Interactive Checklist**
   - Prioritized containment, investigation, remediation, and hardening steps.
   - One-click copyable terminal remediation commands (e.g., `iptables -I INPUT -s <IP> -j DROP`, `aws iam update-access-key ...`).
   - Interactive checkboxes allowing analysts to track triage progress.

5. **AI Audio Incident Briefing (TTS Voice Assistant)**
   - Built-in speech synthesis generates an audio briefing of the security event, tailored for rapid incident triage (inspired by Wispr Flow's voice-first philosophy).
   - Voice dictation microphone to record spoken analyst notes and hypotheses alongside raw logs.

6. **100% Reliable Offline Fallback Engine**
   - Supports external LLM providers (**Google Gemini** and **OpenAI**) via `.env`.
   - **Zero-Friction Fallback**: If no API key is provided or the network is unavailable, VoiceShield's built-in heuristic security engine provides immediate, realistic analysis.

7. **Local Incident Vault (SQLite)**
   - Persistent local database storage for investigations.
   - Search past incidents, filter by severity, update triage statuses (`New` → `Investigating` → `Contained` → `Resolved`), and reload past telemetry into the console with a single click.

8. **Report Export**
   - One-click export to formatted Markdown or JSON incident reports ready for ticketing or compliance audits.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VoiceShield Frontend                     │
│    (React 19 + Vite + Tailwind CSS + Lucide + Web Speech)   │
│  - Cyber SOC Dark Theme (Slate/Neon)                        │
│  - 1-Click Pre-canned Incident Loader (5 Scenarios)         │
│  - Raw Log Editor with syntax highlighting & line count     │
│  - Severity Meter (0-100), Threat Badge & Confidence Gauge  │
│  - MITRE ATT&CK Mapping & Extracted IOCs (IPs, URIs, Users) │
│  - Interactive Remediation Checklist & Report Exporter      │
│  - AI Audio Incident Briefing (TTS Voice Assistant)         │
│  - Incident History & Triage Status Drawer                  │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / JSON                  │
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                    VoiceShield Backend                      │
│            (FastAPI + Python 3.14 + SQLite3)                │
│  - REST API (/api/analyze, /api/incidents, /api/samples)    │
│  - Dual Analysis Engine:                                    │
│      ├── Primary: LLM Analyzer (OpenAI / Gemini / Anthropic)│
│      └── Fallback: Rule & Regex Security Heuristic Engine   │
│  - SQLite Database (Local persistence for past incidents)   │
│  - IOC Extractor (Regex for IPv4, SHA256, CVEs, UserAgents) │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start (1-Click Run)

### Prerequisites
- **Python 3.10+** (Python 3.14 fully supported)
- **Node.js 18+** and `npm`

### Windows (1-Click Launcher)
Double-click `start.bat` or run:
```cmd
start.bat
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

---

## Manual Step-by-Step Setup

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API docs are accessible at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend SOC Console will be running at: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)*

---

## Configuration (`.env`)

VoiceShield works out of the box with zero configuration in Fallback Engine mode. To enable external LLM analysis:

```env
# Optional: OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional: Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

---

## Pre-Packaged Demo Scenarios (1-Click Presets)

VoiceShield includes 5 built-in, realistic security incident log presets for demonstration:

1. **SSH Credential Stuffing & Priv-Escalation**: Multi-IP failed password attempts followed by successful auth as `deploy` and sudo execution.
2. **SQL Injection & Database Schema Exfiltration**: Web server access logs containing `UNION SELECT`, `information_schema` table dumps, and credential queries.
3. **AWS CloudTrail IAM Abuse & S3 Exfiltration**: Compromised cloud identity creating backdoor access keys and setting S3 bucket ACL to public read.
4. **Log4Shell JNDI Exploit (CVE-2021-44228)**: Inbound HTTP headers delivering `${jndi:ldap://...}` payloads.
5. **Endpoint Ransomware Activity**: PowerShell encoded execution and `vssadmin delete shadows /all /quiet` execution.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, active LLM provider, and SQLite status |
| `GET` | `/api/samples` | List 5 ready-to-run incident log presets |
| `POST` | `/api/analyze` | Ingests raw logs & analyst context, returns full investigation findings |
| `POST` | `/api/incidents` | Persists an investigation to the SQLite incident vault |
| `GET` | `/api/incidents` | Lists saved incidents with optional search & severity filtering |
| `GET` | `/api/incidents/{id}` | Retrieves full incident record and analysis telemetry |
| `PATCH` | `/api/incidents/{id}/status` | Updates triage status (`New`, `Investigating`, `Contained`, `Resolved`) |
| `DELETE` | `/api/incidents/{id}` | Deletes incident record from SQLite |

---

## Verification & Testing

To run the automated backend test suite (testing SQLite CRUD, 5 incident scenarios, and fallback reliability):

```bash
python -m backend.test_backend
```

To verify the frontend build:
```bash
cd frontend
npm run build
```
