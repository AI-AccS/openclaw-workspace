# MCP Hub

Central MCP server aggregating all business tool integrations.
Runs locally on your machine — **100% free, no cloud costs**.

## Architecture

```
mcp-hub (this server — stdio)
├── UCM6308        — Grandstream PBX (custom, full REST API)
├── Companies House — UK company registry (free API)
├── HMRC           — Making Tax Digital (VAT, SA, Agents)
├── Employment Hero — KeyPay UK payroll & HR
├── Syft           — Financial analytics & reporting
├── Adfin          — Payment collection
├── Inform Direct  — Company secretarial
└── One Gateways   — Payment processing

Separate MCP servers (registered alongside this hub):
├── Xero           — @xeroapi/xero-mcp-server (official, MIT)
└── ElevenLabs     — elevenlabs-mcp (official, Python/uvx)
```

## Quick Start

### 1. Configure credentials

```
cp config/.env.example config/.env
# Edit config/.env with your API keys
```

### 2. Build

```
npm install
npm run build
```

### 3. Start via mcporter

```
mcporter daemon start
mcporter list
```

### 4. Test a tool

```
mcporter call mcp-hub.ucm_system_status
mcporter call mcp-hub.ch_search_companies query="Accountancy Scotland"
```

## Tools by Module

### UCM6308 (30+ tools)
- `ucm_system_status` — System info & health
- `ucm_list_extensions` / `ucm_get_extension` / `ucm_create_extension` / `ucm_update_extension` / `ucm_delete_extension`
- `ucm_active_calls` / `ucm_hangup_call`
- `ucm_click_to_call` — Initiate calls between two parties
- `ucm_get_cdr` / `ucm_cdr_summary` — Call records & stats
- `ucm_list_ring_groups` / `ucm_create_ring_group` / `ucm_update_ring_group` / `ucm_delete_ring_group`
- `ucm_list_queues` / `ucm_get_queue` / `ucm_queue_status` / `ucm_create_queue`
- `ucm_list_ivr` / `ucm_get_ivr` / `ucm_create_ivr`
- `ucm_list_trunks` / `ucm_trunk_status`
- `ucm_list_voicemail` / `ucm_delete_voicemail`
- `ucm_list_recordings` / `ucm_delete_recording`
- `ucm_list_paging_groups` / `ucm_page_group`
- `ucm_list_conferences` / `ucm_conference_status` / `ucm_kick_from_conference`
- `ucm_parked_calls`
- `ucm_list_time_conditions` / `ucm_override_time_condition`
- `ucm_list_outbound_routes` / `ucm_list_inbound_routes`
- `ucm_list_dect`
- `ucm_create_backup` / `ucm_list_backups` / `ucm_apply_changes`
- `ucm_reboot`

### Companies House (10 tools)
- `ch_search_companies` / `ch_get_company`
- `ch_get_officers` / `ch_get_pscs`
- `ch_filing_history` / `ch_get_charges`
- `ch_get_registered_address` / `ch_get_insolvency`
- `ch_search_officers` / `ch_advanced_search`

### HMRC (8 tools)
- `hmrc_vat_obligations` / `hmrc_vat_return` / `hmrc_submit_vat_return`
- `hmrc_vat_liabilities` / `hmrc_vat_payments`
- `hmrc_sa_obligations`
- `hmrc_agent_clients`

### Employment Hero / KeyPay (8 tools)
- `keypay_list_employees` / `keypay_get_employee`
- `keypay_list_pay_runs` / `keypay_get_payslip`
- `keypay_list_leave_requests` / `keypay_approve_leave`
- `keypay_employee_report` / `keypay_payroll_report`

### Syft (5 tools)
- `syft_list_organisations` / `syft_get_reports` / `syft_get_report`
- `syft_profit_and_loss` / `syft_balance_sheet`

### Adfin (5 tools)
- `adfin_list_payment_requests` / `adfin_create_payment_request`
- `adfin_get_payment_request` / `adfin_cancel_payment_request`
- `adfin_payment_summary`

### Inform Direct (7 tools)
- `id_list_companies` / `id_get_company`
- `id_list_shareholders` / `id_list_directors`
- `id_share_allotments` / `id_pending_filings` / `id_minutes_and_resolutions`

### One Gateways (5 tools)
- `og_list_transactions` / `og_get_transaction`
- `og_refund_transaction` / `og_create_payment_link`
- `og_settlement_report`

## Credentials Needed

| Service | How to get |
|---|---|
| UCM_HOST / UCM_PASS | Your UCM6308 admin panel |
| COMPANIES_HOUSE_API_KEY | https://developer.company-information.service.gov.uk/manage-applications (free) |
| HMRC_ACCESS_TOKEN | https://developer.service.hmrc.gov.uk/developer/applications (free) |
| KEYPAY_API_KEY | Employment Hero > Settings > API |
| SYFT_API_KEY | Syft app > Settings > API |
| ADFIN_API_KEY | Adfin dashboard > Settings |
| INFORM_DIRECT_API_KEY | Contact Inform Direct support |
| ONE_GATEWAYS_API_KEY | One Gateways merchant dashboard |

## Adding Xero (Official MCP Server)

```bash
npm install -g @xeroapi/xero-mcp-server
mcporter config add xero --stdio "xero-mcp-server" \
  --env XERO_CLIENT_ID=xxx --env XERO_CLIENT_SECRET=xxx
```

## Adding ElevenLabs (Official Python MCP Server)

Requires Python / uv:
```bash
pip install elevenlabs-mcp
mcporter config add elevenlabs \
  --stdio "python -m elevenlabs_mcp" \
  --env ELEVENLABS_API_KEY=xxx
```

## Adding More Modules

1. Create `src/modules/<name>/index.ts`
2. Export `register<Name>Tools(server: McpServer)`
3. Import and call it in `src/index.ts`
4. Run `npm run build`
