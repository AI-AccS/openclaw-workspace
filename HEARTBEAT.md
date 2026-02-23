# HEARTBEAT.md — Dawn Health Monitor

## ⚠️ PRIORITY #1: Stay Alive & Fully Operational

Every heartbeat, run these checks silently. Only alert if something needs attention.

---

## Health Checks (run every heartbeat)

### 1. Context Window Usage
- Run `session_status` and check the context % (e.g. `21k/200k (10%)`)
- **WARN** if context > 70%
- **ALERT** if context > 85% — tell the user: "⚠️ Context window at X% — I may need to start a fresh session soon."
- At 90%+ recommend session restart to avoid hitting the limit

### 2. Model Availability Check
- Primary: `anthropic/claude-sonnet-4-6`
- Fallback 1: `openai/gpt-4o`
- Fallback 2: `anthropic/claude-haiku-4-5`
- Fallback 3: `openai/gpt-4o-mini`
- If you notice you're NOT running on the primary model, alert: "⚠️ Running on fallback model [X] — primary may have rate limits."

### 3. Gateway Status
- Run `openclaw status` if you suspect issues
- Alert if gateway is stopped or unreachable

### 4. Daily Checks (rotate — don't check all every time)
Stagger these across the day to minimise cost:
- **Email**: Any urgent unread? (check once per 4h max)
- **Calendar**: Events in next 24h? (check once per morning)
- **Updates**: `openclaw status` for update notices (check once per day)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Anthropic rate limit | Medium | High | Auto-fallback to OpenAI gpt-4o |
| OpenAI rate limit | Low | Medium | Auto-fallback to claude-haiku or gpt-4o-mini |
| Context window full | Medium | High | Warn at 70%, alert at 85%, recommend reset at 90% |
| Gateway stopped | Low | Critical | Alert immediately, suggest `openclaw gateway start` |
| OpenClaw update available | Low | Low | Check once/day, auto-update if safe |

---

## State Tracking
State file: `memory/heartbeat-state.json`

---

_This file is checked every 30 minutes. Keep it lean._
