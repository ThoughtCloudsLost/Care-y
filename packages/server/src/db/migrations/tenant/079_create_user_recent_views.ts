import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Per-user recently-viewed history, stored as a single ECIES envelope
  // sealed to the user's own vol_public. One row per user, whole history
  // in one blob: per-entity rows would hand the server a plaintext trail
  // of which tickets and articles each user opened. No timestamp column
  // (metadata minimization, ADR-018): recency ordering lives inside the
  // ciphertext and the server never acts on this data autonomously.
  await db.schema
    .createTable("user_recent_views")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().references("users.id").onDelete("cascade"),
    )
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("wrapped_payload", "bytea", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("user_recent_views").execute();
}
