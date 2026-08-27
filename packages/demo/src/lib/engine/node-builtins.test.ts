/**
 * Every Node builtin that server code imports as a value must either be
 * aliased to a browser shim, or live in a module the demo never loads.
 *
 * The failure this prevents used to be quiet, and is now loud: Vite fails
 * the demo build when first-party source imports an unaliased builtin.
 * This test is the faster half of that signal. It runs in milliseconds and
 * names the file, where the build takes two minutes and only runs in the
 * gate.
 *
 * Type-only imports are ignored. They are erased before the bundler sees
 * them, so `import type { IncomingMessage } from "node:http"` is free.
 *
 * Sources come from import.meta.glob rather than fs so the test reads what
 * Vite resolves, with no directory walking and no path handling.
 */

import { describe, it, expect } from "vitest";

// Both arrays, because the node:* shims live in serverHealthAliases while
// demoAliases carries the stub and directory mappings. Reading one and not
// the other reports every correctly-aliased builtin as a violation.
import { demoAliases, serverHealthAliases } from "../../../vite.js";

const SERVER_SOURCES: Record<string, string> = import.meta.glob(
  "../../../../server/src/**/*.ts",
  { query: "?raw", import: "default", eager: true },
);

/**
 * Modules the demo never loads, with the reason. A builtin may go
 * unaliased only if every value import of it lives in one of these.
 *
 * Adding an entry claims the demo cannot reach the file. Check that
 * against the engine's import graph before trusting it.
 */
const NOT_REACHABLE_FROM_DEMO: Readonly<Record<string, string>> = {
  "index.ts": "HTTP server entry point; the demo builds the router directly",
  "test-utils.ts": "test helper, never imported by engine or router code",
};

/** Strip the glob prefix so keys read as paths under server/src. */
function toRelativePath(globKey: string): string {
  return globKey.replace("../../../../server/src/", "");
}

function isCheckable(relativePath: string): boolean {
  if (relativePath.endsWith(".test.ts")) return false;
  if (relativePath.endsWith(".d.ts")) return false;
  return !(relativePath in NOT_REACHABLE_FROM_DEMO);
}

/**
 * Find value imports of node: builtins in a source file.
 *
 * Splits on statement boundaries and matches each piece separately, which
 * keeps every pattern linear. An earlier single regex over the whole file
 * needed a lazy `[\s\S]*?` between two `\s+` groups and tripped
 * security/detect-unsafe-regex.
 */
function findNodeValueImports(source: string): string[] {
  const found: string[] = [];
  for (const statement of source.split(";")) {
    const trimmed = statement.trim();
    if (!trimmed.startsWith("import")) continue;
    // Type-only imports never reach the bundler.
    if (/^import\s+type\s/.test(trimmed)) continue;
    const match = /from\s+"(node:[a-z/]+)"$/.exec(trimmed);
    if (match?.[1] === undefined) continue;
    found.push(match[1]);
  }
  return found;
}

describe("node builtin coverage for the demo bundle", () => {
  const aliasedSpecifiers = new Set(
    [
      ...serverHealthAliases.map((alias) => alias.find),
      ...demoAliases().map((alias) => alias.find),
    ]
      .filter((find): find is string => typeof find === "string")
      .filter((find) => find.startsWith("node:")),
  );

  it("reads a non-empty alias list", () => {
    // Guards the guard: reading the wrong array silently makes every
    // builtin look unaliased, which is how the first version of this test
    // reported forty false violations.
    expect(aliasedSpecifiers.size).toBeGreaterThan(0);
  });

  it("sees the server sources", () => {
    // An empty glob would make the coverage assertion below vacuous.
    expect(Object.keys(SERVER_SOURCES).length).toBeGreaterThan(100);
  });

  it("aliases every node builtin that reachable server code imports", () => {
    const offenders: string[] = [];

    for (const [globKey, source] of Object.entries(SERVER_SOURCES)) {
      const relativePath = toRelativePath(globKey);
      if (!isCheckable(relativePath)) continue;

      for (const specifier of findNodeValueImports(source)) {
        if (aliasedSpecifiers.has(specifier)) continue;
        offenders.push(`${relativePath} imports ${specifier}`);
      }
    }

    // A hit means one of two things: alias the builtin in vite.ts, or use
    // the global (Buffer, as the rest of the server package does). Adding
    // to NOT_REACHABLE_FROM_DEMO is only honest when the demo genuinely
    // cannot load the file.
    expect(offenders).toEqual([]);
  });

  it("keeps the unreachable list honest", () => {
    // An entry naming a file that no longer exists is a stale excuse that
    // would silently widen the exemption if the path came back.
    const known = new Set(Object.keys(SERVER_SOURCES).map(toRelativePath));
    for (const relativePath of Object.keys(NOT_REACHABLE_FROM_DEMO)) {
      expect(known).toContain(relativePath);
    }
  });
});
