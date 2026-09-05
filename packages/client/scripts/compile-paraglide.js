import { compile } from "@inlang/paraglide-js";
import * as fs from "node:fs";
import { existsSync } from "node:fs";

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
  outdir: "./src/lib/paraglide",
  strategy: ["cookie", "preferredLanguage", "baseLocale"],
  emitGitIgnore: true,
  emitPrettierIgnore: false,
  emitReadme: false,
  emitTsDeclarations: true,
  fs: retryingFs,
});

if (!existsSync("src/lib/paraglide/messages/_index.js")) {
  console.error(
    "paraglide compile lost src/lib/paraglide/messages/_index.js; " +
      "check kernel file-table pressure (sysctl kern.num_files)",
  );
  process.exit(1);
}
