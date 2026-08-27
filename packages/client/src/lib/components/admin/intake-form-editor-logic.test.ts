import { describe, it, expect } from "vitest";
import type { LocalizedRichText } from "@care-y/shared";
import {
  type PlaintextField,
  computeLocaleCompleteness,
  setCapError,
  validateRichTextCap,
  validateFieldBodyCap,
  extractDocText,
  richTextBodyPreview,
  resolveRichPreview,
  isUnknownArray,
  RICH_TEXT_LOCALE_CAP,
  type ContentCapErrors,
} from "./intake-form-editor-logic.js";

// ---------------------------------------------------------------------------
// computeLocaleCompleteness
// ---------------------------------------------------------------------------

describe("computeLocaleCompleteness", () => {
  const emptyMeta: LocalizedRichText = {};

  function makeTextField(label: { en?: string; es?: string }): PlaintextField {
    return {
      fieldKey: "f1",
      label,
      helpText: {},
      isRequired: false,
      config: { type: "text" },
      fieldType: "text",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
  }

  it("returns zero counts when there are no fields and no meta", () => {
    const result = computeLocaleCompleteness(
      "en",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [],
    );
    expect(result).toEqual({ filled: 0, total: 0 });
  });

  it("counts a field label as total and filled when present", () => {
    const result = computeLocaleCompleteness(
      "en",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [makeTextField({ en: "Name" })],
    );
    expect(result.total).toBe(1);
    expect(result.filled).toBe(1);
  });

  it("counts a field label as total but unfilled when missing", () => {
    const result = computeLocaleCompleteness(
      "es",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [makeTextField({ en: "Name" })],
    );
    expect(result.total).toBe(1);
    expect(result.filled).toBe(0);
  });

  it("counts form meta when populated in any locale", () => {
    const desc: LocalizedRichText = { en: "hello" };
    const result = computeLocaleCompleteness(
      "en",
      desc,
      emptyMeta,
      emptyMeta,
      [],
    );
    expect(result.total).toBe(1);
    expect(result.filled).toBe(1);
  });

  it("counts option labels for select fields", () => {
    const field: PlaintextField = {
      fieldKey: "f2",
      label: { en: "Pick one" },
      helpText: {},
      isRequired: false,
      config: {
        type: "select",
        options: [
          { key: "a", label: { en: "Alpha" } },
          { key: "b", label: { en: "Beta" } },
        ],
      },
      fieldType: "select",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    const result = computeLocaleCompleteness(
      "en",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [field],
    );
    // 1 label + 2 options = 3 total, all filled
    expect(result.total).toBe(3);
    expect(result.filled).toBe(3);
  });

  it("counts rich text field bodies", () => {
    const field: PlaintextField = {
      fieldKey: "rt1",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "richText", body: { en: "some text" } },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    const result = computeLocaleCompleteness(
      "en",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [field],
    );
    expect(result.total).toBe(1);
    expect(result.filled).toBe(1);
  });

  it("counts help text when present in any locale", () => {
    const field: PlaintextField = {
      fieldKey: "f3",
      label: { en: "Name" },
      helpText: { en: "Enter your name" },
      isRequired: false,
      config: { type: "text" },
      fieldType: "text",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    const result = computeLocaleCompleteness(
      "en",
      emptyMeta,
      emptyMeta,
      emptyMeta,
      [field],
    );
    // 1 label + 1 help text = 2
    expect(result.total).toBe(2);
    expect(result.filled).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// setCapError
// ---------------------------------------------------------------------------

describe("setCapError", () => {
  it("sets description error", () => {
    const result = setCapError({}, "description", "too big");
    expect(result.description).toBe("too big");
  });

  it("clears submitMessage error", () => {
    const result = setCapError(
      { submitMessage: "err" },
      "submitMessage",
      undefined,
    );
    expect(result.submitMessage).toBeUndefined();
  });

  it("preserves other fields", () => {
    const prev: ContentCapErrors = { description: "d", closedMessage: "c" };
    const result = setCapError(prev, "submitMessage", "s");
    expect(result.description).toBe("d");
    expect(result.closedMessage).toBe("c");
    expect(result.submitMessage).toBe("s");
  });
});

// ---------------------------------------------------------------------------
// validateRichTextCap
// ---------------------------------------------------------------------------

describe("validateRichTextCap", () => {
  const capMsg = "too big";

  it("passes for content under the cap", () => {
    const { valid, errors } = validateRichTextCap(
      "description",
      { en: "short" },
      capMsg,
      {},
    );
    expect(valid).toBe(true);
    expect(errors.description).toBeUndefined();
  });

  it("fails for content over the cap", () => {
    const bigContent = "x".repeat(RICH_TEXT_LOCALE_CAP + 1);
    const { valid, errors } = validateRichTextCap(
      "description",
      { en: bigContent },
      capMsg,
      {},
    );
    expect(valid).toBe(false);
    expect(errors.description).toBe(capMsg);
  });

  it("checks Spanish locale too", () => {
    const bigContent = "x".repeat(RICH_TEXT_LOCALE_CAP + 1);
    const { valid } = validateRichTextCap(
      "submitMessage",
      { es: bigContent },
      capMsg,
      {},
    );
    expect(valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateFieldBodyCap
// ---------------------------------------------------------------------------

describe("validateFieldBodyCap", () => {
  const capMsg = "too big";

  it("passes for non-richText fields", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "text" },
      fieldType: "text",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(validateFieldBodyCap(field, capMsg).valid).toBe(true);
  });

  it("passes for richText bodies under the cap", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "richText", body: { en: "small" } },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(validateFieldBodyCap(field, capMsg).valid).toBe(true);
  });

  it("fails for richText bodies over the cap", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: {
        type: "richText",
        body: { en: "x".repeat(RICH_TEXT_LOCALE_CAP + 1) },
      },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    const result = validateFieldBodyCap(field, capMsg);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(capMsg);
  });
});

// ---------------------------------------------------------------------------
// extractDocText
// ---------------------------------------------------------------------------

describe("extractDocText", () => {
  it("extracts text from flat content nodes", () => {
    const content = [
      { type: "text", text: "hello" },
      { type: "text", text: "world" },
    ];
    expect(extractDocText(content)).toBe("hello world");
  });

  it("extracts text from nested content", () => {
    const content = [
      {
        type: "paragraph",
        content: [{ type: "text", text: "nested" }],
      },
    ];
    expect(extractDocText(content)).toBe("nested");
  });

  it("returns empty string for empty content", () => {
    expect(extractDocText([])).toBe("");
  });

  it("skips non-object nodes", () => {
    expect(extractDocText([null, 42, "bare"])).toBe("");
  });
});

// ---------------------------------------------------------------------------
// richTextBodyPreview
// ---------------------------------------------------------------------------

describe("richTextBodyPreview", () => {
  const emptyLabel = "(empty)";

  it("returns empty string for non-richText fields", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "text" },
      fieldType: "text",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(richTextBodyPreview(field, emptyLabel)).toBe("");
  });

  it("returns empty label when no body content exists", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "richText", body: {} },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(richTextBodyPreview(field, emptyLabel)).toBe(emptyLabel);
  });

  it("returns plain string content", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "richText", body: { en: "hello world" } },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(richTextBodyPreview(field, emptyLabel)).toBe("hello world");
  });

  it("truncates long text to 60 chars", () => {
    const longText = "a".repeat(80);
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: { type: "richText", body: { en: longText } },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    const result = richTextBodyPreview(field, emptyLabel);
    expect(result).toBe("a".repeat(60) + "...");
  });

  it("extracts text from ProseMirror doc JSON", () => {
    const field: PlaintextField = {
      fieldKey: "f",
      label: {},
      helpText: {},
      isRequired: false,
      config: {
        type: "richText",
        body: {
          en: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "doc text" }],
              },
            ],
          },
        },
      },
      fieldType: "richText",
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };
    expect(richTextBodyPreview(field, emptyLabel)).toBe("doc text");
  });
});

