/**
 * Merge candidate dismissal service.
 *
 * Manages the single-row org-key-sealed dismissal blob in
 * merge_candidate_dismissals. The server is a ciphertext passthrough:
 * it stores and retrieves the encrypted blob without reading it.
 * Encryption/decryption happens browser-side with the org key.
 *
 * Concurrency: last-write-wins with read-merge-write on the client.
 * The client reads the blob, adds/removes entries, and writes back.
 * If two volunteers dismiss concurrently, the last write overwrites.
 * This is acceptable because dismissals are infrequent org-level
 * triage, not high-contention data. The alternative (optimistic
 * concurrency via updated_at) adds complexity for a race condition
 * that is vanishingly rare and whose worst outcome is a dismissed
 * pair reappearing briefly.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface DismissalBlobRecord {
  readonly encryptedDismissals: string;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface DismissalService {
  /** Returns the encrypted dismissal blob, or null if no dismissals exist. */
  get(): Promise<DismissalBlobRecord | null>;

  /** Upserts the encrypted dismissal blob (ciphertext passthrough). */
  put(encryptedDismissals: Buffer): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createDismissalService(
  db: Kysely<TenantDatabase>,
): DismissalService {
  return {
    async get(): Promise<DismissalBlobRecord | null> {
      const row = await db
        .selectFrom("merge_candidate_dismissals")
        .select(["encrypted_dismissals", "updated_at"])
        .where("id", "=", 1)
        .executeTakeFirst();

      if (!row) return null;

      return {
        encryptedDismissals: row.encrypted_dismissals.toString("base64url"),
        updatedAt: row.updated_at,
      };
    },

    async put(encryptedDismissals: Buffer): Promise<void> {
      await db
        .insertInto("merge_candidate_dismissals")
        .values({
          encrypted_dismissals: encryptedDismissals,
        })
        .onConflict((oc) =>
          oc.column("id").doUpdateSet({
            encrypted_dismissals: encryptedDismissals,
          }),
        )
        .execute();
    },
  };
}
