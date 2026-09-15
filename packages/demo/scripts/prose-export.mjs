#!/usr/bin/env node
/**
 * Exports the demo handbook narration to a flat reviewable text file.
 *
 * English only, by design: the review surface is read by someone who does
 * not read Spanish, so mixing the catalogs would bury the half that gets
 * reviewed. The Spanish twins are audited for structural parity by the
 * batch loop and for fluency by its own pass.
 *
 * Every entry carries its section and its key, and any entry whose text
 * differs from the last commit is marked, so a reader can find the
 * uncommitted rework without diffing JSON. Ordering follows en.json, which
 * is how the previous hand-built exports were ordered.
 *
 * Usage: node packages/demo/scripts/prose-export.mjs [outfile]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const CATALOG = "packages/shared/messages/en.json";
const SECTIONS_SRC = resolve(
  repoRoot,
  "packages/demo/src/lib/scroll-sections.ts",
);
const args = process.argv.slice(2);
const force = args.includes("--force");
const outFile =
  args.find((a) => !a.startsWith("--")) ??
  resolve(repoRoot, "packages/demo/prose-audit.txt");

/**
 * First line of every generated export. The guard below refuses to write
 * over a file that does not start with it, because these exports live
 * beside hand-assembled ones that are untracked and therefore
 * unrecoverable: one clobbered a historical baseline before this check
 * existed. Pass --force to overwrite anyway.
 */
const BANNER = "# Demo Handbook Prose";

function refuseToClobber(path) {
  if (!existsSync(path)) return;
  if (force) return;
  const firstLine = readFileSync(path, "utf8").split("\n", 1)[0];
  if (firstLine === BANNER) return;
  process.stderr.write(
    `Refusing to overwrite ${path}: it was not written by this script, so\n` +
      `it may be a hand-assembled export with no copy anywhere. Move it\n` +
      `aside, choose another output path, or pass --force.\n`,
  );
  process.exit(1);
}

/**
 * Sections whose entries have been through the full rework loop (writer,
 * accuracy verification against product source, standards audit, revision).
 * Maintained by hand alongside the checklist in handbook-rework-plan.md,
 * because the plan's prose is the authority and parsing it would invent a
 * second one. Everything else marked in the export is either a scattered
 * wave-0 accuracy correction or a pre-pivot draft still awaiting its batch.
 */
const REWORKED_SECTIONS = new Set([
  "login",
  "schedule",
  "client-intake",
  "client-privacy",
]);

/** Body and description keys, in catalog order. Headings fold into them. */
function isEntryKey(key) {
  const isDemoProse =
    key.startsWith("demo_narrative_") || key.startsWith("demo_section_");
  return isDemoProse && !key.endsWith("_heading") && !key.endsWith("_title");
}

/** The heading that titles an entry, or null when the key has none. */
function headingFor(key, catalog) {
  const candidates = [
    key.replace(/_body\d*$/, "_heading"),
    key.replace(/_desc$/, "_title"),
  ];
  for (const c of candidates) {
    if (c !== key && catalog[c] !== undefined) return catalog[c];
  }
  return null;
}

/**
 * Maps each entry key to the handbook section that renders it, by walking
 * scroll-sections.ts and attributing every bodyKey/descKey to the most
 * recent `id:`. The taxonomy is a frozen literal, so reading it beats
 * importing the module and dragging in the whole engine.
 */
function readSectionIndex() {
  const src = readFileSync(SECTIONS_SRC, "utf8");
  const index = new Map();
  let current = null;
  for (const line of src.split("\n")) {
    const section = /^\s*id:\s*"([a-z-]+)",\s*$/.exec(line);
    if (section) current = section[1];
    const key = /(?:bodyKey|descKey):\s*"([a-z0-9_]+)"/.exec(line);
    if (key && current !== null) index.set(key[1], current);
  }
  return index;
}

/** The catalog as of HEAD, or null outside a git checkout. */
function readCommittedCatalog() {
  try {
    const raw = execFileSync("git", ["show", `HEAD:${CATALOG}`], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

refuseToClobber(outFile);

const catalog = JSON.parse(readFileSync(resolve(repoRoot, CATALOG), "utf8"));
const committed = readCommittedCatalog();
const sections = readSectionIndex();

const keys = Object.keys(catalog).filter(isEntryKey);
const changed = new Set();
const added = new Set();
if (committed !== null) {
  for (const key of keys) {
    if (committed[key] === undefined) added.add(key);
    else if (committed[key] !== catalog[key]) changed.add(key);
  }
}

const bySection = new Map();
for (const key of keys) {
  if (!changed.has(key) && !added.has(key)) continue;
  const section = sections.get(key) ?? "unsectioned";
  bySection.set(section, (bySection.get(section) ?? 0) + 1);
}

const rule = "=".repeat(60);
const lines = [];

lines.push(BANNER);
lines.push("#");
lines.push(
  "# Current working-tree text, English only. Headings fold in as the",
);
lines.push("# ## title above their body. Generated by packages/demo/scripts/");
lines.push("# prose-export.mjs; regenerate rather than editing by hand.");
lines.push("#");
if (committed === null) {
  lines.push("# No git checkout found, so nothing is marked as changed.");
} else {
  lines.push(
    `# ${String(changed.size + added.size)} of ${String(keys.length)} entries differ from the last commit and are`,
  );
  lines.push(
    "# marked CHANGED or NEW. Everything unmarked is already committed",
  );
  lines.push("# and was approved in an earlier wave.");
  lines.push("#");
  lines.push(
    "# A section marked REWORKED has been through the full loop and is",
  );
  lines.push(
    "# ready to read closely. The rest are wave-0 accuracy corrections or",
  );
  lines.push(
    "# pre-pivot drafts still waiting for their batch, so their remaining",
  );
  lines.push("# findings are already filed and do not need reporting again.");
  lines.push("#");
  lines.push("# Uncommitted entries by section:");
  for (const [section, count] of [...bySection].sort((a, b) => b[1] - a[1])) {
    const status = REWORKED_SECTIONS.has(section) ? "  REWORKED" : "";
    lines.push(
      `#   ${section.padEnd(18)} ${String(count).padStart(2)}${status}`,
    );
  }
}
lines.push("");

for (const key of keys) {
  const heading = headingFor(key, catalog);
  lines.push(rule);
  lines.push(`## ${heading ?? `(${key})`}`);
  if (added.has(key)) lines.push("** NEW - not in the last commit **");
  else if (changed.has(key)) lines.push("** CHANGED - uncommitted **");
  lines.push("");
  lines.push(catalog[key]);
  lines.push("");
  lines.push(
    `  [section: ${sections.get(key) ?? "unsectioned"}]  [key: ${key}]`,
  );
  lines.push("");
}

writeFileSync(outFile, lines.join("\n"), "utf8");
process.stdout.write(
  `${String(keys.length)} entries -> ${outFile}\n` +
    (committed === null
      ? "no git comparison\n"
      : `${String(changed.size)} changed, ${String(added.size)} new\n`),
);
