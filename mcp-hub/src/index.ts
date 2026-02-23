/**
 * MCP Hub - Central aggregator for all business integrations
 * Runs as a single MCP server exposing tools from all modules
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import { registerUCM6308Tools } from "./modules/ucm6308/index.js";
import { registerCompaniesHouseTools } from "./modules/companies-house/index.js";
import { registerHMRCTools } from "./modules/hmrc/index.js";
import { registerEmploymentHeroTools } from "./modules/employment-hero/index.js";
import { registerSyftTools } from "./modules/syft/index.js";
import { registerADFinTools } from "./modules/adfin/index.js";
import { registerInformDirectTools } from "./modules/inform-direct/index.js";
import { registerOneGatewaysTools } from "./modules/one-gateways/index.js";

// Load environment variables from config/.env
dotenv.config({ path: new URL("../config/.env", import.meta.url).pathname });

const server = new McpServer({
  name: "mcp-hub",
  version: "1.0.0",
});

// ── Register all modules ───────────────────────────────────────────────────────

// Priority 1: Phone System
registerUCM6308Tools(server);

// Accounting & Finance
registerCompaniesHouseTools(server);
registerHMRCTools(server);
registerADFinTools(server);

// HR & Payroll
registerEmploymentHeroTools(server);

// Company Secretarial
registerInformDirectTools(server);

// Analytics
registerSyftTools(server);

// Payments
registerOneGatewaysTools(server);

// ── Start server ───────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Hub started — all modules registered");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
