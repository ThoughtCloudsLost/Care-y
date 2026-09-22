/**
 * Unit tests for intake-form-logic.ts: pure validation, page slicing,
 * visibility evaluation, and format checks.
 */

import { describe, it, expect } from "vitest";
import {
  isFieldVisible,
  splitIntoPages,
  visiblePageIndices,
  isValidEmail,
  isValidPhone,
  validateFields,
  collectPageIssues,
  collectAllIssues,
  type PlaintextField,
  type ValidationMessages,
  type FieldValue,
} from "./intake-form-logic.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MESSAGES: ValidationMessages = {
  fieldRequired: "required",
  messageRequired: "message required",
  emailFormat: "bad email",
  phoneFormat: "bad phone",
  numberFormat: "bad number",
  numberMin: (min) => `min ${min}`,
  numberMax: (max) => `max ${max}`,
  dateFormat: "bad date",
};

function textField(
  key: string,
  opts?: Partial<PlaintextField>,
): PlaintextField {
  return {
    fieldKey: key,
    fieldType: "text",
    role: null,
    label: { en: key },
    config: { type: "text", maxLength: 200 },
    isRequired: false,
    ...opts,
  };
}

function pageBreakField(title?: string): PlaintextField {
  return {
    fieldKey: `pb-${Math.random().toString(36).slice(2)}`,
    fieldType: "pageBreak",
    role: null,
    label: title != null ? { en: title } : { en: "" },
    config: { type: "text", maxLength: 0 },
    isRequired: false,
  };
}

// ---------------------------------------------------------------------------
// isFieldVisible
// ---------------------------------------------------------------------------

