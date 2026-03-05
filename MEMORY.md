# MEMORY.md — Long-Term Memory

## Who I Am

- **Name:** Dawn
- **Role:** Business AI assistant — autonomous, proactive, resourceful, always available
- **Human:** My operator (name TBC — update when learned)
- **Mission:** Support a suite of successful businesses with planning, coding, management, testing, and automation

---

## ⚡ PRIORITY #1: Always Available, Always Operational

My operator depends on me being at **full capacity at all times**. This is my top priority above all else.

### Model Resilience
**Only Ollama local models used:** `ollama/llama3.3:latest`
- Completely free, no credits, no rate limits
- Always available, never blocked by external providers
- Slower than cloud models but fully reliable

### Health Monitoring
- HEARTBEAT.md runs checks every 30 minutes
- Monitors: context window %, active model, gateway status
- Alerts at: 70% context (warn), 85% context (alert), 90% (recommend session reset)
- Tracks state in `memory/heartbeat-state.json`

### Model Philosophy
- **Only model:** `ollama/llama3.3:latest` — local, free, no limits, fully reliable
- **Evaluating new local models:** Watch for better Ollama releases (Llama upgrades, etc.) — propose switching if demonstrably better
- **Test before committing:** Any new model must work perfectly before staying
- **No external providers:** Zero dependency on paid/cloud services that can rate-limit or block access

### Known Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Ollama crash | Restart Ollama service; auto-recovery configured |
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

### Project 1: Grandstream Wave → UCM6308 Direct Connection — COMPLETE

**Infrastructure (all confirmed working 2026-02-23):**
- UCM6308 internal IP: `192.168.1.148` ← **always use this for access (same network as MSI)**
- BT Static IP: `81.137.249.200`
- DNS A record `tel.scot.ltd` → 81.137.249.200 ✅ (live, TTL 600) — **this is the SIP hostname to use everywhere**
- DNS A record `call.scot.ltd` → **not used** (domain already taken; tel.scot.ltd used instead)
- UCM web UI accessible externally at `http://81.137.249.200:8080` ✅

**Port forwarding on BT router (all configured):**
- SIP: external 5060 UDP → 192.168.1.148:5060
- Secure SIP: external 5061 UDP → 192.168.1.148:5061
- RTP Media: external 10000-20000 UDP → 192.168.1.148:10000-20000
- Web UI: external 8080 TCP → 192.168.1.148:80

**Next steps:**
1. ✅ DNS done — tel.scot.ltd → 81.137.249.200
2. Check/set UCM6308 NAT settings (external host = **tel.scot.ltd**) — UCM credentials stored in mcp-hub/config/.env (UCM_USER=Brigain, UCM_PASS=Jen!fer1) but "Brigain" may be display name not login username — API returned wrong-password error, need to verify actual login username before retrying (48 attempts remain before lockout)
3. Configure each Wave app with: SIP Server = tel.scot.ltd, Port = 5060, Auth = extension + password

**Wave configuration (per user):**
- SIP Server: **tel.scot.ltd**
- SIP Server Port: 5060
- SIP User ID / Auth ID: their extension number
- Password: their SIP password
- Outbound Proxy: **tel.scot.ltd**, Port 5060

**Future:** Use ElevenLabs agents + UCM6308 to make automated calls to HMRC on behalf of the team

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
- **Ollama MUST have `api:'ollama'` in models.providers.ollama config** — missing this causes gateway crashes
- **Gateway Scheduled Task has no RestartOnFailure by default** — configured to restart 10 times at 1-min intervals on crash
- **Never directly edit models.json** — gateway overwrites it on restart; always use `openclaw config set models.providers.*`
- **Do NOT run `openclaw gateway restart` on Windows** — ask the user to manually restart instead
- **Ollama API key**: `ec2ba16d039a4739ab397eb993c62315.P86I5g42PSMSBEQLLTwOQlfa`
- **Heartbeat model**: `ollama/llama3.3:latest` — free, runs locally, no rate limits
