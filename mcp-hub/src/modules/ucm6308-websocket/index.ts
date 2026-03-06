/**
 * UCM6308 WebSocket Real-Time Events
 * Adds live event streaming: ActiveCallStatus, PbxStatus, ExtensionStatus, etc.
 * Based on Grandstream WebSocket API: wss://[PBX_IP]:8089/websockify
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Type declarations for ws module (since @types/ws not installed)
declare module 'ws' {
  export default class WebSocket {
    constructor(url: string);
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    send(data: string, callback?: (err?: Error) => void): void;
    close(code?: number, data?: string | Buffer): void;
    readonly readyState: number;
  }
  export const OPEN = 1;
  export const CLOSED = 3;
}

interface WebSocketSession {
  socket: any; // ws.WebSocket (avoiding type issues)
  transactionId: string;
  subscribedEvents: string[];
  isLoggedIn: boolean;
  heartbeatInterval?: NodeJS.Timeout;
}

const sessions = new Map<string, WebSocketSession>();

// Generate unique transaction ID
function nextTransactionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Send message over WebSocket and wait for response
function sendWebSocketMessage(session: WebSocketSession, message: Record<string, any>): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(message);
    
    session.socket.send(payload, (err?: Error) => {
      if (err) {
        reject(err);
      }
    });

    const timeout = setTimeout(() => {
      session.socket.off('message', responseHandler);
      reject(new Error('WebSocket message timeout'));
    }, 10000);

    const responseHandler = (data: Buffer) => {
      try {
        const response: Record<string, any> = JSON.parse(data.toString());
        const msgTxnId = message.transactionid || message.message?.transactionid;
        if ((response.message && response.message.transactionid === msgTxnId) || 
            (response.response && response.response.transactionid === msgTxnId)) {
          session.socket.off('message', responseHandler);
          clearTimeout(timeout);
          resolve(response);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    session.socket.on('message', responseHandler);
  });
}

function createResponse(data: Record<string, any>): Record<string, any> {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function registerUCM6308WebSocketTools(server: McpServer): void {

  // ── WebSocket Connection ─────────────

  server.tool(
    "ucm_websocket_connect",
    "Establish a WebSocket connection to UCM6308 for real-time events.",
    {
      pbxHost: z.string().describe("UCM IP or hostname, e.g. 192.168.1.148"),
      pbxPort: z.number().optional().default(8089).describe("WebSocket port (default 8089)"),
      username: z.string().describe("UCM API username (API user, not SIP extension)"),
      password: z.string().describe("UCM API password"),
      sessionId: z.string().optional().describe("Custom session ID"),
    },
    async ({ pbxHost, pbxPort = 8089, username, password, sessionId }) => {
      const wsModule = await import('ws');
      const sid = sessionId || `ucm-${Date.now()}`;
      const wsUrl = `wss://${pbxHost}:${pbxPort}/websockify`;
      
      try {
        const socket = new wsModule.default(wsUrl);
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.close();
            reject(new Error('Connection timeout'));
          }, 10000);

          socket.on('open', () => {
            clearTimeout(timeout);
            sessions.set(sid, {
              socket,
              transactionId: nextTransactionId(),
              subscribedEvents: [],
              isLoggedIn: false,
            });
            resolve(createResponse({
              success: true,
              sessionId: sid,
              status: 'connected',
              message: `Connected to ${wsUrl}. Next: authenticate with ucm_websocket_auth.`,
            }));
          });

          socket.on('error', (err: Error) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      } catch (err) {
        return createResponse({ error: `Failed to connect: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
  );

  // ── Authentication ─────────────

  server.tool(
    "ucm_websocket_auth",
    "Authenticate WebSocket session using challenge-response.",
    {
      sessionId: z.string().describe("Session ID from connect"),
      username: z.string().describe("UCM API username"),
      password: z.string().describe("UCM API password"),
    },
    async ({ sessionId, username, password }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      try {
        // Step 1: Get challenge
        const challengeTxnId = nextTransactionId();
        const challengeResponse: Record<string, any> = await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: challengeTxnId,
            action: "challenge",
            username: username,
            version: "1"
          }
        });

        if (!challengeResponse.response?.challenge) {
          return createResponse({ error: 'Challenge failed', raw: challengeResponse });
        }

        const challenge = challengeResponse.response.challenge;

        // Step 2: Login with MD5
        const crypto = await import('crypto');
        const md5Hash = crypto.createHash('md5').update(challenge + password).digest('hex');

        const loginTxnId = nextTransactionId();
        const loginResponse: Record<string, any> = await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: loginTxnId,
            action: "login",
            username: username,
            password: md5Hash,
            version: "1"
          }
        });

        if (loginResponse.response?.status === 0 || loginResponse.status === 0) {
          session.isLoggedIn = true;
          return createResponse({ success: true, message: 'Authenticated', sessionId });
        }

        return createResponse({ error: 'Authentication failed', raw: loginResponse });
      } catch (err) {
        return createResponse({ error: `Auth failed: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
  );

  // ── Subscribe ─────────────

  server.tool(
    "ucm_websocket_subscribe",
    "Subscribe to real-time UCM events.",
    {
      sessionId: z.string().describe("Session ID"),
      eventNames: z.array(z.string()).describe("Events: ActiveCallStatus, PbxStatus, ExtensionStatus, etc."),
    },
    async ({ sessionId, eventNames }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }
      if (!session.isLoggedIn) {
        return createResponse({ error: 'Not authenticated. Call ucm_websocket_auth first.' });
      }

      try {
        const txnId = nextTransactionId();
        const response: Record<string, any> = await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: txnId,
            action: "subscribe",
            eventnames: eventNames
          }
        });

        if (response.response?.status === 0 || response.status === 0) {
          session.subscribedEvents.push(...eventNames);
          return createResponse({ success: true, subscribed: eventNames });
        }

        return createResponse({ error: 'Subscription failed', raw: response });
      } catch (err) {
        return createResponse({ error: `Subscribe failed: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
  );

  // ── Unsubscribe ─────────────

  server.tool(
    "ucm_websocket_unsubscribe",
    "Unsubscribe from events.",
    {
      sessionId: z.string().describe("Session ID"),
      eventNames: z.array(z.string()).describe("Events to unsubscribe"),
    },
    async ({ sessionId, eventNames }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      try {
        const txnId = nextTransactionId();
        const response: Record<string, any> = await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: txnId,
            action: "unsubscribe",
            eventnames: eventNames
          }
        });

        if (response.response?.status === 0 || response.status === 0) {
          session.subscribedEvents = session.subscribedEvents.filter(e => !eventNames.includes(e));
          return createResponse({ success: true, unsubscribed: eventNames });
        }

        return createResponse({ error: 'Unsubscribe failed', raw: response });
      } catch (err) {
        return createResponse({ error: `Unsubscribe failed: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
  );

  // ── Heartbeat ─────────────

  server.tool(
    "ucm_websocket_heartbeat",
    "Send keep-alive heartbeat.",
    {
      sessionId: z.string().describe("Session ID"),
    },
    async ({ sessionId }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      try {
        const txnId = nextTransactionId();
        const response: Record<string, any> = await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: txnId,
            action: "heartbeat"
          }
        });

        return createResponse({ success: true, raw: response });
      } catch (err) {
        return createResponse({ error: `Heartbeat failed: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
  );

  // ── Listen to events ─────────────

  server.tool(
    "ucm_websocket_listen",
    "Listen to incoming events for N seconds.",
    {
      sessionId: z.string().describe("Session ID"),
      durationSeconds: z.number().optional().default(30).describe("How long to listen (max 300s)"),
    },
    async ({ sessionId, durationSeconds = 30 }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      const events: Array<Record<string, any>> = [];
      const maxDuration = Math.min(durationSeconds, 300);
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          session.socket.off('message', eventHandler);
          resolve(createResponse({ success: true, eventsReceived: events.length, events }));
        }, maxDuration * 1000);

        const eventHandler = (data: Buffer) => {
          try {
            const message: Record<string, any> = JSON.parse(data.toString());
            if (message.type === 'request' && message.action === 'notify') {
              events.push({
                timestamp: new Date().toISOString(),
                eventName: message.eventname,
                action: message.action,
                body: message.eventbody
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        session.socket.on('message', eventHandler);
      });
    }
  );

  // ── Status ─────────────

  server.tool(
    "ucm_websocket_status",
    "Get WebSocket session status.",
    {
      sessionId: z.string().describe("Session ID"),
    },
    async ({ sessionId }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      return createResponse({
        sessionId,
        connected: session.socket.readyState === 1, // OPEN state
        isLoggedIn: session.isLoggedIn,
        subscribedEvents: session.subscribedEvents,
      });
    }
  );

  // ── Disconnect ─────────────

  server.tool(
    "ucm_websocket_disconnect",
    "Close WebSocket and cleanup.",
    {
      sessionId: z.string().describe("Session ID"),
    },
    async ({ sessionId }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        return createResponse({ error: `Session not found: ${sessionId}` });
      }

      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }

      try {
        await sendWebSocketMessage(session, {
          type: "request",
          message: {
            transactionid: nextTransactionId(),
            action: "logout"
          }
        });
      } catch (e) {
        // Ignore logout errors
      }

      session.socket.close();
      sessions.delete(sessionId);

      return createResponse({ success: true, message: `Disconnected session ${sessionId}` });
    }
  );
}
