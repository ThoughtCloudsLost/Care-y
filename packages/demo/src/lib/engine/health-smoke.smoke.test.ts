import { describe, it, expect, beforeAll } from "vitest";
import type { DemoEngineResult, HealthProofResult } from "./engine.js";
import { bootDemoEngine, runHealthProofs } from "./engine.js";
import {
  SMOKE_SNAPSHOT_TIMEOUT_MS,
  loadSmokeSnapshot,
  smokeSnapshotSource,
} from "./test-utils.js";

/**
 * CI smoke test: boots the full demo engine under Node from the seed
 * snapshot and runs the health proof battery. Every proof must report
 * pass: true.
 *
 * Uses vitest.smoke.config.ts (separate from the default jsdom project)
 * because PGlite requires a Node environment.
 */

describe("engine health smoke", () => {
  let engine: DemoEngineResult;

  beforeAll(async () => {
    engine = await bootDemoEngine({
      snapshot: smokeSnapshotSource(await loadSmokeSnapshot()),
    });
  }, SMOKE_SNAPSHOT_TIMEOUT_MS);

  it("every health proof passes", async () => {
    const results: HealthProofResult[] = [];

    await runHealthProofs(engine, (r: HealthProofResult) => {
      results.push(r);
    });

    expect(results.length).toBeGreaterThan(0);

    const failures = results.filter((r) => !r.pass);
    if (failures.length > 0) {
      const summary = failures
        .map((f) => `${f.name}: ${f.detail}`)
        .join("\n  ");
      expect.fail(`${String(failures.length)} proof(s) failed:\n  ${summary}`);
    }
  }, 120_000);
});
