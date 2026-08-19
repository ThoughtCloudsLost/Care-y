/**
 * Zod schemas for intake form definitions, semantic field roles, and
 * availability data.
 *
 * Shared by the admin form builder, the public dynamic renderer, and the server.
 * The structured response shape (intakeFormResponseSchema) is the seam the
 * availability-matching Worker consumes. Do not change its JSON shape without
 * coordinating with that consumer.
 */

import { z } from "zod";
import { base64String } from "./validators.js";

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

export const intakeFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "multiselect",
  "checkbox",
  "availability",
]);
export type IntakeFieldType = z.infer<typeof intakeFieldTypeSchema>;

// ---------------------------------------------------------------------------
// Semantic field roles (ADR-068)
// ---------------------------------------------------------------------------

/**
 * Plaintext role tags per ADR-068. "availability" is a widget type, not a role.
 *
 * Server-metadata roles (resolved by the submitter's browser, sent plaintext):
 *   queue-routing, urgency, escalation
 *
 * Browser-side roles (consumed only after volunteer-side decrypt):
 *   phone-contact, email-contact, real-name, pronouns,
 *   contact-safety, consent, language-preference
 */
export const intakeFieldRoleSchema = z.enum([
  "queue-routing",
  "urgency",
  "escalation",
  "phone-contact",
  "email-contact",
  "real-name",
  "pronouns",
  "contact-safety",
  "consent",
  "language-preference",
]);
export type IntakeFieldRole = z.infer<typeof intakeFieldRoleSchema>;

/** Roles that must appear at most once per form (identity/contact roles). */
export const UNIQUE_ROLES_PER_FORM: readonly IntakeFieldRole[] = [
  "phone-contact",
  "email-contact",
  "real-name",
  "pronouns",
  "contact-safety",
  "consent",
  "language-preference",
] as const;

/**
 * Which widget types each role may attach to. The server and builder
 * both validate this mapping.
 */
export const ROLE_WIDGET_COMPATIBILITY: Readonly<
  Record<IntakeFieldRole, readonly IntakeFieldType[]>
> = {
  "queue-routing": ["select", "multiselect"],
  urgency: ["select"],
  escalation: ["select", "checkbox"],
  "phone-contact": ["text"],
  "email-contact": ["text"],
  "real-name": ["text"],
  pronouns: ["text", "select"],
  "contact-safety": ["text", "textarea", "select"],
  consent: ["checkbox"],
  "language-preference": ["select"],
} as const;

// ---------------------------------------------------------------------------
// Role mapping schemas (live inside encrypted config, client-side only)
// ---------------------------------------------------------------------------

/** Queue-routing: option label -> queue UUID. */
export const queueRoutingMappingSchema = z.record(z.string(), z.uuid());
export type QueueRoutingMapping = z.infer<typeof queueRoutingMappingSchema>;

/** Urgency: option label -> ticket priority value. */
export const urgencyMappingSchema = z.record(
  z.string(),
  z.enum(["low", "normal", "high", "urgent"]),
);
export type UrgencyMapping = z.infer<typeof urgencyMappingSchema>;

/** Escalation: option label -> alert level string. */
export const escalationMappingSchema = z.record(
  z.string(),
  z.string().min(1).max(50),
);
export type EscalationMapping = z.infer<typeof escalationMappingSchema>;

// ---------------------------------------------------------------------------
// Field config (plaintext, client-side only)
// ---------------------------------------------------------------------------

/**
 * Plaintext field-definition shape. Exists CLIENT-SIDE only (builder before
 * encrypt, renderer after decrypt). The wire/DB shape carries encryptedLabel/
 * encryptedConfig as base64; the server never validates plaintext labels.
 */
export const intakeFieldConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    maxLength: z.number().int().min(1).max(1_000).optional(),
    placeholder: z.string().max(200).optional(),
  }),
  z.object({
    type: z.literal("textarea"),
    maxLength: z.number().int().min(1).max(10_000).optional(),
    placeholder: z.string().max(200).optional(),
  }),
  z.object({
    type: z.literal("select"),
    options: z.array(z.string().min(1).max(200)).min(1).max(50),
    queueRoutingMapping: queueRoutingMappingSchema.optional(),
    urgencyMapping: urgencyMappingSchema.optional(),
    escalationMapping: escalationMappingSchema.optional(),
  }),
  z.object({
    type: z.literal("multiselect"),
    options: z.array(z.string().min(1).max(200)).min(1).max(50),
    queueRoutingMapping: queueRoutingMappingSchema.optional(),
  }),
  z.object({
    type: z.literal("checkbox"),
    requiredTrue: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("availability"),
    allowRecurring: z.boolean(),
    allowSpecific: z.boolean(),
  }),
]);
export type IntakeFieldConfig = z.infer<typeof intakeFieldConfigSchema>;

