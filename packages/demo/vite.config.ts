import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Alias } from "vite";
import {
  demoAliases,
  demoSplashPlugin,
  serverHealthAliases,
  serverRedirectPlugin,
} from "./vite";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

const isMobile = process.env.VITE_MOBILE === "true";

// Device testing over Tailscale (scripts/dev-network.js) serves https
// with the client package's mkcert certs, matching the client's
// dev:mobile setup. Without the certs the server falls back to http.
function httpsConfig(): { cert: Buffer; key: Buffer } | undefined {
  const certPath = resolve("../client/.certs/localhost.pem");
  const keyPath = resolve("../client/.certs/localhost-key.pem");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time cert paths from known relative locations, not user input
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time cert paths from known relative locations, not user input
    return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
  }
  console.warn(
    "mkcert certs not found in packages/client/.certs; serving http",
  );
  return undefined;
}

const https = isMobile ? httpsConfig() : undefined;

// -----------------------------------------------------------------------
// Alias assembly
// -----------------------------------------------------------------------

/**
 * Persisted-state in-memory shim: intercepts the
 * $lib/stores/persisted-state.svelte specifier (with .js and .ts extension
 * variants) before the $lib directory catch-all can resolve it to the real
 * localStorage-backed implementation. This single alias collapses every
 * per-store stub into a working in-memory primitive.
 */
const persistedStateAlias: Alias = {
  find: /^\$lib\/stores\/persisted-state\.svelte(\.js|\.ts)?$/,
  replacement: resolve(
    "./src/lib/engine/client-shims/persisted-state.svelte.ts",
  ),
};

function buildAliases(): Alias[] {
  // Server health aliases (PGlite db, env, node:crypto, etc.)
  const serverAliases: Alias[] = serverHealthAliases.map((sa) => ({
    find: sa.find,
    replacement: sa.replacement,
  }));

  // Demo aliases (real WASM crypto; no @care-y/crypto stub to filter)
  const demoBase = demoAliases();

  return [
    // (1) Persisted-state shim (must intercept before $lib catch-all)
    persistedStateAlias,
    // (2) Server health aliases
    ...serverAliases,
    // (3) Demo aliases
    ...demoBase,
    // (4) Node buffer polyfill for server code that uses Buffer
    { find: "buffer", replacement: "buffer/" },
  ];
}

export default defineConfig({
  plugins: [
    serverRedirectPlugin(),
    tailwindcss(),
    svelte(),
    demoSplashPlugin(),
  ],
  base: process.env.BASE_PATH ?? "/",
  define: {
    // Production builds statically replace process.env with {}, so the
    // globals-init runtime polyfill cannot reach migration 014's key
    // read. Inline the OBVIOUSLY FAKE constant at build time.
    "process.env.OPS_SECRETS_KEY": JSON.stringify("0f".repeat(32)),
  },
  resolve: {
    alias: buildAliases(),
    // Explicit browser conditions so server-side modules resolve
    // their browser-compatible exports.
    conditions: ["browser"],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        phone: resolve("phone.html"),
        health: resolve("health.html"),
      },
    },
  },
  server: {
    ...(https !== undefined ? { https } : {}),
    fs: {
      // Must include the demo root, client package (for route globs
      // and $lib resolution), server/crypto/shared (for engine imports),
      // and workspace root (pnpm store symlinks).
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
