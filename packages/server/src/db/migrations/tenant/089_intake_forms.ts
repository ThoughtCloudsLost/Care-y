// Intake form tables, structured response storage, and interim key wrap table.
//
// Five DDL groups:
//   1. intake_forms: org-defined form definitions (name is admin-only plaintext,
//      field labels/config are encrypted under the client-branding key).
//   2. intake_form_fields: ordered field definitions per form; encrypted_label
//      and encrypted_config hold ciphertext the public page decrypts.
//   3. queue_intake_forms: one-to-one binding of a queue to a form definition.
//   4. intake_form_responses: per-ticket structured answer blob, encrypted with
//      the ticket key (tk). The availability-matching Worker reads this seam.
//   5. intake_key_wraps: interim wrap of the per-ticket key sealed to the org
//      public key via crypto_box_seal. Converted to per-volunteer ECIES wraps
//      on first volunteer open, then deleted.
//
// Also: clients.phone_id drops NOT NULL so web-intake clients (no phone number)
// can be created without placeholder phone rows.

import { type Kysely, sql } from "kysely";

// Typed DML narrowing for the down() delete: Kysely migrations receive
// Kysely<unknown>, so typed table access requires the standard migration
// narrowing cast (see 014, 083).
interface MigrationClientsDb {
  clients: {
    phone_id: string | null;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. intake_forms
  await db.schema
    .createTable("intake_forms")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 2. intake_form_fields
  await db.schema
    .createTable("intake_form_fields")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("form_id", "uuid", (col) =>
      col.notNull().references("intake_forms.id").onDelete("cascade"),
    )
    .addColumn("position", "int2", (col) => col.notNull())
    .addColumn("field_type", "text", (col) => col.notNull())
    .addColumn("encrypted_label", "bytea", (col) => col.notNull())
    .addColumn("encrypted_config", "bytea", (col) => col.notNull())
    .addColumn("is_required", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint("uq_form_field_position", ["form_id", "position"])
    .execute();

  // 3. queue_intake_forms (one binding per queue; forms shareable across queues)
  await db.schema
    .createTable("queue_intake_forms")
    .addColumn("queue_id", "uuid", (col) =>
      col.primaryKey().references("queues.id").onDelete("cascade"),
    )
    .addColumn("form_id", "uuid", (col) =>
      col.notNull().references("intake_forms.id").onDelete("cascade"),
    )
    .execute();

  // 4. intake_form_responses (per-ticket structured answer blob)
  await db.schema
    .createTable("intake_form_responses")
    .addColumn("ticket_id", "uuid", (col) =>
      col.primaryKey().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("form_id", "uuid", (col) =>
      col.notNull().references("intake_forms.id"),
    )
    .addColumn("encrypted_response", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 5. intake_key_wraps (interim sealed-box wrap of the ticket key)
  await db.schema
    .createTable("intake_key_wraps")
    .addColumn("ticket_id", "uuid", (col) =>
      col.primaryKey().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("wrapped_tk", "bytea", (col) => col.notNull())
    .addColumn("algorithm", "text", (col) =>
      col.notNull().defaultTo("sealed-box-org-v1"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 6. Make clients.phone_id nullable for web-intake clients
  await db.schema
    .alterTable("clients")
    .alterColumn("phone_id", (col) => col.dropNotNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Delete web-intake clients (phone_id IS NULL) so the NOT NULL restore
  // does not fail. Best-effort dev tool, not a production guarantee.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationClientsDb>;
  await typedDb.deleteFrom("clients").where("phone_id", "is", null).execute();

  // Restore clients.phone_id NOT NULL
  await db.schema
    .alterTable("clients")
    .alterColumn("phone_id", (col) => col.setNotNull())
    .execute();

  // Drop tables in reverse dependency order
  await db.schema.dropTable("intake_key_wraps").execute();
  await db.schema.dropTable("intake_form_responses").execute();
  await db.schema.dropTable("queue_intake_forms").execute();
  await db.schema.dropTable("intake_form_fields").execute();
  await db.schema.dropTable("intake_forms").execute();
}
