import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { METHOD_INFO } from "./two-factor-types.js";
import { ErrorCode } from "./error-codes.js";

const dir = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(dir, "../messages");

const ALLOWED_LOCALES = new Set(["en", "es"]);

function loadMessages(locale: string): Record<string, unknown> {
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is validated against a fixed allowlist above
  const raw = readFileSync(resolve(messagesDir, `${locale}.json`), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

const en = loadMessages("en");
const es = loadMessages("es");

describe("messages/en.json", () => {
  it("is valid JSON with flat string keys", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
    }
  });

  it("has all expected namespaces", () => {
    const prefixes = [
      "nav_",
      "app_",
      "error_",
      "email_",
      "twofa_",
      "exposure_",
      "empty_",
    ];
    for (const prefix of prefixes) {
      const keys = Object.keys(en).filter((k) => k.startsWith(prefix));
      expect(keys.length).toBeGreaterThan(0);
    }
  });
});

describe("messages/es.json", () => {
  it("has the same keys as en.json", () => {
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("has no empty string values", () => {
    for (const [key, value] of Object.entries(es)) {
      expect(value, `es.json key "${key}" is empty`).not.toBe("");
    }
  });
});

describe("two-factor-types i18n keys", () => {
  it("every METHOD_INFO labelKey exists in en.json", () => {
    for (const info of METHOD_INFO) {
      expect(en).toHaveProperty(info.labelKey);
    }
  });

  it("every METHOD_INFO descriptionKey exists in en.json", () => {
    for (const info of METHOD_INFO) {
      expect(en).toHaveProperty(info.descriptionKey);
    }
  });
});

describe("ErrorCode i18n keys", () => {
  it("every ErrorCode maps to an error_ key in en.json", () => {
    const errorKeys = Object.keys(en).filter((k) => k.startsWith("error_"));
    for (const code of Object.values(ErrorCode)) {
      const expectedKey = `error_${code.toLowerCase()}`;
      expect(
        errorKeys,
        `ErrorCode.${code} should map to "${expectedKey}" in en.json`,
      ).toContain(expectedKey);
    }
  });
});