// ---------------------------------------------------------------------------
// resolveRichPreview
// ---------------------------------------------------------------------------

describe("resolveRichPreview", () => {
  it("returns the locale value when present and non-empty", () => {
    expect(resolveRichPreview({ en: "hi", es: "hola" }, "es")).toBe("hola");
  });

  it("falls back to English for non-base locale", () => {
    expect(resolveRichPreview({ en: "hi" }, "es")).toBe("hi");
  });

  it("returns undefined when no content", () => {
    expect(resolveRichPreview({}, "en")).toBeUndefined();
  });

  it("skips empty strings and falls back", () => {
    expect(resolveRichPreview({ en: "hi", es: "" }, "es")).toBe("hi");
  });

  it("returns doc objects when present", () => {
    const doc = { type: "doc" as const, content: [{ type: "paragraph" }] };
    expect(resolveRichPreview({ en: doc }, "en")).toBe(doc);
  });
});

// ---------------------------------------------------------------------------
// isUnknownArray
// ---------------------------------------------------------------------------

describe("isUnknownArray", () => {
  it("returns true for arrays", () => {
    expect(isUnknownArray([])).toBe(true);
    expect(isUnknownArray([1, 2, 3])).toBe(true);
  });

  it("returns false for non-arrays", () => {
    expect(isUnknownArray("string")).toBe(false);
    expect(isUnknownArray(null)).toBe(false);
    expect(isUnknownArray({})).toBe(false);
  });
});
