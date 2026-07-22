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

const FAILURES_PATH = join(ROOT, "test-failures.log");
const PREV_SUMMARY_PATH = join(ROOT, ".coverage-prev-summary.json");
const TEST_RESULTS_PATH = join(ROOT, "coverage", "test-results.json");
const DOCKER_APP_ROOT = "/app";

const VITE_ORIGIN = "http://localhost:5174";

const E2E_EXCLUDE_PATTERNS = [
  /\/paraglide\//,
  /\/assets\//,
  /\.css$/,
  /\.svg$/,
  /\/DevThemePanel\.svelte$/,
];

function isExcludedPath(pathname) {
  return E2E_EXCLUDE_PATTERNS.some((re) => re.test(pathname));
}

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

async function processE2ECoverage(coverageMap, vitestFileKeys) {
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
  let overlapEntries = 0;
  let excluded = 0;

  // Separate map accumulates e2e data for files that vitest also covers.
  // Multiple e2e entries for the same file share the same v8-to-istanbul
  // transform, so they merge correctly with each other here.
  const e2eOverlapMap = libCoverage.createCoverageMap();

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

      const pathname = new URL(entry.url).pathname;
      if (isExcludedPath(pathname)) {
        excluded++;
        continue;
      }

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
        converter.destroy();

        if (vitestFileKeys.has(absPath)) {
          e2eOverlapMap.merge(istanbulData);
          overlapEntries++;
        } else {
          coverageMap.merge(istanbulData);
        }
        converted++;
      } catch {
        skipped++;
      }
    }
  }

  // Line-level union for overlapping files: vitest's statement map is
  // the structural base; e2e line hits boost uncovered items without
  // the map-concatenation bug that istanbul's merge() causes when
  // statement maps differ between instrumentations.
  let boosted = 0;
  for (const filePath of e2eOverlapMap.files()) {
    if (!coverageMap.files().includes(filePath)) continue;

    const e2eFc = e2eOverlapMap.fileCoverageFor(filePath);
    const vitestFc = coverageMap.fileCoverageFor(filePath);

    const e2eHitLines = new Set();
    for (const [stmtId, count] of Object.entries(e2eFc.s)) {
      if (count > 0 && e2eFc.statementMap[stmtId]) {
        const loc = e2eFc.statementMap[stmtId];
        for (let line = loc.start.line; line <= loc.end.line; line++) {
          e2eHitLines.add(line);
        }
      }
    }

    if (e2eHitLines.size === 0) continue;

    let fileBoosted = false;

    for (const [stmtId, loc] of Object.entries(vitestFc.statementMap)) {
      if (vitestFc.s[stmtId] > 0) continue;
      for (let line = loc.start.line; line <= loc.end.line; line++) {
        if (e2eHitLines.has(line)) {
          vitestFc.s[stmtId] = 1;
          fileBoosted = true;
          break;
        }
      }
    }

    for (const [fnId, fn] of Object.entries(vitestFc.fnMap)) {
      if (vitestFc.f[fnId] > 0) continue;
      const loc = fn.loc || fn.decl;
      if (!loc) continue;
      for (let line = loc.start.line; line <= loc.end.line; line++) {
        if (e2eHitLines.has(line)) {
          vitestFc.f[fnId] = 1;
          fileBoosted = true;
          break;
        }
      }
    }

    for (const [brId, br] of Object.entries(vitestFc.branchMap)) {
      const locations = br.locations || [];
      for (let i = 0; i < locations.length; i++) {
        if (vitestFc.b[brId][i] > 0) continue;
        const loc = locations[i];
        for (let line = loc.start.line; line <= loc.end.line; line++) {
          if (e2eHitLines.has(line)) {
            vitestFc.b[brId][i] = 1;
            fileBoosted = true;
            break;
          }
        }
      }
    }

    if (fileBoosted) boosted++;
  }

  return {
    converted,
    skipped,
    overlapEntries,
    overlapFiles: e2eOverlapMap.files().length,
    boosted,
    excluded,
    files: files.length,
  };
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

function insertBeforePush(html, content) {
  const pushMarker = `<div class='push'></div>`;
  const pushIdx = html.indexOf(pushMarker);
  if (pushIdx !== -1) {
    return html.slice(0, pushIdx) + content + "\n" + html.slice(pushIdx);
  }
  return html.replace("</body>", content + "\n</body>");
}

