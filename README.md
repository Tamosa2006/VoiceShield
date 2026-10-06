# VoiceShield 🛡️ AI-Powered Security Incident Investigation Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)

> Built for the **Hacker House Goa** shortlisting task.

## 🎥 Demo Video



https://github.com/user-attachments/assets/3340015a-b5ad-4513-b5c5-eaa493b81d22



## 📸 Prompt

<img width="800" height="700" alt="image" src="https://github.com/user-attachments/assets/b65b4a86-267f-4bee-b5e8-f17523222042" />


## The Problem

When a company is attacked, its systems produce thousands of log lines. A security analyst has to read them one by one to work out what happened, how serious it is, and what to do next. That is slow, stressful, and easy to get wrong, and the attacker keeps moving while the analyst reads.

## The Solution

**VoiceShield** turns raw security logs into a clear investigation report in seconds. Paste logs (or load a sample incident) and VoiceShield shows:

- the **risk score and severity**
- the **detected threat type**
- the **supporting evidence**
- a **confidence score**
- **recommended response actions**

If the LLM API is unavailable, a built-in fallback engine keeps the app working, so the demo never breaks.

---

## Key Features

1. **Threat detection with MITRE ATT&CK mapping**
   - Handles SSH brute force and privilege escalation, SQL injection, AWS IAM abuse, Log4Shell (CVE-2021-44228), and endpoint ransomware.
   - Maps behaviors to MITRE techniques (for example `T1110.001`, `T1190`, `T1078.004`, `T1490`).

2. **Risk score and severity**
   - 0 to 100 risk score with a donut chart breakdown and severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - Confidence score for each verdict.

3. **Supporting evidence and IOCs**
   - Regex and heuristic extraction of attacker IPs, targeted accounts, payload signatures, and the offending log lines.

4. **Response playbook**
   - Prioritized containment, investigation, remediation, and hardening steps.
   - One-click copyable commands for each step.
   - Interactive checklist to track progress.

5. **Voice Briefing (text-to-speech)**
   - Listen to a spoken summary of the threat instead of reading the full report.
   - Voice dictation for analyst notes, inspired by Wispr Flow's voice-first approach.

6. **Reliable fallback engine**
   - Supports **Google Gemini** and **OpenAI** through `.env`.
   - With no API key or no network, the built-in rule and regex engine produces the analysis instead. The header shows which engine is active.

7. **Incident Vault (SQLite)**
   - Save investigations, search them, filter by severity, update triage status (`New` → `Investigating` → `Contained` → `Resolved`), and reload them in one click.

8. **Report export**
   - Export an incident as Markdown or JSON.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VoiceShield Frontend                     │
│        (React + Vite + Tailwind CSS + GSAP + Web Speech)    │
│  - SOC-style dark dashboard                                 │
│  - 1-click sample incident loader (5 scenarios)             │
│  - Raw log terminal with upload and line count              │
│  - Risk score donut chart, threat wave chart                │
│  - MITRE tags, IOCs, remediation playbook, report export    │
│  - Voice Briefing (TTS) and incident vault table            │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / JSON                  │
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                    VoiceShield Backend                      │
│                 (FastAPI + Python + SQLite)                 │
│  - REST API (/api/analyze, /api/incidents, /api/samples)    │
│  - Dual analysis engine:                                    │
│      ├── Primary: LLM analyzer (OpenAI / Gemini)            │
│      └── Fallback: rule and regex heuristic engine          │
│  - SQLite database for saved incidents                      │
│  - IOC extractor (IPv4, accounts, signatures)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`

### 1. Clone the repo
```bash
git clone https://github.com/Tamosa2006/VoiceShield.git
cd VoiceShield
```

### 2. Backend (run from the project root)
```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs: http://127.0.0.1:8000/docs
Health check: http://127.0.0.1:8000/api/health

> Run this from the **project root**, not from inside `backend/`. The backend uses package imports.

### 3. Frontend (second terminal)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### One-click launchers
- Windows: double-click `start.bat`
- Linux / macOS: `chmod +x start.sh && ./start.sh`

---

## Configuration (`.env`)

Copy `.env.example` to `.env` in the project root. VoiceShield works with **no configuration** in fallback mode. To enable live LLM analysis, add a key:

```env
# Optional: OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional: Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

Never commit your real `.env` file.

---

## How to Use

1. Click a sample scenario card, or click **+ New Incident**, then paste your own logs or upload a `.log` file.
2. Click **Analyze Log Telemetry Now**.
3. Review the risk score, threat type, evidence, confidence, and playbook.
4. Click **Voice Briefing** to hear the summary.
5. Click **Save** to store the incident in the vault.

## Built-in Demo Scenarios

The logs are simulated and written to resemble real attack patterns. They are not data from real organizations.

1. **SSH Credential Stuffing and Priv-Escalation**: failed passwords, then a successful login as `deploy` and sudo to root.
2. **SQL Injection and Schema Exfiltration**: `UNION SELECT` and `information_schema` dumps in web logs.
3. **AWS CloudTrail IAM Abuse**: a backdoor access key and a public S3 bucket policy.
4. **Log4Shell (CVE-2021-44228)**: `${jndi:ldap://...}` payloads in HTTP headers.
5. **Endpoint Ransomware**: encoded PowerShell and `vssadmin delete shadows /all /quiet`.

---

## Built with Wispr Flow 🎙️

For this project, I used **Wispr Flow** as my voice-first workflow. I spoke my ideas, feature requests, and bug reports to my AI coding assistant instead of typing long prompts, which helped me go from idea to a working app much faster.

The same idea shaped the product: VoiceShield's **Voice Briefing** lets a busy analyst *listen* to the threat summary instead of reading the whole report.

## AI-Assisted Development

The prompts I used to plan and build this project, and the follow-up prompts used to redesign and fix it, are in **[PROMPTS.md](PROMPTS.md)**.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, active engine, and SQLite status |
| `GET` | `/api/samples` | List the 5 sample incidents |
| `POST` | `/api/analyze` | Analyze raw logs and analyst context |
| `POST` | `/api/incidents` | Save an investigation to SQLite |
| `GET` | `/api/incidents` | List saved incidents (search and severity filter) |
| `GET` | `/api/incidents/{id}` | Get a full incident record |
| `PATCH` | `/api/incidents/{id}/status` | Update triage status |
| `DELETE` | `/api/incidents/{id}` | Delete an incident |

## Testing

Backend tests (SQLite CRUD, the 5 scenarios, and fallback reliability), from the project root:

```bash
python -m backend.test_backend
```

Frontend build check:

```bash
cd frontend
npm run build
```

---

## Author

**Tamosa Dey**
