#!/usr/bin/env node
/**
 * Compares the edited prose audit file against the canonical message
 * catalog and reports which keys were changed.
 *
 * Reads docs/demo-handbook-prose-audit.md, pairs each prose block with
 * its <!-- key --> comment, and diffs the text against en.json. Outputs
 * a JSON array of { key, original, edited } objects to stdout, one per
 * changed key.
 *
 * Intended for piping into an agent prompt or script that syncs edits
 * back to en.json.
 *
 * Exit 0 when changes exist, 1 on error, 2 when nothing changed.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const AUDIT_FILE = resolve(ROOT, "docs/demo-handbook-prose-audit.md");
const EN_JSON = resolve(ROOT, "packages/shared/messages/en.json");

// -----------------------------------------------------------------------
// Parse the audit markdown into key/prose pairs
// -----------------------------------------------------------------------

function parseAudit(md) {
  const entries = new Map();
  const lines = md.split("\n");

  // Walk lines backwards from each <!-- key --> comment to collect the
  // prose block above it. A prose block is every non-empty, non-heading,
  // non-comment line between the previous structural marker and the
  // comment.
  for (let i = 0; i < lines.length; i++) {
    const commentMatch = lines[i].match(/^<!--\s+(\S+)\s+-->$/);
    if (!commentMatch) continue;

    const key = commentMatch[1];
    // Skip section-level structural comments like "section: login | ..."
    if (key.startsWith("section:")) continue;

    // Heading keys: the text is on the ### line immediately above.
    // Body/desc keys: the prose block between the previous structural
    // marker and this comment.
    if (key.endsWith("_heading")) {
      for (let j = i - 1; j >= 0; j--) {
        const line = lines[j].trim();
        if (line === "") continue;
        if (line.startsWith("###")) {
          entries.set(key, line.replace(/^#{2,}\s+/, ""));
          break;
        }
        break;
      }
      continue;
    }

    // Collect prose lines upward until we hit a heading, another comment,
    // a horizontal rule, or the blockquote tip marker.
    const proseLines = [];
    for (let j = i - 1; j >= 0; j--) {
      const line = lines[j];
      if (line.startsWith("##")) break;
      if (line.startsWith("<!--")) break;
      if (line === "---") break;
      if (line.startsWith("> ")) break;
      proseLines.unshift(line);
    }

    // Trim leading/trailing empty lines
    while (proseLines.length > 0 && proseLines[0].trim() === "") {
      proseLines.shift();
    }
    while (
      proseLines.length > 0 &&
      proseLines[proseLines.length - 1].trim() === ""
    ) {
      proseLines.pop();
    }

    const prose = proseLines.join("\n");
    if (prose.length > 0) {
      entries.set(key, prose);
    }
  }

  return entries;
}

// -----------------------------------------------------------------------
// Handle heading keys: the audit renders numbered headings like
// "### 1. Language selection" but en.json stores just "Language selection".
// Strip the "N. " prefix for comparison, and report the stripped form
// as the edit.
// -----------------------------------------------------------------------

function stripNumbering(text) {
  return text.replace(/^\d+\.\s+/, "");
}

// -----------------------------------------------------------------------
// Diff against en.json
// -----------------------------------------------------------------------

function diffEntries(auditEntries, msgs) {
  const changes = [];

  for (const [key, editedRaw] of auditEntries) {
    const original = msgs[key];
    if (original === undefined) {
      changes.push({ key, original: null, edited: editedRaw, status: "added" });
      continue;
    }

    // Heading keys get their numbering stripped before comparison
    const isHeading = key.endsWith("_heading");
    const edited = isHeading ? stripNumbering(editedRaw) : editedRaw;

    // Normalize whitespace for comparison: the audit file may have
    // slightly different line breaks than the JSON value.
    const normOriginal = original.replace(/\r\n/g, "\n").trim();
    const normEdited = edited.replace(/\r\n/g, "\n").trim();

    if (normOriginal !== normEdited) {
      changes.push({
        key,
        original: normOriginal,
        edited: normEdited,
        status: "changed",
      });
    }
  }

  return changes;
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

try {
  const md = readFileSync(AUDIT_FILE, "utf-8");
  const msgs = JSON.parse(readFileSync(EN_JSON, "utf-8"));

  const auditEntries = parseAudit(md);
  const changes = diffEntries(auditEntries, msgs);

  if (changes.length === 0) {
    console.error("No changes detected.");
    process.exit(2);
  }

  console.log(JSON.stringify(changes, null, 2));
  console.error(`${String(changes.length)} key(s) changed.`);
} catch (err) {
  console.error("❌", err.message);
  process.exit(1);
}
