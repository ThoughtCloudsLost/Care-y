/**
 * Health alias contract.
 *
 * Each entry maps a server module specifier to a browser-compatible shim
 * under src/health/server/. The vite config consumes this
 * list to wire Vite resolve.alias entries.
 *
 * Uses the same path-resolution helper style as packages/demo/vite.ts.
 */

import { fileURLToPath } from "node:url";

export interface HealthAlias {
  readonly find: string;
  readonly replacement: string;
}

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

/**
 * Server path prefix. Aliases target modules inside packages/server/src/
 * by matching the resolved absolute path prefix so Vite intercepts them
 * regardless of import style (relative, aliased, etc.).
 */
const serverSrc = resolve("../../../../server/src");

export const serverHealthAliases: readonly HealthAlias[] = [
  // M1: db/db.ts - PGlite-backed Kysely (db, tenantDb exports)
  // WHY: server db.ts creates a pg.Pool at module scope; browsers have no pg
  {
    find: `${serverSrc}/db/db`,
    replacement: resolve("./db-shim.ts"),
  },

  // M2: env.ts - hardcoded fake constants, NODE_ENV=production
  // WHY: getEnv() reads process.env and validates with zod; demo has no env
  {
    find: `${serverSrc}/env`,
    replacement: resolve("./env-shim.ts"),
  },

  // M3: crypto/sealed-box.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native (native addon, unbundleable)
  {
    find: `${serverSrc}/crypto/sealed-box`,
    replacement: resolve("./sealed-box-shim.ts"),
  },

  // M4: crypto/field-encryptor.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native + node:crypto hkdfSync/createHmac
  {
    find: `${serverSrc}/crypto/field-encryptor`,
    replacement: resolve("./field-encryptor-shim.ts"),
  },

  // M5: config/secrets.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native + node:crypto hkdfSync
  {
    find: `${serverSrc}/config/secrets`,
    replacement: resolve("./secrets-shim.ts"),
  },

  // M6a: branding/branding-crypto.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native for BLAKE2b and XChaCha20
  {
    find: `${serverSrc}/branding/branding-crypto`,
    replacement: resolve("./branding-crypto-shim.ts"),
  },

  // M6b: branding/branding-service.ts - replaces sodium_memzero
  // WHY: original does `import sodium from "sodium-native"` for memzero
  {
    find: `${serverSrc}/branding/branding-service`,
    replacement: resolve("./branding-service-shim.ts"),
  },

  // sodium-native (the package itself) - libsodium-wrappers-sumo bridge
  // WHY: migration 014 (and other reachable files) import sodium-native
  // directly; a package-level shim covers every importer at once.
  {
    find: "sodium-native",
    replacement: resolve("./sodium-native-shim.ts"),
  },

  // M7: node:crypto - WebCrypto + libsodium-wrappers-sumo shim
  // WHY: 18 server files use randomBytes/createHash/hkdfSync/scrypt/etc.
  {
    find: "node:crypto",
    replacement: resolve("./node-crypto-shim.ts"),
  },

  // M8: utils/intervals.ts - omits .unref() which throws in browsers
  // WHY: setInterval(...).unref() is Node-only; browser throws
  {
    find: `${serverSrc}/utils/intervals`,
    replacement: resolve("./intervals-shim.ts"),
  },

  // M9: db/schema-utils.ts - glob-based MigrationProvider
  // WHY: original uses FileMigrationProvider (fs-based, Node-only)
  {
    find: `${serverSrc}/db/schema-utils`,
    replacement: resolve("./schema-utils-shim.ts"),
  },

  // node:util - promisify is used by scrypt-hash.ts and salt-defense.ts
  // WHY: node:util is not available in browsers
  {
    find: "node:util",
    replacement: resolve("./node-util-shim.ts"),
  },

  // node:net - used by oprf-ipc.ts (IPC sockets)
  // WHY: not available in browsers; oprf evaluator is injected as a stub
  {
    find: "node:net",
    replacement: resolve("./node-net-shim.ts"),
  },

  // node:path - used by schema-utils.ts (but our shim replaces it)
  // and potentially by attachment-validator.ts
  // WHY: not available in browsers
  {
    find: "node:path",
    replacement: resolve("./node-path-shim.ts"),
  },

  // node:fs/promises - used by schema-utils.ts (replaced by glob shim)
  // and by blob store local (which we replace with Map)
  // WHY: not available in browsers
  {
    find: "node:fs/promises",
    replacement: resolve("./node-fs-shim.ts"),
  },

  // node:fs - used indirectly by some imports
  {
    find: "node:fs",
    replacement: resolve("./node-fs-shim.ts"),
  },
] as const;
