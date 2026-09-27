/**
 * API-process side of the cross-process ticket-change notices (see
 * ticket-change-channel.ts).
 *
 * Holds one dedicated Postgres session, outside the pool, that LISTENs on
 * the ticket-change channel. Each notice is validated and handed to
 * TicketLiveEvents.ticketChanged, which resolves recipients from the
 * access rule exactly as for this process's own writes. A malformed
 * notice is dropped with one log line that carries nothing from it.
 *
 * A lost session is replaced with capped exponential backoff and the
 * LISTEN re-issued. The delay starts over only once a session has stayed
 * up for a stability window, so a server that accepts connections and
 * drops them straight away is retried at a falling rate rather than once
 * a second. Notices sent while no session is listening are not
 * queued by Postgres; the affected views stay stale until their next
 * refetch, the same outcome as any missed live event.
 */

import pg from "pg";
import type { Kysely } from "kysely";
import type { OrgSchema } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import type { TicketLiveEvents } from "./ticket-live-events.js";
import {
  TICKET_CHANGED_CHANNEL,
  TICKET_CHANGED_LISTEN_STATEMENT,
  parseTicketChangeNotice,
} from "./ticket-change-channel.js";

/** First reconnect delay after a lost session. */
export const LISTEN_BACKOFF_INITIAL_MS = 1_000;
/** Reconnect delays double up to this cap. */
export const LISTEN_BACKOFF_MAX_MS = 30_000;
/**
 * How long a subscribed session must stay up before the reconnect delay
 * returns to its initial value. A session lost sooner keeps doubling it.
 */
export const LISTEN_STABLE_MS = 30_000;

/** The slice of a node-postgres client the listener uses. */
export interface NotificationClient {
  connect(): Promise<void>;
  query(text: string): Promise<void>;
  end(): Promise<void>;
  onNotification(
    handler: (channel: string, payload: string | undefined) => void,
  ): void;
  onError(handler: (err: Error) => void): void;
  onEnd(handler: () => void): void;
}

/** Wraps a new node-postgres client (not a pooled one) for the listener. */
export function createPgNotificationClient(
  config: pg.ClientConfig,
): NotificationClient {
  const client = new pg.Client(config);
  return {
    async connect(): Promise<void> {
      await client.connect();
    },
    async query(text): Promise<void> {
      await client.query(text);
    },
    async end(): Promise<void> {
      await client.end();
    },
    onNotification(handler): void {
      client.on("notification", (msg) => {
        handler(msg.channel, msg.payload);
      });
    },
    onError(handler): void {
      client.on("error", handler);
    },
    onEnd(handler): void {
      client.on("end", handler);
    },
  };
}

export interface TicketChangeNoticeListenerDeps {
  readonly createClient: () => NotificationClient;
  readonly getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
  readonly liveEvents: TicketLiveEvents;
}

export interface TicketChangeNoticeListener {
  /**
   * Opens the session and subscribes. Resolves after the first attempt
   * whether or not it succeeded; a failure schedules a retry. Never
   * rejects.
   */
  start(): Promise<void>;
  /** Cancels any retry and closes the session. Never rejects. */
  stop(): Promise<void>;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function createTicketChangeNoticeListener(
  deps: TicketChangeNoticeListenerDeps,
): TicketChangeNoticeListener {
  let active: NotificationClient | null = null;
  let stopped = false;
  // TS keeps a flag narrowed across the awaits in connect() although
  // closures reassign it (microsoft/TypeScript#9998); a call reads it
  // fresh.
  const isStopped = (): boolean => stopped;
  let delayMs = LISTEN_BACKOFF_INITIAL_MS;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let stableTimer: ReturnType<typeof setTimeout> | null = null;

  function cancelStableTimer(): void {
    if (stableTimer === null) return;
    clearTimeout(stableTimer);
    stableTimer = null;
  }

  function handleNotice(channel: string, payload: string | undefined): void {
    if (channel !== TICKET_CHANGED_CHANNEL) return;
    const notice = parseTicketChangeNotice(payload);
    if (notice === null) {
      console.warn("Dropped a malformed ticket change notice");
      return;
    }
    void deps.liveEvents.ticketChanged(
      deps.getTenantDb(notice.orgSchema),
      notice.orgSchema,
      notice.ticketId,
    );
  }

  function scheduleReconnect(): void {
    if (stopped || retryTimer !== null) return;
    const wait = delayMs;
    delayMs = Math.min(delayMs * 2, LISTEN_BACKOFF_MAX_MS);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void connect();
    }, wait);
  }

  async function closeClient(client: NotificationClient): Promise<void> {
    try {
      await client.end();
    } catch (err: unknown) {
      console.error("Ticket change listener close failed:", errorMessage(err));
    }
  }

  async function connect(): Promise<void> {
    if (stopped) return;
    const client = deps.createClient();
    const session = { lost: false };

    const onLost = (reason: string): void => {
      if (session.lost) return;
      session.lost = true;
      if (active === client) {
        active = null;
        cancelStableTimer();
      }
      void closeClient(client);
      if (stopped) return;
      console.error("Ticket change listener lost its session:", reason);
      scheduleReconnect();
    };

    client.onNotification(handleNotice);
    client.onError((err) => {
      onLost(err.message);
    });
    client.onEnd(() => {
      onLost("session ended");
    });

    try {
      await client.connect();
      await client.query(TICKET_CHANGED_LISTEN_STATEMENT);
    } catch (err: unknown) {
      onLost(errorMessage(err));
      return;
    }

    if (session.lost) return;
    if (isStopped()) {
      session.lost = true;
      await closeClient(client);
      return;
    }
    active = client;
    stableTimer = setTimeout(() => {
      stableTimer = null;
      delayMs = LISTEN_BACKOFF_INITIAL_MS;
    }, LISTEN_STABLE_MS);
  }

  return {
    start: connect,

    async stop(): Promise<void> {
      stopped = true;
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      cancelStableTimer();
      const client = active;
      active = null;
      if (client !== null) await closeClient(client);
    },
  };
}
