# HEARTBEAT.md — Dawn Health Monitor
# Runs every 15 minutes on ollama/llama3.3:latest (free, local, no limits)

## ⚠️ PRIORITY #1: Stay Alive & Fully Operational

Every heartbeat, run these checks silently. Only alert if something needs attention.

---

## Health Checks (run every heartbeat)

### 1. Context Window Usage
- Run `session_status` and check the context %
- **WARN** if context > 70%
- **ALERT** if context > 85% — tell the user: "⚠️ Context window at X% — I may need to start a fresh session soon."
- At 90%+ recommend session restart

### 1b. Auto-Save Progress (NEW)
- Every heartbeat, check `memory/YYYY-MM-DD.md` for today's work
- If significant progress since last save → consolidate key decisions/actions into MEMORY.md
- **Proactive context management:** When context > 50%, auto-summarize and archive old session details to memory files

### 2. Model Availability Check
- **Only model:** `ollama/llama3.3:latest` (LOCAL — free, no rate limits)
- If NOT running on this model: alert "⚠️ Running on wrong model [X]" and ask user to restart gateway

### 3. OpenClaw Update Check (once per day)
- Run `openclaw status` and check if an update is available
- If update available: run `npm install -g openclaw@latest` then ask user to manually restart gateway
- After update: send a concise TLDR of what's new to the user

### 4. Gateway Status
- Alert if gateway is stopped or unreachable

### 5. Daily Checks (staggered — don't run all every heartbeat)
- **Email**: urgent unread? (max once per 4h)
- **Calendar**: events in next 24h? (once per morning)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|
| Ollama crash (missing api field) | Low | Medium | api:'ollama' now set correctly, auto-restart configured |
| Context window full | Medium | High | Warn at 70%, alert at 85%, recommend reset at 90% |
| Gateway stopped | Low | Critical | Alert immediately, user manual restart required |

---

## State Tracking
State file: `memory/heartbeat-state.json`
