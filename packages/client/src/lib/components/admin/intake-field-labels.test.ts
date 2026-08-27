// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_forms_field_type_text: () => "Text",
  intake_forms_field_type_text_desc: () => "Single-line answer",
  intake_forms_field_type_textarea: () => "Text area",
  intake_forms_field_type_textarea_desc: () => "Multi-line answer",
  intake_forms_field_type_select: () => "Dropdown",
  intake_forms_field_type_select_desc: () => "Choose one option",
  intake_forms_field_type_multiselect: () => "Checkboxes",
  intake_forms_field_type_multiselect_desc: () => "Choose one or more options",
  intake_forms_field_type_checkbox: () => "Checkbox",
  intake_forms_field_type_checkbox_desc: () => "Single yes/no toggle",
  intake_forms_field_type_availability: () => "Availability",
  intake_forms_field_type_availability_desc: () => "Time window picker",
  intake_forms_field_type_date: () => "Date",
  intake_forms_field_type_date_desc: () => "Date picker",
  intake_forms_field_type_page_break: () => "Page break",
  intake_forms_field_type_page_break_desc: () => "Split the form into pages",
  intake_forms_field_type_rich_text: () => "Text block",
  intake_forms_field_type_rich_text_desc: () =>
    "Static formatted content between fields",
}));

const { getFieldTypeLabel, getFieldTypeDesc } =
  await import("./intake-field-labels.js");

describe("getFieldTypeLabel", () => {
  it("returns the correct label for each field type", () => {
    expect(getFieldTypeLabel("text")).toBe("Text");
    expect(getFieldTypeLabel("textarea")).toBe("Text area");
    expect(getFieldTypeLabel("select")).toBe("Dropdown");
    expect(getFieldTypeLabel("multiselect")).toBe("Checkboxes");
    expect(getFieldTypeLabel("checkbox")).toBe("Checkbox");
    expect(getFieldTypeLabel("availability")).toBe("Availability");
    expect(getFieldTypeLabel("date")).toBe("Date");
    expect(getFieldTypeLabel("pageBreak")).toBe("Page break");
    expect(getFieldTypeLabel("richText")).toBe("Text block");
  });
});

describe("getFieldTypeDesc", () => {
  it("returns the correct description for each field type", () => {
    expect(getFieldTypeDesc("text")).toBe("Single-line answer");
    expect(getFieldTypeDesc("textarea")).toBe("Multi-line answer");
    expect(getFieldTypeDesc("select")).toBe("Choose one option");
    expect(getFieldTypeDesc("multiselect")).toBe("Choose one or more options");
    expect(getFieldTypeDesc("checkbox")).toBe("Single yes/no toggle");
    expect(getFieldTypeDesc("availability")).toBe("Time window picker");
    expect(getFieldTypeDesc("date")).toBe("Date picker");
    expect(getFieldTypeDesc("pageBreak")).toBe("Split the form into pages");
    expect(getFieldTypeDesc("richText")).toBe(
      "Static formatted content between fields",
    );
  });
});
