/**
 * Shared alias and plugin exports for the demo package.
 *
 * demoAliases() returns a Vite resolve.alias array used by the
 * demo's own vite.config.ts.
 *
 * serverHealthAliases and serverRedirectPlugin() map server module
 * specifiers to browser-compatible shims under src/lib/engine/server/.
 * The vite.config.ts consumes them to wire resolve.alias entries.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Alias, Plugin } from "vite";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

// -----------------------------------------------------------------------
// Server health aliases
// -----------------------------------------------------------------------

export interface HealthAlias {
  readonly find: string;
  readonly replacement: string;
}

/**
 * Server path prefix. Aliases target modules inside packages/server/src/
 * by matching the resolved absolute path prefix so Vite intercepts them
 * regardless of import style (relative, aliased, etc.).
 */
const serverSrc = resolve("../server/src");

/** Shim directory. All server shims live under src/lib/engine/server/. */
const shimDir = "./src/lib/engine/server";

export const serverHealthAliases: readonly HealthAlias[] = [
  // M1: db/db.ts - PGlite-backed Kysely (db, tenantDb exports)
  // WHY: server db.ts creates a pg.Pool at module scope; browsers have no pg
  {
    find: `${serverSrc}/db/db`,
    replacement: resolve(`${shimDir}/db-shim.ts`),
  },

  // M2: env.ts - hardcoded fake constants, NODE_ENV=production
  // WHY: getEnv() reads process.env and validates with zod; demo has no env
  {
    find: `${serverSrc}/env`,
    replacement: resolve(`${shimDir}/env-shim.ts`),
  },

  // M3: crypto/sealed-box.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native (native addon, unbundleable)
  {
    find: `${serverSrc}/crypto/sealed-box`,
    replacement: resolve(`${shimDir}/sealed-box-shim.ts`),
  },

  // M4: crypto/field-encryptor.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native + node:crypto hkdfSync/createHmac
  {
    find: `${serverSrc}/crypto/field-encryptor`,
    replacement: resolve(`${shimDir}/field-encryptor-shim.ts`),
  },

  // M5: config/secrets.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native + node:crypto hkdfSync
  {
    find: `${serverSrc}/config/secrets`,
    replacement: resolve(`${shimDir}/secrets-shim.ts`),
  },

  // M6a: branding/branding-crypto.ts - libsodium-wrappers-sumo port
  // WHY: original imports sodium-native for BLAKE2b and XChaCha20
  {
    find: `${serverSrc}/branding/branding-crypto`,
    replacement: resolve(`${shimDir}/branding-crypto-shim.ts`),
  },

  // M6b: branding/branding-service.ts - replaces sodium_memzero
  // WHY: original does `import sodium from "sodium-native"` for memzero
  {
    find: `${serverSrc}/branding/branding-service`,
    replacement: resolve(`${shimDir}/branding-service-shim.ts`),
  },

  // sodium-native (the package itself) - libsodium-wrappers-sumo bridge
  // WHY: migration 014 (and other reachable files) import sodium-native
  // directly; a package-level shim covers every importer at once.
  {
    find: "sodium-native",
    replacement: resolve(`${shimDir}/sodium-native-shim.ts`),
  },

  // M7: node:crypto - WebCrypto + libsodium-wrappers-sumo shim
  // WHY: 18 server files use randomBytes/createHash/hkdfSync/scrypt/etc.
  {
    find: "node:crypto",
    replacement: resolve(`${shimDir}/node-crypto-shim.ts`),
  },

  // M8: utils/intervals.ts - omits .unref() which throws in browsers
  // WHY: setInterval(...).unref() is Node-only; browser throws
  {
    find: `${serverSrc}/utils/intervals`,
    replacement: resolve(`${shimDir}/intervals-shim.ts`),
  },

  // M9: db/schema-utils.ts - glob-based MigrationProvider
  // WHY: original uses FileMigrationProvider (fs-based, Node-only)
  {
    find: `${serverSrc}/db/schema-utils`,
    replacement: resolve(`${shimDir}/schema-utils-shim.ts`),
  },

  // node:util - promisify is used by scrypt-hash.ts and salt-defense.ts
  // WHY: node:util is not available in browsers
  {
    find: "node:util",
    replacement: resolve(`${shimDir}/node-util-shim.ts`),
  },

  // node:net - used by oprf-ipc.ts (IPC sockets)
  // WHY: not available in browsers; oprf evaluator is injected as a stub
  {
    find: "node:net",
    replacement: resolve(`${shimDir}/node-net-shim.ts`),
  },

  // node:path - used by schema-utils.ts (but our shim replaces it)
  // and potentially by attachment-validator.ts
  // WHY: not available in browsers
  {
    find: "node:path",
    replacement: resolve(`${shimDir}/node-path-shim.ts`),
  },

  // node:fs/promises - used by schema-utils.ts (replaced by glob shim)
  // and by blob store local (which we replace with Map)
  // WHY: not available in browsers
  {
    find: "node:fs/promises",
    replacement: resolve(`${shimDir}/node-fs-shim.ts`),
  },

  // node:fs - used indirectly by some imports
  {
    find: "node:fs",
    replacement: resolve(`${shimDir}/node-fs-shim.ts`),
  },
] as const;

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
export function serverRedirectPlugin(): Plugin {
  const table = serverHealthAliases.filter((sa) => path.isAbsolute(sa.find));
  return {
    name: "care-y-server-redirect",
    enforce: "pre",
    resolveId(source, importer): string | null {
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
// Demo aliases
// -----------------------------------------------------------------------

// Client code imports these modules with explicit extensions
// ("$lib/trpc/index.js", "$lib/crypto/context.js"), which a plain string
// alias never matches (string aliases match only the bare id or a
// "/"-delimited subpath). Each stub therefore uses an anchored regex
// covering both the bare and the extensioned form. The context regex is
// anchored so "$lib/crypto/context-init.js" stays on the real module.
const stubMatchers: [RegExp, string][] = [
  [/^\$lib\/trpc(\/index\.js)?$/, "./src/stubs/trpc.ts"],
  [/^\$lib\/crypto\/context(\.js)?$/, "./src/stubs/crypto-context.svelte.ts"],
  [
    /^\$lib\/terminology\/context(\.js)?$/,
    "./src/stubs/terminology-context.svelte.ts",
  ],
  [/^\$lib\/stores\/theme\.svelte(\.js|\.ts)?$/, "./src/stubs/theme.svelte.ts"],
  [
    /^\$lib\/stores\/saved-filters\.svelte(\.js|\.ts)?$/,
    "./src/stubs/saved-filters.svelte.ts",
  ],
  [/^\$lib\/paraglide\/runtime(\.js)?$/, "./src/stubs/paraglide-runtime.ts"],
  [/^\$lib\/auth\/login-crypto(\.js)?$/, "./src/stubs/login-crypto.ts"],
  [/^\$lib\/shell\/navigation(\.js)?$/, "./src/stubs/shell-navigation.ts"],
  [/^\$lib\/utils\/format-time(\.js)?$/, "./src/stubs/format-time.ts"],
];

// Exact-id aliases (no extensioned import forms exist for these).
const exactPairs: [string, string][] = [
  ["$app/environment", "./src/stubs/app-environment.ts"],
  ["$app/navigation", "./src/stubs/app-navigation.ts"],
  ["$app/paths", "./src/stubs/app-paths.ts"],
  ["$app/state", "./src/stubs/app-state.svelte.ts"],
];

// Directory catch-alls. Order is load-bearing: these MUST come after the
// stub matchers so that e.g. $lib/crypto/context.js resolves to the stub,
// not to ../client/src/lib/crypto/context.js.
const dirPairs: [string, string][] = [
  ["$lib", "../client/src/lib"],
  ["$routes", "../client/src/routes"],
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

/**
 * Inject the production splash into phone.html at serve/build time.
 *
 * Production paints #splash from static markup in the client's app.html
 * before any JS loads. The phone iframe must do the same: a component-
 * rendered splash appears only after the whole dev module graph loads,
 * leaving seconds of white. Extracting from app.html here (instead of
 * hand-copying) keeps the demo from drifting when the splash changes.
 * DemoSplash.svelte still owns dismissal via the body.hydrated class.
 */
export function demoSplashPlugin(): Plugin {
  const appHtmlPath = resolve("../client/src/app.html");

  return {
    name: "care-y-demo-splash",
    transformIndexHtml: {
      order: "pre",
      handler(html: string, ctx: { filename: string }): string {
        if (!ctx.filename.endsWith("phone.html")) return html;

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time constant derived from import.meta.url, no user input
        const appHtml = readFileSync(appHtmlPath, "utf8");

        // Extract the blocking scheme script that reads localStorage
        // "care-y-color-scheme" and applies theme classes before first
        // paint. Strip the nonce attribute (the demo has no CSP).
        const schemeScriptMatch =
          /<script[^>]*>[\s\S]*?care-y-color-scheme[\s\S]*?<\/script>/.exec(
            appHtml,
          );
        const schemeScript =
          schemeScriptMatch !== null
            ? schemeScriptMatch[0]
                .replace(/ nonce="[^"]*"/, "")
                .replace(/ nonce='[^']*'/, "")
            : "";

        // Every style block that targets #splash, with the SvelteKit
        // nonce template attribute stripped (the demo has no CSP nonce).
        const styles = [...appHtml.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)]
          .map((match) => match[0])
          .filter((block) => block.includes("#splash"))
          .map((block) => block.replace(/<style[^>]*>/, "<style>"))
          .join("\n");

        // The splash div is flat (img + span), so a non-greedy match
        // ends at the correct closing tag.
        const markup = /<div id="splash"[\s\S]*?<\/div>/.exec(appHtml)?.[0];
        if (markup === undefined) return html;

        // Inject scheme script before splash markup so first paint
        // follows the stored scheme (set by outer page via localStorage).
        return html.replace(
          "<body>",
          `<body>\n${schemeScript}\n${styles}\n${markup}`,
        );
      },
    },
  };
}

// -----------------------------------------------------------------------
// Client static assets (fonts + app icon)
// -----------------------------------------------------------------------

/**
 * Serve the client's static fonts and app icon at their production
 * paths. The phone iframe renders the real app CSS, whose @font-face
 * rules point at absolute /fonts/ URLs that SvelteKit serves from
 * packages/client/static in the product; without this the phone falls
 * back to system fonts (and the dev server answers the .woff2 request
 * with the SPA's index.html). Dev serves the files straight from the
 * client package; builds emit them into dist at the same paths.
 */
export function clientStaticAssetsPlugin(): Plugin {
  const staticDir = resolve("../client/static/");
  const iconFile = "icon-192.png";

  function contentTypeFor(file: string): string {
    if (file.endsWith(".woff2")) return "font/woff2";
    if (file.endsWith(".png")) return "image/png";
    if (file.endsWith(".txt")) return "text/plain; charset=utf-8";
    return "application/octet-stream";
  }

  return {
    name: "care-y-demo-client-static",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0] ?? "";
        if (!(url.startsWith("/fonts/") || url === `/${iconFile}`)) {
          next();
          return;
        }
        const file = path.resolve(staticDir, url.slice(1));
        // Containment check: the resolved path must stay inside the
        // client static dir (rejects traversal segments in the URL).
        if (!file.startsWith(path.resolve(staticDir) + path.sep)) {
          next();
          return;
        }
        let body: Buffer;
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- containment-checked above, read-only static asset
          body = readFileSync(file);
        } catch {
          next();
          return;
        }
        res.setHeader("Content-Type", contentTypeFor(file));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.end(body);
      });
    },
    generateBundle() {
      const fontsDir = path.join(staticDir, "fonts");
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time constant path
      for (const name of readdirSync(fontsDir)) {
        if (!name.endsWith(".woff2")) continue;
        this.emitFile({
          type: "asset",
          fileName: `fonts/${name}`,
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time constant dir listing
          source: readFileSync(path.join(fontsDir, name)),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: iconFile,
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time constant path
        source: readFileSync(path.join(staticDir, iconFile)),
      });
    },
  };
}
