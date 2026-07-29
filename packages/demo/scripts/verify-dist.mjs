// Verifies the built demo dist for leaked env variable names, dev-gated
// procedure keys, dev router wiring, and engine isolation. Run after
// "pnpm --filter @care-y/demo run build" completes.
//
// Exit 0: all checks pass.
// Exit 1: at least one violation found (message printed to stderr).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..", "..");
const DIST = resolve(import.meta.dirname, "..", "dist");
const ENV_TS = join(ROOT, "packages", "server", "src", "env.ts");

const failures = [];
const passed = [];

function fail(check, message) {
  failures.push(`[${check}] ${message}`);
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

// Recursively collect files under dir matching the extension filter.
function collectFiles(dir, ext) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

// Recursively collect all files (no filter).
function collectAllFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

// -------------------------------------------------------------------------
// Check A: env variable names must not appear in dist JS.
// The server env.ts schema declares every environment variable the server
// expects. If those names leak into the client bundle they reveal the
// server's configuration surface, which aids reconnaissance.
// -------------------------------------------------------------------------

const envSource = readFileSync(ENV_TS, "utf-8");

// Each schema key appears as an indented uppercase identifier followed by a
// colon, like "  DATABASE_URL: z.string()".
const keyRegex = /^\s+([A-Z][A-Z0-9_]+)\s*:/gm;
const envKeys = [];
let m;
while ((m = keyRegex.exec(envSource)) !== null) {
  envKeys.push(m[1]);
}

// NODE_ENV is ubiquitous (bundlers, libraries) and not a secret name.
const excluded = new Set(["NODE_ENV"]);
const scanKeys = envKeys.filter((k) => !excluded.has(k));

// A refactored env.ts that lost most of its keys would silently skip the
// check. Require at least 15 names so that scenario fails loud.
if (envKeys.length < 15) {
  fail(
    "A",
    `Derived only ${envKeys.length} env key names from env.ts (expected at least 15). ` +
      "The extraction regex may need updating after an env.ts refactor.",
  );
}

const distJsFiles = collectFiles(DIST, ".js");

for (const name of scanKeys) {
  for (const file of distJsFiles) {
    const content = readFileSync(file, "utf-8");
    let idx = -1;
    while ((idx = content.indexOf(name, idx + 1)) !== -1) {
      // OPS_SECRETS_KEY legitimately appears in two benign contexts inside
      // the engine chunk: (1) the fake-key runtime polyfill that injects a
      // known-fake hex constant, identified by the surrounding string
      // FAKE_OPS_KEY_HEX; (2) crypto validation error messages that assert
      // key length, identified by the phrase "must be exactly". Any other
      // occurrence would mean a real env var name leaked into client code.
      if (name === "OPS_SECRETS_KEY") {
        const windowStart = Math.max(0, idx - 200);
        const windowEnd = Math.min(content.length, idx + name.length + 200);
        const window = content.slice(windowStart, windowEnd);
        if (
          window.includes("FAKE_OPS_KEY_HEX") ||
          window.includes("must be exactly")
        ) {
          continue;
        }
      }
      const relPath = file.slice(DIST.length + 1);
      fail("A", `Env variable name "${name}" found in dist file ${relPath}.`);
      break;
    }
  }
}

if (!failures.some((f) => f.startsWith("[A]"))) {
  passed.push("A: no server env variable names leaked into dist JS");
}

// -------------------------------------------------------------------------
// Check B: dev-gated procedure keys must be statically absent.
// The server's development-only seed procedures (devSeedTickets, devSeedKb,
// devSeedOrgKey) are guarded by NODE_ENV === "development". The demo env
// module inlines NODE_ENV as "production", so the bundler should dead-code
// eliminate them. If those procedure keys appear as object keys in the
// bundle, it means the dead-code elimination failed and the dev router is
// still wired in.
// -------------------------------------------------------------------------

const devProcedures = ["devSeedTickets", "devSeedKb", "devSeedOrgKey"];

// Match object-key forms like {"devSeedTickets": or ,devSeedTickets: which
// indicate the key is registered in a router or procedure map. A health
// proof may contain the quoted string "devSeedTickets" followed by " in"
// (a membership check); the colon requirement avoids that false positive.
const devKeyPatterns = devProcedures.map(
  (name) => new RegExp(`[,{]"?${name}"?\\s*:`, "g"),
);

for (const file of distJsFiles) {
  const content = readFileSync(file, "utf-8");
  for (let i = 0; i < devProcedures.length; i++) {
    if (devKeyPatterns[i].test(content)) {
      const relPath = file.slice(DIST.length + 1);
      fail(
        "B",
        `Dev procedure key "${devProcedures[i]}" found as object key in ${relPath}. ` +
          "Dead-code elimination may have failed.",
      );
    }
    // Reset lastIndex after test() on a global regex.
    devKeyPatterns[i].lastIndex = 0;
  }
}

if (!failures.some((f) => f.startsWith("[B]"))) {
  passed.push("B: dev-gated procedure keys are absent from dist JS");
}

// -------------------------------------------------------------------------
// Check C: devDeps wiring in demo source.
// The demo engine module pins devDeps to undefined so that the dev router
// construction is dead code. If a source file sets devDeps to anything else
// (or imports it dynamically), the guard breaks. This check scans the demo
// source directory, not dist, because the dead-code removal makes a dist
// grep unreliable.
// -------------------------------------------------------------------------

const demoSrc = resolve(import.meta.dirname, "..", "src");
const srcFiles = collectAllFiles(demoSrc);

for (const file of srcFiles) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    if (!line.includes("devDeps")) continue;

    // Allowed: the literal assignment that pins devDeps to undefined.
    if (/devDeps\s*:\s*undefined/.test(line)) continue;

    // Allowed: comment lines (single-line // comments).
    if (/^\s*\/\//.test(line)) continue;

    const relPath = file.slice(demoSrc.length + 1);
    fail(
      "C",
      `Unexpected devDeps reference at ${relPath}:${lineNum + 1}. ` +
        "Every occurrence must be either 'devDeps: undefined' or a comment.",
    );
  }
}

