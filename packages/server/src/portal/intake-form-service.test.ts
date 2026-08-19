/**
 * Tests for IntakeFormService.
 *
 * DB integration tests that verify form CRUD, public form resolution
 * by slug/default, slug uniqueness, default atomicity, destination
 * queue validation, kill switch, and the FORM_HAS_RESPONSES guard.
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
import type { IntakeFieldRole } from "@care-y/shared";
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
    opts?: {
      fields?: Array<{
        fieldType: string;
        encryptedLabel?: string;
        encryptedConfig?: string;
        isRequired?: boolean;
        role?: IntakeFieldRole | null;
        routingQueueIds?: string[] | null;
        escalationRecipientIds?: string[] | null;
      }>;
      slug?: string | null;
      isDefault?: boolean;
      destinationQueueId?: string | null;
    },
  ): Promise<string> {
    const defaultFields = opts?.fields ?? [
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
      slug: opts?.slug ?? null,
      isDefault: opts?.isDefault ?? false,
      destinationQueueId: opts?.destinationQueueId ?? null,
      fields: defaultFields.map((f) => ({
        fieldType: f.fieldType as "text",
        encryptedLabel: f.encryptedLabel ?? Buffer.from("l").toString("base64"),
        encryptedConfig:
          f.encryptedConfig ?? Buffer.from("c").toString("base64"),
        isRequired: f.isRequired ?? false,
        role: f.role ?? null,
        routingQueueIds: f.routingQueueIds ?? null,
        escalationRecipientIds: f.escalationRecipientIds ?? null,
      })),
    });
    return result.formId;
  }

  describe("getPublicForm", () => {
    it("returns null when no default form exists", async () => {
      const result = await svc.getPublicForm(testDb.db);
      expect(result).toBeNull();
    });

    it("resolves active default form", async () => {
      const formId = await createForm("Default Form", {
        isDefault: true,
        slug: "default-test",
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.getPublicForm(testDb.db);
      expect(result).not.toBeNull();
      expect(result?.formId).toBe(formId);
      expect(result?.slug).toBe("default-test");

      // Cleanup
      await svc.setActive(testDb.db, formId, false);
      await testDb.db
        .updateTable("intake_forms")
        .set({ is_default: false })
        .where("id", "=", formId)
        .execute();
    });

    it("resolves by slug when given", async () => {
      const formId = await createForm("Slug Form", {
        slug: "test-slug-resolve",
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.getPublicForm(testDb.db, "test-slug-resolve");
      expect(result).not.toBeNull();
      expect(result?.formId).toBe(formId);
      expect(result?.slug).toBe("test-slug-resolve");

      await svc.setActive(testDb.db, formId, false);
    });

    it("returns null for unknown slug", async () => {
      const result = await svc.getPublicForm(testDb.db, "nonexistent-slug");
      expect(result).toBeNull();
    });

    it("returns null for inactive slug form", async () => {
      await createForm("Inactive Slug", { slug: "inactive-slug" });
      // Form starts inactive by default

      const result = await svc.getPublicForm(testDb.db, "inactive-slug");
      expect(result).toBeNull();
    });

    it("returns fields with role in position order", async () => {
      const formId = await createForm("Role Fields", {
        slug: "role-fields",
        fields: [
          {
            fieldType: "text",
            role: "phone-contact",
            encryptedLabel: Buffer.from("Phone").toString("base64"),
            encryptedConfig: Buffer.from("{}").toString("base64"),
            isRequired: true,
          },
          {
            fieldType: "select",
            role: "queue-routing",
            encryptedLabel: Buffer.from("Route").toString("base64"),
            encryptedConfig: Buffer.from("{}").toString("base64"),
            isRequired: true,
          },
        ],
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.getPublicForm(testDb.db, "role-fields");
      expect(result?.fields).toHaveLength(2);
      expect(result?.fields[0]?.role).toBe("phone-contact");
      expect(result?.fields[1]?.role).toBe("queue-routing");

      await svc.setActive(testDb.db, formId, false);
    });
  });

  describe("resolvePublicForm", () => {
    it("returns intakeDisabled when web_intake_enabled is false", async () => {
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: false })
        .execute();

      const result = await svc.resolvePublicForm(testDb.db, null);
      expect(result.intakeDisabled).toBe(true);
      expect(result.formId).toBeNull();

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: true })
        .execute();
    });

    it("returns form data when intake is enabled and slug matches", async () => {
      const formId = await createForm("Resolve Test", { slug: "resolve-test" });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.resolvePublicForm(testDb.db, "resolve-test");
      expect(result.intakeDisabled).toBe(false);
      expect(result.formId).toBe(formId);

      await svc.setActive(testDb.db, formId, false);
    });
  });

  describe("saveForm", () => {
    it("creates a new form with slug and destination", async () => {
      const queue = await createTestQueue(testDb.db);
      const formId = await createForm("Slug Dest Form", {
        slug: "slug-dest",
        destinationQueueId: queue.id,
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.slug).toBe("slug-dest");
      expect(detail.destinationQueueId).toBe(queue.id);
    });

    it("rejects duplicate slug with INTAKE_SLUG_TAKEN", async () => {
      await createForm("First Slug", { slug: "unique-slug-test" });

      try {
        await createForm("Second Slug", { slug: "unique-slug-test" });
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ConflictError);
        expect((err as ConflictError).message).toBe(
          ErrorCode.INTAKE_SLUG_TAKEN,
        );
      }
    });

    it("atomically clears previous default when setting is_default", async () => {
      const idA = await createForm("Default A", { isDefault: true });
      const idB = await createForm("Default B", { isDefault: true });

      const detailA = await svc.getForm(testDb.db, idA);
      const detailB = await svc.getForm(testDb.db, idB);

      expect(detailA.isDefault).toBe(false);
      expect(detailB.isDefault).toBe(true);
    });

    it("rejects nonexistent destination queue", async () => {
      await expect(
        createForm("Bad Queue", {
          destinationQueueId: crypto.randomUUID(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("replaces fields atomically on update", async () => {
      const formId = await createForm("Replace Test", {
        fields: [{ fieldType: "text" }, { fieldType: "textarea" }],
      });

      let forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.fieldCount).toBe(2);

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

  describe("getForm", () => {
    it("returns form with slug, default, destination, and field roles", async () => {
      const queue = await createTestQueue(testDb.db);
      const formId = await createForm("Detail Test", {
        slug: "detail-slug",
        isDefault: false,
        destinationQueueId: queue.id,
        fields: [
          {
            fieldType: "text",
            role: "real-name",
            encryptedLabel: Buffer.from("Q1").toString("base64"),
            encryptedConfig: Buffer.from("c1").toString("base64"),
            isRequired: true,
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.slug).toBe("detail-slug");
      expect(detail.destinationQueueId).toBe(queue.id);
      expect(detail.fields[0]?.role).toBe("real-name");
    });

    it("throws NotFoundError for an unknown form id", async () => {
      await expect(svc.getForm(testDb.db, crypto.randomUUID())).rejects.toThrow(
        NotFoundError,
      );
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

  describe("isWebIntakeEnabled", () => {
    it("returns true by default", async () => {
      const enabled = await svc.isWebIntakeEnabled(testDb.db);
      expect(enabled).toBe(true);
    });

    it("returns false when web_intake_enabled is false", async () => {
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: false })
        .execute();

      const enabled = await svc.isWebIntakeEnabled(testDb.db);
      expect(enabled).toBe(false);

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: true })
        .execute();
    });
  });

  describe("listForms", () => {
    it("returns forms with slug, default, and destination info", async () => {
      const forms = await svc.listForms(testDb.db);
      expect(forms.length).toBeGreaterThan(0);

      for (const f of forms) {
        expect(f.id).toBeDefined();
        expect(typeof f.name).toBe("string");
        expect(typeof f.isActive).toBe("boolean");
        expect(typeof f.isDefault).toBe("boolean");
        expect(typeof f.fieldCount).toBe("number");
      }
    });
  });
});
