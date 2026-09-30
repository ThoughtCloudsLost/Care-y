// Builds the demo seed snapshot into packages/demo/.seed-snapshot/, or
// leaves it alone when its content hash is current.
//
// The builder (scripts/build-seed-snapshot.ts) boots the demo engine, so
// it has to load through the same aliases the engine uses. This runner
// starts a Vite dev server in middleware mode with
// vite.seed-snapshot.config.ts and imports the builder through the server
// environment's module runner (the Vite Environment API), so no other
// TypeScript runner is needed.
//
// Usage: node scripts/seed-snapshot.mjs [--force]
// Exit 0: the snapshot is current (built or already up to date).
// Exit 1: the build failed; nothing partial is left in place.

import { fileURLToPath } from "node:url";
import { createServer, isRunnableDevEnvironment } from "vite";

class SeedSnapshotRunnerError extends Error {
  constructor(message) {
    super(message);
    this.name = "SeedSnapshotRunnerError";
  }
}

const demoRoot = fileURLToPath(new URL("..", import.meta.url));
const force = process.argv.includes("--force");

const server = await createServer({
  root: demoRoot,
  configFile: fileURLToPath(
    new URL("../vite.seed-snapshot.config.ts", import.meta.url),
  ),
  appType: "custom",
  logLevel: "warn",
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});

let exitCode = 0;
try {
  const environment = server.environments.ssr;
  if (!isRunnableDevEnvironment(environment)) {
    throw new SeedSnapshotRunnerError(
      "The Vite ssr environment has no module runner",
    );
  }
  const builder = await environment.runner.import(
    "/scripts/build-seed-snapshot.ts",
  );
  const outcome = await builder.buildSeedSnapshot({
    force,
    onProgress: (step) => {
      console.log(`[seed-snapshot] ${step}`);
    },
  });
  console.log(
    `[seed-snapshot] ${outcome.skipped ? "up to date" : "built"}: ${outcome.outDir}`,
  );
} catch (err) {
  console.error("[seed-snapshot] build failed:", err);
  exitCode = 1;
} finally {
  await server.close();
}

// The engine's modules can leave handles open (timers in the runner's
// module graph); the snapshot is complete or absent by now, so exit
// explicitly rather than wait on them.
process.exit(exitCode);
