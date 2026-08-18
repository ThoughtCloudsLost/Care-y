/**
 * Zod schemas for intake form definitions and availability data.
 *
 * Shared by the admin form builder, the public dynamic renderer, and the server.
 * The structured response shape (intakeFormResponseSchema) is the seam the
 * availability-matching Worker consumes. Do not change its JSON shape without
 * coordinating with that consumer.
 */

import { z } from "zod";
import { base64String } from "./validators.js";

export const intakeFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "multiselect",
  "availability",
]);
export type IntakeFieldType = z.infer<typeof intakeFieldTypeSchema>;

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
  }),
  z.object({
    type: z.literal("multiselect"),
    options: z.array(z.string().min(1).max(200)).min(1).max(50),
  }),
  z.object({
    type: z.literal("availability"),
    allowRecurring: z.boolean(),
    allowSpecific: z.boolean(),
  }),
]);
export type IntakeFieldConfig = z.infer<typeof intakeFieldConfigSchema>;

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
        ]),
      }),
    )
    .max(20),
});
export type IntakeFormResponse = z.infer<typeof intakeFormResponseSchema>;

/**
 * Admin wire shape for whole-form saves. The editor saves the full ordered
 * field list in one mutation (create-or-replace), not per-field CRUD.
 */
export const saveIntakeFormInputSchema = z.object({
  formId: z.uuid().nullable(),
  name: z.string().min(1).max(120),
  fields: z
    .array(
      z.object({
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
      }),
    )
    .min(1)
    .max(20)
    .refine(
      (f) => f.filter((x) => x.fieldType === "availability").length <= 1,
      "one availability field per form",
    ),
});
export type SaveIntakeFormInput = z.infer<typeof saveIntakeFormInputSchema>;
