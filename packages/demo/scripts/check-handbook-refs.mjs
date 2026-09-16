#!/usr/bin/env node
/**
 * Fails when a handbook highlight selector no longer matches anything in
 * product source.
 *
 * Why this exists: the handbook's pixel anchors (SubHighlight selectors in
 * scroll-sections.ts and TOPIC_SELECTORS in tap-pulse.ts) point at class
 * names, test ids and roles inside packages/client components. A product
 * rename silently turns the pulse into a no-op: the demo still builds, the
 * ring just never appears. This converts that silent rot into a loud
 * failure at commit and CI time.
 *
 * The check is deliberately lexical. A selector "resolves" when every one
 * of its atoms (class, id, attribute) appears as a token in at least one
 * client Svelte file. That is weaker than querySelector against a mounted
 * DOM, but it needs no build and catches the actual failure mode, which is
 * a rename. Selectors that only resolve inside packages/demo (demo-owned
 * chrome) pass with a warning so they stay visible in output.
 *
 * Contract:
 *   Input   none. Reads the real sources relative to the repo root, so
 *           pre-commit and CI invoke it identically with no arguments.
 *           An optional directory argument overrides the repo root; it
 *           exists so the guard can be exercised against a fixture tree.
 *   Output  offending `file: selector` lines on stderr.
 *   Exit    0 clean, 1 violations found, 2 a source could not be read or
 *           parsed.
 *
 * Exit 2 matters: a parse failure must never look like a pass, or a
 * refactor that reshapes scroll-sections.ts silently disables the guard.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";
import { HANDBOOK_REFS_ALLOWLIST } from "./handbook-refs-allowlist.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = process.argv[2]
  ? resolve(process.argv[2])
  : join(SCRIPT_DIR, "../../..");

const SCROLL_SECTIONS = join(
  REPO_ROOT,
  "packages/demo/src/lib/scroll-sections.ts",
);
const TAP_PULSE = join(REPO_ROOT, "packages/demo/src/lib/tap-pulse.ts");
const CLIENT_SRC = join(REPO_ROOT, "packages/client/src");
const DEMO_SRC = join(REPO_ROOT, "packages/demo/src");

function displayPath(p) {
  const rel = relative(REPO_ROOT, p);
  return rel.startsWith("..") ? p : rel;
}

// -----------------------------------------------------------------------
// Extraction
// -----------------------------------------------------------------------

/** Pull every quoted string out of a `[...]` array literal body. */
function stringLiterals(arrayBody) {
  return [...arrayBody.matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)].map(
    (m) => m[2],
  );
}

/**
 * Find the `]` closing the bracket at `open`, skipping brackets inside
 * string literals (attribute selectors contain `]`). Returns -1 if
 * unterminated.
 */
