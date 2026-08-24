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
import { newTicketId } from "@care-y/shared";

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

  it("creates all expected tables", async () => {
    const tables = [
      "intake_forms",
      "intake_form_fields",
      "intake_form_responses",
      "intake_key_wraps",
      "merge_candidate_dismissals",
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

  it("does not create queue_intake_forms", async () => {
    const result = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = ${testDb.schemaName}
            AND table_name = 'queue_intake_forms'
        ) AS exists
      `.execute(testDb.platformDb);

    expect(result.rows[0]?.exists).toBe(false);
  });

  // -------------------------------------------------------------------
  // intake_forms (slug, is_default, destination_queue_id)
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
    expect(row.is_default).toBe(false);
    expect(row.slug).toBeNull();
    expect(row.destination_queue_id).toBeNull();
    expect(row.created_at).toBeInstanceOf(Date);
    expect(row.updated_at).toBeInstanceOf(Date);
  });

  it("inserts a form with slug and destination queue", async () => {
    const queue = await createTestQueue(testDb.db);

    const row = await testDb.db
      .insertInto("intake_forms")
      .values({
        // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
        name: "Partner Referral",
        slug: "partner-referral",
        destination_queue_id: queue.id,
        is_default: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(row.slug).toBe("partner-referral");
    expect(row.destination_queue_id).toBe(queue.id);
  });

  it("enforces unique slug per org", async () => {
    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Form A", slug: "unique-slug" })
      .execute();

    await expect(
      testDb.db
        .insertInto("intake_forms")
        // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
        .values({ name: "Form B", slug: "unique-slug" })
        .execute(),
    ).rejects.toThrow();
  });

  it("allows multiple forms with null slugs", async () => {
    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Null Slug A", slug: null })
      .execute();

    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Null Slug B", slug: null })
      .execute();

    // No throw: multiple NULLs allowed by Postgres unique semantics
  });

  it("enforces at most one default form via partial unique index", async () => {
    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Default One", is_default: true })
      .execute();

    await expect(
      testDb.db
        .insertInto("intake_forms")
        // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
        .values({ name: "Default Two", is_default: true })
        .execute(),
    ).rejects.toThrow();
  });

  it("allows multiple non-default forms", async () => {
    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Non-default A", is_default: false })
      .execute();

    await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Non-default B", is_default: false })
      .execute();

    // No throw: multiple false values allowed
  });

  // -------------------------------------------------------------------
  // intake_form_fields (role, routing_queue_ids, encrypted_escalation_recipient_ids)
  // -------------------------------------------------------------------

  it("inserts form fields with encrypted data", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
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
    expect(field.role).toBeNull();
    expect(field.routing_queue_ids).toBeNull();
    expect(field.encrypted_escalation_recipient_ids).toBeNull();
    expect(Buffer.isBuffer(field.encrypted_label)).toBe(true);
    expect(Buffer.isBuffer(field.encrypted_config)).toBe(true);
  });

  it("inserts a field with role and routing_queue_ids", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Routing Role Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const queueA = await createTestQueue(testDb.db);
    const queueB = await createTestQueue(testDb.db);

    const field = await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "select",
        role: "queue-routing",
        encrypted_label: Buffer.from("label"),
        encrypted_config: Buffer.from("config"),
        routing_queue_ids: [queueA.id, queueB.id],
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(field.role).toBe("queue-routing");
    expect(field.routing_queue_ids).toEqual([queueA.id, queueB.id]);
  });

  it("inserts a field with encrypted_escalation_recipient_ids", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "Escalation Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const userId = crypto.randomUUID();
    // Simulate OPS-encrypted JSON array of recipient IDs
    const encryptedIds = Buffer.from(JSON.stringify([userId]));

    const field = await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "select",
        role: "escalation",
        encrypted_label: Buffer.from("label"),
        encrypted_config: Buffer.from("config"),
        encrypted_escalation_recipient_ids: encryptedIds,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(field.role).toBe("escalation");
    expect(Buffer.isBuffer(field.encrypted_escalation_recipient_ids)).toBe(
      true,
    );
  });

  it("allows null encrypted_escalation_recipient_ids", async () => {
    const form = await testDb.db
      .insertInto("intake_forms")
      // care-y-ignore-next-line ast-pii-in-db-write -- admin-internal form label, not PII
      .values({ name: "No Escalation Form" })
      .returning("id")
      .executeTakeFirstOrThrow();

    const field = await testDb.db
      .insertInto("intake_form_fields")
      .values({
        form_id: form.id,
        position: 0,
        field_type: "text",
        encrypted_label: Buffer.from("label"),
        encrypted_config: Buffer.from("config"),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(field.encrypted_escalation_recipient_ids).toBeNull();
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
          ticket_id: newTicketId(),
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
  // merge_candidate_dismissals
  // -------------------------------------------------------------------

  it("inserts a single dismissal blob row", async () => {
    const row = await testDb.db
      .insertInto("merge_candidate_dismissals")
      .values({
        encrypted_dismissals: Buffer.from("sealed-dismissal-blob"),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(row.id).toBe(1);
    expect(Buffer.isBuffer(row.encrypted_dismissals)).toBe(true);
    expect(row.updated_at).toBeInstanceOf(Date);
  });

  it("rejects a second dismissal row (single-row constraint)", async () => {
    // First row may already exist from previous test; try insert with ON CONFLICT
    await testDb.db
      .insertInto("merge_candidate_dismissals")
      .values({
        encrypted_dismissals: Buffer.from("blob-a"),
      })
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          encrypted_dismissals: Buffer.from("blob-a"),
        }),
      )
      .execute();

    // Explicitly try inserting with id=2 (violates CHECK constraint)
    await expect(
      sql`INSERT INTO ${sql.table("merge_candidate_dismissals")}
          (id, encrypted_dismissals) VALUES (2, '\\x00')`.execute(testDb.db),
    ).rejects.toThrow();
  });

  // -------------------------------------------------------------------
  // org_config.web_intake_enabled
  // -------------------------------------------------------------------

  it("has web_intake_enabled column defaulting to true", async () => {
    const result = await testDb.db
      .selectFrom("org_config")
      .select("web_intake_enabled")
      .executeTakeFirst();

    // org_config is seeded with one row by createTestDb
    if (result != null) {
      expect(result.web_intake_enabled).toBe(true);
    }
  });

  it("web_intake_enabled column exists in information_schema", async () => {
    const result = await sql<{
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'org_config'
          AND column_name = 'web_intake_enabled'
      `.execute(testDb.platformDb);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.data_type).toBe("boolean");
    expect(result.rows[0]?.is_nullable).toBe("NO");
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
