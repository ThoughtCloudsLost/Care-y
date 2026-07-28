/**
 * Health engine re-export.
 *
 * The engine has been promoted to $demo/engine/engine.ts for shared
 * use by both the health check and the phone demo. This file
 * re-exports the health-facing API for backwards compatibility.
 */

import {
  bootDemoEngine,
  runHealthProofs,
  type HealthTimings,
  type HealthProofResult,
  type HealthEngine,
  type DemoEngineResult,
} from "$demo/engine/engine.js";

export type {
  HealthTimings,
  HealthProofResult,
  HealthEngine,
  DemoEngineResult,
};

export async function bootHealthEngine(): Promise<HealthEngine> {
  const engine = await bootDemoEngine();

  return {
    trpc: engine.trpc,
    timings: engine.timings,
    async runProofs(report: (r: HealthProofResult) => void): Promise<void> {
      return runHealthProofs(engine, report);
    },
  };
}
