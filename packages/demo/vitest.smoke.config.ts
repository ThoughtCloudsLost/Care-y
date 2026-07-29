import { defineConfig } from "vitest/config";
import type { Alias } from "vite";
import { demoAliases, serverHealthAliases, serverRedirectPlugin } from "./vite";

/**
 * Standalone vitest config for CI smoke tests that boot the demo engine
 * under Node (PGlite and libsodium-sumo both have Node builds).
 *
 * Module substitutions mirror the build aliases from vite.config.ts so
 * the engine's server shims resolve correctly. The environment is "node"
 * (not jsdom) because PGlite and server code expect Node APIs.
 */

function buildAliases(): Alias[] {
  const serverAliases: Alias[] = serverHealthAliases.map((sa) => ({
    find: sa.find,
    replacement: sa.replacement,
  }));

  const demoBase = demoAliases();

  return [
    ...serverAliases,
    ...demoBase,
    { find: "buffer", replacement: "buffer/" },
  ];
}

export default defineConfig({
  plugins: [serverRedirectPlugin()],
  resolve: {
    alias: buildAliases(),
  },
  test: {
    name: "demo-smoke",
    include: ["src/**/*.smoke.test.ts"],
    environment: "node",
  },
});
