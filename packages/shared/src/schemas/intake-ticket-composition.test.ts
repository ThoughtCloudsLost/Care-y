import { describe, it, expect } from "vitest";
import {
  formatAvailability,
  isAvailabilityData,
  resolveOptionKey,
  formatValue,
  toResponseValue,
  composeIntakeTicketContent,
  extractMessageText,
  buildIntakeFormResponse,
  type IntakeAnswer,
} from "./intake-ticket-composition.js";
import type { AvailabilityData, IntakeFieldConfig } from "./intake-forms.js";

// ---------------------------------------------------------------------------
// formatAvailability
// ---------------------------------------------------------------------------

describe("formatAvailability", () => {
  it("formats recurring entries with timezone", () => {
    const data: AvailabilityData = {
      timezone: "America/Chicago",
      recurring: [
        { day: "monday", start: "09:00", end: "12:00" },
        { day: "wednesday", start: "14:00", end: "17:00" },
      ],
      specific: [],
    };
    expect(formatAvailability(data)).toBe(
      "monday 09:00-12:00, wednesday 14:00-17:00 (America/Chicago)",
    );
  });

  it("formats specific entries with timezone", () => {
    const data: AvailabilityData = {
      timezone: "Europe/Berlin",
      recurring: [],
      specific: [{ date: "2026-03-15", start: "10:00", end: "11:00" }],
    };
    expect(formatAvailability(data)).toBe(
      "2026-03-15 10:00-11:00 (Europe/Berlin)",
    );
  });

  it("returns timezone only when both lists are empty", () => {
    const data: AvailabilityData = {
      timezone: "UTC",
      recurring: [],
      specific: [],
    };
    expect(formatAvailability(data)).toBe("(UTC)");
  });

  it("combines recurring and specific entries", () => {
    const data: AvailabilityData = {
      timezone: "Asia/Tokyo",
      recurring: [{ day: "friday", start: "08:00", end: "10:00" }],
      specific: [{ date: "2026-06-01", start: "13:00", end: "15:00" }],
    };
    expect(formatAvailability(data)).toBe(
      "friday 08:00-10:00, 2026-06-01 13:00-15:00 (Asia/Tokyo)",
    );
  });
});

// ---------------------------------------------------------------------------
// isAvailabilityData
// ---------------------------------------------------------------------------

