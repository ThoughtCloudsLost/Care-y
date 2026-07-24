#!/usr/bin/env node

/**
 * Orchestrates a full coverage run: unit tests (all packages), e2e tests,
 * merge, delta comparison, timing, and auto-opens the HTML report.
 *
 * Test failure output is saved to test-failures.log at the project root,
 * overwritten each run. Agents can read that file instead of needing
 * copy-pasted terminal output.
 *
 * Usage: node scripts/coverage-full.mjs
 *        pnpm coverage:full
 */

import { spawn, execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SUMMARY_PATH = join(ROOT, "coverage", "merged", "summary.json");
const FAILURES_PATH = join(ROOT, "test-failures.log");
const PREV_SUMMARY_PATH = join(ROOT, ".coverage-prev-summary.json");
const TEST_RESULTS_PATH = join(ROOT, "coverage", "test-results.json");

function runQuiet(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: "ignore", cwd: ROOT, ...opts });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

function run(cmd, opts = {}) {
  return new Promise((resolve) => {
    const proc = spawn("sh", ["-c", cmd], {
      cwd: ROOT,
      stdio: ["inherit", "pipe", "pipe"],
      env: opts.env || process.env,
    });

    const chunks = [];
    proc.stdout.on("data", (data) => {
      process.stdout.write(data);
      chunks.push(data);
    });
    proc.stderr.on("data", (data) => {
      process.stderr.write(data);
      chunks.push(data);
    });

    proc.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        output: Buffer.concat(chunks).toString("utf-8"),
      });
    });
  });
}

async function timed(label, fn) {
  const start = Date.now();
  const result = await fn();
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  return { label, secs, ...result };
}

async function main() {
  // Trap SIGINT so Ctrl+C (e.g. dismissing Playwright's report server)
  // kills the child process but not the orchestrator. Double Ctrl+C
  // within 2 seconds force-quits.
  let lastSigint = 0;
  process.on("SIGINT", () => {
    const now = Date.now();
    if (now - lastSigint < 2000) {
      console.log("\nForce quit.");
      process.exit(130);
    }
    lastSigint = now;
  });

  // ── Health checks ───────────────────────────────────────────────────
  if (runQuiet("curl -sf http://localhost:3000/health > /dev/null") !== 0) {
    console.error(
      "Dev API not running on :3000. Start with: pnpm dev, pnpm dev:mobile, or docker compose up -d",
    );
    process.exit(1);
  }

  if (
    runQuiet(
      "docker compose -f docker-compose.test.yml exec app true 2>/dev/null",
    ) !== 0
  ) {
    console.error("Test containers not running. Start with: pnpm test:up");
    process.exit(1);
  }

  // ── Stash previous summary for delta comparison ─────────────────────
  let prevSummary = null;
  if (existsSync(SUMMARY_PATH)) {
    try {
      prevSummary = JSON.parse(readFileSync(SUMMARY_PATH, "utf-8"));
    } catch {
      /* corrupt file, ignore */
    }
  }
  if (!prevSummary && existsSync(PREV_SUMMARY_PATH)) {
    try {
      prevSummary = JSON.parse(readFileSync(PREV_SUMMARY_PATH, "utf-8"));
    } catch {
      /* corrupt file, ignore */
    }
  }

  // ── Preserve previous summary for delta injection ───────────────────
  if (prevSummary) {
    writeFileSync(PREV_SUMMARY_PATH, JSON.stringify(prevSummary));
  }

  // ── Clean stale data ────────────────────────────────────────────────
  rmSync(join(ROOT, "coverage"), { recursive: true, force: true });
  rmSync(FAILURES_PATH, { force: true });
  console.log("Cleaned stale coverage data.\n");

  // ── Run phases ──────────────────────────────────────────────────────
  const phases = [];
  const failures = [];

  // Host vitest
  phases.push(
    await timed("Host vitest (client/shared/crypto)", () =>
      run(
        "pnpm exec vitest run --project client --project shared --project crypto --coverage",
      ),
    ),
  );

  if (phases.at(-1).exitCode !== 0) {
    failures.push({
      phase: "Host vitest (client/shared/crypto)",
      output: phases.at(-1).output,
    });
    writeFailures(failures);
    printTiming(phases);
    console.error(
      "\nHost unit tests failed. See test-failures.log for details.",
    );
    process.exit(1);
  }

  // Server vitest (Docker)
  phases.push(
    await timed("Server vitest (Docker)", async () => {
      const result = await run(
        "docker compose -f docker-compose.test.yml exec app pnpm vitest run --project server --coverage",
      );
      if (result.exitCode === 0) {
        mkdirSync(join(ROOT, "coverage", "server"), { recursive: true });
        await run(
          "docker compose -f docker-compose.test.yml cp app:/app/coverage/coverage-final.json coverage/server/coverage-final.json",
        );
      }
      return result;
    }),
  );

  if (phases.at(-1).exitCode !== 0) {
    failures.push({
      phase: "Server vitest (Docker)",
      output: phases.at(-1).output,
    });
    writeFailures(failures);
    printTiming(phases);
    console.error("\nServer tests failed. See test-failures.log for details.");
    process.exit(1);
  }

  // E2E tests (suppress Playwright's auto-open so only the merged report opens)
  let e2eExit = 0;
  phases.push(
    await timed("E2E tests (Playwright)", async () => {
      const result = await run("pnpm test:e2e:coverage", {
        env: { ...process.env, PLAYWRIGHT_HTML_OPEN: "never" },
      });
      e2eExit = result.exitCode;
      return result;
    }),
  );

  if (e2eExit !== 0) {
    failures.push({
      phase: "E2E tests (Playwright)",
      output: phases.at(-1).output,
    });
  }

  // Write sidecar files for the merge script to inject into the HTML
  mkdirSync(join(ROOT, "coverage"), { recursive: true });
  const testResults = phases.map((p) => ({
    label: p.label,
    status: p.exitCode === 0 ? "pass" : "fail",
    secs: p.secs,
  }));
  writeFileSync(TEST_RESULTS_PATH, JSON.stringify(testResults));
  if (failures.length > 0) {
    writeFailures(failures);
  }

  // Coverage merge (always runs, even after e2e failure)
  phases.push(
    await timed("Coverage merge", () =>
      run("pnpm coverage:merge", {
        env: { ...process.env, E2E_EXIT: String(e2eExit) },
      }),
    ),
  );

  // ── Phase timing ────────────────────────────────────────────────────
  printTiming(phases);

  // ── Coverage delta from last run ────────────────────────────────────
  printDelta(prevSummary);

  // ── Failure log notice ──────────────────────────────────────────────
  if (failures.length > 0) {
    console.log(`\nTest failures saved to: test-failures.log`);
  }

  // ── Cleanup temp files ──────────────────────────────────────────────
  rmSync(PREV_SUMMARY_PATH, { force: true });

  // ── Auto-open HTML report ───────────────────────────────────────────
  runQuiet("open coverage/merged/index.html");

  process.exit(e2eExit);
}

