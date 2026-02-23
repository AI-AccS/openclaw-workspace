# MEMORY.md — Long-Term Memory

## Who I Am

- **Name:** Dawn
- **Role:** Business AI assistant — autonomous, proactive, resourceful, always available
- **Human:** My operator (name TBC — update when learned)
- **Mission:** Support a suite of successful businesses with planning, coding, management, testing, and automation

---

## ⚡ PRIORITY #1: Always Available, Always Operational

My operator depends on me being at **full capacity at all times**. This is my top priority above all else.

### Model Resilience (set up 2026-02-23)
Multi-provider failover chain configured:
1. **Primary:** `anthropic/claude-sonnet-4-6` (best quality)
2. **Fallback 1:** `openai/gpt-4o` (different provider — survives Anthropic rate limits)
3. **Fallback 2:** `anthropic/claude-haiku-4-5` (cheaper Anthropic tier)
4. **Fallback 3:** `openai/gpt-4o-mini` (last resort, still capable)

OpenClaw auto-switches on rate limit or model unavailability. Both Anthropic and OpenAI keys are active.

### Health Monitoring
- HEARTBEAT.md runs checks every 30 minutes
- Monitors: context window %, active model, gateway status
- Alerts at: 70% context (warn), 85% context (alert), 90% (recommend session reset)
- Tracks state in `memory/heartbeat-state.json`

### Known Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Anthropic rate limit | Auto-switch to OpenAI gpt-4o |
| Both providers rate limited | gpt-4o-mini as last resort |
| Context window full | Warn early, recommend session restart |
| Gateway stopped | Alert operator, self-restart if possible |

---

## Our Businesses

We run several successful businesses together:

1. **Accountancy Scotland** — main accountancy firm + multiple local branches
2. **Pay.Scot Limited** — payments company
3. **CSec Limited** — security company
4. **Brigolden Limited** — company (details TBC)
5. **Property Company** — (name TBC)
6. **Accountancy Software Limited** — software for accountancy
7. **New Company (coming soon)** — web hosting / email hosting / VOIP / AI development

---

## Key Projects

### Project 1: Grandstream Wave → UCM6308 Direct Connection
- Company uses a **Grandstream UCM6308** telephone server on-premises
- Remote team members use **Grandstream Wave** app
- Wave currently points to Grandstream cloud — need to redirect to our local UCM6308
- We have a **static IP from BT**; BT Business Router with port forwarding already configured (done by previous OpenClaw session)
- **Next step:** Configure Wave app login/server info to point to our UCM6308's static IP
- **Future:** Use ElevenLabs agents + UCM6308 to make automated calls to HMRC on behalf of the team

### Project 2: MCP Hub — BUILT & RUNNING ✅
- Location: `~/.openclaw/workspace/mcp-hub/`
- **92 tools** live across 8 modules, all compiled and registered in mcporter
- Config: `mcp-hub/config/.env` — fill in API keys to activate each module
- mcporter config: `mcp-hub/config/mcporter.json` (uses absolute path to dist/)
- Start: mcporter reads config automatically; hub runs as stdio server

#### Modules built:
| Module | Status | Tools | Notes |
|---|---|---|---|
| UCM6308 | ✅ Built, needs credentials | 30+ | Fill UCM_HOST + UCM_PASS in .env |
| Companies House | ✅ Built, needs free API key | 10 | Register free at developer.company-information.service.gov.uk |
| HMRC MTD | ✅ Built, needs OAuth token | 8 | VAT, SA, Agent services |
| Employment Hero/KeyPay | ✅ Built, needs API key | 8 | KeyPay UK REST API |
| Syft | ✅ Built, needs API key | 5 | Financial analytics |
| Adfin | ✅ Built, needs API key | 5 | Payment collection |
| Inform Direct | ✅ Built, needs API key | 7 | Company secretarial |
| One Gateways | ✅ Built, needs API key | 5 | Payment processing |

#### Still to add (official separate servers):
- **Xero** (all products): `@xeroapi/xero-mcp-server` — MIT, install via npm
- **ElevenLabs**: `elevenlabs-mcp` — official Python server, uvx/pip, free tier 10k credits/mo
- **Google Workspace**: `@presto-ai/google-workspace-mcp` — Gmail, Drive, Calendar, Docs, Sheets

#### Outstanding info needed:
- UCM6308: IP address (static BT IP or LAN IP?) + admin password
- Video production tool (RunwayML? Kling? FFmpeg? other?)
- API keys for each service (user to provide)

#### Next build priorities:
1. Wire UCM6308 credentials → test click-to-call + CDR
2. Install Xero official MCP server
3. Install ElevenLabs official MCP server  
4. Get Companies House free API key → test company search

---

## Skills Status (as of 2026-02-22)
- Upgraded from 6/50 → 43/50 skills ready
- Remaining missing: coding-agent, discord, gh-issues, session-logs (jq dep fixed), sherpa-onnx-tts, voice-call, wacli
- Some require external plugins/configs (WhatsApp, Discord, voice-call) that need channel setup

---

## Operating Rules (from my human)
- Always complete tasks **fully and autonomously**
- **Never ask for help** unless truly impossible to do alone
- Prefer **free, open-source, local** solutions
- Always **test before reporting success**
- Confirm success in **plain simple English** — no jargon
- All actions must be **safe, secure, free, and further our goals**
- Fix issues **before** they become problems

---

## Lessons Learned
- `tail` doesn't work in PowerShell — use `Select-Object -Last N`
- `choco` not installed — use `winget` instead (with `--accept-source-agreements --accept-package-agreements`)
- sessions_spawn agentId parameter not permitted in this deployment
- web_search requires Brave API key — use web_fetch instead for internet research
- Skills can be installed via `npx clawhub install <slug>` or `npm install -g clawhub` then `clawhub install <slug>`
- jq installed via winget — needed for session-logs skill
