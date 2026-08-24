import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import type { FollowupId, UserId, BlobKey, OrgSchema } from "@care-y/shared";

export interface RewrapInput {
  readonly followUpId: FollowupId;
  readonly encryptedContent: Buffer;
  readonly blobUpdates?: readonly {
    readonly oldBlobKey: BlobKey;
    readonly encryptedData: Buffer;
    readonly category: BlobCategory;
  }[];
}

export interface RewrapResult {
  readonly rewrapped: boolean;
}

/**
 * Re-wrap a follow-up's content from `tk_temp` to the ticket's canonical `tk`.
 *
 * Called by the volunteer's Worker after decrypting with `tk_temp` and
 * re-encrypting with `tk`. The server never sees plaintext or keys.
 *
 * Idempotent: if `key_generation` is already null, returns `{ rewrapped: false }`.
 */
export async function rewrapFollowUp(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  input: RewrapInput,
  blobStore?: BlobStore,
  orgSchema?: OrgSchema,
): Promise<RewrapResult> {
  const followUp = await db
    .selectFrom("followups")
    .select(["id", "ticket_id", "key_generation"])
    .where("id", "=", input.followUpId)
    .executeTakeFirst();

  if (!followUp) {
    return { rewrapped: false };
  }

  // Already re-wrapped (idempotent)
  if (followUp.key_generation === null) {
    return { rewrapped: false };
  }

  // Verify access
  await access.assertAccess(userId, followUp.ticket_id);

  const keyGen = followUp.key_generation;

  // Replace blobs before the transaction (BlobStore is external storage)
  const blobReplacements: { oldKey: BlobKey; newKey: BlobKey }[] = [];
  if (input.blobUpdates && blobStore !== undefined && orgSchema !== undefined) {
    for (const update of input.blobUpdates) {
      const newKey = await blobStore.put(
        orgSchema,
        update.category,
        update.encryptedData,
      );
      blobReplacements.push({ oldKey: update.oldBlobKey, newKey });
    }
  }

  await db.transaction().execute(async (trx) => {
    // Update follow-up content and clear key_generation
    await trx
      .updateTable("followups")
      .set({
        encrypted_content: input.encryptedContent,
        key_generation: null,
      })
      .where("id", "=", input.followUpId)
      .execute();

    // Delete the temp key wraps for this key_generation
    await trx
      .deleteFrom("ticket_key_wraps")
      .where("ticket_id", "=", followUp.ticket_id)
      .where("key_generation", "=", keyGen)
      .execute();

    // Delete the portal reply key wrap for this follow-up (if any).
    // Portal client replies store a sealed tk_temp here; once converged
    // to the canonical tk, the sealed wrap is no longer needed. No-op
    // for non-portal follow-ups (no row exists).
    await trx
      .deleteFrom("portal_reply_key_wraps")
      .where("followup_id", "=", input.followUpId)
      .execute();

    // Update blob references in attachment/recording rows
    for (const { oldKey, newKey } of blobReplacements) {
      await trx
        .updateTable("attachments")
        .set({ blob_key: newKey })
        .where("blob_key", "=", oldKey)
        .where("followup_id", "=", input.followUpId)
        .execute();

      await trx
        .updateTable("recordings")
        .set({ blob_key: newKey })
        .where("blob_key", "=", oldKey)
        .where("followup_id", "=", input.followUpId)
        .execute();
    }
  });

  // Clean up old blobs after successful transaction
  if (blobStore) {
    for (const { oldKey } of blobReplacements) {
      await blobStore.delete(oldKey);
    }
  }

  return { rewrapped: true };
}
