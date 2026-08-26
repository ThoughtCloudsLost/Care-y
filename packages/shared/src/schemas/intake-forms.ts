/**
 * Zod schemas for intake form definitions, semantic field roles, and
 * availability data.
 *
 * Shared by the admin form builder, the public dynamic renderer, and the server.
 * The structured response shape (intakeFormResponseSchema) is the seam the
 * availability-matching Worker consumes. Do not change its JSON shape without
 * coordinating with that consumer.
 *
 * D1 (stable field keys): every field carries a client-minted fieldKey (UUID),
 * stable across saves. D2 (stable option keys): options are { key, label }
 * pairs; mappings reference option keys, not labels. D3 (localized content):
 * all human-readable strings are LocalizedText with base-locale fallback.
 */

import { z } from "zod";
import { base64String } from "./validators.js";
import { queueIdSchema, userIdSchema, intakeFormIdSchema } from "../ids.js";

// ---------------------------------------------------------------------------
// Supported form content locales (tracks the app's paraglide locales)
// ---------------------------------------------------------------------------

/** ISO locale codes supported by the form builder. */
export const FORM_LOCALES = ["en", "es"] as const;
export type FormLocale = (typeof FORM_LOCALES)[number];

/** The locale used as fallback when a requested locale has no translation. */
export const BASE_LOCALE: FormLocale = "en";

// ---------------------------------------------------------------------------
// Localized text (D3)
// ---------------------------------------------------------------------------

/**
 * A string that may carry translations for each supported locale. The base
 * locale ("en") is required by a refinement at the definition level, not by
 * the schema itself, so partial objects round-trip through Zod without
 * friction. Use resolveLocalized() to read a value with fallback.
 *
 * z.partialRecord (not z.record) so Zod v4 infers partial keys rather than
 * requiring every locale to be present.
 */
export const localizedTextSchema = z.partialRecord(
  z.enum(FORM_LOCALES),
  z.string().max(10_000),
);
export type LocalizedText = z.infer<typeof localizedTextSchema>;

/**
 * Resolve a localized string with base-locale fallback.
 *
 * Returns the value for the requested locale when present, otherwise the
 * base locale value, otherwise undefined (caller decides whether that is
 * an error or an empty display).
 */
export function resolveLocalized(
  text: LocalizedText | undefined,
  locale: FormLocale,
): string | undefined {
  if (text == null) return undefined;
  // eslint-disable-next-line security/detect-object-injection -- locale is from the FormLocale enum
  const direct = text[locale];
  if (direct != null && direct.length > 0) return direct;
  if (locale !== BASE_LOCALE) {
    // eslint-disable-next-line security/detect-object-injection -- BASE_LOCALE is a compile-time constant
    const fallback = text[BASE_LOCALE];
    if (fallback != null && fallback.length > 0) return fallback;
  }
  return undefined;
}

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
  "date",
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
// Text subtypes (T1.2: input validation)
// ---------------------------------------------------------------------------

/**
 * Subtypes for text fields that enable client-side validation.
 * `email-contact` and `phone-contact` roles default their subtype
 * to `email` and `phone` respectively.
 */
export const textSubtypeSchema = z.enum(["email", "phone", "number"]);
export type TextSubtype = z.infer<typeof textSubtypeSchema>;

/**
 * Number range constraints for text fields with the "number" subtype.
 */
export const numberRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Option schema (D2: stable option keys)
// ---------------------------------------------------------------------------

/**
 * A single option in a select/multiselect field. The key is editor-minted
 * (UUID) and immutable across saves. The label is localized text displayed
 * to the user.
 */
export const intakeOptionSchema = z.object({
  key: z.string().min(1).max(200),
  label: localizedTextSchema,
});
export type IntakeOption = z.infer<typeof intakeOptionSchema>;

// ---------------------------------------------------------------------------
// Role mapping schemas (live inside encrypted config, client-side only)
// Re-keyed from option label to option key (D2).
// ---------------------------------------------------------------------------

/** Queue-routing: option key -> queue UUID. */
export const queueRoutingMappingSchema = z.record(z.string(), queueIdSchema);
export type QueueRoutingMapping = z.infer<typeof queueRoutingMappingSchema>;

/** Urgency: option key -> ticket priority value. */
export const urgencyMappingSchema = z.record(
  z.string(),
  z.enum(["low", "normal", "high", "urgent"]),
);
export type UrgencyMapping = z.infer<typeof urgencyMappingSchema>;

/** Escalation: option key -> alert level string. */
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
 *
 * D2: select/multiselect options are now { key, label } pairs.
 * D3: placeholder is now LocalizedText.
 */
