import { defineConfig } from "vite";
import { nodeEngineAliases, serverRedirectPlugin } from "./vite";

/**
 * Vite config for the seed snapshot builder (scripts/seed-snapshot.mjs).
 * The builder boots the demo engine under Node, so it resolves modules
 * the way the smoke test config does: the server shims, the demo stubs
 * and the server-module redirect.
 *
 * One alias is left out: `buffer` -> `buffer/` (the npm polyfill the
 * browser bundle needs). Vite's server-side import analysis never
 * externalizes a specifier that matches an alias, so under that alias the
 * polyfill, which is CommonJS, would be evaluated inline as an ES module
 * and fail on `require`. Vitest externalizes by resolved path instead,
 * which is why the smoke config can keep the alias. Without it, `buffer`
 * is a Node builtin and stays external, so the builder runs on Node's own
 * Buffer, the same one the server code's global Buffer already is here.
 */
export default defineConfig({
  plugins: [serverRedirectPlugin()],
  resolve: {
    alias: nodeEngineAliases().filter((alias) => alias.find !== "buffer"),
  },
  // The builder loads modules on demand through the module runner; it has
  // no browser entry to pre-bundle, so skip the dependency scan of the
  // package's HTML entries.
  optimizeDeps: {
    noDiscovery: true,
  },
});
