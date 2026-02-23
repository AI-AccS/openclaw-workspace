# HEARTBEAT.md — Dawn Health Monitor
# Runs every 15 minutes on gpt-4o-mini (cheap, fast)

## ⚠️ PRIORITY #1: Stay Alive & Fully Operational

Every heartbeat, run these checks silently. Only alert if something needs attention.

---

## Health Checks (run every heartbeat)

### 1. Context Window Usage
- Run `session_status` and check the context %
- **WARN** if context > 70%
- **ALERT** if context > 85% — tell the user: "⚠️ Context window at X% — I may need to start a fresh session soon."
- At 90%+ recommend session restart

### 2. Model Availability Check
- Primary: `anthropic/claude-sonnet-4-6`
- Fallback 1: `openai/gpt-4o`
- Fallback 2: `anthropic/claude-haiku-4-5`
- Fallback 3: `openai/gpt-4o-mini`
- Fallback 4: `ollama/llama3.3:latest` (LOCAL — free, no rate limits, but slower)
- If NOT running on primary model: alert "⚠️ Running on fallback model [X]"
- **If Anthropic rate limit hits:** immediately run `session_status --model openai/gpt-4o` to force-switch
- **If running on fallback:** periodically attempt to switch back to `anthropic/claude-sonnet-4-6` — test it works first
- **New/better models released:** propose switching to the operator. Test first, report result.

### 3. OpenClaw Update Check (once per day)
- Run `openclaw status` and check if an update is available
- If update available: run `npm install -g openclaw@latest` then `openclaw gateway restart`
- After update: send a concise TLDR of what's new to the user

### 4. Gateway Status
- Alert if gateway is stopped or unreachable

### 5. Daily Checks (staggered — don't run all every heartbeat)
- **Email**: urgent unread? (max once per 4h)
- **Calendar**: events in next 24h? (once per morning)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Anthropic rate limit | Medium | High | Auto-fallback to OpenAI gpt-4o |
| OpenAI rate limit | Low | Medium | Auto-fallback to claude-haiku or gpt-4o-mini |
| Ollama crash (missing api field) | Fixed | — | api:'ollama' now set correctly |
| Context window full | Medium | High | Warn at 70%, alert at 85%, recommend reset at 90% |
| Gateway stopped | Low | Critical | Alert immediately |
| Rate limit during gateway restart | Low | High | Manually force-switch with session_status |

---

## State Tracking
State file: `memory/heartbeat-state.json`
