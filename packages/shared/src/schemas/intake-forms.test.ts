import { describe, expect, it } from "vitest";
import {
  intakeFieldTypeSchema,
  intakeFieldRoleSchema,
  intakeFieldConfigSchema,
  dayOfWeekSchema,
  availabilityDataSchema,
  intakeFormResponseSchema,
  saveIntakeFormInputSchema,
  intakeFormSlugSchema,
  queueRoutingMappingSchema,
  urgencyMappingSchema,
  escalationMappingSchema,
} from "./intake-forms.js";

/** Generate a base64 string that decodes to exactly `n` bytes. */
function base64OfBytes(n: number): string {
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = (i + 65) % 256;
  }
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

/** Generate a valid base64 string of the given character length. */
function base64Chars(len: number): string {
  return "A".repeat(len);
}

function validField(): Record<string, unknown> {
  return {
    fieldType: "text",
    encryptedLabel: base64OfBytes(32),
    encryptedConfig: base64OfBytes(64),
    isRequired: true,
  };
}

function validFormInput(): Record<string, unknown> {
  return {
    formId: null,
    name: "Intake Form",
    fields: [validField()],
  };
}

describe("intakeFieldTypeSchema", () => {
  it("accepts all valid field types", () => {
    for (const t of [
      "text",
      "textarea",
      "select",
      "multiselect",
      "checkbox",
      "availability",
    ]) {
      expect(intakeFieldTypeSchema.safeParse(t).success).toBe(true);
    }
  });

  it("rejects unknown field type", () => {
    expect(intakeFieldTypeSchema.safeParse("radio").success).toBe(false);
  });
});

describe("intakeFieldRoleSchema", () => {
  it("accepts all 10 defined roles", () => {
    const roles = [
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
    ];
    for (const r of roles) {
      expect(intakeFieldRoleSchema.safeParse(r).success).toBe(true);
    }
  });

  it("rejects availability (widget type, not a role)", () => {
    expect(intakeFieldRoleSchema.safeParse("availability").success).toBe(false);
  });

  it("rejects unknown role", () => {
    expect(intakeFieldRoleSchema.safeParse("custom-role").success).toBe(false);
  });
});

describe("role mapping schemas", () => {
  it("queueRoutingMapping accepts option -> UUID record", () => {
    const result = queueRoutingMappingSchema.safeParse({
      "Option A": crypto.randomUUID(),
      "Option B": crypto.randomUUID(),
    });
    expect(result.success).toBe(true);
  });

  it("queueRoutingMapping rejects non-UUID values", () => {
    const result = queueRoutingMappingSchema.safeParse({
      "Option A": "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("urgencyMapping accepts option -> priority record", () => {
    const result = urgencyMappingSchema.safeParse({
      Low: "low",
      Normal: "normal",
      High: "high",
      Urgent: "urgent",
    });
    expect(result.success).toBe(true);
  });

  it("urgencyMapping rejects invalid priority value", () => {
    const result = urgencyMappingSchema.safeParse({
      Critical: "critical",
    });
    expect(result.success).toBe(false);
  });

  it("escalationMapping accepts option -> alert level record", () => {
    const result = escalationMappingSchema.safeParse({
      "In danger": "immediate",
      "Needs follow-up": "standard",
    });
    expect(result.success).toBe(true);
  });

  it("escalationMapping rejects empty alert level", () => {
    const result = escalationMappingSchema.safeParse({
      "In danger": "",
    });
    expect(result.success).toBe(false);
  });
});

describe("intakeFieldConfigSchema", () => {
  it("accepts text config with maxLength and placeholder", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      maxLength: 200,
      placeholder: "Your name",
    });
    expect(result.success).toBe(true);
  });

  it("accepts text config without optional fields", () => {
    const result = intakeFieldConfigSchema.safeParse({ type: "text" });
    expect(result.success).toBe(true);
  });

  it("accepts textarea config", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "textarea",
      maxLength: 5_000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects text config with maxLength over 1000", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      maxLength: 1_001,
    });
    expect(result.success).toBe(false);
  });

  it("rejects textarea config with maxLength over 10000", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "textarea",
      maxLength: 10_001,
    });
    expect(result.success).toBe(false);
  });

  it("accepts select config with options", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: ["Option A", "Option B"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with queue-routing mapping", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: ["General", "Urgent"],
      queueRoutingMapping: {
        General: crypto.randomUUID(),
        Urgent: crypto.randomUUID(),
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with urgency mapping", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: ["Low", "High"],
      urgencyMapping: { Low: "low", High: "high" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with escalation mapping", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: ["Safe", "Danger"],
      escalationMapping: { Safe: "none", Danger: "immediate" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiselect config with queue-routing mapping", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "multiselect",
      options: ["A", "B"],
      queueRoutingMapping: { A: crypto.randomUUID() },
    });
    expect(result.success).toBe(true);
  });

  it("rejects select config with empty options array", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects select config with too many options", () => {
    const options = Array.from({ length: 51 }, (_, i) => `Option ${String(i)}`);
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options,
    });
    expect(result.success).toBe(false);
  });

  it("rejects select option exceeding 200 chars", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: ["x".repeat(201)],
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiselect config", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "multiselect",
      options: ["A", "B", "C"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts checkbox config with requiredTrue", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "checkbox",
      requiredTrue: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts checkbox config without requiredTrue", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "checkbox",
    });
    expect(result.success).toBe(true);
  });

  it("accepts availability config", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "availability",
      allowRecurring: true,
      allowSpecific: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown discriminator type", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "radio",
      options: ["A"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects placeholder exceeding 200 chars", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      placeholder: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("dayOfWeekSchema", () => {
  it("accepts all seven days", () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    for (const d of days) {
      expect(dayOfWeekSchema.safeParse(d).success).toBe(true);
    }
  });

  it("rejects invalid day", () => {
    expect(dayOfWeekSchema.safeParse("funday").success).toBe(false);
  });
});

