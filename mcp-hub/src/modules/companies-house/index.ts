/**
 * Companies House MCP Tools
 * Free REST API — https://developer.company-information.service.gov.uk
 * Requires a free API key from: https://developer.company-information.service.gov.uk/manage-applications
 *
 * Covers: company search, company profile, officers, PSCs,
 *         filing history, charges, registered address, insolvency
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

function chClient() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) throw new Error("COMPANIES_HOUSE_API_KEY not set in config/.env");

  return axios.create({
    baseURL: "https://api.company-information.service.gov.uk",
    auth: { username: apiKey, password: "" }, // Basic auth: key as username, empty password
    timeout: 10000,
  });
}

export function registerCompaniesHouseTools(server: McpServer): void {

  server.tool(
    "ch_search_companies",
    "Search for companies on Companies House by name or keyword",
    {
      query: z.string().describe("Company name or keyword to search"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async ({ query, limit = 20 }) => {
      const res = await chClient().get("/search/companies", {
        params: { q: query, items_per_page: limit },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_company",
    "Get full company profile from Companies House by company number",
    { companyNumber: z.string().describe("Company number e.g. SC123456") },
    async ({ companyNumber }) => {
      const res = await chClient().get(`/company/${companyNumber}`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_officers",
    "Get list of officers (directors, secretaries) for a company",
    {
      companyNumber: z.string(),
      page: z.number().optional(),
    },
    async ({ companyNumber, page = 0 }) => {
      const res = await chClient().get(`/company/${companyNumber}/officers`, {
        params: { start_index: page * 35 },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_pscs",
    "Get Persons with Significant Control (PSCs / beneficial owners) for a company",
    { companyNumber: z.string() },
    async ({ companyNumber }) => {
      const res = await chClient().get(`/company/${companyNumber}/persons-with-significant-control`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_filing_history",
    "Get filing history for a company",
    {
      companyNumber: z.string(),
      category: z.string().optional().describe("Filter by category e.g. accounts, confirmation-statement, capital"),
      limit: z.number().optional(),
    },
    async ({ companyNumber, category, limit = 25 }) => {
      const res = await chClient().get(`/company/${companyNumber}/filing-history`, {
        params: { items_per_page: limit, ...(category ? { category } : {}) },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_charges",
    "Get charges (mortgages, debentures) registered against a company",
    { companyNumber: z.string() },
    async ({ companyNumber }) => {
      const res = await chClient().get(`/company/${companyNumber}/charges`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_registered_address",
    "Get the registered office address for a company",
    { companyNumber: z.string() },
    async ({ companyNumber }) => {
      const res = await chClient().get(`/company/${companyNumber}/registered-office-address`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_get_insolvency",
    "Get insolvency information for a company",
    { companyNumber: z.string() },
    async ({ companyNumber }) => {
      const res = await chClient().get(`/company/${companyNumber}/insolvency`);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_search_officers",
    "Search for officers (directors) by name across all companies",
    {
      query: z.string().describe("Officer name to search"),
      limit: z.number().optional(),
    },
    async ({ query, limit = 20 }) => {
      const res = await chClient().get("/search/officers", {
        params: { q: query, items_per_page: limit },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  server.tool(
    "ch_advanced_search",
    "Advanced company search with filters (status, type, SIC code, incorporation date range)",
    {
      companyNameIncludes: z.string().optional(),
      companyStatus: z.enum(["active", "dissolved", "liquidation", "administration", "receivership"]).optional(),
      companyType: z.string().optional().describe("e.g. ltd, plc, llp"),
      sicCodes: z.string().optional().describe("Comma-separated SIC codes"),
      incorporatedFrom: z.string().optional().describe("YYYY-MM-DD"),
      incorporatedTo: z.string().optional().describe("YYYY-MM-DD"),
      limit: z.number().optional(),
    },
    async (params) => {
      const res = await chClient().get("/advanced-search/companies", {
        params: {
          company_name_includes: params.companyNameIncludes,
          company_status: params.companyStatus,
          company_type: params.companyType,
          sic_codes: params.sicCodes,
          incorporated_from: params.incorporatedFrom,
          incorporated_to: params.incorporatedTo,
          size: params.limit ?? 20,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );
}
