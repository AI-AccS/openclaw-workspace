/**
 * One Gateways MCP Tools
 * Payment processing — https://www.onegateway.co.uk
 * Set ONE_GATEWAYS_API_KEY and ONE_GATEWAYS_MERCHANT_ID in config/.env
 * Contact One Gateways for API documentation and sandbox credentials
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function ogClient() {
  const apiKey = process.env.ONE_GATEWAYS_API_KEY;
  if (!apiKey) throw new Error("ONE_GATEWAYS_API_KEY not set in config/.env");

  const isSandbox = (process.env.ONE_GATEWAYS_SANDBOX ?? "false") === "true";
  const baseURL = isSandbox
    ? "https://sandbox.onegateway.co.uk/api/v1"
    : "https://api.onegateway.co.uk/api/v1";

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

export function registerOneGatewaysTools(server: McpServer): void {

  server.tool(
    "og_list_transactions",
    "List payment transactions processed via One Gateways",
    {
      status: z.enum(["pending", "captured", "refunded", "failed", "voided"]).optional(),
      from: z.string().optional().describe("Start date YYYY-MM-DD"),
      to: z.string().optional().describe("End date YYYY-MM-DD"),
      limit: z.number().optional(),
    },
    async (params) => {
      const res = await ogClient().get("/transactions", { params });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "og_get_transaction",
    "Get details of a specific transaction",
    { transactionId: z.string() },
    async ({ transactionId }) => {
      const res = await ogClient().get(`/transactions/${transactionId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "og_refund_transaction",
    "Issue a full or partial refund on a captured transaction",
    {
      transactionId: z.string(),
      amount: z.number().optional().describe("Refund amount in pence. Omit for full refund."),
      reason: z.string().optional(),
    },
    async ({ transactionId, ...body }) => {
      const res = await ogClient().post(`/transactions/${transactionId}/refund`, body);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "og_create_payment_link",
    "Create a hosted payment page link",
    {
      amount: z.number().describe("Amount in pence"),
      currency: z.string().optional().describe("Currency code (default GBP)"),
      description: z.string(),
      customerEmail: z.string().optional(),
      reference: z.string().optional(),
      expiresAt: z.string().optional().describe("Expiry datetime ISO 8601"),
    },
    async (params) => {
      const res = await ogClient().post("/payment-links", params);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "og_settlement_report",
    "Get settlement report for a date range",
    {
      from: z.string().describe("YYYY-MM-DD"),
      to: z.string().describe("YYYY-MM-DD"),
    },
    async (params) => {
      const res = await ogClient().get("/reports/settlement", { params });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