describe("isAvailabilityData", () => {
  it("returns true for AvailabilityData objects", () => {
    const data: AvailabilityData = {
      timezone: "UTC",
      recurring: [],
      specific: [],
    };
    expect(isAvailabilityData(data)).toBe(true);
  });

  it("returns false for strings", () => {
    expect(isAvailabilityData("hello")).toBe(false);
  });

  it("returns false for arrays", () => {
    expect(isAvailabilityData(["a", "b"])).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(isAvailabilityData(true)).toBe(false);
    expect(isAvailabilityData(false)).toBe(false);
  });

  it("returns false for objects without timezone", () => {
    const obj = { recurring: [], specific: [] };
    // Force the union type for the test
    expect(isAvailabilityData(obj as unknown as AvailabilityData)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveOptionKey
// ---------------------------------------------------------------------------

describe("resolveOptionKey", () => {
  const options = [
    { key: "opt-1", label: { en: "Housing" } },
    { key: "opt-2", label: { en: "Legal", es: "Legal (es)" } },
  ];

  it("resolves a matching key to the base-locale label", () => {
    expect(resolveOptionKey("opt-1", options)).toBe("Housing");
  });

  it("returns the key unchanged when no option matches", () => {
    expect(resolveOptionKey("opt-unknown", options)).toBe("opt-unknown");
  });

  it("falls back to the key when the label has no base-locale value", () => {
    const sparse = [{ key: "k", label: { es: "Solo espanol" } }];
    // BASE_LOCALE is "en", so no en value exists
    expect(resolveOptionKey("k", sparse)).toBe("k");
  });
});

// ---------------------------------------------------------------------------
// formatValue
// ---------------------------------------------------------------------------

describe("formatValue", () => {
  it("formats booleans as Yes/No", () => {
    expect(formatValue(true)).toBe("Yes");
    expect(formatValue(false)).toBe("No");
  });

  it("passes plain strings through", () => {
    expect(formatValue("hello")).toBe("hello");
  });

  it("resolves select option keys to labels", () => {
    const config: IntakeFieldConfig = {
      type: "select",
      options: [
        { key: "opt-a", label: { en: "Option A" } },
        { key: "opt-b", label: { en: "Option B" } },
      ],
    };
    expect(formatValue("opt-a", config)).toBe("Option A");
  });

  it("resolves multiselect option keys to joined labels", () => {
    const config: IntakeFieldConfig = {
      type: "multiselect",
      options: [
        { key: "k1", label: { en: "Alpha" } },
        { key: "k2", label: { en: "Beta" } },
        { key: "k3", label: { en: "Gamma" } },
      ],
    };
    expect(formatValue(["k1", "k3"], config)).toBe("Alpha, Gamma");
  });

  it("joins arrays without config", () => {
    expect(formatValue(["a", "b", "c"])).toBe("a, b, c");
  });

  it("formats availability data", () => {
    const data: AvailabilityData = {
      timezone: "America/New_York",
      recurring: [{ day: "tuesday", start: "10:00", end: "14:00" }],
      specific: [],
    };
    expect(formatValue(data)).toContain("tuesday 10:00-14:00");
    expect(formatValue(data)).toContain("America/New_York");
  });

  it("passes date strings through unchanged", () => {
    const config: IntakeFieldConfig = { type: "date" };
    expect(formatValue("2026-01-15", config)).toBe("2026-01-15");
  });
});

// ---------------------------------------------------------------------------
// toResponseValue
// ---------------------------------------------------------------------------

describe("toResponseValue", () => {
  it("passes booleans through", () => {
    expect(toResponseValue(true)).toBe(true);
    expect(toResponseValue(false)).toBe(false);
  });

  it("passes strings through", () => {
    expect(toResponseValue("test")).toBe("test");
  });

  it("passes AvailabilityData through", () => {
    const data: AvailabilityData = {
      timezone: "UTC",
      recurring: [],
      specific: [],
    };
    expect(toResponseValue(data)).toBe(data);
  });

  it("copies arrays (not reference-equal)", () => {
    const arr = ["a", "b"];
    const result = toResponseValue(arr);
    expect(result).toEqual(["a", "b"]);
    expect(result).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// composeIntakeTicketContent
// ---------------------------------------------------------------------------

describe("composeIntakeTicketContent", () => {
  it("includes the name in the title for default:name answers", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "default:name",
        fieldType: "text",
        label: "Your name",
        value: "Alice",
      },
      {
        fieldKey: "default:message",
        fieldType: "textarea",
        label: "Your message",
        value: "I need help.",
      },
    ];
    const { title } = composeIntakeTicketContent(answers);
    expect(title).toBe("Web intake - Alice");
  });

  it("produces bare 'Web intake' when name is empty", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "default:name",
        fieldType: "text",
        label: "Your name",
        value: "",
      },
    ];
    const { title } = composeIntakeTicketContent(answers);
    expect(title).toBe("Web intake");
  });

  it("produces bare 'Web intake' when no default:name field exists", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "custom-1",
        fieldType: "text",
        label: "Situation",
        value: "Need assistance.",
      },
    ];
    const { title } = composeIntakeTicketContent(answers);
    expect(title).toBe("Web intake");
  });

  it("composes description as label: value lines joined by newlines", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "f1",
        fieldType: "text",
        label: "Name",
        value: "Bob",
      },
      {
        fieldKey: "f2",
        fieldType: "text",
        label: "Phone",
        value: "+1-555-0199",
      },
    ];
    const { description } = composeIntakeTicketContent(answers);
    expect(description).toBe("Name: Bob\nPhone: +1-555-0199");
  });

  it("omits lines with empty formatted values", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "f1",
        fieldType: "text",
        label: "Name",
        value: "",
      },
      {
        fieldKey: "f2",
        fieldType: "text",
        label: "Phone",
        value: "+1-555-0199",
      },
    ];
    const { description } = composeIntakeTicketContent(answers);
    // Empty string is not omitted by formatValue (it returns ""),
    // but composeIntakeTicketContent skips empty formatted values
    expect(description).toBe("Phone: +1-555-0199");
  });

  it("resolves select option keys in description", () => {
    const config: IntakeFieldConfig = {
      type: "select",
      options: [
        { key: "housing", label: { en: "Housing Assistance" } },
        { key: "legal", label: { en: "Legal Aid" } },
      ],
    };
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "f1",
        fieldType: "select",
        label: "Service",
        value: "housing",
        config,
      },
    ];
    const { description } = composeIntakeTicketContent(answers);
    expect(description).toBe("Service: Housing Assistance");
  });

  it("resolves boolean values as Yes/No in description", () => {
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "f1",
        fieldType: "checkbox",
        label: "Consent",
        value: true,
      },
      {
        fieldKey: "f2",
        fieldType: "checkbox",
        label: "Follow-up",
        value: false,
      },
    ];
    const { description } = composeIntakeTicketContent(answers);
    expect(description).toContain("Consent: Yes");
    expect(description).toContain("Follow-up: No");
  });
});

