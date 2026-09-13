// Client accounts and account sessions. Adds `kind` and `account_offer`
// columns to portal_channels.
//
// Three DDL groups:
//   1. client_accounts: password-derived account state. The id column is
//      client-minted (the browser runs OPRF against it before the row
//      exists), so it has no gen_random_uuid() default. No private key
//      column exists by design (derive-don't-store).
//   2. client_account_sessions: bearer session tokens stored as BLAKE2b
//      hashes. No IP/UA columns (no 2FA drift consumer for client
//      accounts, and those columns would be pure metadata about the
//      highest-risk users).
//   3. portal_channels gains `kind` (text, default 'secure_link') and
//      `account_offer` (boolean, default false).

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. client_accounts
  await db.schema
    .createTable("client_accounts")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("client_id", "uuid", (col) =>
      col.notNull().unique().references("clients.id").onDelete("cascade"),
    )
    .addColumn("username_hash", "text", (col) => col.notNull().unique())
    .addColumn("salt", "bytea", (col) => col.notNull())
    .addColumn("public_key", "bytea", (col) => col.notNull())
    .addColumn("auth_hash", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 2. client_account_sessions
  await db.schema
    .createTable("client_account_sessions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("account_id", "uuid", (col) =>
      col.notNull().references("client_accounts.id").onDelete("cascade"),
    )
    .addColumn("token_hash", "bytea", (col) => col.notNull().unique())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 3. portal_channels: kind + account_offer
  await db.schema
    .alterTable("portal_channels")
    .addColumn("kind", "text", (col) => col.notNull().defaultTo("secure_link"))
    .execute();

  await db.schema
    .alterTable("portal_channels")
    .addColumn("account_offer", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop columns first (reverse order of addition)
  await db.schema
    .alterTable("portal_channels")
    .dropColumn("account_offer")
    .execute();

  await db.schema.alterTable("portal_channels").dropColumn("kind").execute();

  // Drop tables in reverse dependency order
  await db.schema.dropTable("client_account_sessions").execute();
  await db.schema.dropTable("client_accounts").execute();
}