if (!failures.some((f) => f.startsWith("[C]"))) {
  passed.push("C: devDeps is only set to undefined in demo source");
}

// -------------------------------------------------------------------------
// Check D: engine (pglite) must not be on phone.html's initial load path.
// phone.html is the demo phone iframe entry whose resting state is the
// login screen, which needs no database. The engine loads through a
// dynamic import so its bytes stay off the critical path. If any script
// or preload referenced by phone.html contains "pglite", the engine is
// back on the initial load path.
// -------------------------------------------------------------------------

const phoneHtml = join(DIST, "phone.html");

if (existsSync(phoneHtml)) {
  const html = readFileSync(phoneHtml, "utf-8");

  // Collect asset URLs from script[src], link[rel=modulepreload], and
  // link[rel=stylesheet].
  const assetUrlPattern =
    /(?:<script[^>]+src="([^"]+)")|(?:<link[^>]+href="([^"]+)")/g;
  const assetUrls = [];
  let am;
  while ((am = assetUrlPattern.exec(html)) !== null) {
    const url = am[1] || am[2];
    if (url) assetUrls.push(url);
  }

  let engineOnLoadPath = false;
  for (const url of assetUrls) {
    // Strip leading slash to resolve against dist.
    const assetPath = join(DIST, url.replace(/^\//, ""));
    if (!existsSync(assetPath) || !assetPath.endsWith(".js")) continue;
    const content = readFileSync(assetPath, "utf-8");
    if (/pglite/i.test(content)) {
      const relPath = assetPath.slice(DIST.length + 1);
      fail(
        "D",
        `phone.html references ${relPath}, which contains "pglite". ` +
          "The engine chunk should not be on the login page's initial load path.",
      );
      engineOnLoadPath = true;
    }
  }

  if (!engineOnLoadPath) {
    passed.push("D: engine (pglite) is not on phone.html's initial load path");
  }
} else {
  // A dist without phone.html means the build shape changed underneath
  // this script; fail loud rather than silently skipping the check.
  fail("D", "phone.html not found in dist.");
}

// -------------------------------------------------------------------------
// Summary
// -------------------------------------------------------------------------

if (passed.length > 0) {
  console.log("Passed:");
  for (const p of passed) {
    console.log(`  ${p}`);
  }
}

if (failures.length > 0) {
  console.error("\nFailed:");
  for (const f of failures) {
    console.error(`  ${f}`);
  }
  process.exit(1);
} else {
  console.log("\nAll demo dist checks passed.");
}
