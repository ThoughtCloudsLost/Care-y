// Intake form tables, structured response storage, interim key wrap table,
// merge-candidate dismissal blob, and org_config web-intake kill switch.
//
// Six DDL groups:
//   1. intake_forms: org-defined form definitions (name is admin-only plaintext,
//      field labels/config are encrypted under the client-branding key).
//      slug is plaintext (admin-authored, URL-safe, unique per org, server
//      needs it for routing). is_default selects the /intake fallback form.
//      destination_queue_id routes submissions to a specific queue.
//   2. intake_form_fields: ordered field definitions per form; encrypted_label
//      and encrypted_config hold ciphertext the public page decrypts. role
//      is a plaintext semantic tag (ADR-068). routing_queue_ids is a plaintext
//      allow-list. encrypted_escalation_recipient_ids is OPS-encrypted bytea
//      (a JSON array of volunteer UUIDs, encrypted to protect the responder
//      shortlist at rest).
//   3. intake_form_responses: per-ticket structured answer blob, encrypted with
//      the ticket key (tk). The availability-matching Worker reads this seam.
//   4. intake_key_wraps: interim wrap of the per-ticket key sealed to the org
//      public key via crypto_box_seal. Converted to per-volunteer ECIES wraps
//      on first volunteer open, then deleted.
//   5. merge_candidate_dismissals: single-row org-key-sealed blob storing
//      dismissed merge-candidate pairs. Append semantics: the client
//      decrypts, appends, re-seals, then UPSERTs.
//   6. org_config.web_intake_enabled: kill switch for all public intake surfaces.
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
    .addColumn("slug", "text")
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("destination_queue_id", "uuid", (col) =>
      col.references("queues.id"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Partial unique index: at most one default form per org (tenant schema).
  await db.schema
    .createIndex("uq_intake_forms_default")
    .on("intake_forms")
    .column("is_default")
    .where("is_default", "=", true)
    .unique()
    .execute();

  // Unique slug per org (tenant schema). Null slugs are excluded by
  // Postgres unique semantics (multiple NULLs allowed).
  await db.schema
    .createIndex("uq_intake_forms_slug")
    .on("intake_forms")
    .column("slug")
    .unique()
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
    .addColumn("role", "text")
    .addColumn("encrypted_label", "bytea", (col) => col.notNull())
    .addColumn("encrypted_config", "bytea", (col) => col.notNull())
    .addColumn("is_required", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("routing_queue_ids", sql`uuid[]`)
    .addColumn("encrypted_escalation_recipient_ids", "bytea")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint("uq_form_field_position", ["form_id", "position"])
    .execute();

  // 3. intake_form_responses (per-ticket structured answer blob)
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

  // 4. intake_key_wraps (interim sealed-box wrap of the ticket key)
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

  // 5. merge_candidate_dismissals (single-row org-key-sealed blob)
  await db.schema
    .createTable("merge_candidate_dismissals")
    .addColumn("id", "integer", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`1`)
        .check(sql`id = 1`),
    )
    .addColumn("encrypted_dismissals", "bytea", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 6. Make clients.phone_id nullable for web-intake clients
  await db.schema
    .alterTable("clients")
    .alterColumn("phone_id", (col) => col.dropNotNull())
    .execute();

  // 7. org_config kill switch for web intake
  await db.schema
    .alterTable("org_config")
    .addColumn("web_intake_enabled", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop org_config kill switch
  await db.schema
    .alterTable("org_config")
    .dropColumn("web_intake_enabled")
    .execute();

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
  await db.schema.dropTable("merge_candidate_dismissals").execute();
  await db.schema.dropTable("intake_key_wraps").execute();
  await db.schema.dropTable("intake_form_responses").execute();
  await db.schema.dropTable("intake_form_fields").execute();
  await db.schema.dropTable("intake_forms").execute();
}
