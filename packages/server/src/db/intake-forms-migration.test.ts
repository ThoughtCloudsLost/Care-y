import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)("089_intake_forms migration", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -------------------------------------------------------------------
  // Table existence
  // -------------------------------------------------------------------

  it("creates all five tables", async () => {
    const tables = [
      "intake_forms",
      "intake_form_fields",
      "queue_intake_forms",
      "intake_form_responses",
      "intake_key_wraps",
    ];

    for (const table of tables) {
      const result = await sql<{ exists: boolean }>`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = ${testDb.schemaName}
              AND table_name = ${table}
          ) AS exists
        `.execute(testDb.platformDb);

      expect(result.rows[0]?.exists, `table ${table} should exist`).toBe(true);
    }
  });

  // -------------------------------------------------------------------
  // intake_forms
  // -------------------------------------------------------------------

  it("inserts an intake form with defaults", async () => {
    const row = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- intake_forms.name is an admin-internal form label, not PII
      .values({ name: "Default Form" })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(row.name).toBe("Default Form");
    expect(row.is_active).toBe(false);
    expect(row.created_at).toBeInstanceOf(Date);
    expect(row.updated_at).toBeInstanceOf(Date);
  });

  // -------------------------------------------------------------------
  // intake_form_fields
  // -------------------------------------------------------------------

  it("inserts form fields with encrypted data", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- intake_forms.name is an admin-internal form label, not PII
      .values({ name: "Field Test Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const field = await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "text",
        encrypted_label: Buffer.from("encrypted-label-data"),
        encrypted_config: Buffer.from("encrypted-config-data"),
        is_required: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(field.field_type).toBe("text");
    expect(field.position).toBe(0);
    expect(field.is_required).toBe(true);
    expect(Buffer.isBuffer(field.encrypted_label)).toBe(true);
    expect(Buffer.isBuffer(field.encrypted_config)).toBe(true);
  });

  it("enforces (form_id, position) uniqueness", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Unique Position Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "text",
        encrypted_label: Buffer.from("label-a"),
        encrypted_config: Buffer.from("config-a"),
      })
      .execute();

    await expect(
      testDb.db
        .insertInto("intake_form_fields")
        .values({
          form_id: form.id,
          position: 0,
          field_type: "textarea",
          encrypted_label: Buffer.from("label-b"),
          encrypted_config: Buffer.from("config-b"),
        })
        .execute(),
    ).rejects.toThrow();
  });

  it("cascades field deletion when form is deleted", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Cascade Fields Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "select",
        encrypted_label: Buffer.from("label"),
        encrypted_config: Buffer.from("config"),
      })
      .execute();

    await testDb.db
      .deleteFrom("intake_forms")
      .where("id", "=", form.id)
      .execute();

    const remaining = await testDb.db
      .selectFrom("intake_form_fields")
      .selectAll()
      .where("form_id", "=", form.id)
      .execute();

    expect(remaining).toHaveLength(0);
  });

  // -------------------------------------------------------------------
  // queue_intake_forms
  // -------------------------------------------------------------------

  it("binds a queue to a form and cascades on queue delete", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Binding Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const queue = await createTestQueue(testDb.db);

    await testDb.db
      .insertInto("queue_intake_forms")
      .values({ queue_id: queue.id, form_id: form.id })
      .execute();

    // Verify binding exists
    const binding = await testDb.db
      .selectFrom("queue_intake_forms")
      .selectAll()
      .where("queue_id", "=", queue.id)
      .executeTakeFirst();

    expect(binding).toBeTruthy();
    expect(binding?.form_id).toBe(form.id);

    // Delete queue cascades the binding
    await testDb.db.deleteFrom("queues").where("id", "=", queue.id).execute();

    const orphanBinding = await testDb.db
      .selectFrom("queue_intake_forms")
      .selectAll()
      .where("queue_id", "=", queue.id)
      .executeTakeFirst();

    expect(orphanBinding).toBeUndefined();
  });

  it("cascades queue binding on form delete", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Form Cascade Binding" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const queue = await createTestQueue(testDb.db);

    await testDb.db
      .insertInto("queue_intake_forms")
      .values({ queue_id: queue.id, form_id: form.id })
      .execute();

    await testDb.db
      .deleteFrom("intake_forms")
      .where("id", "=", form.id)
      .execute();

    const orphanBinding = await testDb.db
      .selectFrom("queue_intake_forms")
      .selectAll()
      .where("queue_id", "=", queue.id)
      .executeTakeFirst();

    expect(orphanBinding).toBeUndefined();
  });

  // -------------------------------------------------------------------
  // intake_key_wraps
  // -------------------------------------------------------------------

  it("inserts an intake key wrap with defaults", async () => {
    const fix = await createTestTicketFixture(testDb.db);

    const wrap = await testDb.db
      .insertInto("intake_key_wraps")
      .values({
        ticket_id: fix.ticketId,
        wrapped_tk: Buffer.alloc(80, 0xab),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(wrap.algorithm).toBe("sealed-box-org-v1");
    expect(Buffer.isBuffer(wrap.wrapped_tk)).toBe(true);
    expect(wrap.wrapped_tk.length).toBe(80);
    expect(wrap.created_at).toBeInstanceOf(Date);
  });

  it("rejects wrap for nonexistent ticket", async () => {
    await expect(
      testDb.db
        .insertInto("intake_key_wraps")
        .values({
          ticket_id: crypto.randomUUID(),
          wrapped_tk: Buffer.alloc(80, 0xab),
        })
        .execute(),
    ).rejects.toThrow();
  });

  it("cascades wrap deletion when ticket is deleted", async () => {
    const fix = await createTestTicketFixture(testDb.db);

    await testDb.db
      .insertInto("intake_key_wraps")
      .values({
        ticket_id: fix.ticketId,
        wrapped_tk: Buffer.alloc(80, 0xcc),
      })
      .execute();

    // Delete the ticket (cascades through client -> ticket chain)
    await testDb.db
      .deleteFrom("tickets")
      .where("id", "=", fix.ticketId)
      .execute();

    const orphanWrap = await testDb.db
      .selectFrom("intake_key_wraps")
      .selectAll()
      .where("ticket_id", "=", fix.ticketId)
      .executeTakeFirst();

    expect(orphanWrap).toBeUndefined();
  });

  // -------------------------------------------------------------------
  // intake_form_responses
  // -------------------------------------------------------------------

  it("inserts a form response and cascades on ticket delete", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Response Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const fix = await createTestTicketFixture(testDb.db);

    await testDb.db
      .insertInto("intake_form_responses")
      .values({
        ticket_id: fix.ticketId,
        form_id: form.id,
        encrypted_response: Buffer.from("encrypted-structured-blob"),
      })
      .execute();

    // Delete ticket cascades the response
    await testDb.db
      .deleteFrom("tickets")
      .where("id", "=", fix.ticketId)
      .execute();

    const orphanResponse = await testDb.db
      .selectFrom("intake_form_responses")
      .selectAll()
      .where("ticket_id", "=", fix.ticketId)
      .executeTakeFirst();

    expect(orphanResponse).toBeUndefined();
  });

  it("blocks form deletion when responses reference it", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Referenced Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const fix = await createTestTicketFixture(testDb.db);

    await testDb.db
      .insertInto("intake_form_responses")
      .values({
        ticket_id: fix.ticketId,
        form_id: form.id,
        encrypted_response: Buffer.from("response-data"),
      })
      .execute();

    // Deleting the form should fail (no ON DELETE CASCADE on form_id
    // in intake_form_responses, enforced at service layer)
    await expect(
      testDb.db.deleteFrom("intake_forms").where("id", "=", form.id).execute(),
    ).rejects.toThrow();
  });

  // -------------------------------------------------------------------
  // clients.phone_id nullable
  // -------------------------------------------------------------------

  it("inserts a client with null phone_id", async () => {
    const row = await testDb.db
      .insertInto("clients")
      .values({
        encrypted_alias: testSealedBox.sealBuffer(
          Buffer.from("web-intake-client"),
        ),
        alias_hash: null,
        phone_id: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(row.phone_id).toBeNull();
    expect(Buffer.isBuffer(row.encrypted_alias)).toBe(true);
  });

  it("phone_id is nullable in information_schema", async () => {
    const result = await sql<{ is_nullable: string }>`
        SELECT is_nullable FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'clients'
          AND column_name = 'phone_id'
      `.execute(testDb.platformDb);

    expect(result.rows[0]?.is_nullable).toBe("YES");
  });
});
