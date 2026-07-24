// Server-Sent Events (SSE) service for real-time notifications.
// One stream per authenticated user, org-scoped.
// Events carry metadata only (ticket IDs, queue names, timestamps). No PII.

import type { ServerResponse } from "node:http";
import type { SseEvent } from "@care-y/shared";

interface SseConnection {
  readonly res: ServerResponse;
  readonly userId: string;
  readonly orgId: string;
  lastEventId: number;
}

export interface SseService {
  /** Registers a new SSE connection for a user. Returns a cleanup function. */
  connect(
    res: ServerResponse,
    userId: string,
    orgId: string,
    lastEventId?: number,
  ): () => void;

  /** Sends an event to all connected users in the recipient list for a given org. */
  broadcast(
    orgId: string,
    recipientUserIds: readonly string[],
    event: SseEvent,
  ): void;

  /** Returns count of active connections (for health/monitoring). */
  connectionCount(): number;

  /** Closes all connections (graceful shutdown). */
  closeAll(): void;
}

export function createSseService(): SseService {
  const connections = new Map<string, SseConnection[]>();
  let eventCounter = 0;

  // Buffer: recent events for Last-Event-ID replay (5-minute window)
  const recentEvents: {
    id: number;
    orgId: string;
    recipientUserIds: readonly string[];
    data: string;
    timestamp: number;
  }[] = [];
  const BUFFER_TTL_MS = 5 * 60 * 1000;
  // Phone + computer + one spare (tablet, work machine). Exceeding the
  // limit evicts the oldest connection rather than rejecting the new one.
  const MAX_CONNECTIONS_PER_USER = 3;

  function pruneBuffer(): void {
    const cutoff = Date.now() - BUFFER_TTL_MS;
    while (
      recentEvents.length > 0 &&
      (recentEvents[0]?.timestamp ?? 0) < cutoff
    ) {
      recentEvents.shift();
    }
  }

  function sendEvent(conn: SseConnection, id: number, data: string): void {
    if (conn.res.destroyed) return;
    conn.res.write(`id: ${String(id)}\ndata: ${data}\n\n`);
    conn.lastEventId = id;
  }

  return {
    connect(res, userId, orgId, lastEventId) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx/Caddy buffering
      });

      // Send initial comment to establish connection
      res.write(": connected\n\n");

      const conn: SseConnection = {
        res,
        userId,
        orgId,
        lastEventId: lastEventId ?? 0,
      };

      const key = `${orgId}:${userId}`;
      const existing = connections.get(key) ?? [];

      // Evict oldest connections when the per-user limit is reached.
      // Prevents a single authenticated user from exhausting server memory.
      while (existing.length >= MAX_CONNECTIONS_PER_USER) {
        const oldest = existing.shift();
        if (oldest && !oldest.res.destroyed) {
          oldest.res.end();
        }
      }

      existing.push(conn);
      connections.set(key, existing);

      // Replay missed events if Last-Event-ID was provided
      if (lastEventId !== undefined) {
        pruneBuffer();
        for (const evt of recentEvents) {
          if (
            evt.id > lastEventId &&
            evt.orgId === orgId &&
            evt.recipientUserIds.includes(userId)
          ) {
            sendEvent(conn, evt.id, evt.data);
          }
        }
      }

      // Heartbeat to detect dead connections (every 30s)
      const heartbeat = setInterval(() => {
        if (conn.res.destroyed) {
          clearInterval(heartbeat);
          return;
        }
        conn.res.write(": heartbeat\n\n");
      }, 30_000);

      // Cleanup function
      return (): void => {
        clearInterval(heartbeat);
        const conns = connections.get(key);
        if (conns) {
          const idx = conns.indexOf(conn);
          if (idx !== -1) conns.splice(idx, 1);
          if (conns.length === 0) connections.delete(key);
        }
        if (!res.destroyed) res.end();
      };
    },

    broadcast(orgId, recipientUserIds, event) {
      const data = JSON.stringify(event);
      eventCounter += 1;
      const id = eventCounter;

      // Buffer for replay
      recentEvents.push({
        id,
        orgId,
        recipientUserIds,
        data,
        timestamp: Date.now(),
      });
      pruneBuffer();

      // Send to all matching connections
      for (const userId of recipientUserIds) {
        const key = `${orgId}:${userId}`;
        const conns = connections.get(key);
        if (!conns) continue;
        for (const conn of conns) {
          sendEvent(conn, id, data);
        }
      }
    },

    connectionCount() {
      let count = 0;
      for (const conns of connections.values()) {
        count += conns.length;
      }
      return count;
    },

    closeAll() {
      for (const conns of connections.values()) {
        for (const conn of conns) {
          if (!conn.res.destroyed) conn.res.end();
        }
      }
      connections.clear();
    },
  };
}
