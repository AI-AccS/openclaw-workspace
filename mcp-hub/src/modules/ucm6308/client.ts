/**
 * Grandstream UCM6308 REST API Client
 * Handles authentication (challenge/response) and all API calls.
 *
 * Auth flow:
 *   1. GET /api?action=challenge&user=<username>  → returns { response: "<challenge>" }
 *   2. GET /api?action=login&user=<user>&token=md5(md5(pass)+challenge) → sets session cookie
 *   3. All subsequent requests include that cookie
 *
 * Session is cached and auto-renewed if it expires (status 6).
 */

import axios, { type AxiosInstance } from "axios";
import https from "https";
import md5 from "md5";

export interface UCMConfig {
  host: string;     // IP or hostname
  port: number;     // 8089 for HTTPS, 80 for HTTP
  username: string;
  password: string;
  useHttps: boolean;
}

export class UCM6308Client {
  private http: AxiosInstance;
  private config: UCMConfig;
  private sessionCookie: string | null = null;

  constructor(config: UCMConfig) {
    this.config = config;

    const protocol = config.useHttps ? "https" : "http";
    const baseURL = `${protocol}://${config.host}:${config.port}/api`;

    this.http = axios.create({
      baseURL,
      timeout: 15000,
      // Accept self-signed certificates — UCM ships with one by default
      httpsAgent: config.useHttps
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
    });
  }

  // ── Authentication ───────────────────────────────────────────────────────────

  async login(): Promise<void> {
    // Step 1: Challenge
    const challengeRes = await this.http.get("", {
      params: { action: "challenge", user: this.config.username },
    });

    const challenge: string = challengeRes.data?.response;
    if (!challenge) {
      throw new Error(`UCM6308 login: no challenge returned — ${JSON.stringify(challengeRes.data)}`);
    }

    // Step 2: Login token = md5( md5(password) + challenge )
    const token = md5(md5(this.config.password) + challenge);

    const loginRes = await this.http.get("", {
      params: { action: "login", user: this.config.username, token },
    });

    if (loginRes.data?.status !== 0) {
      throw new Error(`UCM6308 login failed: ${JSON.stringify(loginRes.data)}`);
    }

    // Capture session cookie
    const setCookie = loginRes.headers["set-cookie"];
    if (setCookie?.[0]) {
      this.sessionCookie = setCookie[0].split(";")[0];
    }
  }

  async logout(): Promise<void> {
    if (!this.sessionCookie) return;
    try {
      await this.rawGet({ action: "logout" });
    } finally {
      this.sessionCookie = null;
    }
  }

  // ── Low-level helpers ────────────────────────────────────────────────────────

  private async rawGet(params: Record<string, unknown>): Promise<unknown> {
    const res = await this.http.get("", {
      params,
      headers: this.sessionCookie ? { Cookie: this.sessionCookie } : {},
    });
    return res.data;
  }

  private async rawPost(body: Record<string, unknown>): Promise<unknown> {
    const res = await this.http.post("", body, {
      headers: {
        "Content-Type": "application/json",
        ...(this.sessionCookie ? { Cookie: this.sessionCookie } : {}),
      },
    });
    return res.data;
  }

  // ── Authenticated API call ───────────────────────────────────────────────────

  async get<T = unknown>(
    action: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.withAuth(() => this.rawGet({ action, ...params })) as Promise<T>;
  }

  async post<T = unknown>(
    action: string,
    body: Record<string, unknown> = {}
  ): Promise<T> {
    return this.withAuth(() => this.rawPost({ action, ...body })) as Promise<T>;
  }

  private async withAuth(fn: () => Promise<unknown>): Promise<unknown> {
    if (!this.sessionCookie) await this.login();

    let data = await fn() as Record<string, unknown>;

    // Status 6 = session expired — re-login once and retry
    if (data?.status === 6) {
      this.sessionCookie = null;
      await this.login();
      data = await fn() as Record<string, unknown>;
    }

    if (data?.status !== 0) {
      throw new Error(`UCM6308 API error: ${JSON.stringify(data)}`);
    }

    return data;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _client: UCM6308Client | null = null;

export function getUCMClient(): UCM6308Client {
  if (!_client) {
    const host = process.env.UCM_HOST;
    if (!host) {
      throw new Error(
        "UCM_HOST not configured. Set it in mcp-hub/config/.env"
      );
    }
    _client = new UCM6308Client({
      host,
      port: parseInt(process.env.UCM_PORT ?? "8089", 10),
      username: process.env.UCM_USER ?? "admin",
      password: process.env.UCM_PASS ?? "",
      useHttps: (process.env.UCM_HTTPS ?? "true") !== "false",
    });
  }
  return _client;
}
