/**
 * Live ticket-change events over SSE.
 *
 * After a write to a ticket or its follow-ups commits, every user who can
 * open that ticket receives a `ticket_changed` event carrying the ticket
 * id, its queue id and a timestamp, nothing else. An open list, count or
 * feed refetches on it. Recipients come from resolveTicketAudience (the set
 * form of the per-object access check), so a user who cannot open the
 * ticket never learns it exists or changed.
 *
 * These events are live-only. They never pass through the notification
 * outbox, preferences, push, email or the notification feed.
 *
 * Writes made in the inbound email process arrive here through a Postgres
 * notice (ticket-change-channel.ts, ticket-change-listener.ts) and take
 * the same ticketChanged path.
 *
 * Emission is fire-and-forget. The write has already committed when an
 * event is emitted, and a missed event leaves a view stale until its next
 * refetch without losing any data. Failures are logged and do not reach
 * the caller.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SseService } from "../notifications/sse.js";
import type { ClientId, OrgSchema, SseEvent, TicketId } from "@care-y/shared";
import { resolveTicketAudience, type TicketAudience } from "./access.js";
import { listTicketIdsForClients } from "./ticket-service.js";

/**
 * Emits for one ticket in a tenant the caller has already bound. Services
 * that hold only a tenant database take this rather than the emitter.
 */
export type TicketChangeListener = (ticketId: TicketId) => void;

export interface TicketLiveEventsDeps {
  readonly sse: SseService;
}

export interface TicketLiveEvents {
  /**
   * Tells everyone who can open the ticket that it changed. Call after the
   * write commits. Never rejects, so callers need not await it.
   */
  ticketChanged(
    tDb: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
    ticketId: TicketId,
  ): Promise<void>;

  /** Binds ticketChanged to one tenant. */
  forTenant(
    tDb: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
  ): TicketChangeListener;

  /**
   * For tickets about to be deleted: resolves who can open them now, while
   * the rows still exist, and returns the emit to call once the delete has
   * committed. Never rejects; a failed resolution returns a no-op.
   */
  captureRemovals(
    tDb: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
    ticketIds: readonly TicketId[],
  ): Promise<() => void>;
}

function logFailure(err: unknown): void {
  // Logs the message only, never the ticket id, recipients or payload.
  console.error(
    "Live ticket event failed:",
    err instanceof Error ? err.message : String(err),
  );
}

/** Hands each ticket to the listener. Without a listener, does nothing. */
export function announceTickets(
  listener: TicketChangeListener | undefined,
  ticketIds: readonly TicketId[],
): void {
  if (listener === undefined) return;
  for (const id of ticketIds) listener(id);
}

/**
 * Announces every ticket of one client, for a committed write to client
 * state that those tickets display (alias, phone, email, communication
 * tier, portal channel, account). The ticket ids are read after the
 * write, so call it once the write has committed. Never rejects: a failed
 * lookup is logged and leaves views stale until they next refetch.
 */
export async function announceClientTickets(
  tDb: Kysely<TenantDatabase>,
  clientId: ClientId,
  listener: TicketChangeListener | undefined,
): Promise<void> {
  if (listener === undefined) return;
  try {
    announceTickets(listener, await listTicketIdsForClients(tDb, [clientId]));
  } catch (err: unknown) {
    logFailure(err);
  }
}

export function createTicketLiveEvents(
  deps: TicketLiveEventsDeps,
): TicketLiveEvents {
  function broadcast(
    orgSchema: OrgSchema,
    ticketId: TicketId,
    audience: TicketAudience,
  ): void {
    if (audience.userIds.length === 0) return;
    const event: SseEvent = {
      type: "ticket_changed",
      ticketId,
      queueId: audience.queueId,
      timestamp: new Date().toISOString(),
    };
    deps.sse.broadcast(orgSchema, audience.userIds, event);
  }

  async function ticketChanged(
    tDb: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
    ticketId: TicketId,
  ): Promise<void> {
    try {
      const audience = await resolveTicketAudience(tDb, ticketId);
      if (audience === null) return;
      broadcast(orgSchema, ticketId, audience);
    } catch (err: unknown) {
      logFailure(err);
    }
  }

  return {
    ticketChanged,

    forTenant(tDb, orgSchema) {
      return (ticketId) => {
        void ticketChanged(tDb, orgSchema, ticketId);
      };
    },

    async captureRemovals(tDb, orgSchema, ticketIds) {
      const captured: { ticketId: TicketId; audience: TicketAudience }[] = [];
      try {
        for (const ticketId of ticketIds) {
          const audience = await resolveTicketAudience(tDb, ticketId);
          if (audience !== null) captured.push({ ticketId, audience });
        }
      } catch (err: unknown) {
        logFailure(err);
        return () => undefined;
      }
      return () => {
        for (const { ticketId, audience } of captured) {
          try {
            broadcast(orgSchema, ticketId, audience);
          } catch (err: unknown) {
            logFailure(err);
          }
        }
      };
    },
  };
}
