# Prompts Used to Build VoiceShield

VoiceShield was built with an AI coding assistant, and I spoke most of these prompts using **Wispr Flow** instead of typing them. This file shows the process: the planning prompt before any code was written, and the follow-up prompts after.

---

## Before: Planning Prompt

I asked the assistant to inspect the workspace and write a plan **before** writing any code.

> I want to build a project called VoiceShield for the HackerHouse Goa shortlisting task. VoiceShield is an AI-powered security incident investigation assistant. Users will paste security logs into a web interface and the application will analyze them and display:
> - the risk score/severity
> - detected threat type
> - supporting evidence
> - confidence score
> - recommended response actions
>
> I want this to be a polished but relatively small full-stack project that I can complete and demonstrate reliably. Use:
> - React for the frontend
> - a fast API backend
> - SQLite for local storage
> - an LLM API for analysis but also include a reliable sample incident for fallback mode so the demo works even if the API is unavailable
>
> Make the UI look like a professional cybersecurity investigation dashboard. Before writing code inspect the workspace and create the detailed implementation plan. Do not implement anything yet.

The assistant produced an implementation plan, which I reviewed before approving the build.

---

## After: Follow-up Prompts

### 1. UI redesign with animation

> This UI is good but I need this kind of UI and use GSAP and animation where it looks good.

(A reference dashboard image was attached.) The assistant proposed a redesign plan, I approved it, and it added a dark multi-card layout, circular gauges, a wave chart, and GSAP entrance animations.

### 2. Fixing the scenarios and adding a graphical risk score

> You built the application, which is very nice, but something is not working. In the cases you gave me, you gave me the SSH credential and then SQL, and so on. You gave me multiple things, so that is not shown properly. Also the text and the notification is not needed here. Make it clear: I need the pie chart or any graphical representation of the risk score, or whatever you give me as an output.

This led to the **Risk Score donut chart**, all 5 scenarios shown clearly, and a cleaner top bar.

### 3. Debugging a blank screen

After moving the project into VS Code, the page was blank. The browser console showed `ReferenceError: containerRef is not defined` in `ScenarioCards.tsx`. The fix was to create the missing ref:

```tsx
const containerRef = useRef<HTMLDivElement>(null);
```

### 4. Backend startup fix

The backend failed with `attempted relative import with no known parent package`. The fix was to start it from the **project root**:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

---

## Notes

- The prompts above are lightly edited for readability. Dictated text often has filler words.
- No API keys or personal data appear in these prompts.
