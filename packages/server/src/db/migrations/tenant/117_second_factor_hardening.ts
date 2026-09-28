import { sql, type Kysely } from "kysely";

interface MigrationDatabase {
  totp_secrets: { verified: boolean };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // Signature algorithm of each passkey, recorded at registration so
  // assertions verify against the key type the authenticator produced.
  // Existing rows were all registered as ES256; the default backfills
  // them and is then dropped so every insert has to state the algorithm.
  await db.schema
    .alterTable("webauthn_credentials")
    .addColumn("algorithm", "text", (col) => col.notNull().defaultTo("ES256"))
    .execute();

  // The CHECK rides on the alterTable builder rather than a raw ALTER
  // TABLE statement so the tenant migrator's withSchema() prefixing
  // applies (Kysely #761). The expression names the column only.
  await db.schema
    .alterTable("webauthn_credentials")
    .addCheckConstraint(
      "webauthn_credentials_valid_algorithm",
      sql`algorithm IN ('ES256', 'RS256')`,
    )
    .execute();

  await db.schema
    .alterTable("webauthn_credentials")
    .alterColumn("algorithm", (ac) => ac.dropDefault())
    .execute();

  // Failed second-factor guesses on a session. The verify routes end the
  // session once this reaches the per-session cap.
  await db.schema
    .alterTable("sessions")
    .addColumn("twofa_failed_attempts", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .execute();

  // A user holds at most one confirmed and one pending TOTP secret. The
  // confirmed secret stays in force while a replacement is being set up
  // and is removed only when the new one is confirmed.
  await db.schema
    .alterTable("totp_secrets")
    .dropConstraint("totp_secrets_user_id_key")
    .execute();
  await db.schema
    .alterTable("totp_secrets")
    .addUniqueConstraint("totp_secrets_user_id_verified_key", [
      "user_id",
      "verified",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Pending secrets have to go before the single-row constraint returns.
  // Narrowed the same way as 014_add_session_tokens.ts (SEC-203, SEC-204,
  // SEC-205): Kysely<unknown> keeps the runner's withSchema() scoping.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const typedDb = db as unknown as Kysely<MigrationDatabase>;
  await typedDb
    .deleteFrom("totp_secrets")
    .where("verified", "=", false)
    .execute();
  await db.schema
    .alterTable("totp_secrets")
    .dropConstraint("totp_secrets_user_id_verified_key")
    .execute();
  await db.schema
    .alterTable("totp_secrets")
    .addUniqueConstraint("totp_secrets_user_id_key", ["user_id"])
    .execute();

  await db.schema
    .alterTable("sessions")
    .dropColumn("twofa_failed_attempts")
    .execute();

  await db.schema
    .alterTable("webauthn_credentials")
    .dropConstraint("webauthn_credentials_valid_algorithm")
    .execute();

  await db.schema
    .alterTable("webauthn_credentials")
    .dropColumn("algorithm")
    .execute();
}
