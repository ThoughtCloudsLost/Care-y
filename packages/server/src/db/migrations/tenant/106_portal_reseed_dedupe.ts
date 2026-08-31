// Portal reseed dedupe: defensively remove duplicate portal_messages
// rows that could appear when a thread is reseeded into an existing
// channel, then enforce uniqueness so the condition cannot recur.
//
// A channel holds at most one portal copy per followup. The unique
// index makes that a DB-level invariant (ADR-092).
//
// Uses Kysely<unknown> (not Kysely<any>) to preserve .withSchema()
// scoping from the migration runner. The dedupe DML uses a local
// interface with a single narrowing assertion (see 014).

import type { Kysely } from "kysely";

interface MigrationPortalMessagesDb {
  portal_messages: {
    id: string;
    channel_id: string;
    followup_id: string;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationPortalMessagesDb>;

  // 1. Delete duplicate portal_messages rows, keeping the smallest id
  //    per (channel_id, followup_id) group. Postgres has no min(uuid)
  //    aggregate, but uuid comparison operators exist, so the survivor
  //    is picked with a self-join instead of a grouped aggregate.
  await typedDb
    .deleteFrom("portal_messages as p")
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("portal_messages as p2")
          .select("p2.id")
          .whereRef("p2.channel_id", "=", "p.channel_id")
          .whereRef("p2.followup_id", "=", "p.followup_id")
          .whereRef("p2.id", "<", "p.id"),
      ),
    )
    .execute();

  // 2. Create unique index to prevent future duplicates.
  await db.schema
    .createIndex("uq_portal_messages_channel_followup")
    .on("portal_messages")
    .columns(["channel_id", "followup_id"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("uq_portal_messages_channel_followup").execute();
}
