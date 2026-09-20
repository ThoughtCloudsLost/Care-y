import { compile } from "@inlang/paraglide-js";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import { existsSync, globSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Generate the en-XA pseudolocale from en.json before compiling.
// The import runs the script as a side effect.
const __scriptDir = dirname(fileURLToPath(import.meta.url));
execSync(
  `node ${resolve(__scriptDir, "generate-pseudolocale.js")} ${resolve(__scriptDir, "../messages")}`,
  { stdio: "inherit" },
);

// Paraglide's writeOutput collects file writes with Promise.allSettled and
// never inspects the rejections, so under kernel file-table pressure
// (ENFILE/EMFILE, seen when several TS language servers watch the ~4k
// generated message modules) it silently drops output files and reports
// success. Retry those two codes at the fs layer and verify the barrel
// index landed, so a compile either succeeds completely or fails loud.
const RETRIABLE = new Set(["ENFILE", "EMFILE"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function withRetry(fn) {
  return async (...args) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fn(...args);
      } catch (err) {
        if (!RETRIABLE.has(err?.code) || attempt >= 400) throw err;
        await sleep(25 + Math.min(attempt * 5, 200));
      }
    }
  };
}

const retryingPromises = new Proxy(fs.promises, {
  get(target, prop) {
    const value = Reflect.get(target, prop);
    return typeof value === "function" ? withRetry(value.bind(target)) : value;
  },
});

const retryingFs = new Proxy(fs, {
  get(target, prop) {
    if (prop === "promises") return retryingPromises;
    const value = Reflect.get(target, prop);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

await compile({
  project: "./project.inlang",
  outdir: "./src/paraglide",
  strategy: ["cookie", "baseLocale"],
  emitGitIgnore: false,
  emitPrettierIgnore: false,
  emitReadme: false,
  emitTsDeclarations: true,
  fs: retryingFs,
});

if (!existsSync("src/paraglide/messages/_index.js")) {
  console.error(
    "paraglide compile lost src/paraglide/messages/_index.js; " +
      "check kernel file-table pressure (sysctl kern.num_files)",
  );
  process.exit(1);
}

// emitTsDeclarations leaves the messages barrel and per-key modules
// without declaration files, and the compile removes any that existed,
// so server-side imports of the compiled JS fail the next clean
// tsc --build. Regenerate the full declaration set from the JSDoc so a
// compile always leaves the workspace buildable.
for (const file of globSync("src/paraglide/messages/*.d.ts")) {
  rmSync(file, { force: true });
}
rmSync("src/paraglide/messages.d.ts", { force: true });
execSync(
  "pnpm exec tsc src/paraglide/messages.js src/paraglide/messages/_index.js" +
    " --allowJs --declaration --emitDeclarationOnly --skipLibCheck" +
    " --target es2022 --module nodenext",
  { stdio: "inherit" },
);
