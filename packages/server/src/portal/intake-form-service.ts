/**
 * Intake form definition service.
 *
 * Admin CRUD for intake form definitions (whole-form saves, activation,
 * queue binding) and public read (resolve the intake queue's bound form
 * for the anonymous intake page).
 *
 * Field labels and config are encrypted ciphertext (bytea) that the
 * server never decrypts or validates. Size caps are enforced by the Zod
 * schema on ingest. The server stores and returns the blobs as-is.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { SaveIntakeFormInput } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Public read return shape
// ---------------------------------------------------------------------------

export interface PublicIntakeFormField {
  readonly id: string;
  readonly fieldType: string;
  readonly encryptedLabel: string;
  readonly encryptedConfig: string;
  readonly isRequired: boolean;
}

export interface PublicIntakeForm {
  readonly formId: string;
  readonly fields: readonly PublicIntakeFormField[];
}

// ---------------------------------------------------------------------------
// Admin detail return shape
// ---------------------------------------------------------------------------

export interface FormDetail {
  readonly formId: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly fields: readonly PublicIntakeFormField[];
}

// ---------------------------------------------------------------------------
// Admin list return shape
// ---------------------------------------------------------------------------

export interface FormSummary {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly fieldCount: number;
  readonly boundQueueIds: readonly string[];
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IntakeFormService {
  /**
   * Public read: resolve org_config.intake_queue_id -> queue_intake_forms
   * binding -> active form + ordered fields. Returns null when no form is
   * bound or the bound form is inactive (caller renders the default form).
   * Ciphertext passthrough: labels/config are returned as base64 strings
   * without decryption. No queue names or ids in the response.
   */
  getPublicForm(db: Kysely<TenantDatabase>): Promise<PublicIntakeForm | null>;

  /**
   * Admin read: load a single form with its fields in position order.
   * Ciphertext passthrough (labels/config returned as base64, never decrypted).
   * Throws NotFoundError for an unknown form id.
   */
  getForm(db: Kysely<TenantDatabase>, formId: string): Promise<FormDetail>;

  /**
   * Admin whole-form save (create when formId null): replaces the field set
   * in one transaction (DELETE + INSERT with positions 0..n-1), enforcing
   * the one-availability rule server-side. Returns the form id.
   */
  saveForm(
    db: Kysely<TenantDatabase>,
    userId: string,
    input: SaveIntakeFormInput,
  ): Promise<{ formId: string }>;

  /** List all forms with summary info (id, name, active, field count, bound queues). */
  listForms(db: Kysely<TenantDatabase>): Promise<FormSummary[]>;

  /**
   * Delete a form. Throws a ConflictError with FORM_HAS_RESPONSES code
   * when the form has intake submissions (deactivate instead).
   */
  deleteForm(db: Kysely<TenantDatabase>, formId: string): Promise<void>;

  /** Activate or deactivate a form. */
  setActive(
    db: Kysely<TenantDatabase>,
    formId: string,
    active: boolean,
  ): Promise<void>;

  /**
   * Bind a form to a queue. Pass null formId to unbind (queue falls back
   * to the default form).
   */
  bindQueue(
    db: Kysely<TenantDatabase>,
    queueId: string,
    formId: string | null,
  ): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createIntakeFormService(): IntakeFormService {
  return {
    async getPublicForm(
      db: Kysely<TenantDatabase>,
    ): Promise<PublicIntakeForm | null> {
      // Step 1: find the intake queue id from org_config
      const config = await db
        .selectFrom("org_config")
        .select("intake_queue_id")
        .executeTakeFirst();

      if (config?.intake_queue_id == null) {
        return null;
      }

      // Step 2: find the form bound to that queue
      const binding = await db
        .selectFrom("queue_intake_forms")
        .select("form_id")
        .where("queue_id", "=", config.intake_queue_id)
        .executeTakeFirst();

      if (!binding) {
        return null;
      }

      // Step 3: check the form is active
      const form = await db
        .selectFrom("intake_forms")
        .select(["id", "is_active"])
        .where("id", "=", binding.form_id)
        .executeTakeFirst();

      if (form?.is_active !== true) {
        return null;
      }

      // Step 4: load fields in position order
      const fields = await db
        .selectFrom("intake_form_fields")
        .select([
          "id",
          "field_type",
          "encrypted_label",
          "encrypted_config",
          "is_required",
        ])
        .where("form_id", "=", form.id)
        .orderBy("position", "asc")
        .execute();

      return {
        formId: form.id,
        fields: fields.map((f) => ({
          id: f.id,
          fieldType: f.field_type,
          // care-y-ignore-next-line no-standard-base64-server -- client-facing ciphertext: browser sends/receives standard base64 per the shared base64String validator
          encryptedLabel: f.encrypted_label.toString("base64"),
          // care-y-ignore-next-line no-standard-base64-server -- same as above
          encryptedConfig: f.encrypted_config.toString("base64"),
          isRequired: f.is_required,
        })),
      };
    },

    async getForm(
      db: Kysely<TenantDatabase>,
      formId: string,
    ): Promise<FormDetail> {
      const form = await db
        .selectFrom("intake_forms")
        .select(["id", "name", "is_active"])
        .where("id", "=", formId)
        .executeTakeFirst();

      if (!form) {
        throw new NotFoundError("Form not found");
      }

      const fields = await db
        .selectFrom("intake_form_fields")
        .select([
          "id",
          "field_type",
          "encrypted_label",
          "encrypted_config",
          "is_required",
        ])
        .where("form_id", "=", form.id)
        .orderBy("position", "asc")
        .execute();

      return {
        formId: form.id,
        // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label, not a person's name; not PII
        name: form.name,
        isActive: form.is_active,
        fields: fields.map((f) => ({
          id: f.id,
          fieldType: f.field_type,
          // care-y-ignore-next-line no-standard-base64-server -- client-facing ciphertext: browser sends/receives standard base64 per the shared base64String validator
          encryptedLabel: f.encrypted_label.toString("base64"),
          // care-y-ignore-next-line no-standard-base64-server -- same as above
          encryptedConfig: f.encrypted_config.toString("base64"),
          isRequired: f.is_required,
        })),
      };
    },

    async saveForm(
      db: Kysely<TenantDatabase>,
      _userId: string,
      input: SaveIntakeFormInput,
    ): Promise<{ formId: string }> {
      // Server-side one-availability re-check
      const availabilityCount = input.fields.filter(
        (f) => f.fieldType === "availability",
      ).length;
      if (availabilityCount > 1) {
        throw new ValidationError("One availability field per form");
      }

      return db.transaction().execute(async (trx) => {
        let formId: string;

        if (input.formId !== null) {
          // Update existing form name
          const existing = await trx
            .selectFrom("intake_forms")
            .select("id")
            .where("id", "=", input.formId)
            .executeTakeFirst();

          if (!existing) {
            throw new NotFoundError("Form not found");
          }

          await trx
            .updateTable("intake_forms")
            // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label (e.g. "Main Intake"), not a person's name; not PII
            .set({ name: input.name, updated_at: new Date() })
            .where("id", "=", input.formId)
            .execute();

          // Delete existing fields (replaced atomically)
          await trx
            .deleteFrom("intake_form_fields")
            .where("form_id", "=", input.formId)
            .execute();

          formId = input.formId;
        } else {
          // Create new form
          const row = await trx
            .insertInto("intake_forms")
            // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label (e.g. "Main Intake"), not a person's name; not PII
            .values({ name: input.name })
            .returning("id")
            .executeTakeFirstOrThrow();

          formId = row.id;
        }

        // Insert fields with positions 0..n-1
        if (input.fields.length > 0) {
          await trx
            .insertInto("intake_form_fields")
            .values(
              input.fields.map((f, idx) => ({
                form_id: formId,
                position: idx,
                field_type: f.fieldType,
                encrypted_label: Buffer.from(f.encryptedLabel, "base64"),
                encrypted_config: Buffer.from(f.encryptedConfig, "base64"),
                is_required: f.isRequired,
              })),
            )
            .execute();
        }

        return { formId };
      });
    },

    async listForms(db: Kysely<TenantDatabase>): Promise<FormSummary[]> {
      const forms = await db
        .selectFrom("intake_forms")
        .select(["id", "name", "is_active"])
        .orderBy("created_at", "asc")
        .execute();

      if (forms.length === 0) {
        return [];
      }

      const formIds = forms.map((f) => f.id);

      // Field counts per form
      const fieldCounts = await db
        .selectFrom("intake_form_fields")
        .select(["form_id", db.fn.countAll<number>().as("count")])
        .where("form_id", "in", formIds)
        .groupBy("form_id")
        .execute();

      const fieldCountMap = new Map(
        fieldCounts.map((r) => [r.form_id, r.count]),
      );

      // Queue bindings per form
      const bindings = await db
        .selectFrom("queue_intake_forms")
        .select(["form_id", "queue_id"])
        .where("form_id", "in", formIds)
        .execute();

      const bindingMap = new Map<string, string[]>();
      for (const b of bindings) {
        const existing = bindingMap.get(b.form_id);
        if (existing) {
          existing.push(b.queue_id);
        } else {
          bindingMap.set(b.form_id, [b.queue_id]);
        }
      }

      return forms.map((f) => ({
        id: f.id,
        name: f.name,
        isActive: f.is_active,
        fieldCount: fieldCountMap.get(f.id) ?? 0,
        boundQueueIds: bindingMap.get(f.id) ?? [],
      }));
    },

    async deleteForm(
      db: Kysely<TenantDatabase>,
      formId: string,
    ): Promise<void> {
      // Check for responses before deleting
      const response = await db
        .selectFrom("intake_form_responses")
        .select("ticket_id")
        .where("form_id", "=", formId)
        .limit(1)
        .executeTakeFirst();

      if (response) {
        throw new ConflictError(ErrorCode.FORM_HAS_RESPONSES);
      }

      const result = await db
        .deleteFrom("intake_forms")
        .where("id", "=", formId)
        .executeTakeFirst();

      if (result.numDeletedRows === 0n) {
        throw new NotFoundError("Form not found");
      }
    },

    async setActive(
      db: Kysely<TenantDatabase>,
      formId: string,
      active: boolean,
    ): Promise<void> {
      const result = await db
        .updateTable("intake_forms")
        .set({ is_active: active, updated_at: new Date() })
        .where("id", "=", formId)
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError("Form not found");
      }
    },

    async bindQueue(
      db: Kysely<TenantDatabase>,
      queueId: string,
      formId: string | null,
    ): Promise<void> {
      // Verify queue exists
      const queue = await db
        .selectFrom("queues")
        .select("id")
        .where("id", "=", queueId)
        .executeTakeFirst();

      if (!queue) {
        throw new NotFoundError("Queue not found");
      }

      if (formId === null) {
        // Unbind: delete the binding row
        await db
          .deleteFrom("queue_intake_forms")
          .where("queue_id", "=", queueId)
          .execute();
        return;
      }

      // Verify form exists
      const form = await db
        .selectFrom("intake_forms")
        .select("id")
        .where("id", "=", formId)
        .executeTakeFirst();

      if (!form) {
        throw new NotFoundError("Form not found");
      }

      // Upsert the binding (queue_id is PK)
      await db
        .insertInto("queue_intake_forms")
        .values({ queue_id: queueId, form_id: formId })
        .onConflict((oc) =>
          oc.column("queue_id").doUpdateSet({ form_id: formId }),
        )
        .execute();
    },
  };
}