describe("availabilityDataSchema", () => {
  const validAvailability = {
    timezone: "America/New_York",
    recurring: [{ day: "monday" as const, start: "09:00", end: "17:00" }],
    specific: [],
  };

  it("accepts valid availability data", () => {
    const result = availabilityDataSchema.safeParse(validAvailability);
    expect(result.success).toBe(true);
  });

  it("accepts a raw UTC offset string as timezone (free string, not IANA-validated)", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      timezone: "UTC+05:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty timezone", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      timezone: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects timezone exceeding 64 chars", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      timezone: "x".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format in recurring", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      recurring: [{ day: "monday", start: "9:00", end: "17:00" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format in specific", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      specific: [{ date: "08-18-2026", start: "09:00", end: "17:00" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid specific window", () => {
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      specific: [{ date: "2026-08-18", start: "09:00", end: "17:00" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 21 recurring windows", () => {
    const recurring = Array.from({ length: 22 }, () => ({
      day: "monday" as const,
      start: "09:00",
      end: "17:00",
    }));
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      recurring,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 30 specific windows", () => {
    const specific = Array.from({ length: 31 }, () => ({
      date: "2026-08-18",
      start: "09:00",
      end: "17:00",
    }));
    const result = availabilityDataSchema.safeParse({
      ...validAvailability,
      specific,
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty recurring and specific arrays", () => {
    const result = availabilityDataSchema.safeParse({
      timezone: "Europe/Berlin",
      recurring: [],
      specific: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("intakeFormResponseSchema", () => {
  it("accepts valid response with string answer", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [{ fieldId: "f1", fieldType: "text", value: "Jane Doe" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with array answer (multiselect)", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [{ fieldId: "f1", fieldType: "multiselect", value: ["A", "B"] }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with boolean answer (checkbox)", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [{ fieldId: "f1", fieldType: "checkbox", value: true }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with availability answer", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        {
          fieldId: "f1",
          fieldType: "availability",
          value: {
            timezone: "America/Chicago",
            recurring: [{ day: "tuesday", start: "10:00", end: "14:00" }],
            specific: [],
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null formId (default form)", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: null,
      answers: [],
    });
    expect(result.success).toBe(true);
  });

  it("caps answers at 100", () => {
    const answers = Array.from({ length: 101 }, (_, i) => ({
      fieldId: `f${String(i)}`,
      fieldType: "text" as const,
      value: "x",
    }));
    const result = intakeFormResponseSchema.safeParse({
      formId: null,
      answers,
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 100 answers", () => {
    const answers = Array.from({ length: 100 }, (_, i) => ({
      fieldId: `f${String(i)}`,
      fieldType: "text" as const,
      value: "x",
    }));
    const result = intakeFormResponseSchema.safeParse({
      formId: null,
      answers,
    });
    expect(result.success).toBe(true);
  });

  it("rejects string value exceeding 10000 chars", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: null,
      answers: [
        { fieldId: "f1", fieldType: "textarea", value: "x".repeat(10_001) },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("intakeFormSlugSchema", () => {
  it("accepts valid kebab-case slugs", () => {
    for (const slug of ["general", "my-form", "partner-referral-2026", "ab"]) {
      expect(intakeFormSlugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it("rejects uppercase", () => {
    expect(intakeFormSlugSchema.safeParse("My-Form").success).toBe(false);
  });

  it("rejects leading hyphen", () => {
    expect(intakeFormSlugSchema.safeParse("-general").success).toBe(false);
  });

  it("rejects trailing hyphen", () => {
    expect(intakeFormSlugSchema.safeParse("general-").success).toBe(false);
  });

  it("rejects consecutive hyphens", () => {
    expect(intakeFormSlugSchema.safeParse("my--form").success).toBe(false);
  });

  it("rejects single character", () => {
    expect(intakeFormSlugSchema.safeParse("a").success).toBe(false);
  });

  it("rejects slug over 80 chars", () => {
    expect(intakeFormSlugSchema.safeParse("a".repeat(81)).success).toBe(false);
  });

  it("accepts 80-char slug", () => {
    expect(intakeFormSlugSchema.safeParse("a".repeat(80)).success).toBe(true);
  });

  it("rejects spaces", () => {
    expect(intakeFormSlugSchema.safeParse("my form").success).toBe(false);
  });

  it("rejects underscores", () => {
    expect(intakeFormSlugSchema.safeParse("my_form").success).toBe(false);
  });
});

describe("saveIntakeFormInputSchema", () => {
  it("accepts valid form input", () => {
    const result = saveIntakeFormInputSchema.safeParse(validFormInput());
    expect(result.success).toBe(true);
  });

  it("accepts formId as UUID (update)", () => {
    const input = { ...validFormInput(), formId: crypto.randomUUID() };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const input = { ...validFormInput(), name: "" };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 120 chars", () => {
    const input = { ...validFormInput(), name: "x".repeat(121) };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects empty fields array", () => {
    const input = { ...validFormInput(), fields: [] };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects more than 100 fields", () => {
    const field = validField();
    const input = {
      ...validFormInput(),
      fields: Array.from({ length: 101 }, () => field),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts exactly 100 fields", () => {
    const field = validField();
    const input = {
      ...validFormInput(),
      fields: Array.from({ length: 100 }, () => field),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects two availability fields (one-per-form rule)", () => {
    const avField = {
      fieldType: "availability" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
    };
    const input = {
      ...validFormInput(),
      fields: [avField, avField],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts exactly one availability field", () => {
    const avField = {
      fieldType: "availability" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
    };
    const input = {
      ...validFormInput(),
      fields: [validField(), avField],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects oversized encryptedLabel", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "text",
          encryptedLabel: base64Chars(2_801),
          encryptedConfig: base64OfBytes(64),
          isRequired: true,
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects oversized encryptedConfig", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "text",
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64Chars(28_001),
          isRequired: true,
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 encryptedLabel", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "text",
          encryptedLabel: "not!valid@base64",
          encryptedConfig: base64OfBytes(64),
          isRequired: true,
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid fieldType", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "radio",
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: true,
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  // --- slug/isDefault/destinationQueueId ---

  it("accepts slug, isDefault, and destinationQueueId", () => {
    const input = {
      ...validFormInput(),
      slug: "general-help",
      isDefault: true,
      destinationQueueId: crypto.randomUUID(),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts null slug and null destinationQueueId", () => {
    const input = {
      ...validFormInput(),
      slug: null,
      destinationQueueId: null,
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const input = {
      ...validFormInput(),
      slug: "UPPER_CASE",
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  // --- field roles ---

  it("accepts fields with valid roles", () => {
    const input = {
      ...validFormInput(),
      fields: [
        { ...validField(), role: "phone-contact" },
        {
          fieldType: "select",
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: false,
          role: "queue-routing",
          routingQueueIds: [crypto.randomUUID()],
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts fields with null role", () => {
    const input = {
      ...validFormInput(),
      fields: [{ ...validField(), role: null }],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects duplicate unique-per-form roles", () => {
    const input = {
      ...validFormInput(),
      fields: [
        { ...validField(), role: "phone-contact" },
        { ...validField(), role: "phone-contact" },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("allows duplicate server-metadata roles (queue-routing on two selects)", () => {
    const selectField = {
      fieldType: "select" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
      role: "queue-routing" as const,
    };
    const input = {
      ...validFormInput(),
      fields: [selectField, selectField],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects role incompatible with widget type (consent on text)", () => {
    const input = {
      ...validFormInput(),
      fields: [{ ...validField(), role: "consent" }],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects role incompatible with widget type (queue-routing on text)", () => {
    const input = {
      ...validFormInput(),
      fields: [{ ...validField(), role: "queue-routing" }],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts consent role on checkbox widget", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "checkbox" as const,
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: true,
          role: "consent",
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts escalation role on checkbox widget", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "checkbox" as const,
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: false,
          role: "escalation",
          escalationRecipientIds: [crypto.randomUUID()],
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts routingQueueIds on a queue-routing field", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "select" as const,
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: false,
          role: "queue-routing",
          routingQueueIds: [crypto.randomUUID(), crypto.randomUUID()],
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects routingQueueIds with non-UUID entries", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          fieldType: "select" as const,
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: false,
          role: "queue-routing",
          routingQueueIds: ["not-a-uuid"],
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
