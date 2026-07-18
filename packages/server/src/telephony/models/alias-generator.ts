/**
 * Client alias generator: produces "adjective-noun-number" aliases
 * like "calm-pebble-7" or "bright-cedar-42".
 *
 * Word lists are positive/neutral adjectives and nature-themed nouns.
 * With 80 adjectives, 80 nouns, and numbers 1-99, the keyspace is
 * roughly 633,000 combinations (minus blocked pairs). Callers must
 * handle collisions via retry (see client-repo.ts).
 */

import { randomInt } from "node:crypto";
import { InternalError } from "../../errors.js";

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

export function generateAlias(): string {
  for (let attempt = 0; attempt < MAX_REROLL_ATTEMPTS; attempt++) {
    const adj = pick(ADJECTIVES);
    const noun = pick(NOUNS);
    if (!isBlockedPair(adj, noun)) {
      const num = randomInt(1, 100);
      return `${adj}-${noun}-${String(num)}`;
    }
  }
  throw new InternalError(
    "Failed to generate alias: exceeded maximum re-roll attempts",
  );
}
