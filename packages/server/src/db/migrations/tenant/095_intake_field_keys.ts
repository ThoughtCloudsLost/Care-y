// Add stable field keys and a response listing index.
//
// 1. intake_form_fields.field_key: plaintext, client-minted UUID stored
//    alongside each field row. Unique per form (not globally) so the
//    delete-all + insert save strategy can re-insert the same keys. The
//    column is NOT NULL; every field carries a key from the editor.
//
// 2. Unique constraint on (form_id, field_key) mirrors the Zod refinement
//    on saveIntakeFormInputSchema.
//
// 3. Index on intake_form_responses.form_id: the PK is ticket_id only.
//    The response viewer lists responses by form; this index supports
//    that query.
//
// No back-compat bridges; the product is not deployed and dev DBs reset.

import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. Add field_key column (not null, text)
  await db.schema
    .alterTable("intake_form_fields")
    .addColumn("field_key", "text", (col) => col.notNull())
    .execute();

  // 2. Unique constraint: one key per form
  await db.schema
    .createIndex("uq_intake_form_fields_key")
    .on("intake_form_fields")
    .columns(["form_id", "field_key"])
    .unique()
    .execute();

  // 3. Index on intake_form_responses.form_id for response listing
  await db.schema
    .createIndex("idx_intake_form_responses_form_id")
    .on("intake_form_responses")
    .column("form_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_intake_form_responses_form_id").execute();

  await db.schema.dropIndex("uq_intake_form_fields_key").execute();

  await db.schema
    .alterTable("intake_form_fields")
    .dropColumn("field_key")
    .execute();
}
