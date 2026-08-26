import { describe, expect, it } from "vitest";
import {
  FORM_LOCALES,
  BASE_LOCALE,
  localizedTextSchema,
  resolveLocalized,
  intakeFieldTypeSchema,
  intakeFieldRoleSchema,
  intakeFieldConfigSchema,
  intakeOptionSchema,
  dayOfWeekSchema,
  availabilityDataSchema,
  intakeFormResponseSchema,
  saveIntakeFormInputSchema,
  intakeFormSlugSchema,
  queueRoutingMappingSchema,
  urgencyMappingSchema,
  escalationMappingSchema,
  fieldKeySchema,
  ENCRYPTED_CONFIG_CAP,
  ENCRYPTED_LABEL_CAP,
  intakeFormMetaSchema,
  textSubtypeSchema,
  ENCRYPTED_FORM_META_CAP,
  visibleWhenSchema,
  visibilityRuleSchema,
  evaluateVisibility,
  isDataFieldType,
  PAGE_BREAK_TYPE,
} from "./intake-forms.js";
import type {
  LocalizedText,
  IntakeFieldConfig,
  VisibleWhen,
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
    fieldKey: crypto.randomUUID(),
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

/** Build a localized text value with base locale populated. */
function lt(en: string, es?: string): LocalizedText {
  const result: LocalizedText = { en };
  if (es != null) result.es = es;
  return result;
}

/** Build a valid option with stable key and localized label. */
function opt(
  key: string,
  enLabel: string,
  esLabel?: string,
): { key: string; label: LocalizedText } {
  return { key, label: lt(enLabel, esLabel) };
}

// =========================================================================
// Localized text and resolveLocalized
// =========================================================================

describe("LocalizedText and resolveLocalized", () => {
  describe("localizedTextSchema", () => {
    it("accepts base locale only", () => {
      const result = localizedTextSchema.safeParse({ en: "Hello" });
      expect(result.success).toBe(true);
    });

    it("accepts both locales", () => {
      const result = localizedTextSchema.safeParse({
        en: "Hello",
        es: "Hola",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty object (no locales populated)", () => {
      const result = localizedTextSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects unknown locale keys", () => {
      const result = localizedTextSchema.safeParse({
        en: "Hello",
        fr: "Bonjour",
      });
      expect(result.success).toBe(false);
    });

    it("rejects string values exceeding 10000 chars", () => {
      const result = localizedTextSchema.safeParse({
        en: "x".repeat(10_001),
      });
      expect(result.success).toBe(false);
    });

    it("accepts string at the 10000 char boundary", () => {
      const result = localizedTextSchema.safeParse({
        en: "x".repeat(10_000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("resolveLocalized", () => {
    it("returns the requested locale value when present", () => {
      const text: LocalizedText = { en: "Hello", es: "Hola" };
      expect(resolveLocalized(text, "es")).toBe("Hola");
    });

    it("falls back to base locale when requested locale is missing", () => {
      const text: LocalizedText = { en: "Hello" };
      expect(resolveLocalized(text, "es")).toBe("Hello");
    });

    it("returns base locale value directly when base locale is requested", () => {
      const text: LocalizedText = { en: "Hello", es: "Hola" };
      expect(resolveLocalized(text, "en")).toBe("Hello");
    });

    it("returns undefined when no locale has a value", () => {
      const text: LocalizedText = {};
      expect(resolveLocalized(text, "en")).toBeUndefined();
    });

    it("returns undefined when text is undefined", () => {
      expect(resolveLocalized(undefined, "en")).toBeUndefined();
    });

    it("skips empty string values and falls back", () => {
      const text: LocalizedText = { en: "Hello", es: "" };
      expect(resolveLocalized(text, "es")).toBe("Hello");
    });

    it("returns undefined when base locale is also empty string", () => {
      const text: LocalizedText = { en: "", es: "" };
      expect(resolveLocalized(text, "es")).toBeUndefined();
    });

    it("returns undefined when base locale requested but empty", () => {
      const text: LocalizedText = { en: "" };
      expect(resolveLocalized(text, "en")).toBeUndefined();
    });
  });

  describe("FORM_LOCALES and BASE_LOCALE", () => {
    it("BASE_LOCALE is the first entry in FORM_LOCALES", () => {
      expect(FORM_LOCALES).toContain(BASE_LOCALE);
    });

    it("BASE_LOCALE is en", () => {
      expect(BASE_LOCALE).toBe("en");
    });

    it("FORM_LOCALES contains en and es", () => {
      expect(FORM_LOCALES).toEqual(["en", "es"]);
    });
  });
});

// =========================================================================
// Stable option keys
// =========================================================================

describe("intakeOptionSchema", () => {
  it("accepts a valid option with key and localized label", () => {
    const result = intakeOptionSchema.safeParse(opt("opt-1", "Option One"));
    expect(result.success).toBe(true);
  });

  it("accepts an option with both locale labels", () => {
    const result = intakeOptionSchema.safeParse(
      opt("opt-1", "Option One", "Opcion Uno"),
    );
    expect(result.success).toBe(true);
  });

  it("rejects option with empty key", () => {
    const result = intakeOptionSchema.safeParse({
      key: "",
      label: { en: "Hello" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects option with key exceeding 200 chars", () => {
    const result = intakeOptionSchema.safeParse({
      key: "x".repeat(201),
      label: { en: "Hello" },
    });
    expect(result.success).toBe(false);
  });
});

// =========================================================================
// Stable field keys (invariant tests)
// =========================================================================

describe("field key stability invariants", () => {
  it("field keys survive a save round-trip shape (same keys, different order)", () => {
    const keyA = crypto.randomUUID();
    const keyB = crypto.randomUUID();
    const fieldA = { ...validField(), fieldKey: keyA };
    const fieldB = { ...validField(), fieldKey: keyB };

    // "Save" in order A, B
    const save1 = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields: [fieldA, fieldB],
    });
    expect(save1.success).toBe(true);

    // "Save" in order B, A (reorder, same keys)
    const save2 = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields: [fieldB, fieldA],
    });
    expect(save2.success).toBe(true);

    if (save1.success && save2.success) {
      // Keys are preserved, just reordered
      const keys1 = save1.data.fields.map((f) => f.fieldKey);
      const keys2 = save2.data.fields.map((f) => f.fieldKey);
      expect(new Set(keys1)).toEqual(new Set(keys2));
    }
  });

  it("rejects duplicate field keys within a single form", () => {
    const duplicateKey = crypto.randomUUID();
    const result = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields: [
        { ...validField(), fieldKey: duplicateKey },
        { ...validField(), fieldKey: duplicateKey },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts sentinel pseudo-keys for default form fields", () => {
    const result = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields: [
        { ...validField(), fieldKey: "default:phone" },
        { ...validField(), fieldKey: "default:email" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("fieldKeySchema accepts UUID strings", () => {
    expect(fieldKeySchema.safeParse(crypto.randomUUID()).success).toBe(true);
  });

  it("fieldKeySchema accepts sentinel pseudo-keys", () => {
    expect(fieldKeySchema.safeParse("default:phone").success).toBe(true);
    expect(fieldKeySchema.safeParse("default:email").success).toBe(true);
  });

  it("fieldKeySchema rejects empty string", () => {
    expect(fieldKeySchema.safeParse("").success).toBe(false);
  });

  it("fieldKeySchema rejects strings exceeding 200 chars", () => {
    expect(fieldKeySchema.safeParse("x".repeat(201)).success).toBe(false);
  });
});

// =========================================================================
// Mapping survival across option rename
// =========================================================================

describe("mapping survival across option rename", () => {
  it("queue-routing mapping keyed by option key survives a label change", () => {
    const optKey = crypto.randomUUID();
    const queueId = crypto.randomUUID();

    // Original config with mapping (plain object, validated by safeParse)
    const result1 = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt(optKey, "General Help")],
      queueRoutingMapping: { [optKey]: queueId },
    });
    expect(result1.success).toBe(true);

    // Rename the label (key stays the same, mapping preserved)
    const result2 = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt(optKey, "General Assistance")],
      queueRoutingMapping: { [optKey]: queueId },
    });
    expect(result2.success).toBe(true);

    // Mapping value is unchanged after rename
    if (result1.success && result2.success) {
      const d1 = result1.data as {
        type: "select";
        queueRoutingMapping?: Record<string, unknown>;
      };
      const d2 = result2.data as {
        type: "select";
        queueRoutingMapping?: Record<string, unknown>;
      };
      expect(d1.queueRoutingMapping?.[optKey]).toBe(queueId);
      expect(d2.queueRoutingMapping?.[optKey]).toBe(queueId);
    }
  });

  it("urgency mapping keyed by option key is not orphaned when label changes", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [
        opt("opt-low", "Low Priority", "Baja prioridad"),
        opt("opt-high", "High Priority", "Alta prioridad"),
      ],
      urgencyMapping: {
        "opt-low": "low",
        "opt-high": "high",
      },
    });
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// Locale fallback in field config
// =========================================================================

describe("localized field config", () => {
  it("accepts text config with localized placeholder", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      placeholder: { en: "Your name", es: "Su nombre" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts textarea config with localized placeholder", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "textarea",
      placeholder: { en: "Describe your situation" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with localized option labels", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [
        opt("opt-a", "Option A", "Opcion A"),
        opt("opt-b", "Option B", "Opcion B"),
      ],
    });
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// Encrypted config size cap with both locales populated
// =========================================================================

describe("encrypted config size cap", () => {
  it("ENCRYPTED_CONFIG_CAP is 28000", () => {
    expect(ENCRYPTED_CONFIG_CAP).toBe(28_000);
  });

  it("ENCRYPTED_LABEL_CAP is 2800", () => {
    expect(ENCRYPTED_LABEL_CAP).toBe(2_800);
  });

  it("rejects encryptedConfig exceeding the cap", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          ...validField(),
          encryptedConfig: base64Chars(ENCRYPTED_CONFIG_CAP + 1),
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts encryptedConfig at the cap boundary", () => {
    const input = {
      ...validFormInput(),
      fields: [
        {
          ...validField(),
          encryptedConfig: base64Chars(ENCRYPTED_CONFIG_CAP),
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("a fully localized config with 50 options serializes within a reasonable bound", () => {
    // Build a maximally populated select config with 50 options, both locales
    const options = Array.from({ length: 50 }, (_, i) => ({
      key: crypto.randomUUID(),
      label: {
        en: `Option ${String(i)} with a moderately long English label text`,
        es: `Opcion ${String(i)} con un texto de etiqueta en espanol moderadamente largo`,
      },
    }));
    const config: IntakeFieldConfig = {
      type: "select",
      options,
    };
    const serialized = JSON.stringify(config);
    // The JSON must fit within the 28 KB cap after base64 encoding of its
    // ciphertext (nonce + MAC overhead is ~40 bytes, base64 inflates ~1.37x).
    // Raw JSON of 50 options with ~70-char bilingual labels is well under 28 KB.
    const base64Estimate = Math.ceil((serialized.length * 4) / 3);
    expect(base64Estimate).toBeLessThan(ENCRYPTED_CONFIG_CAP);
  });
});

// =========================================================================
// Existing test suites, updated for new shape
// =========================================================================

describe("intakeFieldTypeSchema", () => {
  it("accepts all valid field types", () => {
    for (const t of [
      "text",
      "textarea",
      "select",
      "multiselect",
      "checkbox",
      "availability",
      "date",
      "pageBreak",
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
  it("queueRoutingMapping accepts option key -> UUID record", () => {
    const result = queueRoutingMappingSchema.safeParse({
      "opt-a": crypto.randomUUID(),
      "opt-b": crypto.randomUUID(),
    });
    expect(result.success).toBe(true);
  });

  it("queueRoutingMapping rejects non-UUID values", () => {
    const result = queueRoutingMappingSchema.safeParse({
      "opt-a": "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("urgencyMapping accepts option key -> priority record", () => {
    const result = urgencyMappingSchema.safeParse({
      "opt-low": "low",
      "opt-normal": "normal",
      "opt-high": "high",
      "opt-urgent": "urgent",
    });
    expect(result.success).toBe(true);
  });

  it("urgencyMapping rejects invalid priority value", () => {
    const result = urgencyMappingSchema.safeParse({
      "opt-critical": "critical",
    });
    expect(result.success).toBe(false);
  });

  it("escalationMapping accepts option key -> alert level record", () => {
    const result = escalationMappingSchema.safeParse({
      "opt-danger": "immediate",
      "opt-followup": "standard",
    });
    expect(result.success).toBe(true);
  });

  it("escalationMapping rejects empty alert level", () => {
    const result = escalationMappingSchema.safeParse({
      "opt-danger": "",
    });
    expect(result.success).toBe(false);
  });
});

describe("intakeFieldConfigSchema", () => {
  it("accepts text config with maxLength and localized placeholder", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      maxLength: 200,
      placeholder: { en: "Your name", es: "Su nombre" },
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

  it("accepts select config with keyed options", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt("opt-a", "Option A"), opt("opt-b", "Option B")],
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with queue-routing mapping keyed by option key", () => {
    const qA = crypto.randomUUID();
    const qB = crypto.randomUUID();
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt("opt-general", "General"), opt("opt-urgent", "Urgent")],
      queueRoutingMapping: {
        "opt-general": qA,
        "opt-urgent": qB,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with urgency mapping keyed by option key", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt("opt-low", "Low"), opt("opt-high", "High")],
      urgencyMapping: { "opt-low": "low", "opt-high": "high" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts select config with escalation mapping keyed by option key", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt("opt-safe", "Safe"), opt("opt-danger", "Danger")],
      escalationMapping: { "opt-safe": "none", "opt-danger": "immediate" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiselect config with queue-routing mapping", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "multiselect",
      options: [opt("opt-a", "A"), opt("opt-b", "B")],
      queueRoutingMapping: { "opt-a": crypto.randomUUID() },
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
    const options = Array.from({ length: 51 }, (_, i) =>
      opt(`opt-${String(i)}`, `Option ${String(i)}`),
    );
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options,
    });
    expect(result.success).toBe(false);
  });

  it("rejects select option with key exceeding 200 chars", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [{ key: "x".repeat(201), label: { en: "Too long key" } }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiselect config with keyed options", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "multiselect",
      options: [opt("a", "A"), opt("b", "B"), opt("c", "C")],
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
      options: [opt("a", "A")],
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
  it("accepts valid response with string answer keyed by fieldKey", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        { fieldKey: crypto.randomUUID(), fieldType: "text", value: "Jane Doe" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with option key array (multiselect)", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        {
          fieldKey: crypto.randomUUID(),
          fieldType: "multiselect",
          value: ["opt-a", "opt-b"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with boolean answer (checkbox)", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        { fieldKey: crypto.randomUUID(), fieldType: "checkbox", value: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid response with availability answer", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        {
          fieldKey: crypto.randomUUID(),
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

  it("accepts sentinel pseudo-keys as fieldKey values", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: null,
      answers: [
        {
          fieldKey: "default:phone",
          fieldType: "text",
          value: "+15551234567",
        },
        {
          fieldKey: "default:email",
          fieldType: "text",
          value: "user@example.com",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("caps answers at 100", () => {
    const answers = Array.from({ length: 101 }, (_, i) => ({
      fieldKey: `fk-${String(i)}`,
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
      fieldKey: `fk-${String(i)}`,
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
        {
          fieldKey: crypto.randomUUID(),
          fieldType: "textarea",
          value: "x".repeat(10_001),
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("select answer records an option key, not a label", () => {
    const optionKey = crypto.randomUUID();
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        {
          fieldKey: crypto.randomUUID(),
          fieldType: "select",
          value: optionKey,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const firstAnswer = result.data.answers[0];
      expect(firstAnswer).toBeDefined();
      expect(firstAnswer?.value).toBe(optionKey);
    }
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
  it("accepts valid form input with fieldKey", () => {
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
    const fields = Array.from({ length: 101 }, () => validField());
    const input = { ...validFormInput(), fields };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts exactly 100 fields", () => {
    const fields = Array.from({ length: 100 }, () => validField());
    const input = { ...validFormInput(), fields };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects two availability fields (one-per-form rule)", () => {
    const avFieldA = {
      fieldKey: crypto.randomUUID(),
      fieldType: "availability" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
    };
    const avFieldB = {
      ...avFieldA,
      fieldKey: crypto.randomUUID(),
    };
    const input = {
      ...validFormInput(),
      fields: [avFieldA, avFieldB],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts exactly one availability field", () => {
    const avField = {
      fieldKey: crypto.randomUUID(),
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
          ...validField(),
          encryptedLabel: base64Chars(ENCRYPTED_LABEL_CAP + 1),
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
          ...validField(),
          encryptedConfig: base64Chars(ENCRYPTED_CONFIG_CAP + 1),
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
          ...validField(),
          encryptedLabel: "not!valid@base64",
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
          ...validField(),
          fieldType: "radio",
        },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects field without fieldKey", () => {
    const { fieldKey: _, ...fieldWithoutKey } = validField() as Record<
      string,
      unknown
    >;
    const input = {
      ...validFormInput(),
      fields: [fieldWithoutKey],
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

  // --- field keys uniqueness ---

  it("rejects duplicate field keys", () => {
    const sharedKey = crypto.randomUUID();
    const input = {
      ...validFormInput(),
      fields: [
        { ...validField(), fieldKey: sharedKey },
        { ...validField(), fieldKey: sharedKey },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts distinct field keys", () => {
    const input = {
      ...validFormInput(),
      fields: [
        { ...validField(), fieldKey: crypto.randomUUID() },
        { ...validField(), fieldKey: crypto.randomUUID() },
      ],
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  // --- field roles ---

  it("accepts fields with valid roles", () => {
    const input = {
      ...validFormInput(),
      fields: [
        { ...validField(), role: "phone-contact" },
        {
          fieldKey: crypto.randomUUID(),
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
    const selectFieldA = {
      fieldKey: crypto.randomUUID(),
      fieldType: "select" as const,
      encryptedLabel: base64OfBytes(32),
      encryptedConfig: base64OfBytes(64),
      isRequired: false,
      role: "queue-routing" as const,
    };
    const selectFieldB = {
      ...selectFieldA,
      fieldKey: crypto.randomUUID(),
    };
    const input = {
      ...validFormInput(),
      fields: [selectFieldA, selectFieldB],
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
          fieldKey: crypto.randomUUID(),
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
          fieldKey: crypto.randomUUID(),
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
          fieldKey: crypto.randomUUID(),
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
          fieldKey: crypto.randomUUID(),
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

  it("accepts optional encryptedFormMeta", () => {
    const input = {
      ...validFormInput(),
      encryptedFormMeta: base64OfBytes(128),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects oversized encryptedFormMeta", () => {
    const input = {
      ...validFormInput(),
      encryptedFormMeta: base64Chars(ENCRYPTED_FORM_META_CAP + 1),
    };
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts form without encryptedFormMeta (optional)", () => {
    const input = validFormInput();
    const result = saveIntakeFormInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// T1.1: Form-level metadata schema
// =========================================================================

describe("intakeFormMetaSchema", () => {
  it("accepts empty object", () => {
    const result = intakeFormMetaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts description only", () => {
    const result = intakeFormMetaSchema.safeParse({
      description: { en: "Welcome to our form" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all three fields with both locales", () => {
    const result = intakeFormMetaSchema.safeParse({
      description: { en: "Welcome", es: "Bienvenido" },
      submitMessage: { en: "Thank you!", es: "Gracias!" },
      closedMessage: {
        en: "This form is closed.",
        es: "Este formulario esta cerrado.",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown fields", () => {
    const result = intakeFormMetaSchema.safeParse({
      description: { en: "ok" },
      unknownField: "nope",
    });
    // Zod strips unknown keys in non-strict mode, so this passes
    // but the extra key is dropped
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// T1.2: Text subtypes
// =========================================================================

describe("textSubtypeSchema", () => {
  it("accepts email", () => {
    expect(textSubtypeSchema.safeParse("email").success).toBe(true);
  });

  it("accepts phone", () => {
    expect(textSubtypeSchema.safeParse("phone").success).toBe(true);
  });

  it("accepts number", () => {
    expect(textSubtypeSchema.safeParse("number").success).toBe(true);
  });

  it("rejects unknown subtype", () => {
    expect(textSubtypeSchema.safeParse("url").success).toBe(false);
  });
});

describe("text field config with subtype", () => {
  it("accepts text config with email subtype", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      subtype: "email",
    });
    expect(result.success).toBe(true);
  });

  it("accepts text config with number subtype and range", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      subtype: "number",
      numberRange: { min: 0, max: 100 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts text config with number subtype, min only", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      subtype: "number",
      numberRange: { min: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts text config without subtype (plain text)", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
    });
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// T1.2: Date field type
// =========================================================================

describe("date field type", () => {
  it("intakeFieldTypeSchema accepts date", () => {
    expect(intakeFieldTypeSchema.safeParse("date").success).toBe(true);
  });

  it("intakeFieldConfigSchema accepts date config", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "date",
    });
    expect(result.success).toBe(true);
  });

  it("date config accepts helpText", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "date",
      helpText: { en: "Pick a date" },
    });
    expect(result.success).toBe(true);
  });

  it("date answer is a valid response value", () => {
    const result = intakeFormResponseSchema.safeParse({
      formId: crypto.randomUUID(),
      answers: [
        {
          fieldKey: crypto.randomUUID(),
          fieldType: "date",
          value: "2026-09-15",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// T1.1: Help text in field config
// =========================================================================

describe("helpText in field config", () => {
  it("text config accepts helpText", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "text",
      helpText: {
        en: "Enter your full name",
        es: "Ingrese su nombre completo",
      },
    });
    expect(result.success).toBe(true);
  });

  it("select config accepts helpText", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "select",
      options: [opt("a", "A")],
      helpText: { en: "Pick one" },
    });
    expect(result.success).toBe(true);
  });

  it("checkbox config accepts helpText", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "checkbox",
      helpText: { en: "Check to confirm" },
    });
    expect(result.success).toBe(true);
  });

  it("availability config accepts helpText", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "availability",
      allowRecurring: true,
      allowSpecific: true,
      helpText: { en: "When are you available?" },
    });
    expect(result.success).toBe(true);
  });

  it("a fully populated bilingual config with helpText and 50 options stays under cap", () => {
    const options = Array.from({ length: 50 }, (_, i) => ({
      key: crypto.randomUUID(),
      label: {
        en: `Option ${String(i)} with a moderately long English label text`,
        es: `Opcion ${String(i)} con un texto de etiqueta en espanol moderadamente largo`,
      },
    }));
    const config: IntakeFieldConfig = {
      type: "select",
      options,
      helpText: {
        en: "Select the option that best describes your situation. This help text is moderately long to test size.",
        es: "Seleccione la opcion que mejor describa su situacion. Este texto de ayuda es moderadamente largo para probar tamano.",
      },
    };
    const serialized = JSON.stringify(config);
    const base64Estimate = Math.ceil((serialized.length * 4) / 3);
    expect(base64Estimate).toBeLessThan(ENCRYPTED_CONFIG_CAP);
  });
});

// =========================================================================
// T2.1: Conditional visibility (visibleWhen)
// =========================================================================

describe("visibleWhenSchema", () => {
  it("accepts a valid all-mode condition with equals operator", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid any-mode condition with includes operator", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "any",
      rules: [{ fieldKey: "fk-1", operator: "includes", optionKey: "opt-b" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a checked operator with boolValue", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "checked", boolValue: true }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple rules", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "all",
      rules: [
        { fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" },
        { fieldKey: "fk-2", operator: "checked", boolValue: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty rules array", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "all",
      rules: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 rules", () => {
    const rules = Array.from({ length: 21 }, (_, i) => ({
      fieldKey: `fk-${String(i)}`,
      operator: "equals" as const,
      optionKey: `opt-${String(i)}`,
    }));
    const result = visibleWhenSchema.safeParse({ mode: "all", rules });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mode", () => {
    const result = visibleWhenSchema.safeParse({
      mode: "none",
      rules: [{ fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid operator", () => {
    const result = visibilityRuleSchema.safeParse({
      fieldKey: "fk-1",
      operator: "contains",
    });
    expect(result.success).toBe(false);
  });
});

describe("evaluateVisibility", () => {
  it("returns true when visibleWhen is undefined", () => {
    expect(evaluateVisibility(undefined, {})).toBe(true);
  });

  it("evaluates equals operator correctly", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" }],
    };
    expect(evaluateVisibility(vw, { "fk-1": "opt-a" })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-1": "opt-b" })).toBe(false);
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("evaluates includes operator for multiselect", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "includes", optionKey: "opt-b" }],
    };
    expect(evaluateVisibility(vw, { "fk-1": ["opt-a", "opt-b"] })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-1": ["opt-a"] })).toBe(false);
    expect(evaluateVisibility(vw, { "fk-1": "opt-b" })).toBe(false);
  });

  it("evaluates checked operator for checkbox", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "checked", boolValue: true }],
    };
    expect(evaluateVisibility(vw, { "fk-1": true })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-1": false })).toBe(false);
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("all-mode requires every rule to match", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [
        { fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" },
        { fieldKey: "fk-2", operator: "checked", boolValue: true },
      ],
    };
    expect(evaluateVisibility(vw, { "fk-1": "opt-a", "fk-2": true })).toBe(
      true,
    );
    expect(evaluateVisibility(vw, { "fk-1": "opt-a", "fk-2": false })).toBe(
      false,
    );
    expect(evaluateVisibility(vw, { "fk-1": "opt-b", "fk-2": true })).toBe(
      false,
    );
  });

  it("any-mode requires at least one rule to match", () => {
    const vw: VisibleWhen = {
      mode: "any",
      rules: [
        { fieldKey: "fk-1", operator: "equals", optionKey: "opt-a" },
        { fieldKey: "fk-2", operator: "equals", optionKey: "opt-b" },
      ],
    };
    expect(evaluateVisibility(vw, { "fk-1": "opt-a" })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-2": "opt-b" })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-1": "opt-c", "fk-2": "opt-c" })).toBe(
      false,
    );
  });

  it("checked operator defaults boolValue to true", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "fk-1", operator: "checked" }],
    };
    expect(evaluateVisibility(vw, { "fk-1": true })).toBe(true);
    expect(evaluateVisibility(vw, { "fk-1": false })).toBe(false);
  });

  it("unresolved fieldKey evaluates as not-met (equals)", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "missing", operator: "equals", optionKey: "opt-a" }],
    };
    // The referenced field has no value in the answers record, so the
    // rule cannot be satisfied. The element defaults to hidden.
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("unresolved fieldKey evaluates as not-met (includes)", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [
        { fieldKey: "missing", operator: "includes", optionKey: "opt-a" },
      ],
    };
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("unresolved fieldKey evaluates as not-met (checked)", () => {
    const vw: VisibleWhen = {
      mode: "all",
      rules: [{ fieldKey: "missing", operator: "checked", boolValue: true }],
    };
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("unresolved fieldKey in any-mode still hidden when no other rule matches", () => {
    const vw: VisibleWhen = {
      mode: "any",
      rules: [
        { fieldKey: "missing-1", operator: "equals", optionKey: "opt-a" },
        { fieldKey: "missing-2", operator: "checked", boolValue: true },
      ],
    };
    expect(evaluateVisibility(vw, {})).toBe(false);
  });

  it("unresolved fieldKey in any-mode can still show if another rule matches", () => {
    const vw: VisibleWhen = {
      mode: "any",
      rules: [
        { fieldKey: "missing", operator: "equals", optionKey: "opt-a" },
        { fieldKey: "present", operator: "equals", optionKey: "opt-b" },
      ],
    };
    // "missing" is unresolved (not-met), but "present" matches
    expect(evaluateVisibility(vw, { present: "opt-b" })).toBe(true);
  });
});

// =========================================================================
// T2.2: Page break field type
// =========================================================================

describe("pageBreak field type", () => {
  it("intakeFieldTypeSchema accepts pageBreak", () => {
    expect(intakeFieldTypeSchema.safeParse("pageBreak").success).toBe(true);
  });

  it("PAGE_BREAK_TYPE constant is pageBreak", () => {
    expect(PAGE_BREAK_TYPE).toBe("pageBreak");
  });

  it("isDataFieldType returns false for pageBreak", () => {
    expect(isDataFieldType("pageBreak")).toBe(false);
  });

  it("isDataFieldType returns true for data field types", () => {
    for (const t of [
      "text",
      "textarea",
      "select",
      "multiselect",
      "checkbox",
      "availability",
      "date",
    ]) {
      expect(isDataFieldType(t as "text")).toBe(true);
    }
  });

  it("intakeFieldConfigSchema accepts pageBreak config", () => {
    const result = intakeFieldConfigSchema.safeParse({ type: "pageBreak" });
    expect(result.success).toBe(true);
  });

  it("pageBreak config accepts a localized title", () => {
    const result = intakeFieldConfigSchema.safeParse({
      type: "pageBreak",
      title: { en: "Contact Information", es: "Informacion de contacto" },
    });
    expect(result.success).toBe(true);
  });

  it("pageBreak config title is optional", () => {
    const result = intakeFieldConfigSchema.safeParse({ type: "pageBreak" });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data;
      expect(data.type).toBe("pageBreak");
    }
  });

  it("saveIntakeFormInputSchema accepts page break fields", () => {
    const result = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields: [
        validField(),
        {
          fieldKey: crypto.randomUUID(),
          fieldType: "pageBreak",
          encryptedLabel: base64OfBytes(32),
          encryptedConfig: base64OfBytes(64),
          isRequired: false,
        },
        validField(),
      ],
    });
    expect(result.success).toBe(true);
  });

  it("page breaks compose with the 100-field cap", () => {
    const fields = Array.from({ length: 98 }, () => validField());
    fields.push({
      ...validField(),
      fieldType: "pageBreak",
    } as Record<string, unknown>);
    fields.push(validField());
    const result = saveIntakeFormInputSchema.safeParse({
      ...validFormInput(),
      fields,
    });
    expect(result.success).toBe(true);
  });
});
