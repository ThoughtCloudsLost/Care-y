import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { demoAliases, demoSplashPlugin } from "./vite";

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

const isMobile = process.env.VITE_MOBILE === "true";

// Device testing over Tailscale (scripts/dev-network.js) serves https
// with the client package's mkcert certs, matching the client's
// dev:mobile setup. Without the certs the server falls back to http.
function httpsConfig(): { cert: Buffer; key: Buffer } | undefined {
  const certPath = resolve("../client/.certs/localhost.pem");
  const keyPath = resolve("../client/.certs/localhost-key.pem");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time cert paths from known relative locations, not user input
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- build-time cert paths from known relative locations, not user input
    return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
  }
  console.warn(
    "mkcert certs not found in packages/client/.certs; serving http",
  );
  return undefined;
}

const https = isMobile ? httpsConfig() : undefined;

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
    ...(https !== undefined ? { https } : {}),
    fs: {
      // Setting allow replaces Vite's default list (which would have
      // covered this package), so the demo root and the workspace root
      // (pnpm store symlink targets) must be listed alongside client.
      allow: [".", "../client", "../.."],
    },
  },
});
