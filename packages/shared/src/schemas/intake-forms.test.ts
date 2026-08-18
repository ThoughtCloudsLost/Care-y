import { describe, expect, it } from "vitest";
import {
  intakeFieldTypeSchema,
  intakeFieldConfigSchema,
  dayOfWeekSchema,
  availabilityDataSchema,
  intakeFormResponseSchema,
  saveIntakeFormInputSchema,
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

describe("intakeFieldTypeSchema", () => {
  it("accepts all valid field types", () => {
    for (const t of [
      "text",
      "textarea",
      "select",
      "multiselect",
      "availability",
    ]) {
      expect(intakeFieldTypeSchema.safeParse(t).success).toBe(true);
    }
  });

  it("rejects unknown field type", () => {
    expect(intakeFieldTypeSchema.safeParse("checkbox").success).toBe(false);
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

  it("caps answers at 20", () => {
    const answers = Array.from({ length: 21 }, (_, i) => ({
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

  it("accepts exactly 20 answers", () => {
    const answers = Array.from({ length: 20 }, (_, i) => ({
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

describe("saveIntakeFormInputSchema", () => {
  function validFormInput(): Record<string, unknown> {
    return {
      formId: null,
      name: "Intake Form",
      fields: [
        {
          fieldType: "text",
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: true,
        },
      ],
    };
  }

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

  it("rejects more than 20 fields", () => {
    const field = {
      fieldType: "text" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
    };
    const input = {
      ...validFormInput(),
      fields: Array.from({ length: 21 }, () => field),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
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
    const textField = {
      fieldType: "text" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: true,
    };
    const input = {
      ...validFormInput(),
      fields: [textField, avField],
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
});