// ---------------------------------------------------------------------------
// extractMessageText
// ---------------------------------------------------------------------------

describe("extractMessageText", () => {
  it("returns the value of the first textarea answer", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
      {
        fieldKey: "f2",
        fieldType: "textarea",
        label: "Message",
        value: "Help me.",
      },
    ];
    expect(extractMessageText(answers)).toBe("Help me.");
  });

  it("returns null when no textarea answer exists", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
    ];
    expect(extractMessageText(answers)).toBeNull();
  });

  it("returns empty string when textarea value is not a string", () => {
    // Edge case: textarea with a non-string value (e.g., from a bug)
    const answers: IntakeAnswer[] = [
      {
        fieldKey: "f1",
        fieldType: "textarea",
        label: "Notes",
        value: true,
      },
    ];
    expect(extractMessageText(answers)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// buildIntakeFormResponse
// ---------------------------------------------------------------------------

describe("buildIntakeFormResponse", () => {
  it("builds a response payload with the correct formId", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
    ];
    const result = buildIntakeFormResponse("form-abc", answers);
    expect(result.formId).toBe("form-abc");
  });

  it("passes null formId through", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
    ];
    const result = buildIntakeFormResponse(null, answers);
    expect(result.formId).toBeNull();
  });

  it("maps answers to fieldKey, fieldType, and normalized value", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
      {
        fieldKey: "f2",
        fieldType: "multiselect",
        label: "Services",
        value: ["a", "b"],
      },
      {
        fieldKey: "f3",
        fieldType: "checkbox",
        label: "Consent",
        value: true,
      },
    ];
    const result = buildIntakeFormResponse(null, answers);
    expect(result.answers).toEqual([
      { fieldKey: "f1", fieldType: "text", value: "Alice" },
      { fieldKey: "f2", fieldType: "multiselect", value: ["a", "b"] },
      { fieldKey: "f3", fieldType: "checkbox", value: true },
    ]);
  });

  it("does not include labels in the response payload", () => {
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "text", label: "Name", value: "Alice" },
    ];
    const result = buildIntakeFormResponse(null, answers);
    // The answer objects should NOT contain a "label" property
    for (const a of result.answers) {
      expect(a).not.toHaveProperty("label");
    }
  });

  it("copies array values (not reference-equal)", () => {
    const arr = ["x", "y"];
    const answers: IntakeAnswer[] = [
      { fieldKey: "f1", fieldType: "multiselect", label: "Items", value: arr },
    ];
    const result = buildIntakeFormResponse(null, answers);
    expect(result.answers[0]?.value).toEqual(["x", "y"]);
    expect(result.answers[0]?.value).not.toBe(arr);
  });
});
