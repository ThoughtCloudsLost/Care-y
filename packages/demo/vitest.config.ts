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
    include: ["src/**/*.test.ts"],
    exclude: ["**/dist/**", "**/node_modules/**", "src/**/*.smoke.test.ts"],
    environment: "jsdom",
  },
});
