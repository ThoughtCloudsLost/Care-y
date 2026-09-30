#!/usr/bin/env node
/**
 * Generates docs/demo-handbook-copy-audit.md from the demo handbook's
 * section taxonomy and message catalog.
 *
 * Parses packages/demo/src/lib/scroll-sections.ts for the ENTRY_SECTION
 * and SECTIONS arrays (the canonical handbook ordering), resolves each
 * message key against packages/shared/messages/en.json, and writes the
 * audit in the same format the handbook renders: section title, section
 * description, then numbered sub-headings with body text.
 *
 * Run with no arguments; re-run whenever entry text changes.
 * Exit 0 on success, 1 on error.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SECTIONS_TS = resolve(ROOT, "packages/demo/src/lib/scroll-sections.ts");
const EN_JSON = resolve(ROOT, "packages/shared/messages/en.json");
const OUT_FILE = resolve(ROOT, "docs/demo-handbook-copy-audit.md");

// -----------------------------------------------------------------------
// Parse the section taxonomy from the TypeScript source
// -----------------------------------------------------------------------

function parseSections(source) {
  const sections = [];

  // Extract ENTRY_SECTION object via balanced-brace counting
  const entryMarker = "export const ENTRY_SECTION: Section = {";
  const entryIdx = source.indexOf(entryMarker);
  if (entryIdx >= 0) {
    const braceIdx = entryIdx + entryMarker.length - 1;
    const entryBlock = extractBalanced(source, braceIdx, "{", "}");
    if (entryBlock) {
      const parsed = parseSectionBlock(entryBlock);
      if (parsed) sections.push({ ...parsed, label: "Entry Page" });
    }
  }

  // Extract SECTIONS array via balanced-bracket counting
  const marker = "export const SECTIONS: readonly Section[] = [";
  const sectionsIdx = source.indexOf(marker);
  if (sectionsIdx >= 0) {
    const arrayStart = sectionsIdx + marker.length - 1;
    const body = extractBalanced(source, arrayStart, "[", "]");
    if (body) {
      // Strip the outer brackets
      const inner = body.slice(1, -1);
      const sectionBlocks = extractTopLevelBlocks(inner, "{", "}");
      for (const block of sectionBlocks) {
        const parsed = parseSectionBlock(block);
        if (parsed) sections.push(parsed);
      }
    }
  }

  return sections;
}

function extractBalanced(source, startIdx, open, close) {
  if (source[startIdx] !== open) return null;
  let depth = 1;
  for (let i = startIdx + 1; i < source.length; i++) {
    if (source[i] === open) depth++;
    if (source[i] === close) {
      depth--;
      if (depth === 0) return source.slice(startIdx, i + 1);
    }
  }
  return null;
}

function extractTopLevelBlocks(source, open, close) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === open) {
      if (depth === 0) start = i;
      depth++;
    } else if (source[i] === close) {
      depth--;
      if (depth === 0 && start >= 0) {
        blocks.push(source.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return blocks;
}

function parseSectionBlock(block) {
  const id = extractString(block, /id\s*:\s*"([^"]+)"/);
  const titleKey = extractString(block, /titleKey\s*:\s*"([^"]+)"/);
  const descKey = extractString(block, /descKey\s*:\s*"([^"]+)"/);
  if (!id || !titleKey || !descKey) return null;

  const subs = [];
  const subsIdx = block.indexOf("subs: [");
  if (subsIdx >= 0) {
    const bracketIdx = block.indexOf("[", subsIdx);
    const subsArray = extractBalanced(block, bracketIdx, "[", "]");
    if (subsArray) {
      const subBlocks = extractTopLevelBlocks(subsArray.slice(1, -1), "{", "}");
      for (const sub of subBlocks) {
        const slug = extractString(sub, /slug\s*:\s*"([^"]+)"/);
        const headingKey = extractString(sub, /headingKey\s*:\s*"([^"]+)"/);
        const bodyKey = extractString(sub, /bodyKey\s*:\s*"([^"]+)"/);
        if (slug && headingKey && bodyKey) {
          subs.push({ slug, headingKey, bodyKey });
        }
      }
    }
  }

  return { id, titleKey, descKey, subs };
}

function extractString(text, regex) {
  const m = text.match(regex);
  return m ? m[1] : null;
}

// -----------------------------------------------------------------------
// Resolve message keys to entry text
// -----------------------------------------------------------------------

function resolveKey(msgs, key) {
  const val = msgs[key];
  if (val === undefined) return `⚠️ MISSING KEY: \`${key}\``;
  return val;
}

// -----------------------------------------------------------------------
// Flag colons that may stand in for a dash
// -----------------------------------------------------------------------

// Returns a short window of text around each colon in an entry that has
// more text after it on the same line. Bold labels and link targets are
// removed and inline code becomes a placeholder, so their colons do not
// count. Not matched: a colon that ends its
// line (a list introduction), the term of a definition bullet ("- New: ..."),
// and a label whose value is code ("Wrap rows: `path`").
function findColonDashes(text) {
  const hits = [];
  for (const line of text.split("\n")) {
    const stripped = line
      .replace(/^\s*[-*]\s+([^:]{1,40}:\s)?/, "")
      .replace(/\*\*[^*]+\*\*/g, "")
      .replace(/`[^`]*`/g, "\u0000")
      .replace(/\]\([^)]*\)/g, "]")
      .replace(/\[\[[^\]]*\]\]/g, "");
    for (const m of stripped.matchAll(/[^\s\d]:\s+[\p{L}[(]/gu)) {
      const start = Math.max(0, m.index - 60);
      const end = Math.min(stripped.length, m.index + 70);
      const window = stripped.slice(start, end).replaceAll("\u0000", "`…`");
      hits.push(`...${window.trim()}...`);
    }
  }
  return hits;
}

// -----------------------------------------------------------------------
// Render the audit markdown
// -----------------------------------------------------------------------

function render(sections, msgs) {
  const lines = [];
  lines.push("# Demo Handbook Copy Audit");
  lines.push("");
  lines.push("> Auto-generated by `scripts/handbook-copy-audit.mjs`.");
  lines.push(
    "> Sources: `packages/demo/src/lib/scroll-sections.ts` (section ordering)",
  );
  lines.push("> and `packages/shared/messages/en.json` (entry text).");
  lines.push("");

  // Stats
  let totalSubs = 0;
  for (const s of sections) totalSubs += s.subs.length;
  lines.push(
    `> ${String(sections.length)} sections, ${String(totalSubs)} sub-topics.`,
  );
  lines.push("");

  // Global tip
  const tipText = msgs["demo_narrative_tip"];
  if (tipText) {
    lines.push("> **Handbook tip** (shown once, under the first section):");
    lines.push(`> ${tipText}`);
    lines.push("<!-- demo_narrative_tip -->");
    lines.push("");
  }

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("");
  for (const s of sections) {
    const title = resolveKey(msgs, s.titleKey);
    const label = s.label ? ` *(${s.label})*` : "";
    const anchor = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");
    lines.push(
      `- [${title}${label}](#${anchor}): ${String(s.subs.length)} topics`,
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // Section entry text
  for (const s of sections) {
    const title = resolveKey(msgs, s.titleKey);
    const desc = resolveKey(msgs, s.descKey);

    lines.push(`## ${title}`);
    if (s.label) lines.push(`*${s.label}*`);
    lines.push(`<!-- section: ${s.id} | ${s.titleKey} -->`);
    lines.push("");
    lines.push(desc);
    lines.push(`<!-- ${s.descKey} -->`);
    lines.push("");

    const numbered = s.subs.length > 1;
    for (let i = 0; i < s.subs.length; i++) {
      const sub = s.subs[i];
      const heading = resolveKey(msgs, sub.headingKey);
      const body = resolveKey(msgs, sub.bodyKey);
      const prefix = numbered ? `${String(i + 1)}. ` : "";

      lines.push(`### ${prefix}${heading}`);
      lines.push(`<!-- ${sub.headingKey} -->`);
      lines.push("");
      lines.push(body);
      lines.push(`<!-- ${sub.bodyKey} -->`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  // Review flags: colons that may stand in for a dash. Not a failure;
  // each hit needs a reader to decide.
  const colonFlags = [];
  for (const s of sections) {
    const keys = [s.descKey, ...s.subs.map((sub) => sub.bodyKey)];
    for (const key of keys) {
      for (const sentence of findColonDashes(msgs[key] ?? "")) {
        colonFlags.push(`- \`${key}\`: ${sentence}`);
      }
    }
  }
  if (colonFlags.length > 0) {
    lines.push("## Review Flags: Mid-Sentence Colons");
    lines.push("");
    lines.push(
      `${String(colonFlags.length)} lines carry a colon with more text after it on the same line. A colon used as a dash, or one followed by an inline comma-separated list, breaks the register; a colon that introduces a bulleted list is fine.`,
    );
    lines.push("");
    lines.push(...colonFlags);
    lines.push("");
  }

  // Orphan check: find demo_narrative_* keys not referenced by any section
  const referenced = new Set();
  referenced.add("demo_narrative_tip");
  for (const s of sections) {
    for (const sub of s.subs) {
      referenced.add(sub.headingKey);
      referenced.add(sub.bodyKey);
    }
  }
  const allNarrative = Object.keys(msgs).filter((k) =>
    k.startsWith("demo_narrative_"),
  );
  const orphans = allNarrative.filter((k) => !referenced.has(k));

  if (orphans.length > 0) {
    lines.push("## Orphaned Keys");
    lines.push("");
    lines.push(
      `These ${String(orphans.length)} \`demo_narrative_*\` keys exist in en.json but are not referenced by any section in the handbook taxonomy:`,
    );
    lines.push("");
    for (const k of orphans.sort()) {
      lines.push(`- \`${k}\`: ${msgs[k]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

try {
  const sectionSource = readFileSync(SECTIONS_TS, "utf-8");
  const msgs = JSON.parse(readFileSync(EN_JSON, "utf-8"));

  const sections = parseSections(sectionSource);
  if (sections.length === 0) {
    console.error("❌ No sections parsed from", SECTIONS_TS);
    process.exit(1);
  }

  const md = render(sections, msgs);
  writeFileSync(OUT_FILE, md, "utf-8");

  let totalSubs = 0;
  for (const s of sections) totalSubs += s.subs.length;

  console.log(`✅ Wrote ${OUT_FILE}`);
  console.log(
    `   ${String(sections.length)} sections, ${String(totalSubs)} sub-topics`,
  );

  const allNarrative = Object.keys(msgs).filter((k) =>
    k.startsWith("demo_narrative_"),
  );
  const referenced = new Set();
  referenced.add("demo_narrative_tip");
  for (const s of sections) {
    for (const sub of s.subs) {
      referenced.add(sub.headingKey);
      referenced.add(sub.bodyKey);
    }
  }
  const orphans = allNarrative.filter((k) => !referenced.has(k));
  if (orphans.length > 0) {
    console.log(
      `   ⚠️  ${String(orphans.length)} orphaned keys (in en.json but not in any section)`,
    );
  }
} catch (err) {
  console.error("❌", err.message);
  process.exit(1);
}
