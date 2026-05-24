#!/usr/bin/env node

/**
 * Merges Vitest unit test coverage (Istanbul format) with Playwright E2E
 * coverage (raw V8 CDP format) into a unified report.
 *
 * Usage: node scripts/merge-coverage.mjs
 *
 * Inputs:
 *   coverage/coverage-final.json   - Vitest output (Istanbul format)
 *   coverage/e2e/raw/*.json        - Playwright CDP output (V8 ScriptCoverage[])
 *
 * Outputs:
 *   coverage/merged/               - text, html, lcov reports
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import v8toIstanbul from "v8-to-istanbul";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const ROOT = resolve(import.meta.dirname, "..");
const CLIENT_ROOT = join(ROOT, "packages", "client");
const VITEST_COVERAGE = join(ROOT, "coverage", "coverage-final.json");
const E2E_RAW_DIR = join(ROOT, "coverage", "e2e", "raw");
const MERGED_DIR = join(ROOT, "coverage", "merged");

const VITE_ORIGIN = "http://localhost:5174";

function mapUrlToPath(url) {
  if (!url.startsWith(VITE_ORIGIN)) return null;
  const pathname = new URL(url).pathname;
  if (!pathname.startsWith("/src/")) return null;
  if (pathname.includes("node_modules")) return null;

  // Vite may append query params for HMR (e.g. ?t=123456) which are stripped
  // by URL parsing above. pathname is clean.
  return join(CLIENT_ROOT, pathname);
}

async function processE2ECoverage(coverageMap) {
  if (!existsSync(E2E_RAW_DIR)) {
    console.log("  No E2E coverage directory found at", E2E_RAW_DIR);
    return 0;
  }

  const files = readdirSync(E2E_RAW_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("  No E2E coverage files found");
    return 0;
  }

  let converted = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = join(E2E_RAW_DIR, file);
    let entries;
    try {
      entries = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
      console.warn(`  Skipping malformed JSON: ${file}`);
      skipped++;
      continue;
    }

    for (const entry of entries) {
      const absPath = mapUrlToPath(entry.url);
      if (!absPath) continue;
      if (!existsSync(absPath)) {
        skipped++;
        continue;
      }

      try {
        const converter = v8toIstanbul(absPath, 0, {
          source: entry.source,
        });
        await converter.load();
        converter.applyCoverage(entry.functions);
        const istanbulData = converter.toIstanbul();
        coverageMap.merge(istanbulData);
        converter.destroy();
        converted++;
      } catch {
        skipped++;
      }
    }
  }

  return { converted, skipped, files: files.length };
}

async function main() {
  console.log("Merging coverage reports...\n");

  const hasVitest = existsSync(VITEST_COVERAGE);
  const hasE2E = existsSync(E2E_RAW_DIR);

  if (!hasVitest && !hasE2E) {
    console.error(
      "No coverage data found. Run unit tests (--coverage) and/or E2E tests first.",
    );
    process.exit(1);
  }

  const coverageMap = libCoverage.createCoverageMap();

  // 1. Load Vitest coverage
  if (hasVitest) {
    try {
      const vitestData = JSON.parse(readFileSync(VITEST_COVERAGE, "utf-8"));
      coverageMap.merge(vitestData);
      const fileCount = Object.keys(vitestData).length;
      console.log(`  Vitest: ${String(fileCount)} files loaded`);
    } catch {
      console.warn("  Failed to parse Vitest coverage, skipping");
    }
  } else {
    console.log("  Vitest: no coverage-final.json found (skipping)");
  }

  // 2. Process E2E coverage
  console.log("  Processing E2E coverage...");
  const e2eResult = await processE2ECoverage(coverageMap);
  if (typeof e2eResult === "object") {
    console.log(
      `  E2E: ${String(e2eResult.converted)} entries converted from ${String(e2eResult.files)} files` +
        (e2eResult.skipped > 0 ? `, ${String(e2eResult.skipped)} skipped` : ""),
    );
  }

  // 3. Generate reports
  console.log("\nGenerating reports...");

  const context = libReport.createContext({
    dir: MERGED_DIR,
    coverageMap,
    defaultSummarizer: "nested",
    watermarks: libReport.getDefaultWatermarks(),
  });

  for (const reporter of ["text", "html", "lcov"]) {
    reports.create(reporter).execute(context);
  }

  console.log(`\nReports written to ${MERGED_DIR}/`);

  // 4. Print summary
  const summary = coverageMap.getCoverageSummary();
  console.log("\n--- Merged Coverage Summary ---");
  console.log(`  Statements: ${String(summary.statements.pct)}%`);
  console.log(`  Branches:   ${String(summary.branches.pct)}%`);
  console.log(`  Functions:  ${String(summary.functions.pct)}%`);
  console.log(`  Lines:      ${String(summary.lines.pct)}%`);
}

main().catch((err) => {
  console.error("Merge failed:", err);
  process.exit(1);
});
