import { defineConfig } from "vitest/config";
import { nodeEngineAliases, serverRedirectPlugin } from "./vite";

/**
 * Standalone vitest config for CI smoke tests that boot the demo engine
 * under Node (PGlite and libsodium-sumo both have Node builds).
 *
 * Module substitutions mirror the build aliases from vite.config.ts so
 * the engine's server shims resolve correctly. The environment is "node"
 * (not jsdom) because PGlite and server code expect Node APIs.
 */

export default defineConfig({
  plugins: [serverRedirectPlugin()],
  resolve: {
    alias: nodeEngineAliases(),
  },
  test: {
    name: "demo-smoke",
    include: ["src/**/*.smoke.test.ts"],
    environment: "node",
  },
});
