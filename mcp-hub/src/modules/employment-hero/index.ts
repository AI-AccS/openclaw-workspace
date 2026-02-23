/**
 * Employment Hero / KeyPay MCP Tools
 * REST API — https://api.keypay.com.au / https://api.yourpayroll.co.uk (UK)
 * API docs: https://keypay.com.au/au/api
 *
 * Covers: employees, pay runs, leave, timesheets, pay schedules,
 *         payslips, deductions, reports, qualifications
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function keypayClient() {
  const apiKey = process.env.KEYPAY_API_KEY;
  const businessId = process.env.KEYPAY_BUSINESS_ID;
  if (!apiKey) throw new Error("KEYPAY_API_KEY not set in config/.env");
  if (!businessId) throw new Error("KEYPAY_BUSINESS_ID not set in config/.env");

  return {
    http: axios.create({
      baseURL: `https://api.yourpayroll.co.uk/api/v2/business/${businessId}`,
      headers: { Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}` },
      timeout: 15000,
    }),
    businessId,
  };
}

export function registerEmploymentHeroTools(server: McpServer): void {

  server.tool(
    "keypay_list_employees",
    "List all employees in the business",
    {
      filter: z.string().optional().describe("Filter by name or employee number"),
    },
    async ({ filter }) => {
      const { http } = keypayClient();
      const res = await http.get("/employee", { params: filter ? { filter } : {} });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_get_employee",
    "Get details of a specific employee",
    { employeeId: z.number().describe("Employee ID") },
    async ({ employeeId }) => {
      const { http } = keypayClient();
      const res = await http.get(`/employee/${employeeId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_list_pay_runs",
    "List pay runs for the business",
    {
      payScheduleId: z.number().optional().describe("Filter by pay schedule"),
      status: z.enum(["Initialised", "Locked", "Posted"]).optional(),
    },
    async (params) => {
      const { http } = keypayClient();
      const res = await http.get("/payrun", { params });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_get_payslip",
    "Get payslip for an employee in a specific pay run",
    {
      payRunId: z.number(),
      employeeId: z.number(),
    },
    async ({ payRunId, employeeId }) => {
      const { http } = keypayClient();
      const res = await http.get(`/payrun/${payRunId}/payslip/${employeeId}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_list_leave_requests",
    "List leave requests for an employee",
    {
      employeeId: z.number(),
      status: z.enum(["Pending", "Approved", "Declined", "Cancelled"]).optional(),
    },
    async ({ employeeId, status }) => {
      const { http } = keypayClient();
      const res = await http.get(`/employee/${employeeId}/leaverequest`, {
        params: status ? { status } : {},
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_approve_leave",
    "Approve a leave request",
    {
      employeeId: z.number(),
      leaveRequestId: z.number(),
    },
    async ({ employeeId, leaveRequestId }) => {
      const { http } = keypayClient();
      const res = await http.post(`/employee/${employeeId}/leaverequest/${leaveRequestId}/approve`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_employee_report",
    "Generate an employee summary report",
    {},
    async () => {
      const { http } = keypayClient();
      const res = await http.get("/report/employeesummary");
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "keypay_payroll_report",
    "Generate a payroll report for a date range",
    {
      fromDate: z.string().describe("YYYY-MM-DD"),
      toDate: z.string().describe("YYYY-MM-DD"),
    },
    async ({ fromDate, toDate }) => {
      const { http } = keypayClient();
      const res = await http.get("/report/payrollsummary", {
        params: { fromDate, toDate },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
