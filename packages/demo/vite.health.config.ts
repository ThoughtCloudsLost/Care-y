/**
 * Vite config for the health entry (health.html).
 *
 * Mirrors the main vite.config.ts structure (plugins, conditions,
 * fs.allow) but uses health.html as the sole entry and port 5199.
 *
 * Alias order is LOAD-BEARING (first match wins):
 *   1. Health-owned persisted-state shim (in-memory, kills the
 *      per-store stub treadmill)
 *   2. Health-owned tRPC shim (delegates to engine, not demo mock)
 *   3. Server health aliases (PGlite db, env, crypto shims, etc.)
 *   4. Demo aliases from vite.ts (reused via demoAliases), with
 *      the @care-y/crypto stub REMOVED (engine needs real WASM crypto)
 *   5. Node buffer polyfill mapping
 *
 * The persisted-state and tRPC shims must come BEFORE the demo
 * aliases because the demo's stub matchers and directory catch-alls
 * would otherwise intercept those specifiers first.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Alias, Plugin } from "vite";
import { demoAliases } from "./vite";
import { serverHealthAliases } from "./src/health/server/aliases.js";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

// -----------------------------------------------------------------------
// Health-owned aliases (must come FIRST)
// -----------------------------------------------------------------------

/**
 * Persisted-state shim: intercepts the $lib/stores/persisted-state.svelte
 * specifier (with .js and .ts extension variants) before the $lib
 * directory catch-all can resolve it to the real localStorage-backed
 * implementation. This single alias collapses every per-store stub
 * into a working in-memory primitive.
 */
const persistedStateAlias: Alias = {
  find: /^\$lib\/stores\/persisted-state\.svelte(\.js|\.ts)?$/,
  replacement: resolve("./src/health/client-shims/persisted-state.svelte.ts"),
};

/**
 * tRPC shim: intercepts $lib/trpc (with /index.js variant) before
 * the demo's own trpc stub. Routes components through the engine's
 * PGlite-backed caller instead of the fixture mock.
 */
const healthTrpcAlias: Alias = {
  find: /^\$lib\/trpc(\/index\.js)?$/,
  replacement: resolve("./src/health/client-shims/trpc.ts"),
};

// -----------------------------------------------------------------------
// Filter the demo aliases: remove the @care-y/crypto stub
// -----------------------------------------------------------------------

/**
 * The demo stubs @care-y/crypto with fail-loud shims because the demo
 * normally has no WASM crypto. The health needs real crypto for the
 * engine's sealed-box and field-encryptor shims, so we filter it out
 * by checking both the string find and the replacement path.
 */
function filterCryptoStub(aliases: Alias[]): Alias[] {
  return aliases.filter((alias) => {
    if (typeof alias.find === "string" && alias.find === "@care-y/crypto") {
      return false;
    }
    return true;
  });
}

// -----------------------------------------------------------------------
// Assemble the full alias list
// -----------------------------------------------------------------------

function buildAliases(): Alias[] {
  // Convert serverHealthAliases to Vite Alias format
  const serverAliases: Alias[] = serverHealthAliases.map((sa) => ({
    find: sa.find,
    replacement: sa.replacement,
  }));

  const demoBase = filterCryptoStub(demoAliases());

  return [
    // (1) Health-owned shims (must intercept before demo stubs)
    persistedStateAlias,
    healthTrpcAlias,
    // (2) Server health aliases (PGlite db, env, node:crypto, etc.)
    ...serverAliases,
    // (3) Demo aliases (minus @care-y/crypto stub)
    ...demoBase,
    // (4) Node buffer polyfill for server code that uses Buffer
    { find: "buffer", replacement: "buffer/" },
  ];
}

// -----------------------------------------------------------------------
// Server-module redirect plugin
// -----------------------------------------------------------------------

/**
 * Vite string aliases match import SPECIFIERS, not resolved paths, so an
 * absolute-path `find` never intercepts a server-internal relative import
 * like "../db/db.js". This plugin resolves relative imports to absolute
 * paths first, then redirects any path that matches the serverHealthAliases
 * table (extension-insensitive) to its shim. Bare-specifier entries
 * (node:crypto, sodium-native) stay in the alias list, which does handle
 * those correctly.
 */
function healthServerRedirect(): Plugin {
  const table = serverHealthAliases.filter((sa) => path.isAbsolute(sa.find));
  return {
    name: "health-server-redirect",
    enforce: "pre",
    resolveId(source, importer) {
      if (importer === undefined || !source.startsWith(".")) return null;
      const resolved = path.resolve(path.dirname(importer), source);
      const noExt = resolved.replace(/\.(?:js|ts)$/, "");
      for (const entry of table) {
        if (noExt === entry.find) return entry.replacement;
      }
      return null;
    },
  };
}

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------

export default defineConfig({
  plugins: [healthServerRedirect(), tailwindcss(), svelte()],
  base: process.env.BASE_PATH ?? "/",
  define: {
    // Production builds statically replace process.env with {}, so the
    // globals-init runtime polyfill cannot reach migration 014's key
    // read. Inline the OBVIOUSLY FAKE constant (same value globals-init
    // sets) at build time. Never put a real environment value here; the
    // env rule stands: fake constants only, and CI greps built assets
    // for real env variable names.
    "process.env.OPS_SECRETS_KEY": JSON.stringify("0f".repeat(32)),
  },
  resolve: {
    alias: buildAliases(),
    // Explicit browser conditions so server-side modules resolve
    // their browser-compatible exports.
    conditions: ["browser"],
  },
  build: {
    // Separate outDir so a health build never overwrites the demo's dist.
    outDir: "dist-health",
    rollupOptions: {
      input: {
        health: resolve("health.html"),
      },
    },
  },
  server: {
    port: 5199,
    strictPort: true,
    fs: {
      // Must include the demo root, client package (for route globs
      // and $lib resolution), and workspace root (pnpm store symlinks).
      allow: [".", "../client", "../server", "../crypto", "../shared", "../.."],
    },
  },
  optimizeDeps: {
    // PGlite bundles its own WASM; Vite's dep optimizer cannot handle it.
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
});
