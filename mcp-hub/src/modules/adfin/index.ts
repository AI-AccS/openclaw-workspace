/**
 * Adfin MCP Tools
 * Adfin is a payment collection platform for accountants
 * REST API — https://developers.adfin.com
 * Set ADFIN_API_KEY in config/.env
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function adfinClient() {
  const apiKey = process.env.ADFIN_API_KEY;
  if (!apiKey) throw new Error("ADFIN_API_KEY not set in config/.env");

  return axios.create({
    baseURL: "https://api.adfin.com/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

export function registerADFinTools(server: McpServer): void {

  server.tool(
    "adfin_list_payment_requests",
    "List payment requests sent via Adfin",
    {
      status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
      limit: z.number().optional(),
    },
    async (params) => {
      const res = await adfinClient().get("/payment-requests", { params });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "adfin_create_payment_request",
    "Create a new payment request (invoice collection)",
    {
      clientEmail: z.string().describe("Client email address"),
      clientName: z.string(),
      amount: z.number().describe("Amount in pence (e.g. 10000 = £100.00)"),
      currency: z.string().optional().describe("Currency code (default GBP)"),
      description: z.string().describe("Payment description"),
      dueDate: z.string().optional().describe("Due date YYYY-MM-DD"),
      reference: z.string().optional().describe("Your internal reference"),
    },
    async (params) => {
      const res = await adfinClient().post("/payment-requests", params);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "adfin_get_payment_request",
    "Get details of a specific payment request",
    { paymentRequestId: z.string() },
    async ({ paymentRequestId }) => {
      const res = await adfinClient().get(`/payment-requests/${paymentRequestId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "adfin_cancel_payment_request",
    "Cancel a pending payment request",
    { paymentRequestId: z.string() },
    async ({ paymentRequestId }) => {
      const res = await adfinClient().post(`/payment-requests/${paymentRequestId}/cancel`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "adfin_payment_summary",
    "Get a summary of payments collected",
    {
      from: z.string().optional().describe("Start date YYYY-MM-DD"),
      to: z.string().optional().describe("End date YYYY-MM-DD"),
    },
    async (params) => {
      const res = await adfinClient().get("/reports/summary", { params });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
