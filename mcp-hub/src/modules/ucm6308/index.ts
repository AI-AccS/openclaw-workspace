/**
 * UCM6308 MCP Tools
 * Covers: extensions, ring groups, queues, IVR, trunks, CDR,
 *         active calls, click-to-call, voicemail, conferences,
 *         recordings, paging, parking, system status.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getUCMClient } from "./client.js";

export function registerUCM6308Tools(server: McpServer): void {
  const ucm = () => getUCMClient();

  // ── System ───────────────────────────────────────────────────────────────────

  server.tool(
    "ucm_system_status",
    "Get UCM6308 system status: firmware, uptime, CPU, memory, disk",
    {},
    async () => {
      const res = await ucm().get("getSysInfo");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_reboot",
    "Reboot the UCM6308 PBX",
    {},
    async () => {
      const res = await ucm().post("reboot");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Extensions ───────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_extensions",
    "List all SIP extensions on the UCM6308",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      limit: z.number().optional().describe("Results per page (default 50)"),
    },
    async ({ page = 1, limit = 50 }) => {
      const res = await ucm().get("listAccount", { page, limit });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_get_extension",
    "Get details of a specific extension",
    { extension: z.string().describe("Extension number, e.g. 1001") },
    async ({ extension }) => {
      const res = await ucm().get("getAccount", { extension });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_create_extension",
    "Create a new SIP extension",
    {
      extension: z.string().describe("Extension number"),
      callerIdName: z.string().describe("Caller ID name"),
      password: z.string().describe("SIP password"),
      email: z.string().optional().describe("Email for voicemail notifications"),
      voicemail: z.boolean().optional().describe("Enable voicemail (default true)"),
      callForwardUnconditional: z.string().optional().describe("Unconditional forward destination"),
    },
    async (params) => {
      const res = await ucm().post("addAccount", params);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_update_extension",
    "Update an existing SIP extension",
    {
      extension: z.string().describe("Extension number to update"),
      callerIdName: z.string().optional(),
      email: z.string().optional(),
      voicemail: z.boolean().optional(),
      callForwardUnconditional: z.string().optional(),
      callForwardBusy: z.string().optional(),
      callForwardNoAnswer: z.string().optional(),
      dnd: z.boolean().optional().describe("Enable Do Not Disturb"),
    },
    async (params) => {
      const res = await ucm().post("updateAccount", params);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_delete_extension",
    "Delete a SIP extension",
    { extension: z.string().describe("Extension number to delete") },
    async ({ extension }) => {
      const res = await ucm().post("deleteAccount", { extension });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Active Calls ─────────────────────────────────────────────────────────────

  server.tool(
    "ucm_active_calls",
    "List all currently active calls on the UCM6308",
    {},
    async () => {
      const res = await ucm().get("getActiveCalls");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_hangup_call",
    "Hang up an active call by channel ID",
    { channel: z.string().describe("Channel ID from ucm_active_calls") },
    async ({ channel }) => {
      const res = await ucm().post("hangupCall", { channel });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Click-to-Call ─────────────────────────────────────────────────────────────

  server.tool(
    "ucm_click_to_call",
    "Initiate a call between two parties via the UCM6308 (click-to-call). The PBX calls ext first, then bridges to destination.",
    {
      caller: z.string().describe("Extension that will receive the outbound call first, e.g. 1001"),
      callee: z.string().describe("Number to call, e.g. 07700900123 or external number"),
    },
    async ({ caller, callee }) => {
      const res = await ucm().post("clickToCall", {
        caller,
        callee,
      });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Call Detail Records ───────────────────────────────────────────────────────

  server.tool(
    "ucm_get_cdr",
    "Retrieve Call Detail Records (CDR) with optional filters",
    {
      startTime: z.string().optional().describe("Start datetime e.g. 2026-01-01 00:00:00"),
      endTime: z.string().optional().describe("End datetime e.g. 2026-01-31 23:59:59"),
      caller: z.string().optional().describe("Filter by caller number"),
      callee: z.string().optional().describe("Filter by callee number"),
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Records per page (max 100)"),
      orderby: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    },
    async (params) => {
      const res = await ucm().get("getCDR", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_cdr_summary",
    "Get a CDR summary/statistics for a date range",
    {
      startTime: z.string().describe("Start datetime e.g. 2026-01-01 00:00:00"),
      endTime: z.string().describe("End datetime e.g. 2026-01-31 23:59:59"),
    },
    async (params) => {
      const res = await ucm().get("getCDRSummary", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Ring Groups ───────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_ring_groups",
    "List all ring groups",
    {},
    async () => {
      const res = await ucm().get("listRingGroup");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_get_ring_group",
    "Get details of a ring group",
    { ringGroupNumber: z.string().describe("Ring group extension number") },
    async ({ ringGroupNumber }) => {
      const res = await ucm().get("getRingGroup", { ringGroupNumber });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_create_ring_group",
    "Create a new ring group",
    {
      ringGroupNumber: z.string().describe("Extension number for the group"),
      ringGroupName: z.string().describe("Display name"),
      members: z.string().describe("Comma-separated member extensions e.g. 1001,1002,1003"),
      strategy: z.enum(["ringall", "linear", "leastrecent", "fewestcalls", "random", "rrmemory"])
        .optional().describe("Ring strategy (default ringall)"),
      timeout: z.number().optional().describe("Ring timeout in seconds"),
      destinationType: z.string().optional().describe("Timeout destination type"),
      destinationValue: z.string().optional().describe("Timeout destination value"),
    },
    async (params) => {
      const res = await ucm().post("addRingGroup", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_update_ring_group",
    "Update an existing ring group",
    {
      ringGroupNumber: z.string().describe("Ring group extension number"),
      ringGroupName: z.string().optional(),
      members: z.string().optional().describe("Comma-separated extensions"),
      strategy: z.enum(["ringall", "linear", "leastrecent", "fewestcalls", "random", "rrmemory"]).optional(),
      timeout: z.number().optional(),
    },
    async (params) => {
      const res = await ucm().post("updateRingGroup", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_delete_ring_group",
    "Delete a ring group",
    { ringGroupNumber: z.string() },
    async ({ ringGroupNumber }) => {
      const res = await ucm().post("deleteRingGroup", { ringGroupNumber });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Call Queues ───────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_queues",
    "List all call queues",
    {},
    async () => {
      const res = await ucm().get("listQueue");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_get_queue",
    "Get details of a call queue",
    { queueExtension: z.string().describe("Queue extension number") },
    async ({ queueExtension }) => {
      const res = await ucm().get("getQueue", { queueExtension });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_queue_status",
    "Get live status of a queue (agents, waiting calls, etc.)",
    { queueExtension: z.string().describe("Queue extension number") },
    async ({ queueExtension }) => {
      const res = await ucm().get("getQueueStatus", { queueExtension });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_create_queue",
    "Create a new call queue",
    {
      queueExtension: z.string().describe("Extension number for the queue"),
      queueName: z.string().describe("Display name"),
      agents: z.string().describe("Comma-separated agent extensions"),
      strategy: z.enum(["ringall", "linear", "leastrecent", "fewestcalls", "random", "rrmemory", "wrandom"]).optional(),
      maxWaitTime: z.number().optional().describe("Max wait time in seconds"),
      maxLen: z.number().optional().describe("Max callers in queue"),
      musicOnHold: z.string().optional().describe("Music on hold class"),
      announceFrequency: z.number().optional().describe("Position announcement frequency in seconds"),
    },
    async (params) => {
      const res = await ucm().post("addQueue", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── IVR / Auto-Attendant ──────────────────────────────────────────────────────

  server.tool(
    "ucm_list_ivr",
    "List all IVR (Auto-Attendant) menus",
    {},
    async () => {
      const res = await ucm().get("listIVR");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_get_ivr",
    "Get details of an IVR menu",
    { ivrName: z.string().describe("IVR extension/name") },
    async ({ ivrName }) => {
      const res = await ucm().get("getIVR", { ivr_name: ivrName });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_create_ivr",
    "Create a new IVR (Auto-Attendant) menu",
    {
      ivrName: z.string().describe("IVR extension number"),
      ivrDisplayName: z.string().describe("Display name"),
      welcomePrompt: z.string().optional().describe("Welcome audio prompt"),
      timeoutDest: z.string().optional().describe("Timeout destination"),
      invalidDest: z.string().optional().describe("Invalid key destination"),
      keyPresses: z.record(z.string()).optional().describe("Key→destination map e.g. {\"1\":\"1001\",\"2\":\"2000\"}"),
    },
    async (params) => {
      const res = await ucm().post("addIVR", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── SIP Trunks ────────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_trunks",
    "List all SIP trunks configured on the UCM6308",
    {},
    async () => {
      const res = await ucm().get("listTrunk");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_get_trunk",
    "Get details of a SIP trunk",
    { trunkName: z.string().describe("Trunk name") },
    async ({ trunkName }) => {
      const res = await ucm().get("getTrunk", { trunk_name: trunkName });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_trunk_status",
    "Get registration status of all SIP trunks",
    {},
    async () => {
      const res = await ucm().get("getTrunkStatus");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Voicemail ─────────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_voicemail",
    "List voicemail messages for an extension",
    {
      extension: z.string().describe("Extension number"),
      folder: z.enum(["INBOX", "Old", "Work", "Family", "Friends"]).optional().describe("Voicemail folder"),
    },
    async ({ extension, folder = "INBOX" }) => {
      const res = await ucm().get("getVoicemail", { extension, folder });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_delete_voicemail",
    "Delete a voicemail message",
    {
      extension: z.string().describe("Extension number"),
      messageId: z.string().describe("Message ID from ucm_list_voicemail"),
    },
    async (params) => {
      const res = await ucm().post("deleteVoicemail", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Recordings ────────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_recordings",
    "List call recordings",
    {
      startTime: z.string().optional().describe("Filter start datetime"),
      endTime: z.string().optional().describe("Filter end datetime"),
      extension: z.string().optional().describe("Filter by extension"),
      page: z.number().optional(),
      limit: z.number().optional(),
    },
    async (params) => {
      const res = await ucm().get("getRecordings", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_delete_recording",
    "Delete a call recording",
    { recordingFile: z.string().describe("Recording filename from ucm_list_recordings") },
    async ({ recordingFile }) => {
      const res = await ucm().post("deleteRecording", { recording_file: recordingFile });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Paging & Intercom ─────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_paging_groups",
    "List all paging/intercom groups",
    {},
    async () => {
      const res = await ucm().get("listPagingGroup");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_page_group",
    "Send a page to a paging group (makes extensions auto-answer)",
    {
      pagingGroupNumber: z.string().describe("Paging group extension"),
      callerExtension: z.string().describe("Extension initiating the page"),
    },
    async (params) => {
      const res = await ucm().post("pagingGroupCall", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Conference Rooms ──────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_conferences",
    "List all conference rooms",
    {},
    async () => {
      const res = await ucm().get("listConference");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_conference_status",
    "Get live participants in a conference room",
    { conferenceNumber: z.string().describe("Conference room extension") },
    async ({ conferenceNumber }) => {
      const res = await ucm().get("getConferenceStatus", { conference_number: conferenceNumber });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_kick_from_conference",
    "Kick a participant from a conference room",
    {
      conferenceNumber: z.string(),
      channel: z.string().describe("Participant channel ID"),
    },
    async (params) => {
      const res = await ucm().post("kickConferenceMember", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Call Parking ──────────────────────────────────────────────────────────────

  server.tool(
    "ucm_parked_calls",
    "List currently parked calls",
    {},
    async () => {
      const res = await ucm().get("getParkedCalls");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Time Conditions ───────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_time_conditions",
    "List all time conditions (business hours rules)",
    {},
    async () => {
      const res = await ucm().get("listTimeCondition");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_override_time_condition",
    "Temporarily override a time condition (e.g. set to closed/open)",
    {
      timeConditionName: z.string().describe("Time condition name"),
      mode: z.enum(["use_time_condition", "set_true", "set_false"]).describe(
        "Override mode: use_time_condition=normal, set_true=force open, set_false=force closed"
      ),
    },
    async (params) => {
      const res = await ucm().post("updateTimeCondition", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Outbound Routes ───────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_outbound_routes",
    "List all outbound call routing rules",
    {},
    async () => {
      const res = await ucm().get("listOutboundRoute");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Inbound Routes ────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_inbound_routes",
    "List all inbound DID routing rules",
    {},
    async () => {
      const res = await ucm().get("listInboundRoute");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── DECT Handsets ─────────────────────────────────────────────────────────────

  server.tool(
    "ucm_list_dect",
    "List DECT handsets registered to the UCM6308",
    {},
    async () => {
      const res = await ucm().get("listDectInfo");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  // ── Backup & Maintenance ──────────────────────────────────────────────────────

  server.tool(
    "ucm_create_backup",
    "Trigger a configuration backup on the UCM6308",
    {
      backupName: z.string().optional().describe("Backup filename (auto-generated if omitted)"),
    },
    async (params) => {
      const res = await ucm().post("createBackup", params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_list_backups",
    "List available configuration backups",
    {},
    async () => {
      const res = await ucm().get("listBackup");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.tool(
    "ucm_apply_changes",
    "Apply pending configuration changes on the UCM6308 (equivalent to clicking Apply Changes in the UI)",
    {},
    async () => {
      const res = await ucm().post("applyChange");
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );
}