function writeFailures(failures) {
  const lines = [
    `Test Failure Log`,
    `Run: ${new Date().toISOString()}`,
    `${"=".repeat(72)}`,
    "",
  ];
  for (const f of failures) {
    lines.push(`PHASE: ${f.phase}`);
    lines.push("-".repeat(72));
    lines.push(f.output);
    lines.push("");
  }
  writeFileSync(FAILURES_PATH, lines.join("\n"));
}

function printTiming(phases) {
  console.log("\n--- Phase Timing ---");
  for (const p of phases) {
    const tag = p.exitCode === 0 ? "PASS" : "FAIL";
    console.log(`  ${tag} ${p.label.padEnd(36)} ${p.secs}s`);
  }
  const total = phases.reduce((s, p) => s + parseFloat(p.secs), 0).toFixed(1);
  console.log(`       ${"Total".padEnd(36)} ${total}s`);
}

function printDelta(prevSummary) {
  if (prevSummary && existsSync(SUMMARY_PATH)) {
    try {
      const newSummary = JSON.parse(readFileSync(SUMMARY_PATH, "utf-8"));
      const rows = [];
      for (const pkg of Object.keys(newSummary)) {
        if (!prevSummary[pkg]) continue;
        const diffs = [];
        for (const m of ["statements", "branches", "functions", "lines"]) {
          const diff = newSummary[pkg][m] - prevSummary[pkg][m];
          if (Math.abs(diff) >= 0.01) {
            const sign = diff > 0 ? "+" : "";
            const label =
              m === "statements"
                ? "Stmts"
                : m === "branches"
                  ? "Branch"
                  : m === "functions"
                    ? "Funcs"
                    : "Lines";
            diffs.push(`${label} ${sign}${diff.toFixed(2)}%`);
          }
        }
        if (diffs.length > 0) {
          rows.push(`  ${pkg.padEnd(7)} ${diffs.join("  ")}`);
        }
      }
      if (rows.length > 0) {
        console.log("\n--- Coverage Delta (vs last run) ---");
        for (const row of rows) console.log(row);
      } else {
        console.log("\n--- Coverage Delta (vs last run) ---");
        console.log("  No change.");
      }
    } catch {
      /* new summary missing or corrupt */
    }
  } else if (!prevSummary) {
    console.log("\n--- Coverage Delta ---");
    console.log("  First run, no previous data to compare.");
  }
}

main();
