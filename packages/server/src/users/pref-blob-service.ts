/**
 * Per-user preference document service: get/put of one ECIES envelope per
 * (user, kind) on user_pref_blobs. The route handler delegates here rather
 * than querying the DB directly (layer separation per code-standards.md).
 *
 * The server treats the envelope as opaque bytes and never decodes or
 * inspects the payload. It is sealed client-side to the user's own
 * vol_public; only that user's vol_private (derived at login, held in the
 * client crypto Worker) can open it. The sealed payload names its own kind,
 * so a row served under the wrong kind fails the client's check and loads
 * the default. Last write wins: concurrent sessions overwrite each other,
 * which was accepted for dashboard filter documents (the later save stands).
 */

import type { Kysely } from "kysely";
import type { PrefBlobKind, UserId } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";

export interface PrefBlobEnvelope {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedPayload: Buffer;
}

export interface PrefBlobService {
  get(userId: UserId, kind: PrefBlobKind): Promise<PrefBlobEnvelope | null>;
  put(
    userId: UserId,
    kind: PrefBlobKind,
    envelope: PrefBlobEnvelope,
  ): Promise<void>;
}

export function createPrefBlobService(
  db: Kysely<TenantDatabase>,
): PrefBlobService {
  return {
    async get(
      userId: UserId,
      kind: PrefBlobKind,
    ): Promise<PrefBlobEnvelope | null> {
      const row = await db
        .selectFrom("user_pref_blobs")
        .select(["ephemeral_point", "nonce", "wrapped_payload"])
        .where("user_id", "=", userId)
        .where("kind", "=", kind)
        .executeTakeFirst();

      if (!row) return null;
      return {
        ephemeralPoint: row.ephemeral_point,
        nonce: row.nonce,
        wrappedPayload: row.wrapped_payload,
      };
    },

    async put(
      userId: UserId,
      kind: PrefBlobKind,
      envelope: PrefBlobEnvelope,
    ): Promise<void> {
      await db
        .insertInto("user_pref_blobs")
        .values({
          user_id: userId,
          kind,
          ephemeral_point: envelope.ephemeralPoint,
          nonce: envelope.nonce,
          wrapped_payload: envelope.wrappedPayload,
        })
        .onConflict((oc) =>
          oc.columns(["user_id", "kind"]).doUpdateSet({
            ephemeral_point: envelope.ephemeralPoint,
            nonce: envelope.nonce,
            wrapped_payload: envelope.wrappedPayload,
          }),
        )
        .execute();
    },
  };
}