function injectFailures(htmlPath) {
  if (!existsSync(htmlPath)) return;
  if (!existsSync(FAILURES_PATH)) return;

  let logContent;
  try {
    logContent = readFileSync(FAILURES_PATH, "utf-8").trim();
  } catch {
    return;
  }
  if (!logContent) return;

  const phases = [];
  const blocks = logContent.split(/^PHASE: /m).slice(1);
  for (const block of blocks) {
    const newlineIdx = block.indexOf("\n");
    const name = block.slice(0, newlineIdx).trim();
    const body = block
      .slice(newlineIdx + 1)
      .replace(/^-{40,}\n/, "")
      .trim();
    phases.push({ name, body });
  }

  if (phases.length === 0) return;

  const escapedPhases = phases.map((p) => ({
    name: p.name
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;"),
    body: p.body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;"),
  }));

  let phaseSections = "";
  for (const p of escapedPhases) {
    phaseSections += `
    <details class="failure-phase">
      <summary class="failure-phase-name">${p.name}</summary>
      <pre class="failure-output">${p.body}</pre>
    </details>`;
  }

  const injection = `
<style>
  .failures-section {
    margin: 24px 20px; padding: 0;
    border: 2px solid #c2294a; border-radius: 6px;
    overflow: hidden;
  }
  .failures-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; margin: 0;
    background: #FCE1E5; color: #9b1c31;
    font-size: 14px; font-weight: 600; font-family: inherit;
    cursor: pointer; user-select: none;
    list-style: none;
  }
  .failures-header::-webkit-details-marker { display: none; }
  .failures-header::before {
    content: '\\25B6'; font-size: 10px;
    transition: transform 0.15s ease;
  }
  details.failures-wrapper[open] > .failures-header::before {
    transform: rotate(90deg);
  }
  .failures-count {
    display: inline-block; font-size: 11px;
    padding: 1px 7px; border-radius: 10px;
    background: #9b1c31; color: #fff;
  }
  .failures-body { padding: 0; }
  .failure-phase { border-top: 1px solid #e5e7eb; }
  .failure-phase-name {
    padding: 8px 16px; font-size: 13px; font-weight: 600;
    cursor: pointer; user-select: none;
    list-style: none;
  }
  .failure-phase-name::-webkit-details-marker { display: none; }
  .failure-phase-name::before {
    content: '\\25B6'; font-size: 9px; margin-right: 6px;
    display: inline-block; transition: transform 0.15s ease;
  }
  details.failure-phase[open] > .failure-phase-name::before {
    transform: rotate(90deg);
  }
  .failure-output {
    margin: 0; padding: 12px 16px;
    background: #fafafa;
    font-size: 12px; line-height: 1.5;
    overflow-x: auto; white-space: pre-wrap; word-break: break-all;
    max-height: 600px; overflow-y: auto;
    border-top: 1px solid #e5e7eb;
  }
  @media (prefers-color-scheme: dark) {
    .failures-section { border-color: #c2294a; }
    .failures-header { background: #3b1520; color: #fca5a5; }
    .failures-count { background: #c2294a; }
    .failure-phase { border-top-color: #3f3f50; }
    .failure-phase-name { color: #fca5a5; }
    .failure-output {
      background: #1a1a2e; color: #d4d4d8;
      border-top-color: #3f3f50;
    }
  }
</style>
<div class="failures-section">
  <details class="failures-wrapper" open>
    <summary class="failures-header">
      Failed Tests <span class="failures-count">${String(phases.length)} phase${phases.length === 1 ? "" : "s"}</span>
    </summary>
    <div class="failures-body">
      ${phaseSections}
    </div>
  </details>
</div>
`;

  let html = readFileSync(htmlPath, "utf-8");
  html = insertBeforePush(html, injection);
  writeFileSync(htmlPath, html);
}

function injectTestResults(htmlPath) {
  if (!existsSync(htmlPath)) return;
  if (!existsSync(TEST_RESULTS_PATH)) return;

  let results;
  try {
    results = JSON.parse(readFileSync(TEST_RESULTS_PATH, "utf-8"));
  } catch {
    return;
  }
  if (!Array.isArray(results) || results.length === 0) return;

  const allPassed = results.every((r) => r.status === "pass");

  const pills = results
    .map((r) => {
      const cls = r.status === "pass" ? "pass" : "fail";
      const icon = r.status === "pass" ? "&#x2713;" : "&#x2717;";
      return `<span class="result-pill ${cls}">${icon} ${r.label} <span class="result-time">${r.secs}s</span></span>`;
    })
    .join("\n      ");

  const statusCls = allPassed ? "pass" : "fail";
  const statusText = allPassed ? "All Tests Passed" : "Some Tests Failed";

  const injection = `
<style>
  .test-results-bar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 10px 20px; margin: 0;
    border-bottom: 1px solid #ddd;
    font-size: 13px; font-family: inherit;
  }
  .test-results-label {
    font-weight: 600; font-size: 13px;
    padding: 3px 10px; border-radius: 4px;
  }
  .test-results-label.pass { background: rgb(230,245,208); color: #2d5016; }
  .test-results-label.fail { background: #FCE1E5; color: #9b1c31; }
  .result-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 4px;
    font-size: 12px; font-weight: 500;
  }
  .result-pill.pass { color: #2d5016; }
  .result-pill.fail { color: #9b1c31; font-weight: 600; }
  .result-time { opacity: 0.6; font-size: 11px; }
  @media (prefers-color-scheme: dark) {
    .test-results-bar { border-bottom-color: #3f3f50; }
    .test-results-label.pass { background: #1a2e1a; color: #86efac; }
    .test-results-label.fail { background: #3b1520; color: #fca5a5; }
    .result-pill.pass { color: #86efac; }
    .result-pill.fail { color: #fca5a5; }
  }
</style>
<div class="test-results-bar">
  <span class="test-results-label ${statusCls}">${statusText}</span>
  ${pills}
</div>`;

  let html = readFileSync(htmlPath, "utf-8");
  html = insertBeforePush(html, injection);
  writeFileSync(htmlPath, html);
}