export const intakeFieldConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    maxLength: z.number().int().min(1).max(1_000).optional(),
    placeholder: localizedTextSchema.optional(),
    helpText: localizedTextSchema.optional(),
    subtype: textSubtypeSchema.optional(),
    numberRange: numberRangeSchema.optional(),
  }),
  z.object({
    type: z.literal("textarea"),
    maxLength: z.number().int().min(1).max(10_000).optional(),
    placeholder: localizedTextSchema.optional(),
    helpText: localizedTextSchema.optional(),
  }),
  z.object({
    type: z.literal("select"),
    options: z.array(intakeOptionSchema).min(1).max(50),
    helpText: localizedTextSchema.optional(),
    queueRoutingMapping: queueRoutingMappingSchema.optional(),
    urgencyMapping: urgencyMappingSchema.optional(),
    escalationMapping: escalationMappingSchema.optional(),
  }),
  z.object({
    type: z.literal("multiselect"),
    options: z.array(intakeOptionSchema).min(1).max(50),
    helpText: localizedTextSchema.optional(),
    queueRoutingMapping: queueRoutingMappingSchema.optional(),
  }),
  z.object({
    type: z.literal("checkbox"),
    requiredTrue: z.boolean().optional(),
    helpText: localizedTextSchema.optional(),
  }),
  z.object({
    type: z.literal("availability"),
    allowRecurring: z.boolean(),
    allowSpecific: z.boolean(),
    helpText: localizedTextSchema.optional(),
  }),
  z.object({
    type: z.literal("date"),
    helpText: localizedTextSchema.optional(),
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
 *
 * D1: answers reference fieldKey (stable across saves) rather than a transient
 * row id. D2: select/multiselect answers record option keys, not labels.
 */
export const intakeFormResponseSchema = z.object({
  formId: z.string().nullable(),
  answers: z
    .array(
      z.object({
        fieldKey: z.string().max(200),
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
// Encrypted config size cap
// ---------------------------------------------------------------------------

/**
 * Maximum base64 character length for a single encryptedConfig field.
 * 28 KB accommodates a fully localized config (en + es) with 50 options.
 */
export const ENCRYPTED_CONFIG_CAP = 28_000;

/**
 * Maximum base64 character length for a single encryptedLabel field.
 */
export const ENCRYPTED_LABEL_CAP = 2_800;

// ---------------------------------------------------------------------------
// Form-level metadata (encrypted, inside the definition)
// ---------------------------------------------------------------------------

/**
 * Plaintext shape for form-level descriptive content. Encrypted under the
 * client-branding key alongside field definitions. The closed message is
 * consumed once a form has a closing date; the schema stores it now
 * so editors can author it ahead of that feature.
 */
export const intakeFormMetaSchema = z.object({
  description: localizedTextSchema.optional(),
  submitMessage: localizedTextSchema.optional(),
  closedMessage: localizedTextSchema.optional(),
});
export type IntakeFormMeta = z.infer<typeof intakeFormMetaSchema>;

/**
 * Maximum base64 character length for the encrypted form metadata blob.
 * Generous cap; three LocalizedText fields with 10 KB each per locale
 * plus overhead fits comfortably.
 */
export const ENCRYPTED_FORM_META_CAP = 88_000;

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

/**
 * Field key schema. UUIDs minted by the editor for custom fields, or
 * sentinel pseudo-keys for the default form's built-in fields.
 */
export const fieldKeySchema = z.string().min(1).max(200);

/** Field shape within the admin save mutation. */
const saveIntakeFieldSchema = z.object({
  fieldKey: fieldKeySchema,
  fieldType: intakeFieldTypeSchema,
  encryptedLabel: base64String("encryptedLabel").refine(
    (s) => s.length <= ENCRYPTED_LABEL_CAP,
    "label too large",
  ),
  encryptedConfig: base64String("encryptedConfig").refine(
    (s) => s.length <= ENCRYPTED_CONFIG_CAP,
    "config too large",
  ),
  isRequired: z.boolean(),
  role: intakeFieldRoleSchema.nullable().optional(),
  routingQueueIds: z.array(queueIdSchema).max(50).nullable().optional(),
  escalationRecipientIds: z.array(userIdSchema).max(50).nullable().optional(),
});

/**
 * Admin wire shape for whole-form saves. The editor saves the full ordered
 * field list in one mutation (create-or-replace), not per-field CRUD.
 */
export const saveIntakeFormInputSchema = z
  .object({
    formId: intakeFormIdSchema.nullable(),
    name: z.string().min(1).max(120),
    slug: intakeFormSlugSchema.nullable().optional(),
    isDefault: z.boolean().optional(),
    destinationQueueId: queueIdSchema.nullable().optional(),
    encryptedFormMeta: base64String("encryptedFormMeta")
      .refine(
        (s) => s.length <= ENCRYPTED_FORM_META_CAP,
        "form metadata too large",
      )
      .optional(),
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
    // Field keys must be unique within a form (D1)
    const keys = new Set<string>();
    for (const f of input.fields) {
      if (keys.has(f.fieldKey)) return false;
      keys.add(f.fieldKey);
    }
    return true;
  }, "field keys must be unique within a form")
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
