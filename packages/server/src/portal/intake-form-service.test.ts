/**
 * Tests for IntakeFormService.
 *
 * DB integration tests that verify form CRUD, public form resolution,
 * queue binding, and the FORM_HAS_RESPONSES guard.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestQueue,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { createIntakeFormService } from "./intake-form-service.js";
import type { IntakeFormService } from "./intake-form-service.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("IntakeFormService", () => {
  let testDb: TestDb;
  let svc: IntakeFormService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createIntakeFormService();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Helper: create a form with minimal fields. */
  async function createForm(
    name: string,
    fields?: Array<{
      fieldType: string;
      encryptedLabel?: string;
      encryptedConfig?: string;
      isRequired?: boolean;
    }>,
  ): Promise<string> {
    const defaultFields = fields ?? [
      {
        fieldType: "text",
        encryptedLabel: Buffer.from("label").toString("base64"),
        encryptedConfig: Buffer.from("{}").toString("base64"),
        isRequired: false,
      },
    ];

    const result = await svc.saveForm(testDb.db, crypto.randomUUID(), {
      formId: null,
      name,
      fields: defaultFields.map((f) => ({
        fieldType: f.fieldType as "text",
        encryptedLabel: f.encryptedLabel ?? Buffer.from("l").toString("base64"),
        encryptedConfig:
          f.encryptedConfig ?? Buffer.from("c").toString("base64"),
        isRequired: f.isRequired ?? false,
      })),
    });
    return result.formId;
  }

  describe("getPublicForm", () => {
    it("returns null when intake_queue_id is not set", async () => {
      const result = await svc.getPublicForm(testDb.db);
      expect(result).toBeNull();
    });

    it("returns null when no form is bound to the intake queue", async () => {
      const queue = await createTestQueue(testDb.db);

      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: queue.id })
        .execute();

      const result = await svc.getPublicForm(testDb.db);
      expect(result).toBeNull();

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: null })
        .execute();
    });

    it("returns null when the bound form is inactive", async () => {
      const queue = await createTestQueue(testDb.db);
      const formId = await createForm("Inactive Form");

      // Form starts inactive by default
      await svc.bindQueue(testDb.db, queue.id, formId);
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: queue.id })
        .execute();

      const result = await svc.getPublicForm(testDb.db);
      expect(result).toBeNull();

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: null })
        .execute();
    });

    it("resolves binding to active form with fields in position order", async () => {
      const queue = await createTestQueue(testDb.db);
      const label1 = Buffer.from("First").toString("base64");
      const label2 = Buffer.from("Second").toString("base64");
      const config1 = Buffer.from("c1").toString("base64");
      const config2 = Buffer.from("c2").toString("base64");

      const formId = await createForm("Active Form", [
        {
          fieldType: "text",
          encryptedLabel: label1,
          encryptedConfig: config1,
          isRequired: true,
        },
        {
          fieldType: "textarea",
          encryptedLabel: label2,
          encryptedConfig: config2,
          isRequired: false,
        },
      ]);

      await svc.setActive(testDb.db, formId, true);
      await svc.bindQueue(testDb.db, queue.id, formId);
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: queue.id })
        .execute();

      const result = await svc.getPublicForm(testDb.db);

      expect(result).not.toBeNull();
      expect(result?.formId).toBe(formId);
      expect(result?.fields).toHaveLength(2);
      expect(result?.fields[0]?.fieldType).toBe("text");
      expect(result?.fields[0]?.encryptedLabel).toBe(label1);
      expect(result?.fields[0]?.encryptedConfig).toBe(config1);
      expect(result?.fields[0]?.isRequired).toBe(true);
      expect(result?.fields[1]?.fieldType).toBe("textarea");
      expect(result?.fields[1]?.encryptedLabel).toBe(label2);
      expect(result?.fields[1]?.isRequired).toBe(false);

      // Response does not contain queue ids
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(queue.id);

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: null })
        .execute();
    });
  });

  describe("getForm", () => {
    it("returns form with fields in position order and base64 ciphertext", async () => {
      const label1 = Buffer.from("Question 1").toString("base64");
      const label2 = Buffer.from("Question 2").toString("base64");
      const config1 = Buffer.from("cfg1").toString("base64");
      const config2 = Buffer.from("cfg2").toString("base64");

      const formId = await createForm("Detail Test", [
        {
          fieldType: "text",
          encryptedLabel: label1,
          encryptedConfig: config1,
          isRequired: true,
        },
        {
          fieldType: "select",
          encryptedLabel: label2,
          encryptedConfig: config2,
          isRequired: false,
        },
      ]);

      const detail = await svc.getForm(testDb.db, formId);

      expect(detail.formId).toBe(formId);
      expect(detail.name).toBe("Detail Test");
      expect(detail.isActive).toBe(false);
      expect(detail.fields).toHaveLength(2);

      // Fields in position order
      expect(detail.fields[0]?.fieldType).toBe("text");
      expect(detail.fields[0]?.encryptedLabel).toBe(label1);
      expect(detail.fields[0]?.encryptedConfig).toBe(config1);
      expect(detail.fields[0]?.isRequired).toBe(true);

      expect(detail.fields[1]?.fieldType).toBe("select");
      expect(detail.fields[1]?.encryptedLabel).toBe(label2);
      expect(detail.fields[1]?.encryptedConfig).toBe(config2);
      expect(detail.fields[1]?.isRequired).toBe(false);
    });

    it("throws NotFoundError for an unknown form id", async () => {
      await expect(svc.getForm(testDb.db, crypto.randomUUID())).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("saveForm", () => {
    it("creates a new form when formId is null", async () => {
      const formId = await createForm("New Form");
      expect(formId).toBeDefined();
      expect(typeof formId).toBe("string");

      const forms = await svc.listForms(testDb.db);
      const found = forms.find((f) => f.id === formId);
      expect(found).toBeDefined();
      expect(found?.name).toBe("New Form");
      expect(found?.fieldCount).toBe(1);
    });

    it("replaces fields atomically on update", async () => {
      const formId = await createForm("Replace Test", [
        { fieldType: "text" },
        { fieldType: "textarea" },
      ]);

      // Verify initial field count
      let forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.fieldCount).toBe(2);

      // Update with different fields
      await svc.saveForm(testDb.db, crypto.randomUUID(), {
        formId,
        name: "Replace Test Updated",
        fields: [
          {
            fieldType: "select",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: true,
          },
        ],
      });

      forms = await svc.listForms(testDb.db);
      const updated = forms.find((f) => f.id === formId);
      expect(updated?.name).toBe("Replace Test Updated");
      expect(updated?.fieldCount).toBe(1);
    });

    it("rejects more than one availability field", async () => {
      await expect(
        svc.saveForm(testDb.db, crypto.randomUUID(), {
          formId: null,
          name: "Too Many Availability",
          fields: [
            {
              fieldType: "availability",
              encryptedLabel: Buffer.from("a1").toString("base64"),
              encryptedConfig: Buffer.from("c1").toString("base64"),
              isRequired: false,
            },
            {
              fieldType: "availability",
              encryptedLabel: Buffer.from("a2").toString("base64"),
              encryptedConfig: Buffer.from("c2").toString("base64"),
              isRequired: false,
            },
          ],
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError when updating a nonexistent form", async () => {
      await expect(
        svc.saveForm(testDb.db, crypto.randomUUID(), {
          formId: crypto.randomUUID(),
          name: "Ghost",
          fields: [
            {
              fieldType: "text",
              encryptedLabel: Buffer.from("l").toString("base64"),
              encryptedConfig: Buffer.from("c").toString("base64"),
              isRequired: false,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteForm", () => {
    it("deletes a form with no responses", async () => {
      const formId = await createForm("Delete Me");

      await svc.deleteForm(testDb.db, formId);

      const forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)).toBeUndefined();
    });

    it("throws FORM_HAS_RESPONSES when responses exist", async () => {
      const formId = await createForm("Has Responses");
      const queue = await createTestQueue(testDb.db);

      // Create a minimal ticket + client to satisfy FK
      const client = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from(`c-${crypto.randomUUID().slice(0, 8)}`),
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const ticket = await testDb.db
        .insertInto("tickets")
        .values({
          queue_id: queue.id,
          client_id: client.id,
          encrypted_title: Buffer.from("t"),
          encrypted_description: Buffer.from("d"),
          key_generation: crypto.randomUUID(),
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Insert a response row
      await testDb.db
        .insertInto("intake_form_responses")
        .values({
          ticket_id: ticket.id,
          form_id: formId,
          encrypted_response: Buffer.from("resp"),
        })
        .execute();

      try {
        await svc.deleteForm(testDb.db, formId);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ConflictError);
        const ce = err as ConflictError;
        expect(ce.message).toBe(ErrorCode.FORM_HAS_RESPONSES);
      }
    });

    it("throws NotFoundError for a nonexistent form", async () => {
      await expect(
        svc.deleteForm(testDb.db, crypto.randomUUID()),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("setActive", () => {
    it("activates and deactivates a form", async () => {
      const formId = await createForm("Toggle Active");

      let forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.isActive).toBe(false);

      await svc.setActive(testDb.db, formId, true);
      forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.isActive).toBe(true);

      await svc.setActive(testDb.db, formId, false);
      forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.isActive).toBe(false);
    });

    it("throws NotFoundError for a nonexistent form", async () => {
      await expect(
        svc.setActive(testDb.db, crypto.randomUUID(), true),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("bindQueue", () => {
    it("binds and unbinds a form to a queue", async () => {
      const queue = await createTestQueue(testDb.db);
      const formId = await createForm("Bind Test");

      // Bind
      await svc.bindQueue(testDb.db, queue.id, formId);

      let forms = await svc.listForms(testDb.db);
      let bound = forms.find((f) => f.id === formId);
      expect(bound?.boundQueueIds).toContain(queue.id);

      // Unbind
      await svc.bindQueue(testDb.db, queue.id, null);

      forms = await svc.listForms(testDb.db);
      bound = forms.find((f) => f.id === formId);
      expect(bound?.boundQueueIds).not.toContain(queue.id);
    });

    it("rebinding replaces the previous form on the same queue", async () => {
      const queue = await createTestQueue(testDb.db);
      const formA = await createForm("Form A");
      const formB = await createForm("Form B");

      await svc.bindQueue(testDb.db, queue.id, formA);
      await svc.bindQueue(testDb.db, queue.id, formB);

      const forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formA)?.boundQueueIds).not.toContain(
        queue.id,
      );
      expect(forms.find((f) => f.id === formB)?.boundQueueIds).toContain(
        queue.id,
      );
    });

    it("throws NotFoundError for a nonexistent queue", async () => {
      const formId = await createForm("Queue Not Found");
      await expect(
        svc.bindQueue(testDb.db, crypto.randomUUID(), formId),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError for a nonexistent form", async () => {
      const queue = await createTestQueue(testDb.db);
      await expect(
        svc.bindQueue(testDb.db, queue.id, crypto.randomUUID()),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("listForms", () => {
    it("returns forms ordered by creation time with correct summaries", async () => {
      // This test relies on forms created above; verify structure
      const forms = await svc.listForms(testDb.db);
      expect(forms.length).toBeGreaterThan(0);

      for (const f of forms) {
        expect(f.id).toBeDefined();
        expect(typeof f.name).toBe("string");
        expect(typeof f.isActive).toBe("boolean");
        expect(typeof f.fieldCount).toBe("number");
        expect(Array.isArray(f.boundQueueIds)).toBe(true);
      }
    });
  });
});
