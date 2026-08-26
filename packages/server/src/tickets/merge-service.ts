/**
 * Client merge service (ADR-018).
 *
 * Consolidates two client records and their tickets. The merge
 * operation and undo are wrapped in DB transactions. Actor identities
 * and auxiliary timestamps live inside the encrypted snapshot blob,
 * not in plaintext columns.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { MergeError, NotFoundError } from "../errors.js";
import { createDependencyService } from "./dependency-service.js";
import { ErrorCode } from "@care-y/shared";
import type {
  ClientId,
  ClientMergeEventId,
  ChannelRowId,
} from "@care-y/shared";

export interface MergeEventRecord {
  readonly id: ClientMergeEventId;
  readonly primaryClientId: ClientId;
  readonly secondaryClientId: ClientId;
  readonly mergedAt: Date;
  readonly snapshot: Buffer;
  readonly undoLocked: boolean;
  readonly isUndone: boolean;
}

export interface MergeService {
  merge(input: {
    primaryClientId: ClientId;
    secondaryClientId: ClientId;
    encryptedSnapshot: Buffer;
    keepChannelOf?: "primary" | "secondary";
  }): Promise<MergeEventRecord>;

  undoMerge(input: {
    mergeEventId: ClientMergeEventId;
    encryptedSnapshot: Buffer;
  }): Promise<MergeEventRecord>;

  setUndoLock(mergeEventId: ClientMergeEventId, locked: boolean): Promise<void>;

  listByClient(clientId: ClientId): Promise<MergeEventRecord[]>;
}

function toRecord(row: {
  id: ClientMergeEventId;
  primary_client_id: ClientId;
  secondary_client_id: ClientId;
  merged_at: Date;
  snapshot: Buffer;
  undo_locked: boolean;
  is_undone: boolean;
}): MergeEventRecord {
  return {
    id: row.id,
    primaryClientId: row.primary_client_id,
    secondaryClientId: row.secondary_client_id,
    mergedAt: row.merged_at,
    snapshot: row.snapshot,
    undoLocked: row.undo_locked,
    isUndone: row.is_undone,
  };
}

// ---------------------------------------------------------------------------
// Channel collision helpers (called inside the merge transaction)
// ---------------------------------------------------------------------------

/**
 * Derive the communication tier string from a channel kind.
 * "account" -> "account"; "secure_link" / "intake_continuation" -> "secure_link".
 */
function tierForKind(kind: string): string {
  if (kind === "account") return "account";
  return "secure_link";
}

/**
 * Revoke a channel inside a transaction: delete its portal_messages,
 * set status='revoked' and revoked_at. Mirrors the steps in
 * channel-service.ts revokeChannel but operates on a single channel id
 * within an existing transaction.
 */
async function revokeChannelInTrx(
  trx: Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
): Promise<void> {
  await trx
    .deleteFrom("portal_messages")
    .where("channel_id", "=", channelRowId)
    .execute();

  await trx
    .updateTable("portal_channels")
    .set({ status: "revoked", revoked_at: new Date() })
    .where("id", "=", channelRowId)
    .execute();
}

/**
 * Re-point a channel from its current client to the primary client and
 * set the primary's communication tier to match the channel kind.
 * Also resets the secondary (merged-away) client's tier to sms_email.
 */
async function repointChannel(
  trx: Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
  primaryClientId: ClientId,
  secondaryClientId: ClientId,
  channelKind: string,
): Promise<void> {
  await trx
    .updateTable("portal_channels")
    .set({ client_id: primaryClientId })
    .where("id", "=", channelRowId)
    .execute();

  await trx
    .updateTable("clients")
    .set({ communication_tier: tierForKind(channelKind) })
    .where("id", "=", primaryClientId)
    .execute();

  await trx
    .updateTable("clients")
    .set({ communication_tier: "sms_email" })
    .where("id", "=", secondaryClientId)
    .execute();
}

/**
 * Handle portal channel collision during merge.
 *
 * Cases:
 * - Neither client has an active channel: no-op.
 * - Only one has an active channel: if it belongs to the secondary,
 *   re-point it to the primary and fix tiers.
 * - Both have active channels: honor keepChannelOf (default: keep the
 *   older by created_at), revoke the loser, re-point the winner if needed.
 */
async function reconcileChannels(
  trx: Transaction<TenantDatabase>,
  primaryClientId: ClientId,
  secondaryClientId: ClientId,
  keepChannelOf?: "primary" | "secondary",
): Promise<void> {
  const channels = await trx
    .selectFrom("portal_channels")
    .select(["id", "client_id", "kind", "created_at"])
    .where("client_id", "in", [primaryClientId, secondaryClientId])
    .where("status", "=", "active")
    .execute();

  const primaryChannel = channels.find((c) => c.client_id === primaryClientId);
  const secondaryChannel = channels.find(
    (c) => c.client_id === secondaryClientId,
  );

  // Neither has a channel: nothing to do
  if (!primaryChannel && !secondaryChannel) {
    return;
  }

  // Only primary has a channel: already correct ownership, no repoint needed
  if (!secondaryChannel) {
    return;
  }

  // Only secondary has a channel: re-point it to primary
  if (!primaryChannel) {
    await repointChannel(
      trx,
      secondaryChannel.id,
      primaryClientId,
      secondaryClientId,
      secondaryChannel.kind,
    );
    return;
  }

  // Both have active channels: pick a winner.
  // After the early returns above, TS narrows both to non-null.
  type ChannelRow = typeof primaryChannel;

  let winner: ChannelRow;
  let loser: ChannelRow;

  if (keepChannelOf === "primary") {
    winner = primaryChannel;
    loser = secondaryChannel;
  } else if (keepChannelOf === "secondary") {
    winner = secondaryChannel;
    loser = primaryChannel;
  } else {
    // Default: keep the older channel (by created_at)
    if (primaryChannel.created_at <= secondaryChannel.created_at) {
      winner = primaryChannel;
      loser = secondaryChannel;
    } else {
      winner = secondaryChannel;
      loser = primaryChannel;
    }
  }

  // Revoke the loser
  await revokeChannelInTrx(trx, loser.id);

  // If the winner belongs to the secondary, re-point it to the primary
  if (winner.client_id === secondaryClientId) {
    await repointChannel(
      trx,
      winner.id,
      primaryClientId,
      secondaryClientId,
      winner.kind,
    );
  } else {
    // Winner already belongs to primary; normalize primary's tier and reset secondary's
    await trx
      .updateTable("clients")
      .set({ communication_tier: tierForKind(winner.kind) })
      .where("id", "=", primaryClientId)
      .execute();

    await trx
      .updateTable("clients")
      .set({ communication_tier: "sms_email" })
      .where("id", "=", secondaryClientId)
      .execute();
  }
}

