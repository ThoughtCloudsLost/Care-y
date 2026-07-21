#!/usr/bin/env node

/**
 * Merges all coverage sources into a unified report:
 *   - Host vitest (client, shared, crypto)
 *   - Docker vitest (server)
 *   - Playwright E2E (raw V8 CDP)
 *
 * Usage: node scripts/merge-coverage.mjs
 *
 * Inputs:
 *   coverage/coverage-final.json   - Host vitest output (Istanbul format)
 *   coverage/server/coverage-final.json - Server vitest from Docker (copied via docker compose cp)
 *   coverage/e2e/raw/*.json        - Playwright CDP output (V8 ScriptCoverage[])
 *
 * Outputs:
 *   coverage/merged/               - text, html, lcov reports
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import v8toIstanbul from "v8-to-istanbul";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const ROOT = resolve(import.meta.dirname, "..");
const CLIENT_ROOT = join(ROOT, "packages", "client");
const VITEST_COVERAGE = join(ROOT, "coverage", "coverage-final.json");
const SERVER_COVERAGE = join(ROOT, "coverage", "server", "coverage-final.json");
const E2E_RAW_DIR = join(ROOT, "coverage", "e2e", "raw");
const MERGED_DIR = join(ROOT, "coverage", "merged");

const DOCKER_APP_ROOT = "/app";

const VITE_ORIGIN = "http://localhost:5174";

function remapDockerPaths(istanbulData) {
  const remapped = {};
  for (const [dockerPath, fileCov] of Object.entries(istanbulData)) {
    if (!dockerPath.startsWith(DOCKER_APP_ROOT)) continue;
    const relativePath = dockerPath.slice(DOCKER_APP_ROOT.length + 1);
    const hostPath = join(ROOT, relativePath);
    remapped[hostPath] = { ...fileCov, path: hostPath };
  }
  return remapped;
}

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

function applyDarkTheme(cssPath) {
  if (!existsSync(cssPath)) return;
  const darkCSS = `
/* Dark theme override */
@media (prefers-color-scheme: dark) {
  body { background: #1a1a2e; color: #d4d4d8; }
  a { color: #60a5fa; }
  .quiet { color: #a1a1aa; }
  .fraction { background: #2d2d3f; color: #a1a1aa; }
  div.path a:link, div.path a:visited { color: #d4d4d8; }
  .coverage-summary tr { border-bottom-color: #3f3f50; }
  .keyline-all { border-color: #3f3f50; }
  .coverage-summary tbody { border-color: #3f3f50; }
  .coverage-summary td { border-right-color: #3f3f50; }
  .coverage-summary th { color: #a1a1aa; }

  /* coverage bars */
  .cover-empty { background: #2d2d3f; }
  .chart { border-color: inherit; }

  /* status colors (slightly muted for dark bg) */
  .low, .cline-no { background: #3b1520; }
  .cstat-no, .fstat-no, .cbranch-no { background: #4a1a28; }
  .red.solid, .status-line.low, .low .cover-fill { background: #c2294a; }
  .low .chart { border-color: #c2294a; }
  .high, .cline-yes { background: #1a2e1a; }
  .cstat-yes { background: #2a5a1a; }
  .status-line.high, .high .cover-fill { background: #4d9221; }
  .high .chart { border-color: #4d9221; }
  .medium { background: #2e2a10; }
  .status-line.medium, .medium .cover-fill { background: #c9a30b; }
  .medium .chart { border-color: #c9a30b; }
  .cbranch-no { background: #5a4a00 !important; color: #fbbf24; }
  .cstat-skip, .fstat-skip { background: #2d2d3f; color: #a1a1aa; }
  .cbranch-skip { background: #2d2d3f !important; color: #a1a1aa; }
  span.cline-neutral { background: #252538; }
  .coverage-summary td.empty { color: #71717a; }
  .missing-if-branch { background: #52525b; color: #fbbf24; }

  /* code view */
  pre.prettyprint { background: #1a1a2e; }
  .com { color: #71717a !important; }
  .ignore-none { color: #71717a; }
  .highlighted, .highlighted .cstat-no,
  .highlighted .fstat-no, .highlighted .cbranch-no {
    background: #7f1d2d !important;
  }

  /* source line numbers */
  table.coverage td.line-count { color: #52525b; }
  table.coverage td.line-coverage { color: #a1a1aa; }
}
`;
  appendFileSync(cssPath, darkCSS);
}

function injectThresholds(htmlPath) {
  if (!existsSync(htmlPath)) return;
  const thresholdsPath = join(ROOT, "coverage-thresholds.json");
  if (!existsSync(thresholdsPath)) return;

  const thresholds = JSON.parse(readFileSync(thresholdsPath, "utf-8"));
  let html = readFileSync(htmlPath, "utf-8");

  const injection = `
<style>
  .threshold-bar {
    display: flex; gap: 12px; flex-wrap: wrap;
    padding: 12px 20px; margin: 0;
    border-bottom: 1px solid #ddd;
    font-size: 13px; font-family: inherit;
  }
  .threshold-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 4px;
    font-weight: 500;
  }
  .threshold-pill.pass { background: rgb(230,245,208); color: #2d5016; }
  .threshold-pill.fail { background: #FCE1E5; color: #9b1c31; }
  .threshold-pill .pkg { font-weight: 600; }
  .threshold-pill .detail { font-weight: 400; opacity: 0.8; font-size: 12px; }
  .threshold-badge {
    display: inline-block; font-size: 10px; padding: 1px 5px;
    border-radius: 3px; margin-left: 6px; vertical-align: middle;
    font-family: Consolas, 'Liberation Mono', Menlo, monospace;
  }
  .threshold-badge.pass { background: rgb(230,245,208); color: #2d5016; }
  .threshold-badge.fail { background: #FCE1E5; color: #9b1c31; }
  @media (prefers-color-scheme: dark) {
    .threshold-bar { border-bottom-color: #3f3f50; }
    .threshold-pill.pass { background: #1a2e1a; color: #86efac; }
    .threshold-pill.fail { background: #3b1520; color: #fca5a5; }
    .threshold-badge.pass { background: #1a2e1a; color: #86efac; }
    .threshold-badge.fail { background: #3b1520; color: #fca5a5; }
  }
</style>
<script>
(function() {
  var TH = ${JSON.stringify(thresholds)};
  var pkgMap = { 'client/src': 'client', 'crypto/src': 'crypto', 'server/src': 'server', 'shared/src': 'shared' };
  var metrics = ['statements', 'branches', 'functions', 'lines'];
  var labels = { statements: 'Stmts', branches: 'Branch', functions: 'Funcs', lines: 'Lines' };

  // Add threshold badges to table rows
  var rows = document.querySelectorAll('.coverage-summary tbody tr');
  rows.forEach(function(row) {
    var fileCell = row.querySelector('td.file');
    if (!fileCell) return;
    var val = fileCell.getAttribute('data-value');
    var pkg = pkgMap[val];
    if (!pkg || !TH[pkg]) return;

    var pctCells = row.querySelectorAll('td.pct');
    var metricOrder = ['statements', 'branches', 'functions', 'lines'];
    pctCells.forEach(function(cell, i) {
      var pct = parseFloat(cell.getAttribute('data-value'));
      var target = TH[pkg][metricOrder[i]];
      if (typeof target !== 'number') return;
      var ok = pct >= target;
      var badge = document.createElement('span');
      badge.className = 'threshold-badge ' + (ok ? 'pass' : 'fail');
      badge.textContent = (ok ? '\\u2265' : '<') + target + '%';
      cell.appendChild(badge);
    });
  });

  // Add summary bar above the table
  var table = document.querySelector('.coverage-summary');
  if (!table) return;
  var bar = document.createElement('div');
  bar.className = 'threshold-bar';
  var heading = document.createElement('span');
  heading.className = 'quiet';
  heading.textContent = 'Thresholds:';
  bar.appendChild(heading);

  Object.keys(TH).forEach(function(pkg) {
    var t = TH[pkg];
    var dirName = pkg + '/src';
    var row = document.querySelector('td.file[data-value="' + dirName + '"]');
    if (!row) return;
    var tr = row.parentElement;
    var pctCells = tr.querySelectorAll('td.pct');
    var allPass = true;
    var fails = [];
    metrics.forEach(function(m, i) {
      var pct = parseFloat(pctCells[i].getAttribute('data-value'));
      if (pct < t[m]) { allPass = false; fails.push(labels[m] + ' ' + pct.toFixed(1) + '/' + t[m] + '%'); }
    });

    var pill = document.createElement('span');
    pill.className = 'threshold-pill ' + (allPass ? 'pass' : 'fail');
    var pkgSpan = document.createElement('span');
    pkgSpan.className = 'pkg';
    pkgSpan.textContent = pkg;
    pill.appendChild(pkgSpan);

    if (allPass) {
      var check = document.createElement('span');
      check.textContent = ' \\u2713';
      pill.appendChild(check);
    } else {
      var detail = document.createElement('span');
      detail.className = 'detail';
      detail.textContent = ' ' + fails.join(', ');
      pill.appendChild(detail);
    }
    bar.appendChild(pill);
  });
  table.parentElement.insertBefore(bar, table);
})();
</script>`;

  html = html.replace("</body>", injection + "\n</body>");
  writeFileSync(htmlPath, html);
}

async function main() {
  console.log("Merging coverage reports...\n");

  const hasVitest = existsSync(VITEST_COVERAGE);
  const hasServer = existsSync(SERVER_COVERAGE);
  const hasE2E = existsSync(E2E_RAW_DIR);

  if (!hasVitest && !hasServer && !hasE2E) {
    console.error(
      "No coverage data found. Run unit tests (--coverage) and/or E2E tests first.",
    );
    process.exit(1);
  }

  const coverageMap = libCoverage.createCoverageMap();

  // 1. Load host vitest coverage (client, shared, crypto)
  if (hasVitest) {
    try {
      const vitestData = JSON.parse(readFileSync(VITEST_COVERAGE, "utf-8"));
      coverageMap.merge(vitestData);
      const fileCount = Object.keys(vitestData).length;
      console.log(`  Host vitest: ${String(fileCount)} files loaded`);
    } catch {
      console.warn("  Failed to parse host vitest coverage, skipping");
    }
  } else {
    console.log("  Host vitest: no coverage-final.json found (skipping)");
  }

  // 2. Load server vitest coverage (from Docker)
  if (hasServer) {
    try {
      const serverData = JSON.parse(readFileSync(SERVER_COVERAGE, "utf-8"));
      const remapped = remapDockerPaths(serverData);
      coverageMap.merge(remapped);
      const fileCount = Object.keys(remapped).length;
      console.log(`  Server vitest: ${String(fileCount)} files loaded`);
    } catch {
      console.warn("  Failed to parse server vitest coverage, skipping");
    }
  } else {
    console.log(
      "  Server vitest: no coverage/server/coverage-final.json found (skipping)",
    );
  }

  // 3. Process E2E coverage
  console.log("  Processing E2E coverage...");
  const e2eResult = await processE2ECoverage(coverageMap);
  if (typeof e2eResult === "object") {
    console.log(
      `  E2E: ${String(e2eResult.converted)} entries converted from ${String(e2eResult.files)} files` +
        (e2eResult.skipped > 0 ? `, ${String(e2eResult.skipped)} skipped` : ""),
    );
  }

  // 4. Generate reports
  console.log("\nGenerating reports...");

  const context = libReport.createContext({
    dir: MERGED_DIR,
    coverageMap,
    defaultSummarizer: "nested",
    watermarks: libReport.getDefaultWatermarks(),
  });

  reports.create("text", { maxCols: 120 }).execute(context);
  reports.create("html").execute(context);
  reports.create("lcov").execute(context);

  applyDarkTheme(join(MERGED_DIR, "base.css"));
  injectThresholds(join(MERGED_DIR, "index.html"));

  console.log(`\nReports written to ${MERGED_DIR}/`);
  console.log(`  HTML: open coverage/merged/index.html for full detail`);

  // 5. Print summary
  const summary = coverageMap.getCoverageSummary();
  console.log("\n--- Merged Coverage Summary ---");
  console.log(`  Statements: ${String(summary.statements.pct)}%`);
  console.log(`  Branches:   ${String(summary.branches.pct)}%`);
  console.log(`  Functions:  ${String(summary.functions.pct)}%`);
  console.log(`  Lines:      ${String(summary.lines.pct)}%`);

  // 6. Per-package breakdown vs thresholds
  const THRESHOLDS = JSON.parse(
    readFileSync(join(ROOT, "coverage-thresholds.json"), "utf-8"),
  );

  const pkgCoverage = {};
  for (const filePath of coverageMap.files()) {
    const match = filePath.match(/packages\/(\w+)\//);
    if (!match) continue;
    const pkg = match[1];
    if (!pkgCoverage[pkg]) pkgCoverage[pkg] = libCoverage.createCoverageMap();
    pkgCoverage[pkg].addFileCoverage(coverageMap.fileCoverageFor(filePath));
  }

  console.log("\n--- Per-Package Coverage ---");
  console.log(
    `       ${"".padEnd(7)}  ${"Tgt".padStart(5)}  ${"Stmts".padStart(7)}  ${"Branch".padStart(7)}  ${"Funcs".padStart(7)}  ${"Lines".padStart(7)}`,
  );
  let anyBelowThreshold = false;
  for (const [pkg, threshold] of Object.entries(THRESHOLDS)) {
    const map = pkgCoverage[pkg];
    if (!map) {
      console.log(`  ${pkg}: no coverage data`);
      continue;
    }
    const s = map.getCoverageSummary();
    const metrics = [
      { pct: s.statements.pct, target: threshold.statements },
      { pct: s.branches.pct, target: threshold.branches },
      { pct: s.functions.pct, target: threshold.functions },
      { pct: s.lines.pct, target: threshold.lines },
    ];
    const hasFail = metrics.some((m) => m.pct < m.target);
    if (hasFail) anyBelowThreshold = true;
    const status = hasFail ? "FAIL" : "PASS";
    const target = `${String(threshold.lines)}%`;
    const cols = metrics
      .map((m) => {
        const val = String(m.pct) + "%";
        const mark = m.pct < m.target ? "*" : " ";
        return (val + mark).padStart(7);
      })
      .join("  ");
    console.log(`  ${status} ${pkg.padEnd(7)}  ${target.padStart(5)}  ${cols}`);
  }

  // 7. Test result summary
  const e2eExit = process.env.E2E_EXIT;
  console.log("\n--- Test Results ---");
  console.log("  Unit tests: PASS (gate)");
  if (e2eExit !== undefined) {
    const e2eStatus = e2eExit === "0" ? "PASS" : "FAIL";
    console.log(`  E2E tests:  ${e2eStatus} (exit ${e2eExit})`);
  } else {
    console.log("  E2E tests:  not reported");
  }

  if (anyBelowThreshold) {
    console.log(
      "\nOne or more packages below threshold. See per-package breakdown above.",
    );
  }

  // 8. Save per-package summary for delta comparison
  const pkgSummary = {};
  for (const [pkg, map] of Object.entries(pkgCoverage)) {
    const s = map.getCoverageSummary();
    pkgSummary[pkg] = {
      statements: s.statements.pct,
      branches: s.branches.pct,
      functions: s.functions.pct,
      lines: s.lines.pct,
    };
  }
  mkdirSync(MERGED_DIR, { recursive: true });
  writeFileSync(
    join(MERGED_DIR, "summary.json"),
    JSON.stringify(pkgSummary, null, 2) + "\n",
  );
}

main().catch((err) => {
  console.error("Merge failed:", err);
  process.exit(1);
});
