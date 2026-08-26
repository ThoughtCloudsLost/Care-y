/**
 * Intake form definition service.
 *
 * Admin CRUD for intake form definitions (whole-form saves, activation,
 * slug/default/destination handling) and public read (resolve by slug or
 * is_default flag for the anonymous intake page).
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
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { z } from "zod";
import type {
  IntakeFormId,
  IntakeFormFieldId,
  QueueId,
  UserId,
} from "@care-y/shared";
import { userIdSchema } from "@care-y/shared";

const recipientIdsSchema = z.array(userIdSchema);

// ---------------------------------------------------------------------------
// Public read return shape
// ---------------------------------------------------------------------------

export interface PublicIntakeFormField {
  readonly id: IntakeFormFieldId;
  readonly fieldKey: string;
  readonly fieldType: string;
  readonly role: string | null;
  readonly encryptedLabel: string;
  readonly encryptedConfig: string;
  readonly isRequired: boolean;
}

export interface PublicIntakeForm {
  readonly formId: IntakeFormId;
  readonly slug: string | null;
  readonly encryptedFormMeta: string | null;
  readonly fields: readonly PublicIntakeFormField[];
}

/**
 * Full result from resolvePublicForm, ready for the route to return as-is.
 * Handles kill switch, slug resolution, and default fallback in one call.
 */
export interface PublicFormResult {
  readonly formId: IntakeFormId | null;
  readonly slug: string | null;
  readonly encryptedFormMeta: string | null;
  readonly fields: readonly PublicIntakeFormField[] | null;
  readonly intakeDisabled: boolean;
}

// ---------------------------------------------------------------------------
// Admin detail return shape
// ---------------------------------------------------------------------------

export interface FormDetailField {
  readonly id: IntakeFormFieldId;
  readonly fieldKey: string;
  readonly fieldType: string;
  readonly role: string | null;
  readonly routingQueueIds: readonly QueueId[] | null;
  readonly escalationRecipientIds: readonly UserId[] | null;
  readonly encryptedLabel: string;
  readonly encryptedConfig: string;
  readonly isRequired: boolean;
}

export interface FormDetail {
  readonly formId: IntakeFormId;
  readonly name: string;
  readonly slug: string | null;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly destinationQueueId: QueueId | null;
  readonly encryptedFormMeta: string | null;
  readonly fields: readonly FormDetailField[];
}

// ---------------------------------------------------------------------------
// Admin list return shape
// ---------------------------------------------------------------------------

