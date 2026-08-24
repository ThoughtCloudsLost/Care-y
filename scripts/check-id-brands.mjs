#!/usr/bin/env node
/**
 * Fails when an identifier column in the database type definitions is typed as
 * a bare `string` instead of a branded identifier type.
 *
 * Why this exists: four shipped defects came from two semantically different
 * values sharing one primitive type (an org UUID and an `org_<uuid>` schema
 * name; a provider SID and an E.164 number; base64 and base64url). Branding the
 * column types makes a mismatched query a compile error, because Kysely derives
 * a `.where()` value type from the column it references. That only holds while
 * every identifier column stays branded, so this check is what stops a new
 * table arriving next month with `client_id: string`.
 *
 * The rule is deliberately mechanical. "Every identifier column is branded" can
 * be checked; "the confusable ones are branded" needs a judgement call, and
 * that judgement is exactly what was made wrong four times.
 *
 * Contract:
 *   Input   none. Reads the real types file relative to the repo root, so
 *           pre-commit and CI invoke it identically with no arguments.
 *           An optional path argument overrides the target; it exists so the
 *           guard itself can be exercised against a fixture, because a check
 *           nobody has watched fail is not known to work.
 *   Output  offending `Table.column: type` lines on stderr.
 *   Exit    0 clean, 1 violations found, 2 the file could not be read or parsed.
 *
 * Exit 2 matters: a parse failure must never look like a pass, or a refactor
 * that reshapes the file silently disables the guard.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TYPES_FILE = join(REPO_ROOT, "packages/server/src/db/types.ts");
const TYPES_FILE = process.argv[2]
  ? resolve(process.argv[2])
  : DEFAULT_TYPES_FILE;

/**
 * The wire boundary, checked second.
 *
 * Branding the columns only pays off if the values reaching them are branded
 * too, and tRPC inputs are where they enter. A new route schema declaring an
 * identifier as bare `z.uuid()` produces a plain string that then has to be
 * cast or parsed somewhere downstream, which is how the column-layer guarantee
 * gets quietly hollowed out. Adding a schema is also far more common than
 * adding a table, so this is the likelier regression of the two.
 *
 * Opt out on a specific line with a trailing `// not-an-id: <reason>` comment,
 * for the genuine cases: correlation tokens, client-side record ids, and
 * anything that is a uuid without identifying a database row.
 */
const SCHEMA_DIR = join(REPO_ROOT, "packages/shared/src/schemas");
const BARE_UUID = /\bz\s*\.\s*uuid\s*\(\s*\)/;
const NOT_AN_ID = /\/\/\s*not-an-id:/;

/** Repo-relative when the target is inside the repo, absolute when it is not. */
function displayPath(p) {
  const rel = relative(REPO_ROOT, p);
  return rel.startsWith("..") ? p : rel;
}

/**
 * Column names that must carry a brand.
 *
 * The `_id` / `_hash` / `_sid` suffixes are the obvious cases. The rest of this
 * pattern exists because a first pass using only those missed ten foreign keys
 * named for the ROLE they play rather than for what they hold: `assigned_to`,
 * `created_by`, `added_by`, `invited_by`, `resolved_by`, `merged_into`. Those
 * are still foreign keys and a swap there is still silent, so any rule that
 * matches on `_id` alone gives false confidence.
 *
 *   *_by / *_to / *_into   foreign keys named for a relationship
 *   *_ids                  arrays of foreign keys
 *   token / *_token        bearer credentials, distinct from the row id
 *   *_role                 role thresholds, compared against a user's role id
 *   blob_key / *_blob_key  storage keys, interchangeable and non-obvious
 *   key_generation         cross-table crypto-shred match key
 *   hashed_ip              a keyed digest that fits no suffix
 */
const IDENTIFIER_COLUMN =
  /^(id|token|blob_key|key_generation|hashed_ip|[a-z0-9_]+_(id|ids|hash|sid|token|by|to|into|role|blob_key))$/;

/**
 * Columns that must be branded despite not matching the pattern above. The org
 * identity columns are the origin of the defect class and are named for what
 * they are rather than for any role.
 */
const ALSO_REQUIRED = new Set(["OrgsTable.schema_name", "OrgsTable.slug"]);

/**
 * Pattern-matching columns that are allowed to stay unbranded, each with the
 * reason. Kept here rather than as a silent skip so an exemption is something
 * a reviewer sees in a diff.
 *
 * Integer primary keys need no entry: a type with no `string` in it is not a
 * stringly-typed identifier and is skipped structurally.
 */
const EXEMPT = new Map([
  // (none yet - add as `["XxxTable.column", "why"]`)
]);

/** Strip wrappers and nullability so `Generated<TicketId> | null` reduces to `TicketId`. */
function unwrap(type) {
  let t = type.trim();
  let previous;
  do {
    previous = t;
    t = t
      .replace(/^Generated<(.*)>$/s, "$1")
      .replace(/^ColumnType<([^,]*),.*>$/s, "$1")
      .replace(/\|\s*null/g, "")
      .replace(/\|\s*undefined/g, "")
      .trim();
  } while (t !== previous);
  return t;
}