// ---------------------------------------------------------------------------
// Availability data
// ---------------------------------------------------------------------------

export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;

export const availabilityDataSchema = z.object({
  timezone: z.string().min(1).max(64),
  recurring: z
    .array(
      z.object({
        day: dayOfWeekSchema,
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .max(21),
  specific: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .max(30),
});
export type AvailabilityData = z.infer<typeof availabilityDataSchema>;

// ---------------------------------------------------------------------------
// Structured response (encrypted into the per-ticket blob)
// ---------------------------------------------------------------------------

/**
 * Structured form response plaintext shape (encrypted into encryptedFormResponse).
 * The availability-matching Worker decodes this exact shape.
 */
export const intakeFormResponseSchema = z.object({
  formId: z.string().nullable(),
  answers: z
    .array(
      z.object({
        fieldId: z.string().max(200),
        fieldType: intakeFieldTypeSchema,
        value: z.union([
          z.string().max(10_000),
          z.array(z.string().max(200)).max(50),
          availabilityDataSchema,
          z.boolean(),
        ]),
      }),
    )
    .max(100),
});
export type IntakeFormResponse = z.infer<typeof intakeFormResponseSchema>;

// ---------------------------------------------------------------------------
// Slug validation
// ---------------------------------------------------------------------------

/** Kebab-case, 2-80 characters, lowercase alpha + digits + hyphens. */
export const intakeFormSlugSchema = z
  .string()
  .min(2)
  .max(80)
  .refine(
    (s) =>
      /^[a-z0-9]/.test(s) &&
      /[a-z0-9]$/.test(s) &&
      /^[a-z0-9-]+$/.test(s) &&
      !s.includes("--"),
    {
      message:
        "slug must be kebab-case (lowercase letters, digits, and hyphens)",
    },
  );

// ---------------------------------------------------------------------------
// Admin save input
// ---------------------------------------------------------------------------

/**
 * Validates that a role is compatible with the field's widget type.
 */
function isRoleCompatible(
  role: IntakeFieldRole,
  fieldType: IntakeFieldType,
): boolean {
  // eslint-disable-next-line security/detect-object-injection -- role is validated by intakeFieldRoleSchema enum
  const allowed = ROLE_WIDGET_COMPATIBILITY[role];
  return allowed.includes(fieldType);
}

/** Field shape within the admin save mutation. */
const saveIntakeFieldSchema = z.object({
  fieldType: intakeFieldTypeSchema,
  encryptedLabel: base64String("encryptedLabel").refine(
    (s) => s.length <= 2_800,
    "label too large",
  ),
  encryptedConfig: base64String("encryptedConfig").refine(
    (s) => s.length <= 28_000,
    "config too large",
  ),
  isRequired: z.boolean(),
  role: intakeFieldRoleSchema.nullable().optional(),
  routingQueueIds: z.array(z.uuid()).max(50).nullable().optional(),
  escalationRecipientIds: z.array(z.uuid()).max(50).nullable().optional(),
});

/**
 * Admin wire shape for whole-form saves. The editor saves the full ordered
 * field list in one mutation (create-or-replace), not per-field CRUD.
 */
export const saveIntakeFormInputSchema = z
  .object({
    formId: z.uuid().nullable(),
    name: z.string().min(1).max(120),
    slug: intakeFormSlugSchema.nullable().optional(),
    isDefault: z.boolean().optional(),
    destinationQueueId: z.uuid().nullable().optional(),
    fields: z
      .array(saveIntakeFieldSchema)
      .min(1)
      .max(100)
      .refine(
        (f) => f.filter((x) => x.fieldType === "availability").length <= 1,
        "one availability field per form",
      ),
  })
  .refine((input) => {
    // Validate unique-per-form roles
    const roleCounts = new Map<string, number>();
    for (const f of input.fields) {
      if (f.role != null) {
        roleCounts.set(f.role, (roleCounts.get(f.role) ?? 0) + 1);
      }
    }
    for (const role of UNIQUE_ROLES_PER_FORM) {
      if ((roleCounts.get(role) ?? 0) > 1) return false;
    }
    return true;
  }, "contact, real-name, pronouns, contact-safety, consent, and language-preference roles must appear at most once per form")
  .refine((input) => {
    // Validate role/widget compatibility
    for (const f of input.fields) {
      if (f.role != null && !isRoleCompatible(f.role, f.fieldType)) {
        return false;
      }
    }
    return true;
  }, "one or more fields have a role incompatible with their widget type");
export type SaveIntakeFormInput = z.infer<typeof saveIntakeFormInputSchema>;
