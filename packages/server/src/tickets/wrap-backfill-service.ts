/**
 * Ticket key wrap backfill service.
 *
 * When a volunteer joins a queue, they need ticket key wraps for the
 * queue's existing tickets so they can decrypt them. This service
 * provides the server-side endpoints for:
 *
 * 1. Querying which tickets in a user's queues are missing wraps for
 *    them (the "pending backfill" query, called by the client sweep).
 * 2. Accepting client-minted ECIES wraps for those tickets (the
 *    "submit backfill" mutation, called by an existing holder).
 *
 * The client-side sweep runs on login for any holder who can decrypt
 * tickets in the affected queues, following the resumable org-reseal
 * pattern from ADR-107.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ForbiddenError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { TicketId, UserId, QueueId, KeyGeneration } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WrapBackfillPendingTicket {
  readonly ticketId: TicketId;
  readonly queueId: QueueId;
  readonly keyGeneration: string;
}

export interface WrapBackfillTarget {
  readonly volunteerId: UserId;
  readonly volPublic: string; // base64url
}

export interface WrapBackfillWrap {
  readonly ticketId: TicketId;
  readonly volunteerId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface WrapBackfillResult {
  readonly inserted: number;
}

export interface WrapBackfillService {
  /**
   * Returns tickets in the caller's queues that are missing wraps for
   * at least one active queue member. The caller must hold a wrap for
   * each returned ticket (they are the "existing holder" who will do
   * the re-wrapping). Limited to `limit` rows per call.
   */
  listPendingBackfills(
    callerId: UserId,
    limit: number,
  ): Promise<{
    tickets: readonly WrapBackfillPendingTicket[];
    targets: readonly WrapBackfillTarget[];
  }>;

  /**
   * Accepts client-minted ECIES wraps for tickets the caller holds.
   * Validates that each target is an active queue member, and that the
   * caller holds a wrap for each ticket. Idempotent: skips duplicates.
   */
  submitBackfillWraps(
    callerId: UserId,
    wraps: readonly WrapBackfillWrap[],
  ): Promise<WrapBackfillResult>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createWrapBackfillService(
  db: Kysely<TenantDatabase>,
): WrapBackfillService {
  return {
    async listPendingBackfills(
      callerId,
      limit,
    ): Promise<{
      tickets: readonly WrapBackfillPendingTicket[];
      targets: readonly WrapBackfillTarget[];
    }> {
      // Find queues the caller belongs to
      const callerQueues = await db
        .selectFrom("queue_assignments")
        .select("queue_id")
        .where("user_id", "=", callerId)
        .execute();

      if (callerQueues.length === 0) {
        return { tickets: [], targets: [] };
      }

      const queueIds = callerQueues.map((r) => r.queue_id);

      // Find all active queue members with vol_public across the caller's queues
      const allMembers = await db
        .selectFrom("queue_assignments")
        .innerJoin(
          "user_keys",
          "user_keys.user_id",
          "queue_assignments.user_id",
        )
        .innerJoin("users", "users.id", "queue_assignments.user_id")
        .select([
          "queue_assignments.user_id",
          "queue_assignments.queue_id",
          "user_keys.vol_public",
        ])
        .where("queue_assignments.queue_id", "in", queueIds)
        .where("user_keys.vol_public", "is not", null)
        .where("users.is_active", "=", true)
        .execute();

      // Build a per-queue member set
      const queueMemberMap = new Map<QueueId, Set<UserId>>();
      const memberKeys = new Map<UserId, Buffer>();
      for (const m of allMembers) {
        if (m.vol_public === null) continue;
        let set = queueMemberMap.get(m.queue_id);
        if (!set) {
          set = new Set();
          queueMemberMap.set(m.queue_id, set);
        }
        set.add(m.user_id);
        if (!memberKeys.has(m.user_id)) {
          memberKeys.set(m.user_id, m.vol_public);
        }
      }

      // Find tickets in the caller's queues where the caller holds a wrap
      // and at least one queue member lacks a wrap
      const tickets = await db
        .selectFrom("tickets as t")
        .innerJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", callerId),
        )
        .select(["t.id", "t.queue_id", "t.key_generation"])
        .where("t.queue_id", "in", queueIds)
        .where("t.status", "=", "open")
        .limit(limit)
        .execute();

      if (tickets.length === 0) {
        return { tickets: [], targets: [] };
      }

      // Filter to tickets that are actually missing wraps for members
      const ticketIds = tickets.map((t) => t.id);
      const existingWraps = await db
        .selectFrom("ticket_key_wraps")
        .select(["ticket_id", "volunteer_id"])
        .where("ticket_id", "in", ticketIds)
        .execute();

      const wrapsByTicket = new Map<TicketId, Set<UserId>>();
      for (const w of existingWraps) {
        let set = wrapsByTicket.get(w.ticket_id);
        if (!set) {
          set = new Set();
          wrapsByTicket.set(w.ticket_id, set);
        }
        set.add(w.volunteer_id);
      }

      const pendingTickets: WrapBackfillPendingTicket[] = [];
      const neededTargetIds = new Set<UserId>();

      for (const t of tickets) {
        const members = queueMemberMap.get(t.queue_id);
        if (!members) continue;

        const wrapped = wrapsByTicket.get(t.id) ?? new Set();
        let hasMissing = false;

        for (const memberId of members) {
          if (!wrapped.has(memberId)) {
            hasMissing = true;
            neededTargetIds.add(memberId);
          }
        }

        if (hasMissing) {
          pendingTickets.push({
            ticketId: t.id,
            queueId: t.queue_id,
            keyGeneration: t.key_generation,
          });
        }
      }

      const targets: WrapBackfillTarget[] = [];
      for (const userId of neededTargetIds) {
        const volPublic = memberKeys.get(userId);
        if (volPublic) {
          targets.push({
            volunteerId: userId,
            volPublic: volPublic.toString("base64url"),
          });
        }
      }

      return { tickets: pendingTickets, targets };
    },

    async submitBackfillWraps(callerId, wraps): Promise<WrapBackfillResult> {
      if (wraps.length === 0) {
        return { inserted: 0 };
      }

      // Verify caller holds a wrap for each referenced ticket
      const ticketIds = [...new Set(wraps.map((w) => w.ticketId))];
      const callerWraps = await db
        .selectFrom("ticket_key_wraps")
        .select("ticket_id")
        .where("ticket_id", "in", ticketIds)
        .where("volunteer_id", "=", callerId)
        .execute();

      const callerHasWrap = new Set(callerWraps.map((w) => w.ticket_id));
      for (const tid of ticketIds) {
        if (!callerHasWrap.has(tid)) {
          throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
        }
      }

      // Validate targets are active queue members
      const targetIds = [...new Set(wraps.map((w) => w.volunteerId))];
      const validTargets = await db
        .selectFrom("users")
        .select("id")
        .where("id", "in", targetIds)
        .where("is_active", "=", true)
        .execute();

      const validIds = new Set(validTargets.map((u) => u.id));
      for (const wrap of wraps) {
        if (!validIds.has(wrap.volunteerId)) {
          throw new ValidationError(
            `Volunteer ${wrap.volunteerId} is not an active user`,
          );
        }
      }

      // Get existing wraps to skip duplicates (idempotent)
      const existingWraps = await db
        .selectFrom("ticket_key_wraps")
        .select(["ticket_id", "volunteer_id"])
        .where(
          "ticket_id",
          "in",
          wraps.map((w) => w.ticketId),
        )
        .execute();

      const existingSet = new Set(
        existingWraps.map((w) => `${w.ticket_id}:${w.volunteer_id}`),
      );

      // Get key_generation for each ticket
      const ticketRows = await db
        .selectFrom("tickets")
        .select(["id", "key_generation"])
        .where("id", "in", ticketIds)
        .execute();

      const keyGenByTicket = new Map<TicketId, KeyGeneration>();
      for (const t of ticketRows) {
        keyGenByTicket.set(t.id, t.key_generation);
      }

      let inserted = 0;

      for (const wrap of wraps) {
        const key = `${wrap.ticketId}:${wrap.volunteerId}`;
        if (existingSet.has(key)) continue;

        const keyGen = keyGenByTicket.get(wrap.ticketId);
        if (!keyGen) continue;

        await db
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: wrap.ticketId,
            volunteer_id: wrap.volunteerId,
            key_generation: keyGen,
            ephemeral_point: wrap.ephemeralPoint,
            nonce: wrap.nonce,
            wrapped_key: wrap.wrappedKey,
            algorithm: "ecies-ristretto255-v1",
          })
          .onConflict((oc) =>
            oc
              .columns(["ticket_id", "volunteer_id", "key_generation"])
              .doNothing(),
          )
          .execute();

        inserted += 1;
      }

      return { inserted };
    },
  };
}
