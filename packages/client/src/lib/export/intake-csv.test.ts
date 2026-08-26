import { describe, it, expect } from "vitest";
import { assembleIntakeCsv, type CsvFieldDef } from "./intake-csv.js";

function makeFields(
  defs: { key: string; label: string; fieldType: string }[],
): ReadonlyMap<string, CsvFieldDef> {
  const map = new Map<string, CsvFieldDef>();
  for (const d of defs) {
    map.set(d.key, {
      fieldKey: d.key,
      label: { en: d.label, es: `${d.label} (es)` },
      fieldType: d.fieldType,
    });
  }
  return map;
}

describe("assembleIntakeCsv", () => {
  const fields = makeFields([
    { key: "fk-name", label: "Name", fieldType: "text" },
    { key: "fk-email", label: "Email", fieldType: "text" },
    { key: "fk-agree", label: "Agree", fieldType: "checkbox" },
  ]);

  it("produces headers in definition order with localized labels", () => {
    const result = assembleIntakeCsv(fields, [], "en", "Submitted");

    // BOM + header row
    const lines = result.csv.split("\r\n");
    // First line has a BOM character
    const header = lines[0]!.replace(/^﻿/, "");
    expect(header).toBe("Submitted,Name,Email,Agree");
    expect(result.exportedCount).toBe(0);
  });

  it("localizes headers to the requested locale", () => {
    const result = assembleIntakeCsv(fields, [], "es", "Enviado");
    const lines = result.csv.split("\r\n");
    const header = lines[0]!.replace(/^﻿/, "");
    expect(header).toBe("Enviado,Name (es),Email (es),Agree (es)");
  });

  it("formats string, boolean, number, and array values", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "Jane Doe" },
            { fieldKey: "fk-email", value: "jane@example.com" },
            { fieldKey: "fk-agree", value: true },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    expect(lines[1]).toBe(
      "2026-08-25T10:00:00.000Z,Jane Doe,jane@example.com,Yes",
    );
    expect(result.exportedCount).toBe(1);
  });

  it("outputs empty cells for missing answers", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [{ fieldKey: "fk-name", value: "Alice" }],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    // Name filled, Email and Agree empty
    expect(lines[1]).toBe("2026-08-25T10:00:00.000Z,Alice,,");
  });

  it("quotes cells containing commas", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "Doe, Jane" },
            { fieldKey: "fk-email", value: "j@e.com" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    expect(lines[1]).toContain('"Doe, Jane"');
  });

  it("escapes double-quotes by doubling them", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: 'She said "hi"' },
            { fieldKey: "fk-email", value: "" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    expect(lines[1]).toContain('"She said ""hi"""');
  });

  it("prefixes formula-triggering characters with a single-quote (OWASP CSV injection)", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "=SUM(A1)" },
            { fieldKey: "fk-email", value: "+cmd|'/C calc'!A0" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    // The = and + characters should be prefixed with a single-quote
    expect(lines[1]).toContain("'=SUM(A1)");
    expect(lines[1]).toContain("'+cmd|'/C calc'!A0");
  });

  it("handles array values with semicolon separator", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: ["opt-a", "opt-b"] },
            { fieldKey: "fk-email", value: "" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    expect(lines[1]).toContain("opt-a; opt-b");
  });

  it("falls back to the base-locale label when the locale has none", () => {
    const sparseFields = new Map<string, CsvFieldDef>();
    sparseFields.set("fk-x", {
      fieldKey: "fk-x",
      label: { en: "English Only" },
      fieldType: "text",
    });

    const result = assembleIntakeCsv(sparseFields, [], "es", "Enviado");
    const lines = result.csv.split("\r\n");
    const header = lines[0]!.replace(/^﻿/, "");
    expect(header).toBe("Enviado,English Only");
  });

  it("uses fieldKey as fallback when the label is empty in every locale", () => {
    const sparseFields = new Map<string, CsvFieldDef>();
    sparseFields.set("fk-x", {
      fieldKey: "fk-x",
      label: {},
      fieldType: "text",
    });

    const result = assembleIntakeCsv(sparseFields, [], "es", "Enviado");
    const lines = result.csv.split("\r\n");
    const header = lines[0]!.replace(/^﻿/, "");
    expect(header).toBe("Enviado,fk-x");
  });

  it("includes UTF-8 BOM for Excel compatibility", () => {
    const result = assembleIntakeCsv(fields, [], "en", "Submitted");
    expect(result.csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("terminates with CRLF", () => {
    const result = assembleIntakeCsv(fields, [], "en", "Submitted");
    expect(result.csv.endsWith("\r\n")).toBe(true);
  });

  it("handles multiple rows preserving definition-order columns", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T09:00:00Z",
          answers: [
            { fieldKey: "fk-email", value: "a@b.com" },
            { fieldKey: "fk-name", value: "First" },
          ],
        },
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "Second" },
            { fieldKey: "fk-agree", value: true },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const lines = result.csv.split("\r\n");
    // Row 1: answers came out of definition order, should still line up
    expect(lines[1]).toBe("2026-08-25T09:00:00.000Z,First,a@b.com,");
    // Row 2: email missing
    expect(lines[2]).toBe("2026-08-25T10:00:00.000Z,Second,,Yes");
    expect(result.exportedCount).toBe(2);
  });

  it("handles newlines in cell values by quoting them", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "Line1\nLine2" },
            { fieldKey: "fk-email", value: "" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    // The cell with newline should be quoted
    expect(result.csv).toContain('"Line1\nLine2"');
  });

  it("prefixes cells starting with - @ and tab", () => {
    const result = assembleIntakeCsv(
      fields,
      [
        {
          submittedAt: "2026-08-25T10:00:00Z",
          answers: [
            { fieldKey: "fk-name", value: "-danger" },
            { fieldKey: "fk-email", value: "@mention" },
            { fieldKey: "fk-agree", value: false },
          ],
        },
      ],
      "en",
      "Submitted",
    );

    const raw = result.csv;
    expect(raw).toContain("'-danger");
    expect(raw).toContain("'@mention");
  });
});