function closingBracket(source, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (quote !== null) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * SubHighlight selectors: every `selectors: [ ... ]` array in
 * scroll-sections.ts. The taxonomy file guarantees plain string-array
 * literals, so a quote-aware bracket scan is sufficient.
 */
function extractHighlightSelectors(source) {
  const found = [];
  for (const m of source.matchAll(/selectors:\s*\[/g)) {
    const start = m.index + m[0].length - 1;
    const end = closingBracket(source, start);
    if (end === -1) return null;
    const line = source.slice(0, m.index).split("\n").length;
    for (const sel of stringLiterals(source.slice(start, end + 1))) {
      found.push({ selector: sel, line });
    }
  }
  return found.length > 0 ? found : null;
}

/**
 * TOPIC_SELECTORS values in tap-pulse.ts. The map body holds topic keys
 * (bare words) and selector strings; only strings shaped like selectors
 * (leading `.`, `#` or `[`) are checked.
 */
function extractTopicSelectors(source) {
  const marker = "TOPIC_SELECTORS";
  const markerIdx = source.indexOf(marker);
  if (markerIdx === -1) return null;
  const mapStart = source.indexOf("new Map([", markerIdx);
  if (mapStart === -1) return null;
  const open = mapStart + "new Map([".length - 1;
  const end = closingBracket(source, open);
  if (end === -1) return null;
  const body = source.slice(open, end + 1);
  const baseLine = source.slice(0, open).split("\n").length;
  const found = [];
  for (const m of body.matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)) {
    const sel = m[2];
    if (!/^[.#[]/.test(sel)) continue;
    const line = baseLine + body.slice(0, m.index).split("\n").length - 1;
    found.push({ selector: sel, line });
  }
  return found.length > 0 ? found : null;
}

// -----------------------------------------------------------------------
// Resolution
// -----------------------------------------------------------------------

function svelteFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const p = join(d, entry);
      if (statSync(p).isDirectory()) {
        if (entry === "node_modules" || entry === "dist") continue;
        walk(p);
      } else if (entry.endsWith(".svelte")) {
        out.push(p);
      }
    }
  };
  walk(dir);
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Break a selector into checkable atoms. A compound selector like
 * `.section-scroll-nav [data-section-id]` resolves only when every atom
 * does. Returns null for a shape this parser does not understand, which
 * the caller treats as a parse failure rather than a pass.
 */
function selectorAtoms(selector) {
  const atoms = [];
  const pattern =
    /\.([\w-]+)|#([\w-]+)|\[([\w-]+)(?:=["']?([^"'\]]*)["']?)?\]|([a-zA-Z][\w-]*)/g;
  let matchedLength = 0;
  for (const m of selector.matchAll(pattern)) {
    matchedLength += m[0].length;
    if (m[1] !== undefined) atoms.push({ kind: "class", name: m[1] });
    else if (m[2] !== undefined) atoms.push({ kind: "id", name: m[2] });
    else if (m[3] !== undefined)
      atoms.push({ kind: "attr", name: m[3], value: m[4] });
    // Bare element atoms (div, button) are structural, not rename-prone;
    // they are matched to keep coverage accounting honest but not checked.
  }
  const structural = selector.replace(/[\s>+~*]/g, "").length;
  if (atoms.length === 0 || matchedLength < structural) return null;
  return atoms;
}

function atomRegex(atom) {
  if (atom.kind === "class") {
    // Token match: appears in class attrs, class: directives, clsx strings
    // or <style> blocks, but not inside a longer hyphenated name.
    return new RegExp(`(^|[^\\w-])${escapeRegex(atom.name)}($|[^\\w-])`);
  }
  if (atom.kind === "id") {
    return new RegExp(`id=["']${escapeRegex(atom.name)}["']`);
  }
  if (atom.value !== undefined && atom.value !== "") {
    return new RegExp(
      `${escapeRegex(atom.name)}\\s*=\\s*["']${escapeRegex(atom.value)}["']`,
    );
  }
  return new RegExp(`(^|[^\\w-])${escapeRegex(atom.name)}($|[^\\w-])`);
}

/** "client" | "demo" | null — where every atom of the selector resolves. */
function resolveSelector(selector, clientTexts, demoTexts) {
  const atoms = selectorAtoms(selector);
  if (atoms === null) return "unparseable";
  const checkable = atoms.filter((a) => a.kind !== undefined);
  const foundIn = (texts) =>
    checkable.every((atom) => {
      const re = atomRegex(atom);
      return texts.some((t) => re.test(t));
    });
  if (foundIn(clientTexts)) return "client";
  if (foundIn(demoTexts)) return "demo";
  return null;
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

function main() {
  let scrollSource, tapSource;
  try {
    scrollSource = readFileSync(SCROLL_SECTIONS, "utf8");
    tapSource = readFileSync(TAP_PULSE, "utf8");
  } catch (err) {
    process.stderr.write(`check-handbook-refs: cannot read: ${err.message}\n`);
    return 2;
  }

  const highlight = extractHighlightSelectors(scrollSource);
  const topic = extractTopicSelectors(tapSource);
  if (highlight === null || topic === null) {
    process.stderr.write(
      "check-handbook-refs: no selectors extracted. The file shape changed, so this check is no longer meaningful. Update the parser rather than deleting the check.\n",
    );
    return 2;
  }

  let clientTexts, demoTexts;
  try {
    clientTexts = svelteFiles(CLIENT_SRC).map((f) => readFileSync(f, "utf8"));
    demoTexts = svelteFiles(DEMO_SRC).map((f) => readFileSync(f, "utf8"));
  } catch (err) {
    process.stderr.write(
      `check-handbook-refs: cannot read component sources: ${err.message}\n`,
    );
    return 2;
  }
  if (clientTexts.length === 0) {
    process.stderr.write(
      "check-handbook-refs: no client Svelte files found. The layout changed; update this script.\n",
    );
    return 2;
  }

  const refs = [
    ...highlight.map((r) => ({ ...r, file: displayPath(SCROLL_SECTIONS) })),
    ...topic.map((r) => ({ ...r, file: displayPath(TAP_PULSE) })),
  ];

  const violations = [];
  const warnings = [];
  const usedAllowlist = new Set();
  const seen = new Map();

  for (const ref of refs) {
    const key = ref.selector;
    let outcome = seen.get(key);
    if (outcome === undefined) {
      outcome = resolveSelector(ref.selector, clientTexts, demoTexts);
      seen.set(key, outcome);
    }
    if (outcome === "client") continue;
    if (outcome === "unparseable") {
      process.stderr.write(
        `check-handbook-refs: cannot parse selector ${JSON.stringify(ref.selector)} at ${ref.file}:${ref.line}. Extend selectorAtoms rather than deleting the check.\n`,
      );
      return 2;
    }
    if (outcome === "demo") {
      warnings.push(
        `${ref.file}:${ref.line}  ${ref.selector}  (resolves only in packages/demo — demo-owned chrome)`,
      );
      continue;
    }
    const allowed = HANDBOOK_REFS_ALLOWLIST.get(ref.selector);
    if (allowed !== undefined) {
      usedAllowlist.add(ref.selector);
      warnings.push(
        `${ref.file}:${ref.line}  ${ref.selector}  (allowlisted: ${allowed.reason})`,
      );
      continue;
    }
    violations.push(`${ref.file}:${ref.line}  ${ref.selector}`);
  }

  for (const w of warnings) process.stderr.write(`  warn  ${w}\n`);

  const staleAllowlist = [...HANDBOOK_REFS_ALLOWLIST.keys()].filter(
    (k) => !usedAllowlist.has(k),
  );
  if (staleAllowlist.length > 0) {
    process.stderr.write(
      `check-handbook-refs: ${staleAllowlist.length} allowlist entr${staleAllowlist.length === 1 ? "y" : "ies"} no longer match${staleAllowlist.length === 1 ? "es" : ""} an unresolved selector. Remove from handbook-refs-allowlist.mjs:\n`,
    );
    for (const k of staleAllowlist) process.stderr.write(`  ${k}\n`);
    return 1;
  }

  if (violations.length > 0) {
    process.stderr.write(
      `check-handbook-refs: ${violations.length} selector(s) resolve nowhere in packages/client or packages/demo:\n\n`,
    );
    for (const v of violations) process.stderr.write(`  ${v}\n`);
    process.stderr.write(
      "\nEither the product component was renamed (update the selector) or the region is gone (retarget or drop the highlight). If the gap is accepted for now, add the selector to handbook-refs-allowlist.mjs with a reason.\n",
    );
    return 1;
  }

  return 0;
}

process.exit(main());
