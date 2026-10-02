import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";
import { demoAliases } from "./vite";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    alias: demoAliases(),
    conditions: ["browser"],
  },
  test: {
    name: "demo",
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    exclude: ["**/dist/**", "**/node_modules/**", "src/**/*.smoke.test.ts"],
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    // The splash test imports the client's splash stylesheet with ?raw.
    // Without this entry vitest replaces every .css import with an empty
    // string, raw query included.
    css: { include: [/splash\.css/] },
  },
});
