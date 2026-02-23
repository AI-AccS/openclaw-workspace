/**
 * HMRC Making Tax Digital (MTD) MCP Tools
 * Free API — https://developer.service.hmrc.gov.uk
 *
 * Covers: VAT returns, obligations, payments, liabilities,
 *         Self Assessment, PAYE (read), Agent services
 *
 * Auth: OAuth 2.0 — tokens managed via HMRC_ACCESS_TOKEN env var
 * Get credentials at: https://developer.service.hmrc.gov.uk/developer/applications
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function hmrcClient() {
  const token = process.env.HMRC_ACCESS_TOKEN;
  if (!token) throw new Error("HMRC_ACCESS_TOKEN not set in config/.env");

  const isSandbox = (process.env.HMRC_SANDBOX ?? "false") === "true";
  const baseURL = isSandbox
    ? "https://test-api.service.hmrc.gov.uk"
    : "https://api.service.hmrc.gov.uk";

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.hmrc.1.0+json",
    },
    timeout: 15000,
  });
}

export function registerHMRCTools(server: McpServer): void {

  // ── VAT ──────────────────────────────────────────────────────────────────────

  server.tool(
    "hmrc_vat_obligations",
    "Get VAT return obligations for a VAT-registered business",
    {
      vrn: z.string().describe("VAT Registration Number (9 digits)"),
      from: z.string().describe("Period start YYYY-MM-DD"),
      to: z.string().describe("Period end YYYY-MM-DD"),
      status: z.enum(["O", "F"]).optional().describe("O=Open, F=Fulfilled"),
    },
    async ({ vrn, from, to, status }) => {
      const res = await hmrcClient().get(`/organisations/vat/${vrn}/obligations`, {
        params: { from, to, ...(status ? { status } : {}) },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "hmrc_vat_return",
    "Retrieve a submitted VAT return",
    {
      vrn: z.string().describe("VAT Registration Number"),
      periodKey: z.string().describe("Period key from obligations e.g. 18AA"),
    },
    async ({ vrn, periodKey }) => {
      const res = await hmrcClient().get(`/organisations/vat/${vrn}/returns/${periodKey}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "hmrc_submit_vat_return",
    "Submit a VAT return to HMRC",
    {
      vrn: z.string().describe("VAT Registration Number"),
      periodKey: z.string().describe("Period key from obligations"),
      vatDueSales: z.number().describe("VAT due on sales (Box 1)"),
      vatDueAcquisitions: z.number().describe("VAT due on acquisitions (Box 2)"),
      totalVatDue: z.number().describe("Total VAT due (Box 3 = Box 1 + Box 2)"),
      vatReclaimedCurrPeriod: z.number().describe("VAT reclaimed (Box 4)"),
      netVatDue: z.number().describe("Net VAT payable (Box 5 = |Box 3 - Box 4|)"),
      totalValueSalesExVAT: z.number().describe("Total value of sales ex-VAT (Box 6)"),
      totalValuePurchasesExVAT: z.number().describe("Total value of purchases ex-VAT (Box 7)"),
      totalValueGoodsSuppliedExVAT: z.number().describe("Total goods to EC ex-VAT (Box 8)"),
      totalAcquisitionsExVAT: z.number().describe("Total acquisitions from EC ex-VAT (Box 9)"),
      finalised: z.boolean().describe("Must be true to submit"),
    },
    async ({ vrn, ...body }) => {
      const res = await hmrcClient().post(`/organisations/vat/${vrn}/returns`, body);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "hmrc_vat_liabilities",
    "Get VAT liabilities (amounts owed to HMRC)",
    {
      vrn: z.string().describe("VAT Registration Number"),
      from: z.string().describe("Period start YYYY-MM-DD"),
      to: z.string().describe("Period end YYYY-MM-DD"),
    },
    async ({ vrn, from, to }) => {
      const res = await hmrcClient().get(`/organisations/vat/${vrn}/liabilities`, {
        params: { from, to },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "hmrc_vat_payments",
    "Get VAT payments received by HMRC",
    {
      vrn: z.string().describe("VAT Registration Number"),
      from: z.string().describe("Period start YYYY-MM-DD"),
      to: z.string().describe("Period end YYYY-MM-DD"),
    },
    async ({ vrn, from, to }) => {
      const res = await hmrcClient().get(`/organisations/vat/${vrn}/payments`, {
        params: { from, to },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  // ── Self Assessment ───────────────────────────────────────────────────────────

  server.tool(
    "hmrc_sa_obligations",
    "Get Self Assessment obligations for an individual",
    {
      utr: z.string().describe("Unique Taxpayer Reference (10 digits)"),
      from: z.string().optional().describe("Period start YYYY-MM-DD"),
      to: z.string().optional().describe("Period end YYYY-MM-DD"),
    },
    async ({ utr, from, to }) => {
      const res = await hmrcClient().get(
        `/self-assessment/ni/${utr}/self-employments/obligations`,
        { params: { from, to } }
      );
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  // ── Agent Services ────────────────────────────────────────────────────────────

  server.tool(
    "hmrc_agent_clients",
    "List clients authorised for an agent (requires Agent Services Account)",
    {
      service: z.enum(["MTD-VAT", "MTD-IT", "HMRC-MTD-CT"]).describe("Service type"),
    },
    async ({ service }) => {
      const arn = process.env.HMRC_AGENT_ARN;
      if (!arn) throw new Error("HMRC_AGENT_ARN not set in config/.env");
      const res = await hmrcClient().get(
        `/agents/${arn}/client-authorisations`,
        { params: { service } }
      );
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
