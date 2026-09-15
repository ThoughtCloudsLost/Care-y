// Org key rotation: generation tracking table and per-table stamps.
//
// org_key_generations holds one row per generation of the org keypair.
// Each row records the public key and (for gen > 1) the previous
// generation's secret encrypted under the new secret. The rotation
// service is the sole writer; no check constraints are needed.
//
// Every table holding org-sealed ciphertext gains an org_key_generation
// column indicating the oldest generation any sealed column in that
// row may be under. org_config gets both: current_key_generation (the
// org's generation pointer) and org_key_generation (the row stamp for
// its own encrypted_terminology blob).

import type { Kysely } from "kysely";

interface MigrationOrgConfigDb {
  org_config: {
    org_public_key: Buffer | null;
  };
  org_key_generations: {
    generation: number;
    public_key: Buffer;
    prev_secret_ct?: Buffer | null;
    prev_nonce?: Buffer | null;
  };
}

/** Tables that gain an `org_key_generation` smallint NOT NULL DEFAULT 1 column. */
const STAMPED_TABLES = [
  "org_config",
  "queues",
  "note_types",
  "kb_categories",
  "kb_items",
  "kb_attachments",
  "preset_replies",
  "clients",
  "users",
  "sessions",
  "client_merge_events",
  "merge_candidate_dismissals",
  "consultants",
  "phone_blocklist",
  "invite_tokens",
  "voicemail_quarantine",
  "phones",
  "intake_key_wraps",
  "portal_reply_key_wraps",
  "intake_forms",
  "intake_form_fields",
] as const;

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. Create org_key_generations table.
  await db.schema
    .createTable("org_key_generations")
    .addColumn("generation", "int2", (col) => col.primaryKey())
    .addColumn("public_key", "bytea", (col) => col.notNull())
    .addColumn("prev_secret_ct", "bytea")
    .addColumn("prev_nonce", "bytea")
    .addColumn("rotated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  // 2. Backfill generation 1 from existing org_config.org_public_key.
  //    Skip when org_config is empty (fresh schema mid-onboarding).
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationOrgConfigDb>;
  const row = await typedDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (row?.org_public_key) {
    await typedDb
      .insertInto("org_key_generations")
      .values({
        generation: 1,
        public_key: row.org_public_key,
      })
      .execute();
  }

  // 3. Add current_key_generation to org_config.
  await db.schema
    .alterTable("org_config")
    .addColumn("current_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // 4. Add org_key_generation stamp to every org-sealed table.
  for (const table of STAMPED_TABLES) {
    await db.schema
      .alterTable(table)
      .addColumn("org_key_generation", "int2", (col) =>
        col.notNull().defaultTo(1),
      )
      .execute();
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop org_key_generation from stamped tables (reverse order).
  for (const table of [...STAMPED_TABLES].reverse()) {
    await db.schema
      .alterTable(table)
      .dropColumn("org_key_generation")
      .execute();
  }

  // Drop current_key_generation from org_config.
  await db.schema
    .alterTable("org_config")
    .dropColumn("current_key_generation")
    .execute();

  // Drop the table.
  await db.schema.dropTable("org_key_generations").execute();
}
