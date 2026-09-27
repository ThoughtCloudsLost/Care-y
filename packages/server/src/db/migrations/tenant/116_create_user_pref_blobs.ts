import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Per-user preference documents, one ECIES envelope per (user, kind),
  // each sealed to the user's own vol_public. The server stores ciphertext
  // only: saved preferences such as dashboard filters reveal what a user
  // works on. The only plaintext is that a user has a document of a given
  // kind. No timestamp column (metadata minimization, ADR-018): the server
  // never acts on this data autonomously.
  await db.schema
    .createTable("user_pref_blobs")
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("kind", "text", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("wrapped_payload", "bytea", (col) => col.notNull())
    .addPrimaryKeyConstraint("user_pref_blobs_pk", ["user_id", "kind"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("user_pref_blobs").execute();
}