export function createMergeService(db: Kysely<TenantDatabase>): MergeService {
  return {
    async merge(input) {
      if (input.primaryClientId === input.secondaryClientId) {
        throw new MergeError(ErrorCode.CANNOT_MERGE_INTO_SELF);
      }

      return db.transaction().execute(async (trx) => {
        // Verify both clients exist
        const [primary, secondary] = await Promise.all([
          trx
            .selectFrom("clients")
            .select(["id", "merged_into"])
            .where("id", "=", input.primaryClientId)
            .executeTakeFirst(),
          trx
            .selectFrom("clients")
            .select(["id", "merged_into"])
            .where("id", "=", input.secondaryClientId)
            .executeTakeFirst(),
        ]);

        if (!primary)
          throw new NotFoundError(ErrorCode.PRIMARY_CLIENT_NOT_FOUND);
        if (!secondary)
          throw new NotFoundError(ErrorCode.SECONDARY_CLIENT_NOT_FOUND);

        if (secondary.merged_into !== null) {
          throw new MergeError(ErrorCode.SECONDARY_ALREADY_MERGED);
        }

        // 1. Create merge event
        const event = await trx
          .insertInto("client_merge_events")
          .values({
            primary_client_id: input.primaryClientId,
            secondary_client_id: input.secondaryClientId,
            snapshot: input.encryptedSnapshot,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        // 2. Mark secondary as merged
        await trx
          .updateTable("clients")
          .set({ merged_into: input.primaryClientId })
          .where("id", "=", input.secondaryClientId)
          .execute();

        // 3. Close secondary's open ticket (if any) with merge_note
        const secondaryTicket = await trx
          .selectFrom("tickets")
          .select("id")
          .where("client_id", "=", input.secondaryClientId)
          .where("status", "=", "open")
          .executeTakeFirst();

        if (secondaryTicket) {
          // Enforce dependency constraint: cannot close ticket with unresolved deps
          const depService = createDependencyService(trx);
          const resolved = await depService.allResolved(secondaryTicket.id);
          if (!resolved) {
            throw new MergeError(ErrorCode.MERGE_UNRESOLVED_DEPS);
          }

          await trx
            .updateTable("tickets")
            .set({ status: "closed" })
            .where("id", "=", secondaryTicket.id)
            .execute();

          await trx
            .insertInto("followups")
            .values({
              ticket_id: secondaryTicket.id,
              source: "system",
              type: "merge_note",
              encrypted_content: Buffer.alloc(0),
            })
            .execute();
        }

        // 4. Reconcile portal channels (re-point, revoke collisions)
        await reconcileChannels(
          trx,
          input.primaryClientId,
          input.secondaryClientId,
          input.keepChannelOf,
        );

        return toRecord(event);
      });
    },

    async undoMerge(input) {
      return db.transaction().execute(async (trx) => {
        const event = await trx
          .selectFrom("client_merge_events")
          .selectAll()
          .where("id", "=", input.mergeEventId)
          .executeTakeFirst();

        if (!event) throw new NotFoundError(ErrorCode.MERGE_EVENT_NOT_FOUND);
        if (event.is_undone)
          throw new MergeError(ErrorCode.MERGE_ALREADY_UNDONE);
        if (event.undo_locked)
          throw new MergeError(ErrorCode.MERGE_UNDO_LOCKED);

        // 1. Clear merged_into on secondary
        await trx
          .updateTable("clients")
          .set({ merged_into: null })
          .where("id", "=", event.secondary_client_id)
          .execute();

        // 2. Mark event as undone and update snapshot
        const updated = await trx
          .updateTable("client_merge_events")
          .set({
            is_undone: true,
            snapshot: input.encryptedSnapshot,
          })
          .where("id", "=", input.mergeEventId)
          .returningAll()
          .executeTakeFirstOrThrow();

        return toRecord(updated);
      });
    },

    async setUndoLock(mergeEventId, locked) {
      const result = await db
        .updateTable("client_merge_events")
        .set({ undo_locked: locked })
        .where("id", "=", mergeEventId)
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError(ErrorCode.MERGE_EVENT_NOT_FOUND);
      }
    },

    async listByClient(clientId) {
      const rows = await db
        .selectFrom("client_merge_events")
        .selectAll()
        .where((eb) =>
          eb.or([
            eb("primary_client_id", "=", clientId),
            eb("secondary_client_id", "=", clientId),
          ]),
        )
        .orderBy("merged_at", "desc")
        .execute();

      return rows.map(toRecord);
    },
  };
}
