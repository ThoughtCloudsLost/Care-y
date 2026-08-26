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
  noopEncryptor,
  type TestDb,
} from "../test-utils.js";
import { createIntakeFormService } from "./intake-form-service.js";
import type { IntakeFormService } from "./intake-form-service.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { IntakeFieldRole } from "@care-y/shared";
import type {
  IntakeFormId,
  UserId,
  QueueId,
  KeyGeneration,
} from "@care-y/shared";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("IntakeFormService", () => {
  let testDb: TestDb;
  let svc: IntakeFormService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createIntakeFormService({ fieldEncryptor: noopEncryptor });
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Helper: create a form with minimal fields. */
  async function createForm(
    name: string,
    opts?: {
      fields?: Array<{
        fieldKey?: string;
        fieldType: string;
        encryptedLabel?: string;
        encryptedConfig?: string;
        isRequired?: boolean;
        role?: IntakeFieldRole | null;
        routingQueueIds?: QueueId[] | null;
        escalationRecipientIds?: UserId[] | null;
      }>;
      slug?: string | null;
      isDefault?: boolean;
      destinationQueueId?: QueueId | null;
    },
  ): Promise<IntakeFormId> {
    const defaultFields = opts?.fields ?? [
      {
        fieldType: "text",
        encryptedLabel: Buffer.from("label").toString("base64"),
        encryptedConfig: Buffer.from("{}").toString("base64"),
        isRequired: false,
      },
    ];

    const result = await svc.saveForm(
      testDb.db,
      crypto.randomUUID() as UserId,
      {
        formId: null,
        name,
        slug: opts?.slug ?? null,
        isDefault: opts?.isDefault ?? false,
        destinationQueueId: opts?.destinationQueueId ?? null,
        fields: defaultFields.map((f) => ({
          fieldKey: f.fieldKey ?? crypto.randomUUID(),
          fieldType: f.fieldType as "text",
          encryptedLabel:
            f.encryptedLabel ?? Buffer.from("l").toString("base64"),
          encryptedConfig:
            f.encryptedConfig ?? Buffer.from("c").toString("base64"),
          isRequired: f.isRequired ?? false,
          role: f.role ?? null,
          routingQueueIds: f.routingQueueIds ?? null,
          escalationRecipientIds: f.escalationRecipientIds ?? null,
        })),
      },
    );
    return result.formId as IntakeFormId;
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

    it("returns builtinFormDisabled=false when no default DB form and builtin is enabled", async () => {
      // Default state: builtin_default_enabled is true (migration default)
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: true })
        .execute();

      const result = await svc.resolvePublicForm(testDb.db, null);
      expect(result.formId).toBeNull();
      expect(result.builtinFormDisabled).toBe(false);
      expect(result.intakeDisabled).toBe(false);
    });

    it("returns builtinFormDisabled=true when no default DB form and builtin is disabled", async () => {
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: false })
        .execute();

      const result = await svc.resolvePublicForm(testDb.db, null);
      expect(result.formId).toBeNull();
      expect(result.builtinFormDisabled).toBe(true);
      expect(result.intakeDisabled).toBe(false);

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: true })
        .execute();
    });

    it("returns builtinFormDisabled=false when an active default DB form exists (setting irrelevant)", async () => {
      const formId = await createForm("Default DB Form", {
        isDefault: true,
        slug: "builtin-test-default",
      });
      await svc.setActive(testDb.db, formId, true);

      // Even when builtin is disabled, the DB form takes precedence
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: false })
        .execute();

      const result = await svc.resolvePublicForm(testDb.db, null);
      expect(result.formId).toBe(formId);
      expect(result.builtinFormDisabled).toBe(false);

      // Cleanup
      await svc.setActive(testDb.db, formId, false);
      await testDb.db
        .updateTable("intake_forms")
        .set({ is_default: false })
        .where("id", "=", formId)
        .execute();
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: true })
        .execute();
    });

    it("does not set builtinFormDisabled for slug-based resolution", async () => {
      // Builtin toggle should not affect slug routes
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: false })
        .execute();

      const result = await svc.resolvePublicForm(
        testDb.db,
        "nonexistent-slug-builtin",
      );
      expect(result.formId).toBeNull();
      expect(result.builtinFormDisabled).toBe(false);

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ builtin_default_enabled: true })
        .execute();
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
          destinationQueueId: crypto.randomUUID() as QueueId,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("replaces fields atomically on update", async () => {
      const formId = await createForm("Replace Test", {
        fields: [{ fieldType: "text" }, { fieldType: "textarea" }],
      });

      let forms = await svc.listForms(testDb.db);
      expect(forms.find((f) => f.id === formId)?.fieldCount).toBe(2);

      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Replace Test Updated",
        fields: [
          {
            fieldKey: crypto.randomUUID(),
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
        svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
          formId: null,
          name: "Too Many Availability",
          fields: [
            {
              fieldKey: crypto.randomUUID(),
              fieldType: "availability",
              encryptedLabel: Buffer.from("a1").toString("base64"),
              encryptedConfig: Buffer.from("c1").toString("base64"),
              isRequired: false,
            },
            {
              fieldKey: crypto.randomUUID(),
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
        svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
          formId: crypto.randomUUID() as IntakeFormId,
          name: "Ghost",
          fields: [
            {
              fieldKey: crypto.randomUUID(),
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

  describe("fieldKey round-trip", () => {
    it("persists and returns fieldKey on getForm", async () => {
      const keyA = crypto.randomUUID();
      const keyB = crypto.randomUUID();
      const formId = await createForm("FieldKey RT", {
        fields: [
          { fieldKey: keyA, fieldType: "text" },
          { fieldKey: keyB, fieldType: "textarea" },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.fields).toHaveLength(2);
      expect(detail.fields[0]?.fieldKey).toBe(keyA);
      expect(detail.fields[1]?.fieldKey).toBe(keyB);
    });

    it("persists and returns fieldKey on getPublicForm", async () => {
      const keyA = crypto.randomUUID();
      const formId = await createForm("FieldKey Public", {
        slug: "fk-public",
        fields: [{ fieldKey: keyA, fieldType: "text" }],
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.getPublicForm(testDb.db, "fk-public");
      expect(result).not.toBeNull();
      expect(result?.fields[0]?.fieldKey).toBe(keyA);

      await svc.setActive(testDb.db, formId, false);
    });

    it("preserves fieldKey across delete+insert save", async () => {
      const stableKey = crypto.randomUUID();
      const formId = await createForm("Stable Key", {
        fields: [{ fieldKey: stableKey, fieldType: "text" }],
      });

      // Re-save with the same key but a different label
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Stable Key Updated",
        fields: [
          {
            fieldKey: stableKey,
            fieldType: "text",
            encryptedLabel: Buffer.from("new-label").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: true,
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.fields[0]?.fieldKey).toBe(stableKey);
      expect(detail.fields[0]?.isRequired).toBe(true);
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
      await expect(
        svc.getForm(testDb.db, crypto.randomUUID() as IntakeFormId),
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
          key_generation: crypto.randomUUID() as KeyGeneration,
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
        svc.deleteForm(testDb.db, crypto.randomUUID() as IntakeFormId),
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
        svc.setActive(testDb.db, crypto.randomUUID() as IntakeFormId, true),
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

  describe("encryptedFormMeta round-trip", () => {
    it("saves with meta and reads it back on getForm", async () => {
      const metaBlob = Buffer.from('{"description":"test"}').toString("base64");
      const formId = await createForm("Meta RT", {
        slug: "meta-rt",
      });

      // Re-save with encryptedFormMeta
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Meta RT",
        slug: "meta-rt",
        encryptedFormMeta: metaBlob,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.encryptedFormMeta).toBe(metaBlob);
    });

    it("saves with meta and reads it back on getPublicForm", async () => {
      const metaBlob = Buffer.from('{"submitMessage":"thanks"}').toString(
        "base64",
      );
      const formId = await createForm("Meta Public", {
        slug: "meta-public",
      });

      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Meta Public",
        slug: "meta-public",
        encryptedFormMeta: metaBlob,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      await svc.setActive(testDb.db, formId, true);
      const publicForm = await svc.getPublicForm(testDb.db, "meta-public");
      expect(publicForm).not.toBeNull();
      expect(publicForm?.encryptedFormMeta).toBe(metaBlob);

      await svc.setActive(testDb.db, formId, false);
    });

    it("saves with meta and reads it back on resolvePublicForm", async () => {
      const metaBlob = Buffer.from('{"closedMessage":"closed"}').toString(
        "base64",
      );
      const formId = await createForm("Meta Resolve", {
        slug: "meta-resolve",
      });

      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Meta Resolve",
        slug: "meta-resolve",
        encryptedFormMeta: metaBlob,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      await svc.setActive(testDb.db, formId, true);
      const result = await svc.resolvePublicForm(testDb.db, "meta-resolve");
      expect(result.encryptedFormMeta).toBe(metaBlob);

      await svc.setActive(testDb.db, formId, false);
    });

    it("returns null when no meta is saved", async () => {
      const formId = await createForm("No Meta");

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.encryptedFormMeta).toBeNull();
    });

    it("clears meta when saved without encryptedFormMeta", async () => {
      const metaBlob = Buffer.from('{"description":"will clear"}').toString(
        "base64",
      );
      const formId = await createForm("Clear Meta", {
        slug: "clear-meta",
      });

      // Save with meta
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Clear Meta",
        slug: "clear-meta",
        encryptedFormMeta: metaBlob,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      let detail = await svc.getForm(testDb.db, formId);
      expect(detail.encryptedFormMeta).toBe(metaBlob);

      // Re-save without meta (omit encryptedFormMeta entirely)
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Clear Meta",
        slug: "clear-meta",
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      detail = await svc.getForm(testDb.db, formId);
      expect(detail.encryptedFormMeta).toBeNull();
    });
  });

  describe("escalation recipients round-trip", () => {
    it("encrypts on save and decrypts on read", async () => {
      const recipientA = crypto.randomUUID() as UserId;
      const recipientB = crypto.randomUUID() as UserId;

      const formId = await createForm("Escalation RT", {
        fields: [
          {
            fieldType: "checkbox",
            role: "escalation",
            escalationRecipientIds: [recipientA, recipientB],
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.fields).toHaveLength(1);
      expect(detail.fields[0]?.escalationRecipientIds).toEqual([
        recipientA,
        recipientB,
      ]);
    });

    it("stores null when no escalation recipients provided", async () => {
      const formId = await createForm("No Escalation", {
        fields: [
          {
            fieldType: "text",
            escalationRecipientIds: null,
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.fields[0]?.escalationRecipientIds).toBeNull();
    });

    it("does not expose escalation recipients in public form", async () => {
      const formId = await createForm("Public Esc", {
        slug: "public-esc-test",
        fields: [
          {
            fieldType: "checkbox",
            role: "escalation",
            escalationRecipientIds: [crypto.randomUUID() as UserId],
          },
        ],
      });
      await svc.setActive(testDb.db, formId, true);

      const publicForm = await svc.getPublicForm(testDb.db, "public-esc-test");
      expect(publicForm).not.toBeNull();
      // Public form fields should not have escalationRecipientIds
      for (const field of publicForm!.fields) {
        expect("escalationRecipientIds" in field).toBe(false);
      }

      await svc.setActive(testDb.db, formId, false);
    });

    it("stores ciphertext in the database (not plaintext array)", async () => {
      const recipientId = crypto.randomUUID() as UserId;
      const formId = await createForm("Cipher Check", {
        fields: [
          {
            fieldType: "checkbox",
            role: "escalation",
            escalationRecipientIds: [recipientId],
          },
        ],
      });

      // Read raw from DB to verify it is bytea, not a uuid[]
      const rawField = await testDb.db
        .selectFrom("intake_form_fields")
        .select("encrypted_escalation_recipient_ids")
        .where("form_id", "=", formId)
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(rawField.encrypted_escalation_recipient_ids)).toBe(
        true,
      );
      // The column is bytea (Buffer), not a Postgres uuid[] array.
      // With noopEncryptor the content is the JSON string as bytes;
      // in production it would be XSalsa20-Poly1305 ciphertext.
      const raw = rawField.encrypted_escalation_recipient_ids!;
      expect(raw.length).toBeGreaterThan(0);
    });
  });

  describe("closesAt", () => {
    it("getForm returns closesAt as ISO string when set", async () => {
      const closesAt = new Date(Date.now() + 86_400_000).toISOString();
      const formId = await createForm("Closes Future");
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Closes Future",
        closesAt,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.closesAt).toBe(closesAt);
    });

    it("getForm returns null closesAt when not set", async () => {
      const formId = await createForm("No Closing");
      const detail = await svc.getForm(testDb.db, formId);
      expect(detail.closesAt).toBeNull();
    });

    it("resolvePublicForm returns formClosed=true when closes_at is in the past", async () => {
      const pastDate = new Date(Date.now() - 60_000).toISOString();
      const formId = await createForm("Closed Form", {
        slug: "closed-form-test",
      });
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Closed Form",
        slug: "closed-form-test",
        closesAt: pastDate,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.resolvePublicForm(testDb.db, "closed-form-test");
      expect(result.formClosed).toBe(true);
      expect(result.intakeDisabled).toBe(false);
      expect(result.formId).toBe(formId);
      // Fields are null for a closed form (same shape as disabled)
      expect(result.fields).toBeNull();
      // encryptedFormMeta is included so the client can show the closed message
      expect(result.encryptedFormMeta).not.toBeUndefined();

      await svc.setActive(testDb.db, formId, false);
    });

    it("resolvePublicForm returns formClosed=false when closes_at is in the future", async () => {
      const futureDate = new Date(Date.now() + 86_400_000).toISOString();
      const formId = await createForm("Open Form", {
        slug: "open-form-test",
      });
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Open Form",
        slug: "open-form-test",
        closesAt: futureDate,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.resolvePublicForm(testDb.db, "open-form-test");
      expect(result.formClosed).toBe(false);
      expect(result.fields).not.toBeNull();

      await svc.setActive(testDb.db, formId, false);
    });

    it("resolvePublicForm returns formClosed=false when closes_at is null", async () => {
      const formId = await createForm("No Close Form", {
        slug: "no-close-test",
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.resolvePublicForm(testDb.db, "no-close-test");
      expect(result.formClosed).toBe(false);
      expect(result.fields).not.toBeNull();

      await svc.setActive(testDb.db, formId, false);
    });

    it("saveForm clears closes_at when null is passed", async () => {
      const closesAt = new Date(Date.now() + 86_400_000).toISOString();
      const formId = await createForm("Clear Closes");
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Clear Closes",
        closesAt,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      let detail = await svc.getForm(testDb.db, formId);
      expect(detail.closesAt).not.toBeNull();

      // Clear the closing date
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Clear Closes",
        closesAt: null,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });

      detail = await svc.getForm(testDb.db, formId);
      expect(detail.closesAt).toBeNull();
    });

    it("resolvePublicForm includes encryptedFormMeta when form is closed", async () => {
      const metaBlob = Buffer.from(
        '{"closedMessage":"We are closed"}',
      ).toString("base64");
      const pastDate = new Date(Date.now() - 60_000).toISOString();
      const formId = await createForm("Closed With Meta", {
        slug: "closed-meta-test",
      });
      await svc.saveForm(testDb.db, crypto.randomUUID() as UserId, {
        formId,
        name: "Closed With Meta",
        slug: "closed-meta-test",
        closesAt: pastDate,
        encryptedFormMeta: metaBlob,
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text",
            encryptedLabel: Buffer.from("l").toString("base64"),
            encryptedConfig: Buffer.from("c").toString("base64"),
            isRequired: false,
          },
        ],
      });
      await svc.setActive(testDb.db, formId, true);

      const result = await svc.resolvePublicForm(testDb.db, "closed-meta-test");
      expect(result.formClosed).toBe(true);
      expect(result.encryptedFormMeta).toBe(metaBlob);

      await svc.setActive(testDb.db, formId, false);
    });
  });
});
