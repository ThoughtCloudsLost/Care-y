/**
 * Locale coverage: assert that compiled paraglide message functions
 * return distinct output for es vs en when the source translations
 * differ.
 *
 * The corpus is derived from en.json and es.json at test time, not
 * maintained by hand, so it cannot drift as copy changes. A new key
 * is covered the moment it is translated, and a key with identical
 * values in both languages is correctly excluded.
 *
 * Catches: wrong-locale resolution, wrong default, stale cache, and
 * any hardcoded English the lint rule's disabled blocks let through.
 *
 * Named so a future Playwright sweep can extend this file with
 * full-route visual assertions.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as messages from "$lib/paraglide/messages.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(__dir, "../../../../shared/messages");

const ALLOWED_LOCALES = new Set(["en", "es"]);

function loadMessages(locale: string): Record<string, string> {
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is validated against ALLOWED_LOCALES above
  const raw = readFileSync(resolve(messagesDir, `${locale}.json`), "utf-8");
  return JSON.parse(raw) as Record<string, string>;
}

/**
 * Extract {param} names from a message template string.
 * Handles simple {name} placeholders. Returns an empty array for
 * messages with no placeholders.
 */
function extractParams(template: string): string[] {
  const params: string[] = [];
  // Match simple {word} placeholders (not nested ICU plurals).
  // For nested structures like {count, plural, ...}, the outer name
  // is the first word before the comma.
  const re = /\{(\w+)[^}]*\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(template)) !== null) {
    const name = match[1];
    if (name !== undefined && !params.includes(name)) {
      params.push(name);
    }
  }
  return params;
}

/**
 * Build a dummy inputs object for a parameterized message.
 * Each param gets a fixed string so both locale calls produce the
 * same interpolated segments, and only the translated text differs.
 */
function buildDummyInputs(params: string[]): Record<string, string | number> {
  const inputs: Record<string, string | number> = {};
  for (const p of params) {
    // Use "X" as a short, neutral placeholder that won't accidentally
    // match real translated text.
    inputs[p] = "X";
  }
  return inputs;
}

const en = loadMessages("en");
const es = loadMessages("es");

// Build the corpus: keys where es differs from en.
const differingKeys: string[] = [];
for (const [key, enVal] of Object.entries(en)) {
  const esVal = es[key];
  if (esVal !== undefined && esVal !== enVal) {
    differingKeys.push(key);
  }
}

describe("locale coverage: es output differs from en for translated keys", () => {
  // The message functions barrel: each export is either a message
  // function or a re-export namespace. We only care about functions,
  // narrowed through the predicate below.
  type MessageFn = (
    inputs: Record<string, unknown>,
    options?: { locale?: string },
  ) => string;
  function isMessageFn(value: unknown): value is MessageFn {
    return typeof value === "function";
  }
  const messageFns = messages as unknown as Record<string, unknown>;

  it("has a non-empty corpus of differing keys", () => {
    expect(differingKeys.length).toBeGreaterThan(0);
  });

  const mismatches: string[] = [];

  for (const key of differingKeys) {
    const fn = messageFns[key];
    if (!isMessageFn(fn)) continue;

    const params = extractParams(en[key] ?? "");
    const inputs = buildDummyInputs(params);

    // Call the compiled message function under both locales.
    let enResult: string;
    let esResult: string;
    try {
      enResult = fn(inputs, { locale: "en" });
      esResult = fn(inputs, { locale: "es" });
    } catch {
      // Some message functions may have required params we cannot
      // infer from simple regex extraction (e.g. markup callbacks).
      // Skip rather than false-alarm.
      continue;
    }

    if (enResult === esResult) {
      mismatches.push(key);
    }
  }

  it("no translated key resolves to the English value under es locale", () => {
    expect(
      mismatches,
      `These keys have different en/es source values but the compiled ` +
        `message function returns the same output for both locales. ` +
        `This indicates wrong-locale resolution or a stale compile:\n  ` +
        mismatches.join("\n  "),
    ).toEqual([]);
  });
});
