import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { demoAliases, demoSplashPlugin } from "./vite";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

export default defineConfig({
  plugins: [tailwindcss(), svelte(), demoSplashPlugin()],
  base: process.env.BASE_PATH ?? "/",
  resolve: {
    // No conditions override here: Vite's default client conditions already
    // include "browser", and specifying the option replaces the defaults
    // (dropping "module" and "development|production"). The vitest config
    // does set conditions because the Node runner resolves differently.
    alias: demoAliases(),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        phone: resolve("phone.html"),
      },
    },
  },
  server: {
    fs: {
      // Setting allow replaces Vite's default list (which would have
      // covered this package), so the demo root and the workspace root
      // (pnpm store symlink targets) must be listed alongside client.
      allow: [".", "../client", "../.."],
    },
  },
});
