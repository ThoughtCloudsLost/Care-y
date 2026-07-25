/**
 * Shared alias and plugin exports for the demo package.
 *
 * demoAliases() returns a Vite resolve.alias array used directly by
 * the demo's own vite.config.ts. demoResolvePlugin() wraps the same
 * mapping as an enforce-pre resolveId plugin for future SvelteKit
 * consumers (care-y.com) where Vite's alias array is prepended by
 * the SvelteKit plugin and cannot shadow $lib.
 */
import { fileURLToPath } from "node:url";
import type { Alias, Plugin } from "vite";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

// Client code imports these modules with explicit extensions
// ("$lib/trpc/index.js", "$lib/crypto/context.js"), which a plain string
// alias never matches (string aliases match only the bare id or a
// "/"-delimited subpath). Each stub therefore uses an anchored regex
// covering both the bare and the extensioned form. The context regex is
// anchored so "$lib/crypto/context-init.js" stays on the real module.
const stubMatchers: [RegExp, string][] = [
  [/^\$lib\/trpc(\/index\.js)?$/, "./src/stubs/trpc.ts"],
  [/^\$lib\/tickets\/queries(\.js)?$/, "./src/stubs/queries.ts"],
  [/^\$lib\/crypto\/context(\.js)?$/, "./src/stubs/crypto-context.ts"],
  [
    /^\$lib\/terminology\/context(\.js)?$/,
    "./src/stubs/terminology-context.svelte.ts",
  ],
];

// Exact-id aliases (no extensioned import forms exist for these).
const exactPairs: [string, string][] = [
  ["@care-y/crypto", "./src/stubs/care-y-crypto.ts"],
  ["$app/environment", "./src/stubs/app-environment.ts"],
  ["$app/navigation", "./src/stubs/app-navigation.ts"],
  ["$app/paths", "./src/stubs/app-paths.ts"],
  ["$app/state", "./src/stubs/app-state.ts"],
];

// Directory catch-alls. Order is load-bearing: these MUST come after the
// stub matchers so that e.g. $lib/crypto/context.js resolves to the stub,
// not to ../client/src/lib/crypto/context.js.
const dirPairs: [string, string][] = [
  ["$lib", "../client/src/lib"],
  ["$demo", "./src/lib"],
];

export function demoAliases(): Alias[] {
  return [
    ...stubMatchers.map(([find, relative]): Alias => ({
      find,
      replacement: resolve(relative),
    })),
    ...exactPairs.map(([find, relative]): Alias => ({
      find,
      replacement: resolve(relative),
    })),
    ...dirPairs.map(([find, relative]): Alias => ({
      find,
      replacement: resolve(relative),
    })),
  ];
}

export function demoResolvePlugin(): Plugin {
  const exact = new Map(
    exactPairs.map(([find, relative]) => [find, resolve(relative)]),
  );
  const dirs = dirPairs.map(
    ([prefix, relative]) => [prefix, resolve(relative)] as const,
  );

  return {
    name: "care-y-demo-resolve",
    enforce: "pre",
    async resolveId(source: string, importer: string | undefined) {
      // Stub matchers and exact ids map to real files on disk; return
      // the target directly.
      for (const [pattern, relative] of stubMatchers) {
        if (pattern.test(source)) return resolve(relative);
      }
      const exactHit = exact.get(source);
      if (exactHit !== undefined) return exactHit;

      // Directory rewrites keep the remainder (often a ".js" specifier
      // for an on-disk ".ts" file), so delegate back to the resolver
      // chain for extension substitution instead of returning the raw
      // rewritten path.
      for (const [prefix, target] of dirs) {
        if (source === prefix || source.startsWith(prefix + "/")) {
          const rewritten = target + source.slice(prefix.length);
          const resolved = await this.resolve(rewritten, importer, {
            skipSelf: true,
          });
          return resolved ?? rewritten;
        }
      }

      return undefined;
    },
  };
}
