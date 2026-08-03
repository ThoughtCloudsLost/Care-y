/**
 * Client alias generator: produces "adjective-noun-number" aliases
 * like "calm-pebble-40217" or "bright-cedar-3".
 *
 * Word lists are positive/neutral adjectives and nature-themed nouns.
 * The numeric suffix is drawn from a per-org PostgreSQL sequence so
 * generated aliases cannot repeat within an org. Blocked adjective-noun
 * pairs trigger a re-roll of the word pair only; the suffix is always
 * unique.
 */

import { randomInt } from "node:crypto";
import { InternalError } from "../../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../../db/types.js";
import { sql } from "kysely";

export const ADJECTIVES = [
  "bright",
  "calm",
  "clear",
  "cool",
  "crisp",
  "dawn",
  "deep",
  "fair",
  "firm",
  "fleet",
  "fresh",
  "full",
  "glad",
  "green",
  "hale",
  "keen",
  "kind",
  "lush",
  "mild",
  "neat",
  "new",
  "pale",
  "plain",
  "pure",
  "quick",
  "rare",
  "rich",
  "ripe",
  "safe",
  "sage",
  "slow",
  "soft",
  "sound",
  "spry",
  "still",
  "sure",
  "sweet",
  "tame",
  "tidy",
  "true",
  "vast",
  "warm",
  "wide",
  "wild",
  "wise",
  "young",
  "azure",
  "coral",
  "dusky",
  "early",
  "even",
  "faint",
  "gentle",
  "hardy",
  "humble",
  "ivory",
  "jolly",
  "light",
  "lucid",
  "merry",
  "noble",
  "opal",
  "open",
  "plush",
  "proud",
  "quiet",
  "rosy",
  "round",
  "sandy",
  "serene",
  "silver",
  "smooth",
  "snowy",
  "solar",
  "steady",
  "stone",
  "sunny",
  "swift",
  "teal",
  "vivid",
] as const;

export const NOUNS = [
  "acorn",
  "aspen",
  "birch",
  "bloom",
  "brook",
  "cedar",
  "cliff",
  "cloud",
  "coast",
  "coral",
  "cove",
  "creek",
  "dew",
  "dove",
  "dune",
  "elm",
  "ember",
  "fawn",
  "fern",
  "field",
  "finch",
  "flame",
  "flint",
  "frost",
  "glade",
  "glen",
  "grove",
  "haven",
  "hawk",
  "hazel",
  "heath",
  "heron",
  "hill",
  "holly",
  "iris",
  "jade",
  "lake",
  "lark",
  "leaf",
  "lily",
  "linden",
  "maple",
  "marsh",
  "meadow",
  "mist",
  "moon",
  "moss",
  "oak",
  "opal",
  "orchid",
  "otter",
  "pebble",
  "pine",
  "pond",
  "quail",
  "rain",
  "reed",
  "ridge",
  "river",
  "robin",
  "rose",
  "sage",
  "shore",
  "slate",
  "snow",
  "spark",
  "spring",
  "star",
  "stone",
  "storm",
  "stream",
  "summit",
  "thistle",
  "thorn",
  "tide",
  "vale",
  "violet",
  "wren",
  "willow",
  "wind",
] as const;

// Adjective-noun pairs that produce unfortunate readings (drug slang,
// bodily function innuendo, etc.). Checked during generation; blocked
// pairs trigger a re-roll.
export const BLOCKED_PAIRS: ReadonlySet<string> = new Set([
  "cool-snow",
  "deep-snow",
  "fresh-snow",
  "full-moon",
  "pure-snow",
  "snowy-frost",
  "still-stone",
  "stone-sage",
  "warm-dew",
  "warm-rain",
  "warm-stream",
]);

const MAX_REROLL_ATTEMPTS = 100;

function pick(arr: readonly string[]): string {
  const item = arr[randomInt(arr.length)];
  if (item === undefined) {
    throw new InternalError("randomInt produced out-of-bounds index");
  }
  return item;
}

export function isBlockedPair(adjective: string, noun: string): boolean {
  return BLOCKED_PAIRS.has(`${adjective}-${noun}`);
}

/**
 * Draws the next value from the per-org client_alias_seq sequence.
 * The sequence lives in the tenant schema, so withSchema's search_path
 * resolves it to the correct org.
 */
async function nextAliasSuffix(db: Kysely<TenantDatabase>): Promise<number> {
  const result = await sql<{
    nextval: string;
  }>`SELECT nextval('client_alias_seq')`.execute(db);
  const row = result.rows[0];
  if (!row) {
    throw new InternalError("client_alias_seq returned no rows");
  }
  return Number(row.nextval);
}

/**
 * Generate a unique alias using the per-org sequence.
 * The suffix is drawn from a PostgreSQL sequence so no two generated
 * aliases can collide within an org.
 */
export async function generateAlias(
  db: Kysely<TenantDatabase>,
): Promise<string> {
  const suffix = await nextAliasSuffix(db);

  for (let attempt = 0; attempt < MAX_REROLL_ATTEMPTS; attempt++) {
    const adj = pick(ADJECTIVES);
    const noun = pick(NOUNS);
    if (!isBlockedPair(adj, noun)) {
      return `${adj}-${noun}-${String(suffix)}`;
    }
  }
  throw new InternalError(
    "Failed to generate alias: exceeded maximum re-roll attempts",
  );
}