function injectDelta(htmlPath, coverageMap) {
  if (!existsSync(htmlPath)) return;
  if (!existsSync(PREV_SUMMARY_PATH)) return;

  let prevSummary;
  try {
    prevSummary = JSON.parse(readFileSync(PREV_SUMMARY_PATH, "utf-8"));
  } catch {
    return;
  }

  const pkgCoverage = {};
  for (const filePath of coverageMap.files()) {
    const match = filePath.match(/packages\/(\w+)\//);
    if (!match) continue;
    const pkg = match[1];
    if (!pkgCoverage[pkg]) pkgCoverage[pkg] = libCoverage.createCoverageMap();
    pkgCoverage[pkg].addFileCoverage(coverageMap.fileCoverageFor(filePath));
  }

  const deltas = [];
  const metrics = ["statements", "branches", "functions", "lines"];
  const labels = {
    statements: "Stmts",
    branches: "Branch",
    functions: "Funcs",
    lines: "Lines",
  };

  for (const [pkg, map] of Object.entries(pkgCoverage)) {
    if (!prevSummary[pkg]) continue;
    const s = map.getCoverageSummary();
    const diffs = [];
    for (const m of metrics) {
      const diff = s[m].pct - prevSummary[pkg][m];
      if (Math.abs(diff) >= 0.01) {
        const sign = diff > 0 ? "+" : "";
        diffs.push({
          label: labels[m],
          value: `${sign}${diff.toFixed(2)}%`,
          direction: diff > 0 ? "up" : "down",
        });
      }
    }
    if (diffs.length > 0) {
      deltas.push({ pkg, diffs });
    }
  }

  if (deltas.length === 0) return;

  const deltaPills = deltas
    .map((d) => {
      const diffSpans = d.diffs
        .map(
          (df) =>
            `<span class="delta-metric ${df.direction}">${df.label} ${df.value}</span>`,
        )
        .join(" ");
      return `<span class="delta-pkg"><span class="delta-pkg-name">${d.pkg}</span> ${diffSpans}</span>`;
    })
    .join("\n      ");

  const injection = `
<style>
  .delta-bar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 8px 20px; margin: 0;
    border-bottom: 1px solid #ddd;
    font-size: 12px; font-family: inherit;
  }
  .delta-label { font-weight: 600; color: #71717a; font-size: 12px; }
  .delta-pkg {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px;
  }
  .delta-pkg-name { font-weight: 600; }
  .delta-metric { font-family: Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; }
  .delta-metric.up { color: #2d5016; }
  .delta-metric.down { color: #9b1c31; }
  @media (prefers-color-scheme: dark) {
    .delta-bar { border-bottom-color: #3f3f50; }
    .delta-label { color: #a1a1aa; }
    .delta-metric.up { color: #86efac; }
    .delta-metric.down { color: #fca5a5; }
  }
</style>
<div class="delta-bar">
  <span class="delta-label">Delta vs last run:</span>
  ${deltaPills}
</div>`;

  let html = readFileSync(htmlPath, "utf-8");
  html = insertBeforePush(html, injection);
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
  const vitestFileKeys = new Set();

  // 1. Load host vitest coverage (client, shared, crypto)
  if (hasVitest) {
    try {
      const vitestData = JSON.parse(readFileSync(VITEST_COVERAGE, "utf-8"));
      for (const key of Object.keys(vitestData)) {
        vitestFileKeys.add(key);
      }
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
      for (const key of Object.keys(remapped)) {
        vitestFileKeys.add(key);
      }
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

  // 3. Process E2E coverage (line-level union for vitest overlap; direct merge for e2e-only)
  console.log("  Processing E2E coverage...");
  const e2eResult = await processE2ECoverage(coverageMap, vitestFileKeys);
  if (typeof e2eResult === "object") {
    const parts = [
      `${String(e2eResult.converted)} entries converted from ${String(e2eResult.files)} files`,
    ];
    if (e2eResult.overlapEntries > 0)
      parts.push(
        `${String(e2eResult.overlapEntries)} across ${String(e2eResult.overlapFiles)} files merged via line union`,
      );
    if (e2eResult.boosted > 0)
      parts.push(`${String(e2eResult.boosted)} files boosted by e2e`);
    if (e2eResult.excluded > 0)
      parts.push(`${String(e2eResult.excluded)} excluded (generated)`);
    if (e2eResult.skipped > 0)
      parts.push(`${String(e2eResult.skipped)} skipped (missing/error)`);
    console.log(`  E2E: ${parts.join(", ")}`);
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
  const htmlPath = join(MERGED_DIR, "index.html");
  injectThresholds(htmlPath);
  injectTestResults(htmlPath);
  injectDelta(htmlPath, coverageMap);
  injectFailures(htmlPath);

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
