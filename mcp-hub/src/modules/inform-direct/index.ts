/**
 * Inform Direct MCP Tools
 * Company secretarial platform — https://www.informdirect.co.uk
 * API docs: https://www.informdirect.co.uk/api-docs (contact Inform Direct for API access)
 * Set INFORM_DIRECT_API_KEY and INFORM_DIRECT_API_SECRET in config/.env
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function idClient() {
  const apiKey = process.env.INFORM_DIRECT_API_KEY;
  if (!apiKey) throw new Error("INFORM_DIRECT_API_KEY not set in config/.env");

  return axios.create({
    baseURL: "https://api.informdirect.co.uk/v1",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

export function registerInformDirectTools(server: McpServer): void {

  server.tool(
    "id_list_companies",
    "List all companies managed in Inform Direct",
    {},
    async () => {
      const res = await idClient().get("/companies");
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_get_company",
    "Get details of a company in Inform Direct",
    { companyId: z.string().describe("Inform Direct company ID") },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_list_shareholders",
    "List shareholders for a company",
    { companyId: z.string() },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}/shareholders`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_list_directors",
    "List directors for a company",
    { companyId: z.string() },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}/officers`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_share_allotments",
    "Get share allotments and capital structure",
    { companyId: z.string() },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}/shares`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_pending_filings",
    "Get pending Companies House filings",
    { companyId: z.string() },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}/filings/pending`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "id_minutes_and_resolutions",
    "List board minutes and resolutions for a company",
    { companyId: z.string() },
    async ({ companyId }) => {
      const res = await idClient().get(`/companies/${companyId}/documents`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
