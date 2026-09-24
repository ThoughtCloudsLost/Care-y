#!/usr/bin/env node
/**
 * Flags handbook prose that describes a rendering instead of a behavior.
 *
 * Why this exists: the entry template says an entry states what a feature
 * does and what it protects, never how the screen looks. That rule was in
 * the template from the start and the first pilot pass still shipped five
 * violations past a human review, because the sentences read as
 * documentation. "The pills look alike whether the work happens on the
 * server or in the browser" is a fact about a rendering wearing the voice
 * of a fact about a system.
 *
 * The check is lexical and deliberately noisy. It cannot tell "the tab
 * strip stops naming the organization" (a real threat-model fact about
 * what an onlooker sees) from "a control sits in the top bar" (layout
 * narration), so it flags both and a human decides. Treating it as a gate
 * would teach whoever hits a false positive to reword around the matcher
 * rather than think about the sentence, so it reports and exits 0.
 *
 * Contract:
 *   Input   none. Reads the catalogs relative to the repo root, so CI and
 *           a local run behave identically. An optional directory argument
 *           overrides the root for fixture runs.
 *   Output  `key: term` plus the offending sentence, grouped by catalog,
 *           on stdout. A summary count on stderr.
 *   Exit    0 always. Hits do not fail the run. 2 when a catalog cannot
 *           be read or parsed.
 *
 * Exit 2 matters for the same reason it does in check-handbook-refs: a
 * parse failure must never look like a clean sweep.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = process.argv[2]
  ? resolve(process.argv[2])
  : join(SCRIPT_DIR, "../../..");

const CATALOGS = [
  ["en", join(REPO_ROOT, "packages/shared/messages/en.json")],
  ["es", join(REPO_ROOT, "packages/shared/messages/es.json")],
];

/**
 * Each entry is [pattern, why]. The why is printed beside the hit so a
 * reviewer knows what to look at rather than guessing what tripped.
 */
const PATTERNS = {
  en: [
    [/\b(?:top|bottom) bar\b/i, "position: name the surface, not the bar"],
    [/\b(?:above|below) the fold\b/i, "position: say what is loaded"],
    [/\bat the (?:top|bottom)\b/i, "position: say what the ordering means"],
    [/\bpinn?(?:ed|ing|s) (?:itself )?to the top\b/i, "position"],
    [/\b(?:left|right)(?:[- ]hand)? side of the\b/i, "position"],
    [/\bin the corner\b/i, "position"],
    [/\b(?:beside|next to) it\b/i, "position"],
    [/\blooks? (?:like|alike)\b/i, "appearance"],
    [/\blook alike\b/i, "appearance"],
    [/\bdisappears?\b/i, "appearance: say what state is gone"],
    [/\bgrey(?:ed|s) out\b/i, "appearance: say what is unavailable"],
    [/\bicon with\b/i, "appearance"],
    [/\bon screen\b|\bonscreen\b/i, "appearance"],
    [/\bquietly\b/i, "adverb doing a fact's work"],
    [/\bsimply\b|\bjust\b/i, "adverb: minimises rather than states"],
    [/\bneatly\b|\bcleanly\b|\belegantly\b/i, "adverb: editorialising"],
    [/\bconveniently\b|\bhelpfully\b/i, "adverb: editorialising"],
  ],
  es: [
    [/\bbarra (?:superior|inferior)\b/i, "position"],
    [/\bparte (?:superior|inferior) de la\b/i, "position"],
    [/\bal lado\b|\bjunto a (?:él|ella)\b/i, "position"],
    [/\bse parecen?\b/i, "appearance"],
    [/\bdesaparecen?\b/i, "appearance: say what state is gone"],
    [/\bsilenciosamente\b|\bdiscretamente\b/i, "adverb doing a fact's work"],
    [/\bsimplemente\b/i, "adverb: minimises rather than states"],
  ],
};

/** Markup the reader never sees, stripped so it cannot trip a matcher. */
function stripMarkup(text) {
  return text
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/\[([^\]]*)\]\(#[^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, "")
    .replace(/\*\*/g, "");
}

/** Split on sentence ends, keeping enough context to judge a hit. */
function sentences(text) {
  return text
    .split("\n")
    .flatMap((line) => line.split(/(?<=[.:])\s+(?=[A-ZÁÉÍÓÚÑ¿«])/u))
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadCatalog(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    process.stderr.write(`could not read ${path}: ${cause.message}\n`);
    process.exit(2);
  }
}

let total = 0;

for (const [lang, path] of CATALOGS) {
  const catalog = loadCatalog(path);
  const hits = [];

  for (const [key, value] of Object.entries(catalog)) {
    if (!key.startsWith("demo_narrative_") || typeof value !== "string") {
      continue;
    }
    for (const sentence of sentences(stripMarkup(value))) {
      for (const [pattern, why] of PATTERNS[lang]) {
        const match = sentence.match(pattern);
        if (match) hits.push({ key, term: match[0], why, sentence });
      }
    }
  }

  process.stdout.write(`\n## ${lang} (${hits.length})\n\n`);
  for (const hit of hits) {
    process.stdout.write(`${hit.key}\n`);
    process.stdout.write(`  ${hit.term}  (${hit.why})\n`);
    process.stdout.write(`  ${hit.sentence}\n\n`);
  }
  total += hits.length;
}

process.stderr.write(
  `${total} sentences to review. Every hit needs a human decision: ` +
    `some describe what an onlooker sees, which is a real fact.\n`,
);