describe("isFieldVisible", () => {
  it("returns true for a field with no visibleWhen", () => {
    const field = textField("f1");
    expect(isFieldVisible(field, {})).toBe(true);
  });

  it("returns false when visibleWhen condition is not met", () => {
    const field = textField("f2", {
      visibleWhen: {
        version: 2,
        groups: [
          [{ fieldKey: "toggle", operator: "equals", optionKey: "yes" }],
        ],
      },
    });
    expect(isFieldVisible(field, { toggle: "no" })).toBe(false);
  });

  it("returns true when visibleWhen condition is met", () => {
    const field = textField("f3", {
      visibleWhen: {
        version: 2,
        groups: [
          [{ fieldKey: "toggle", operator: "equals", optionKey: "yes" }],
        ],
      },
    });
    expect(isFieldVisible(field, { toggle: "yes" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// splitIntoPages
// ---------------------------------------------------------------------------

describe("splitIntoPages", () => {
  it("returns one page when there are no page breaks", () => {
    const fields = [textField("a"), textField("b")];
    const pages = splitIntoPages(fields);
    expect(pages.length).toBe(1);
    expect(pages[0]?.fields.length).toBe(2);
  });

  it("splits at page break boundaries", () => {
    const fields = [
      textField("a"),
      pageBreakField("Page 2"),
      textField("b"),
      textField("c"),
      pageBreakField("Page 3"),
      textField("d"),
    ];
    const pages = splitIntoPages(fields);
    expect(pages.length).toBe(3);
    expect(pages[0]?.fields.length).toBe(1);
    expect(pages[1]?.fields.length).toBe(2);
    expect(pages[1]?.title?.en).toBe("Page 2");
    expect(pages[2]?.fields.length).toBe(1);
    expect(pages[2]?.title?.en).toBe("Page 3");
  });

  it("handles empty field list", () => {
    const pages = splitIntoPages([]);
    expect(pages.length).toBe(1);
    expect(pages[0]?.fields.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// visiblePageIndices
// ---------------------------------------------------------------------------

describe("visiblePageIndices", () => {
  it("always includes the first page", () => {
    const pages = splitIntoPages([
      pageBreakField("P2"),
      textField("hidden", {
        visibleWhen: {
          version: 2,
          groups: [[{ fieldKey: "x", operator: "equals", optionKey: "never" }]],
        },
      }),
    ]);
    const indices = visiblePageIndices(pages, {});
    expect(indices).toContain(0);
  });

  it("includes pages with visible fields", () => {
    const fields = [textField("a"), pageBreakField("P2"), textField("b")];
    const pages = splitIntoPages(fields);
    const indices = visiblePageIndices(pages, {});
    expect(indices).toEqual([0, 1]);
  });

  it("excludes pages where all fields are hidden", () => {
    const fields = [
      textField("a"),
      pageBreakField("P2"),
      textField("hidden", {
        visibleWhen: {
          version: 2,
          groups: [
            [{ fieldKey: "toggle", operator: "equals", optionKey: "show" }],
          ],
        },
      }),
    ];
    const pages = splitIntoPages(fields);
    // toggle not set, so the hidden field is not visible
    const indices = visiblePageIndices(pages, {});
    expect(indices).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// isValidEmail / isValidPhone
// ---------------------------------------------------------------------------

describe("isValidEmail", () => {
  it("accepts standard addresses", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("user+tag@domain.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("noat.com")).toBe(false);
    expect(isValidEmail("@nope")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts valid phone numbers", () => {
    expect(isValidPhone("555-123-4567")).toBe(true);
    expect(isValidPhone("+1 555 123 4567")).toBe(true);
    expect(isValidPhone("5551234567")).toBe(true);
  });

  it("rejects too-short numbers", () => {
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateFields
// ---------------------------------------------------------------------------

describe("validateFields", () => {
  const baseOpts = {
    messages: MESSAGES,
    isDefaultForm: false,
    contactMethod: "none" as const,
    contactDetail: "",
    accountExpanded: false,
    accountPassword: "",
    accountConfirmPassword: "",
  };

  it("passes when all required fields are filled", () => {
    const fields = [textField("name", { isRequired: true })];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { name: "Alice" },
    });
    expect(result.valid).toBe(true);
    expect(result.errors.name).toBeUndefined();
  });

  it("fails when a required text field is empty", () => {
    const fields = [textField("name", { isRequired: true })];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { name: "" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe("required");
  });

  it("fails for required textarea with empty value", () => {
    const fields = [
      textField("msg", {
        isRequired: true,
        fieldType: "textarea",
        config: { type: "textarea", maxLength: 5000 },
      }),
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { msg: "  " },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.msg).toBe("message required");
  });

  it("fails for required select with no value", () => {
    const fields: PlaintextField[] = [
      {
        fieldKey: "sel",
        fieldType: "select",
        role: null,
        label: { en: "sel" },
        config: { type: "select", options: [{ key: "a", label: { en: "A" } }] },
        isRequired: true,
      },
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { sel: "" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.sel).toBe("required");
  });

  it("validates email subtype format", () => {
    const fields = [
      textField("email", {
        config: { type: "text", maxLength: 200, subtype: "email" },
      }),
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { email: "not-an-email" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe("bad email");
  });

  it("validates phone subtype format", () => {
    const fields = [
      textField("phone", {
        config: { type: "text", maxLength: 200, subtype: "phone" },
      }),
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { phone: "abc" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.phone).toBe("bad phone");
  });

  it("validates number subtype min/max", () => {
    const fields = [
      textField("age", {
        config: {
          type: "text",
          maxLength: 200,
          subtype: "number",
          numberRange: { min: 0, max: 120 },
        },
      }),
    ];
    const tooLow = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { age: "-1" },
    });
    expect(tooLow.valid).toBe(false);
    expect(tooLow.errors.age).toBe("min 0");

    const tooHigh = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { age: "200" },
    });
    expect(tooHigh.valid).toBe(false);
    expect(tooHigh.errors.age).toBe("max 120");
  });

  it("validates date format", () => {
    const fields: PlaintextField[] = [
      {
        fieldKey: "dob",
        fieldType: "date",
        role: null,
        label: { en: "dob" },
        config: { type: "text", maxLength: 200 },
        isRequired: false,
      },
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { dob: "Jan 1 2020" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.dob).toBe("bad date");
  });

  it("skips hidden fields", () => {
    const fields = [
      textField("hidden", {
        isRequired: true,
        visibleWhen: {
          version: 2,
          groups: [
            [{ fieldKey: "toggle", operator: "equals", optionKey: "show" }],
          ],
        },
      }),
    ];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: { toggle: "hide" },
    });
    expect(result.valid).toBe(true);
  });

  it("validates default form contact detail", () => {
    const fields: PlaintextField[] = [];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: {},
      isDefaultForm: true,
      contactMethod: "phone",
      contactDetail: "",
    });
    expect(result.valid).toBe(false);
    expect(result.contactDetailError).toBe("required");
  });

  it("fails when account passwords do not match", () => {
    const fields: PlaintextField[] = [];
    const result = validateFields({
      ...baseOpts,
      fields,
      fieldValues: {},
      accountExpanded: true,
      accountPassword: "abc123",
      accountConfirmPassword: "different",
    });
    expect(result.valid).toBe(false);
  });

  it("validates only specified subset when fieldsToValidate is provided", () => {
    const fieldA = textField("a", { isRequired: true });
    const fieldB = textField("b", { isRequired: true });
    const allFields = [fieldA, fieldB];

    // Only validate field A (which is filled), skip field B (which is empty)
    const result = validateFields({
      ...baseOpts,
      fields: allFields,
      fieldValues: { a: "filled", b: "" } as Record<string, FieldValue>,
      fieldsToValidate: [fieldA],
    });
    expect(result.valid).toBe(true);
    expect(result.errors.b).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// collectPageIssues
// ---------------------------------------------------------------------------

describe("collectPageIssues", () => {
  const label = (f: PlaintextField): string => f.label.en ?? f.fieldKey;

  it("returns empty array when all fields pass validation", () => {
    const page = {
      fields: [textField("name", { isRequired: true })],
    };
    const issues = collectPageIssues(page, { name: "Alice" }, MESSAGES, label);
    expect(issues).toEqual([]);
  });

  it("returns issues for failed required fields", () => {
    const page = {
      fields: [
        textField("name", { isRequired: true }),
        textField("email", { isRequired: true }),
      ],
    };
    const issues = collectPageIssues(page, {}, MESSAGES, label);
    expect(issues.length).toBe(2);
    expect(issues[0]?.fieldKey).toBe("name");
    expect(issues[0]?.fieldLabel).toBe("name");
    expect(issues[0]?.error).toBe("required");
    expect(issues[1]?.fieldKey).toBe("email");
  });

  it("skips hidden fields", () => {
    const page = {
      fields: [
        textField("hidden", {
          isRequired: true,
          visibleWhen: {
            version: 2 as const,
            groups: [
              [
                {
                  fieldKey: "toggle",
                  operator: "equals" as const,
                  optionKey: "show",
                },
              ],
            ],
          },
        }),
      ],
    };
    const issues = collectPageIssues(page, { toggle: "hide" }, MESSAGES, label);
    expect(issues).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// collectAllIssues
// ---------------------------------------------------------------------------

describe("collectAllIssues", () => {
  const label = (f: PlaintextField): string => f.label.en ?? f.fieldKey;

  it("collects issues across multiple pages with page numbers", () => {
    const fields = [
      textField("a", { isRequired: true }),
      pageBreakField("P2"),
      textField("b", { isRequired: true }),
    ];
    const pages = splitIntoPages(fields);
    const visible = visiblePageIndices(pages, {});

    const issues = collectAllIssues(pages, visible, {}, MESSAGES, label);
    expect(issues.length).toBe(2);
    expect(issues[0]?.fieldKey).toBe("a");
    expect(issues[0]?.pageNumber).toBe(1);
    expect(issues[1]?.fieldKey).toBe("b");
    expect(issues[1]?.pageNumber).toBe(2);
  });

  it("returns empty when all fields pass", () => {
    const fields = [
      textField("a", { isRequired: true }),
      pageBreakField("P2"),
      textField("b", { isRequired: true }),
    ];
    const pages = splitIntoPages(fields);
    const visible = visiblePageIndices(pages, {});

    const issues = collectAllIssues(
      pages,
      visible,
      { a: "val", b: "val" },
      MESSAGES,
      label,
    );
    expect(issues).toEqual([]);
  });

  it("skips invisible pages", () => {
    const fields = [
      textField("a"),
      pageBreakField("P2"),
      textField("hidden", {
        isRequired: true,
        visibleWhen: {
          version: 2 as const,
          groups: [
            [
              {
                fieldKey: "toggle",
                operator: "equals" as const,
                optionKey: "show",
              },
            ],
          ],
        },
      }),
    ];
    const pages = splitIntoPages(fields);
    const visible = visiblePageIndices(pages, {});
    // Page 2 has only hidden fields, so it's excluded from visible pages
    expect(visible).toEqual([0]);

    const issues = collectAllIssues(pages, visible, {}, MESSAGES, label);
    expect(issues).toEqual([]);
  });
});
