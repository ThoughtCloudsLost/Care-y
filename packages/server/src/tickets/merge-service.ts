/**
 * Client merge service (ADR-018).
 *
 * Consolidates two client records and their tickets. The merge
 * operation and undo are wrapped in DB transactions. Actor identities
 * and auxiliary timestamps live inside the encrypted snapshot blob,
 * not in plaintext columns.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { MergeError, NotFoundError } from "../errors.js";
import { createDependencyService } from "./dependency-service.js";
import { ErrorCode } from "@care-y/shared";

export interface MergeEventRecord {
  readonly id: string;
  readonly primaryClientId: string;
  readonly secondaryClientId: string;
  readonly mergedAt: Date;
  readonly snapshot: Buffer;
  readonly undoLocked: boolean;
  readonly isUndone: boolean;
}

export interface MergeService {
  merge(input: {
    primaryClientId: string;
    secondaryClientId: string;
    encryptedSnapshot: Buffer;
  }): Promise<MergeEventRecord>;

  undoMerge(input: {
    mergeEventId: string;
    encryptedSnapshot: Buffer;
  }): Promise<MergeEventRecord>;

  setUndoLock(mergeEventId: string, locked: boolean): Promise<void>;

  listByClient(clientId: string): Promise<MergeEventRecord[]>;
}

function toRecord(row: {
  id: string;
  primary_client_id: string;
  secondary_client_id: string;
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
              encrypted_content: Buffer.from("merge-system-note"),
            })
            .execute();
        }

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