export interface FormSummary {
  readonly id: IntakeFormId;
  readonly name: string;
  readonly slug: string | null;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly destinationQueueId: QueueId | null;
  readonly fieldCount: number;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IntakeFormService {
  /**
   * Public read: resolve by slug (when given) or fall back to the
   * is_default form. Returns null when no matching active form exists
   * (caller renders the default built-in form or not-available state).
   *
   * When a slug IS provided but does not match any active form, returns
   * null. The route maps this to not-available (never falls through to
   * another form).
   *
   * Ciphertext passthrough: labels/config are returned as base64 strings
   * without decryption. No queue names or ids in the response (only the
   * form id and slug for the client to submit back).
   */
  getPublicForm(
    db: Kysely<TenantDatabase>,
    slug?: string | null,
  ): Promise<PublicIntakeForm | null>;

  /**
   * Admin read: load a single form with its fields in position order.
   * Ciphertext passthrough (labels/config returned as base64, never decrypted).
   * Throws NotFoundError for an unknown form id.
   */
  getForm(
    db: Kysely<TenantDatabase>,
    formId: IntakeFormId,
  ): Promise<FormDetail>;

  /**
   * Admin whole-form save (create when formId null): replaces the field set
   * in one transaction (DELETE + INSERT with positions 0..n-1), enforcing
   * the one-availability rule server-side. Handles slug uniqueness,
   * is_default atomicity, and destination queue validation. Returns the form id.
   */
  saveForm(
    db: Kysely<TenantDatabase>,
    userId: UserId,
    input: SaveIntakeFormInput,
  ): Promise<{ formId: string }>;

  /** List all forms with summary info (id, name, slug, active, default, destination, field count). */
  listForms(db: Kysely<TenantDatabase>): Promise<FormSummary[]>;

  /**
   * Delete a form. Throws a ConflictError with FORM_HAS_RESPONSES code
   * when the form has intake submissions (deactivate instead).
   */
  deleteForm(db: Kysely<TenantDatabase>, formId: IntakeFormId): Promise<void>;

  /** Activate or deactivate a form. */
  setActive(
    db: Kysely<TenantDatabase>,
    formId: IntakeFormId,
    active: boolean,
  ): Promise<void>;

  /** Returns false when org_config.web_intake_enabled is false (kill switch). */
  isWebIntakeEnabled(db: Kysely<TenantDatabase>): Promise<boolean>;

  /** Sets the org-wide web intake enabled flag (kill switch toggle). */
  setWebIntakeEnabled(
    db: Kysely<TenantDatabase>,
    enabled: boolean,
  ): Promise<void>;

  /**
   * Full public resolution: checks kill switch, resolves by slug or
   * is_default, returns a complete result the route returns as-is.
   * No business logic needed in the route handler.
   */
  resolvePublicForm(
    db: Kysely<TenantDatabase>,
    slug: string | null,
  ): Promise<PublicFormResult>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createIntakeFormService(deps: {
  readonly fieldEncryptor: FieldEncryptor;
}): IntakeFormService {
  const { fieldEncryptor } = deps;
  return {
    async getPublicForm(
      db: Kysely<TenantDatabase>,
      slug?: string | null,
    ): Promise<PublicIntakeForm | null> {
      let form;

      if (slug != null) {
        // Resolve by slug: only return an active form matching the slug
        form = await db
          .selectFrom("intake_forms")
          .select(["id", "slug", "encrypted_form_meta"])
          .where("slug", "=", slug)
          .where("is_active", "=", true)
          .executeTakeFirst();
      } else {
        // Resolve by is_default: find the active default form
        form = await db
          .selectFrom("intake_forms")
          .select(["id", "slug", "encrypted_form_meta"])
          .where("is_default", "=", true)
          .where("is_active", "=", true)
          .executeTakeFirst();
      }

      if (!form) {
        return null;
      }

      // Load fields in position order
      const fields = await db
        .selectFrom("intake_form_fields")
        .select([
          "id",
          "field_key",
          "field_type",
          "role",
          "encrypted_label",
          "encrypted_config",
          "is_required",
        ])
        .where("form_id", "=", form.id)
        .orderBy("position", "asc")
        .execute();

      return {
        formId: form.id,
        slug: form.slug,
        // care-y-ignore-next-line no-standard-base64-server -- client-facing ciphertext: browser sends/receives standard base64 per the shared base64String validator
        encryptedFormMeta: form.encrypted_form_meta?.toString("base64") ?? null,
        fields: fields.map((f) => ({
          id: f.id,
          fieldKey: f.field_key,
          fieldType: f.field_type,
          role: f.role,
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
      formId: IntakeFormId,
    ): Promise<FormDetail> {
      const form = await db
        .selectFrom("intake_forms")
        .select([
          "id",
          "name",
          "slug",
          "is_active",
          "is_default",
          "destination_queue_id",
          "encrypted_form_meta",
        ])
        .where("id", "=", formId)
        .executeTakeFirst();

      if (!form) {
        throw new NotFoundError("Form not found");
      }

      const fields = await db
        .selectFrom("intake_form_fields")
        .select([
          "id",
          "field_key",
          "field_type",
          "role",
          "routing_queue_ids",
          "encrypted_escalation_recipient_ids",
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
        slug: form.slug,
        isActive: form.is_active,
        isDefault: form.is_default,
        destinationQueueId: form.destination_queue_id,
        // care-y-ignore-next-line no-standard-base64-server -- client-facing ciphertext: browser sends/receives standard base64 per the shared base64String validator
        encryptedFormMeta: form.encrypted_form_meta?.toString("base64") ?? null,
        fields: fields.map((f) => {
          // Decrypt OPS-encrypted escalation recipient IDs for the admin UI.
          let escalationRecipientIds: readonly UserId[] | null = null;
          if (f.encrypted_escalation_recipient_ids !== null) {
            // care-y-ignore-next-line server-no-decrypt -- OPS-tier decryption: escalation recipient IDs are server-side operational data encrypted with OPS_SECRETS_KEY, same pattern as phones.encrypted_number in client-service.ts
            const json = fieldEncryptor.decrypt(
              f.encrypted_escalation_recipient_ids,
            );
            const parsed: unknown = JSON.parse(json);
            escalationRecipientIds = recipientIdsSchema.parse(parsed);
          }

          return {
            id: f.id,
            fieldKey: f.field_key,
            fieldType: f.field_type,
            role: f.role,
            routingQueueIds: f.routing_queue_ids,
            escalationRecipientIds,
            // care-y-ignore-next-line no-standard-base64-server -- client-facing ciphertext: browser sends/receives standard base64 per the shared base64String validator
            encryptedLabel: f.encrypted_label.toString("base64"),
            // care-y-ignore-next-line no-standard-base64-server -- same as above
            encryptedConfig: f.encrypted_config.toString("base64"),
            isRequired: f.is_required,
          };
        }),
      };
    },

    async saveForm(
      db: Kysely<TenantDatabase>,
      _userId: UserId,
      input: SaveIntakeFormInput,
    ): Promise<{ formId: string }> {
      // Server-side one-availability re-check
      const availabilityCount = input.fields.filter(
        (f) => f.fieldType === "availability",
      ).length;
      if (availabilityCount > 1) {
        throw new ValidationError("One availability field per form");
      }

      // Validate destination queue exists (when provided)
      if (input.destinationQueueId != null) {
        const queue = await db
          .selectFrom("queues")
          .select("id")
          .where("id", "=", input.destinationQueueId)
          .executeTakeFirst();

        if (!queue) {
          throw new NotFoundError("Destination queue not found");
        }
      }

      return db.transaction().execute(async (trx) => {
        let formId: IntakeFormId;

        // Slug uniqueness check (within the transaction)
        if (input.slug != null) {
          const existingSlug = await trx
            .selectFrom("intake_forms")
            .select("id")
            .where("slug", "=", input.slug)
            .executeTakeFirst();

          if (existingSlug && existingSlug.id !== input.formId) {
            throw new ConflictError(ErrorCode.INTAKE_SLUG_TAKEN);
          }
        }

        if (input.formId !== null) {
          // Update existing form
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
            .set({
              // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label (e.g. "Main Intake"), not a person's name; not PII
              name: input.name,
              slug: input.slug ?? null,
              destination_queue_id: input.destinationQueueId ?? null,
              encrypted_form_meta:
                input.encryptedFormMeta != null
                  ? Buffer.from(input.encryptedFormMeta, "base64")
                  : null,
              updated_at: new Date(),
            })
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
            .values({
              // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label (e.g. "Main Intake"), not a person's name; not PII
              name: input.name,
              slug: input.slug ?? null,
              destination_queue_id: input.destinationQueueId ?? null,
              encrypted_form_meta:
                input.encryptedFormMeta != null
                  ? Buffer.from(input.encryptedFormMeta, "base64")
                  : null,
            })
            .returning("id")
            .executeTakeFirstOrThrow();

          formId = row.id;
        }

        // Atomically clear any existing default if this form is becoming default
        if (input.isDefault === true) {
          await trx
            .updateTable("intake_forms")
            .set({ is_default: false })
            .where("is_default", "=", true)
            .where("id", "!=", formId)
            .execute();

          await trx
            .updateTable("intake_forms")
            .set({ is_default: true })
            .where("id", "=", formId)
            .execute();
        } else if (input.isDefault === false) {
          await trx
            .updateTable("intake_forms")
            .set({ is_default: false })
            .where("id", "=", formId)
            .execute();
        }

        // Insert fields with positions 0..n-1
        if (input.fields.length > 0) {
          await trx
            .insertInto("intake_form_fields")
            .values(
              input.fields.map((f, idx) => ({
                form_id: formId,
                position: idx,
                field_key: f.fieldKey,
                field_type: f.fieldType,
                role: f.role ?? null,
                routing_queue_ids: f.routingQueueIds ?? null,
                encrypted_escalation_recipient_ids:
                  f.escalationRecipientIds != null
                    ? fieldEncryptor.encrypt(
                        JSON.stringify(f.escalationRecipientIds),
                      )
                    : null,
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
        .select([
          "id",
          "name",
          "slug",
          "is_active",
          "is_default",
          "destination_queue_id",
        ])
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

      return forms.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        isActive: f.is_active,
        isDefault: f.is_default,
        destinationQueueId: f.destination_queue_id,
        fieldCount: fieldCountMap.get(f.id) ?? 0,
      }));
    },

    async deleteForm(
      db: Kysely<TenantDatabase>,
      formId: IntakeFormId,
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
      formId: IntakeFormId,
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

    async isWebIntakeEnabled(db: Kysely<TenantDatabase>): Promise<boolean> {
      const config = await db
        .selectFrom("org_config")
        .select("web_intake_enabled")
        .executeTakeFirst();

      // Default to true when no row exists (pre-migration orgs)
      return config?.web_intake_enabled !== false;
    },

    async setWebIntakeEnabled(
      db: Kysely<TenantDatabase>,
      enabled: boolean,
    ): Promise<void> {
      await db
        .updateTable("org_config")
        .set({ web_intake_enabled: enabled })
        .execute();
    },

    async resolvePublicForm(
      db: Kysely<TenantDatabase>,
      slug: string | null,
    ): Promise<PublicFormResult> {
      // Kill switch
      const enabled = await this.isWebIntakeEnabled(db);
      if (!enabled) {
        return {
          formId: null,
          fields: null,
          slug: null,
          encryptedFormMeta: null,
          intakeDisabled: true,
        };
      }

      const form = await this.getPublicForm(db, slug);

      if (form === null) {
        // Slug was given but no active form matched, or no default form
        return {
          formId: null,
          fields: null,
          slug,
          encryptedFormMeta: null,
          intakeDisabled: false,
        };
      }

      return {
        formId: form.formId,
        slug: form.slug,
        encryptedFormMeta: form.encryptedFormMeta,
        fields: form.fields,
        intakeDisabled: false,
      };
    },
  };
}
