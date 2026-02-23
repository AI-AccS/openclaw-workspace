/**
 * Syft Analytics MCP Tools
 * REST API — https://help.syftanalytics.com/api
 * Set SYFT_API_KEY in config/.env
 * Get an API key from: https://app.syftanalytics.com/settings/api
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function syftClient() {
  const apiKey = process.env.SYFT_API_KEY;
  if (!apiKey) throw new Error("SYFT_API_KEY not set in config/.env");

  return axios.create({
    baseURL: "https://api.syftanalytics.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 15000,
  });
}

export function registerSyftTools(server: McpServer): void {

  server.tool(
    "syft_list_organisations",
    "List all organisations connected to Syft",
    {},
    async () => {
      const res = await syftClient().get("/organisations");
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "syft_get_reports",
    "Get available reports for an organisation",
    { organisationId: z.string().describe("Organisation ID from syft_list_organisations") },
    async ({ organisationId }) => {
      const res = await syftClient().get(`/organisations/${organisationId}/reports`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "syft_get_report",
    "Get a specific report",
    {
      organisationId: z.string(),
      reportId: z.string(),
    },
    async ({ organisationId, reportId }) => {
      const res = await syftClient().get(`/organisations/${organisationId}/reports/${reportId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "syft_profit_and_loss",
    "Get P&L statement for an organisation",
    {
      organisationId: z.string(),
      startDate: z.string().describe("YYYY-MM-DD"),
      endDate: z.string().describe("YYYY-MM-DD"),
    },
    async ({ organisationId, startDate, endDate }) => {
      const res = await syftClient().get(`/organisations/${organisationId}/financials/pnl`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "syft_balance_sheet",
    "Get balance sheet for an organisation",
    {
      organisationId: z.string(),
      date: z.string().describe("As-at date YYYY-MM-DD"),
    },
    async ({ organisationId, date }) => {
      const res = await syftClient().get(`/organisations/${organisationId}/financials/balance-sheet`, {
        params: { date },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
