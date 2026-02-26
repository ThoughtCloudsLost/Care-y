// Query pattern reference - Kysely idioms for this project.
// This file exists to prevent Knex.js idioms from creeping in.
// Add to it when new patterns are established.
//
// KEY DIFFERENCES from Knex (they look similar, they are NOT interchangeable):
//   Knex: .where('col', 'val')           <- string equality shorthand
//   Kysely: .where('col', '=', val)      <- always explicit operator

// NOTE: `as never` casts appear throughout this file because the `Database`
// interface is empty in this phase. They are intentional - this is a reference
// file, not production code. Real repositories will have typed table names and
// should NEVER use `as never`. Remove this note when Database has real tables.
import { db } from "./db.js";

// --- PATTERN: Insert encrypted blob (bytea) ---
// Kysely accepts Node.js Buffer directly for bytea columns.
// Do NOT use base64 strings or hex - pass Buffer directly.
async function exampleInsertEncryptedBlob(ciphertext: Buffer): Promise<void> {
  await db
    .insertInto("example_table" as never)
    .values({ encrypted_content: ciphertext })
    .execute();
}

// --- PATTERN: Select and return ciphertext ---
// Kysely returns bytea columns as Buffer in Node.js.
async function exampleSelectCiphertext(
  id: number,
): Promise<Buffer | undefined> {
  const row = await db
    .selectFrom("example_table" as never)
    .select("encrypted_content" as never)
    .where("id" as never, "=", id as never)
    .executeTakeFirst();
  return (row as { encrypted_content?: Buffer } | undefined)?.encrypted_content;
}

// --- PATTERN: Migration file template (copy for each new migration) ---
// import type { Kysely } from 'kysely'
// export async function up(db: Kysely<unknown>): Promise<void> { ... }
// export async function down(db: Kysely<unknown>): Promise<void> { ... }

// Suppress "declared but never read" warnings - this file is a reference, not a library.
void exampleInsertEncryptedBlob;
void exampleSelectCiphertext;