/**
 * Returns offending `file:line` entries for bare `z.uuid()` in wire schemas,
 * or null when the directory cannot be read (treated as a parse failure by the
 * caller rather than a pass).
 */
function checkWireSchemas() {
  let entries;
  try {
    entries = readdirSync(SCHEMA_DIR).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
    );
  } catch {
    return null;
  }
  if (entries.length === 0) return null;

  const found = [];
  for (const entry of entries) {
    const path = join(SCHEMA_DIR, entry);
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      return null;
    }
    text.split("\n").forEach((line, i) => {
      if (BARE_UUID.test(line) && !NOT_AN_ID.test(line)) {
        found.push(`${entry}:${String(i + 1)}  ${line.trim()}`);
      }
    });
  }
  return found;
}

function main() {
  let source;
  try {
    source = readFileSync(TYPES_FILE, "utf8");
  } catch (err) {
    process.stderr.write(
      `check-id-brands: cannot read ${displayPath(TYPES_FILE)}: ${err.message}\n`,
    );
    return 2;
  }

  const interfaces = [...source.matchAll(/export interface (\w+Table)\s*\{/g)];
  if (interfaces.length === 0) {
    process.stderr.write(
      "check-id-brands: no table interfaces found. The file shape changed, so this check is no longer meaningful. Update the parser rather than deleting the check.\n",
    );
    return 2;
  }

  const violations = [];
  const usedExemptions = new Set();

  for (const match of interfaces) {
    const tableName = match[1];
    const bodyStart = match.index + match[0].length;
    const bodyEnd = source.indexOf("\n}", bodyStart);
    if (bodyEnd === -1) {
      process.stderr.write(
        `check-id-brands: unterminated interface ${tableName}.\n`,
      );
      return 2;
    }

    for (const line of source.slice(bodyStart, bodyEnd).split("\n")) {
      const field = /^\s*(\w+)\??:\s*(.+?);/.exec(line);
      if (!field) continue;

      const [, column, rawType] = field;
      const qualified = `${tableName}.${column}`;

      const required =
        IDENTIFIER_COLUMN.test(column) || ALSO_REQUIRED.has(qualified);
      if (!required) continue;

      if (EXEMPT.has(qualified)) {
        usedExemptions.add(qualified);
        continue;
      }

      // A type with no `string` in it is not a stringly-typed identifier.
      // Integer primary keys land here and pass without needing an exemption.
      if (!/\bstring\b/.test(rawType)) continue;

      if (unwrap(rawType) === "string") {
        violations.push(`${qualified}: ${rawType.trim()}`);
      }
    }
  }

  // A stale exemption is a small lie that grows. Surface it, but do not fail on
  // it: the column may simply have been deleted, which is not a regression.
  for (const [qualified, reason] of EXEMPT) {
    if (!usedExemptions.has(qualified)) {
      process.stderr.write(
        `check-id-brands: exemption for ${qualified} (${reason}) no longer matches any column. Remove it.\n`,
      );
    }
  }

  if (violations.length > 0) {
    process.stderr.write(
      `check-id-brands: ${violations.length} identifier column(s) typed as bare string in ${displayPath(TYPES_FILE)}:\n\n`,
    );
    for (const v of violations) process.stderr.write(`  ${v}\n`);
    process.stderr.write(
      "\nGive each one a branded type from packages/shared/src/ids.ts. A foreign key takes the brand of the primary key it references, never a brand of its own. If a column genuinely is not an identifier, add it to EXEMPT in this script with a reason.\n",
    );
    return 1;
  }

  // Only check the wire boundary when running against the real types file.
  // A fixture run is exercising the column parser, not the whole repo.
  if (TYPES_FILE !== DEFAULT_TYPES_FILE) return 0;

  const bareUuids = checkWireSchemas();
  if (bareUuids === null) {
    process.stderr.write(
      "check-id-brands: could not read packages/shared/src/schemas. The layout changed, so the wire-boundary check is no longer meaningful. Update this script rather than deleting the check.\n",
    );
    return 2;
  }

  if (bareUuids.length > 0) {
    process.stderr.write(
      `check-id-brands: ${bareUuids.length} bare z.uuid() in wire schemas:\n\n`,
    );
    for (const u of bareUuids) process.stderr.write(`  ${u}\n`);
    process.stderr.write(
      "\nUse the branded schema for the identifier instead (ticketIdSchema, userIdSchema, orgIdSchema, ...). A bare z.uuid() produces a plain string, which then needs a cast or a parse further down and undoes the column branding. If the field is a uuid but does not identify a database row (a correlation token, a client-side record id), add a trailing `// not-an-id: <reason>` comment on that line.\n",
    );
    return 1;
  }

  return 0;
}

process.exit(main());
