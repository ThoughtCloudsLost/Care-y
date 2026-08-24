/**
 * Recently-viewed history service: get/put of a single per-user ECIES
 * envelope on user_recent_views. The route handler delegates here rather
 * than querying the DB directly (layer separation per code-standards.md).
 *
 * The server treats the envelope as opaque bytes. It is sealed client-side
 * to the user's own vol_public; only that user's vol_private (derived at
 * login, held in the client crypto Worker) can open it. Last write wins:
 * concurrent sessions overwrite each other, which is acceptable for a
 * bounded recency list.
 */

import type { Kysely } from "kysely";
import type { UserId } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";

export interface RecentViewsEnvelope {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedPayload: Buffer;
}

export interface RecentViewsService {
  get(userId: UserId): Promise<RecentViewsEnvelope | null>;
  put(userId: UserId, envelope: RecentViewsEnvelope): Promise<void>;
}

export function createRecentViewsService(
  db: Kysely<TenantDatabase>,
): RecentViewsService {
  return {
    async get(userId: UserId): Promise<RecentViewsEnvelope | null> {
      const row = await db
        .selectFrom("user_recent_views")
        .select(["ephemeral_point", "nonce", "wrapped_payload"])
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!row) return null;
      return {
        ephemeralPoint: row.ephemeral_point,
        nonce: row.nonce,
        wrappedPayload: row.wrapped_payload,
      };
    },

    async put(userId: UserId, envelope: RecentViewsEnvelope): Promise<void> {
      await db
        .insertInto("user_recent_views")
        .values({
          user_id: userId,
          ephemeral_point: envelope.ephemeralPoint,
          nonce: envelope.nonce,
          wrapped_payload: envelope.wrappedPayload,
        })
        .onConflict((oc) =>
          oc.column("user_id").doUpdateSet({
            ephemeral_point: envelope.ephemeralPoint,
            nonce: envelope.nonce,
            wrapped_payload: envelope.wrappedPayload,
          }),
        )
        .execute();
    },
  };
}
