/**
 * Generate the en-XA pseudolocale from en.json.
 *
 * Transforms every value so it is unmistakably not English: accents all
 * vowels, wraps the string in corner-bracket markers, and pads by ~30%
 * to simulate the length expansion of longer locales (Spanish, German).
 *
 * Placeholders ({param}) and markdown bold (**text**) are preserved
 * verbatim; only the plain text between them is transformed.
 *
 * Usage: invoked from both compile-paraglide.js scripts (shared and
 * client) BEFORE the paraglide compile, so the generated file is
 * always fresh and never hand-edited.
 *
 * Invocation:
 *   node generate-pseudolocale.js <messagesDir>
 *
 * If no argument is provided, defaults to ../messages relative to the
 * script location (the shared package).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Vowel accent map for pseudolocalization. */
const ACCENT_MAP = new Map([
  ["a", "à"],
  ["e", "è"],
  ["i", "ì"],
  ["o", "ò"],
  ["u", "ù"],
  ["A", "À"],
  ["E", "È"],
  ["I", "Ì"],
  ["O", "Ò"],
  ["U", "Ù"],
]);

const PAD_CHAR = "•"; // bullet, visible and clearly not real text

/**
 * Accent vowels in a plain text segment (no placeholders, no markdown).
 * @param {string} text
 * @returns {string}
 */
function accentVowels(text) {
  let result = "";
  for (const ch of text) {
    const replacement = ACCENT_MAP.get(ch);
    result += replacement !== undefined ? replacement : ch;
  }
  return result;
}

/**
 * Expand a string by ~30% using a padding suffix.
 * @param {string} text - The already-accented text (plain segments only).
 * @returns {string}
 */
function padLength(text) {
  // Count only visible characters (exclude markers we already added).
  const padCount = Math.ceil(text.length * 0.3);
  if (padCount === 0) return text;
  return text + " " + PAD_CHAR.repeat(padCount);
}

/**
 * A regex that matches:
 *  - {placeholder} tokens (including nested like {count, plural, ...})
 *  - **bold** markdown markers
 *
 * The regex captures these tokens so we can split around them and only
 * transform the plain text segments between them.
 *
 * Placeholder pattern: opening brace, then everything up to the matching
 * close brace (handles one level of nesting for ICU plurals).
 */
const TOKEN_RE = /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\*\*)/g;

/**
 * Transform a single message value into its pseudolocalized form.
 * @param {string} value
 * @returns {string}
 */
function pseudolocalize(value) {
  // Split into tokens (preserved) and plain text (transformed).
  const parts = value.split(TOKEN_RE);
  let plainAccumulator = "";
  const segments = [];

  for (const part of parts) {
    if (TOKEN_RE.test(part)) {
      // This is a placeholder or markdown marker; preserve it.
      // First, flush any accumulated plain text.
      if (plainAccumulator.length > 0) {
        segments.push(padLength(accentVowels(plainAccumulator)));
        plainAccumulator = "";
      }
      // Reset lastIndex since we used .test()
      TOKEN_RE.lastIndex = 0;
      segments.push(part);
    } else {
      plainAccumulator += part;
    }
    // Reset lastIndex for the next .test() call
    TOKEN_RE.lastIndex = 0;
  }

  // Flush remaining plain text
  if (plainAccumulator.length > 0) {
    segments.push(padLength(accentVowels(plainAccumulator)));
  }

  const inner = segments.join("");
  return `⟦${inner}⟧`;
}

/**
 * Generate en-XA.json from en.json in the given messages directory.
 * @param {string} messagesDir - Absolute path to the messages directory.
 */
function generatePseudolocale(messagesDir) {
  const enPath = resolve(messagesDir, "en.json");
  const outPath = resolve(messagesDir, "en-XA.json");

  const en = JSON.parse(readFileSync(enPath, "utf-8"));

  /** @type {Record<string, string>} */
  const pseudo = {};
  for (const [key, value] of Object.entries(en)) {
    if (typeof value !== "string") continue;
    pseudo[key] = pseudolocalize(value);
  }

  writeFileSync(outPath, JSON.stringify(pseudo, null, 2) + "\n", "utf-8");
}

// Always run on import / direct execution.
const messagesDir = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, "../messages");

generatePseudolocale(messagesDir);
