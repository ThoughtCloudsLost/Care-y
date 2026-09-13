import fs from "node:fs";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig, type Plugin } from "vite";

/**
 * Vite plugin: enable cross-origin isolation on all dev server responses.
 *
 * hooks.server.ts sets COOP same-origin + COEP require-corp on SvelteKit
 * page responses (enables SharedArrayBuffer for libsodium WASM). Under COEP
 * require-corp, every subresource must carry a Cross-Origin-Resource-Policy
 * header, and module Workers must carry their own COEP header
 * (coep-frame-resource-needs-coep-header).
 *
 * Vite's dev server doesn't add these headers by default, and server.headers
 * only covers Vite's static file handler. This plugin uses configureServer
 * to inject middleware before all other handlers, covering /@fs/ paths,
 * pre-bundled deps, HMR preambles, and Worker scripts.
 *
 * Standard pattern from vite-plugin-cross-origin-isolation and Vite #3909.
 */
function crossOriginIsolationPlugin(): Plugin {
  return {
    name: "care-y-cross-origin-isolation",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        next();
      });
    },
  };
}

const isMobile = process.env.VITE_MOBILE === "true";
const orgSlug = process.env.VITE_ORG_SLUG ?? "dev-org";

// Prefer mkcert certs (trusted by simulators and browsers).
// Fall back to basicSsl (self-signed, triggers cert warnings).
function httpsConfig():
  | { https?: { cert: Buffer; key: Buffer } }
  | { plugins: ReturnType<typeof basicSsl>[] } {
  const certPath = ".certs/localhost.pem";
  const keyPath = ".certs/localhost-key.pem";
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      https: {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      },
    };
  }
  return { plugins: [basicSsl()] };
}

const mkcert = isMobile ? httpsConfig() : {};

export default defineConfig({
  plugins: [
    crossOriginIsolationPlugin(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["cookie", "preferredLanguage", "baseLocale"],
    }),
    tailwindcss(),
    sveltekit(),
    ...("plugins" in mkcert ? mkcert.plugins : []),
    SvelteKitPWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      registerType: "prompt",
      devOptions: {
        enabled: true,
        type: "module",
      },
      injectManifest: {
        // Skip Workbox manifest injection. SvelteKit's $service-worker module
        // provides build/files/version natively. The plugin still handles
        // manifest.webmanifest generation and registerSW.js registration.
        // The plugin checks for falsiness at runtime, but the type only allows string.
        injectionPoint: undefined as unknown as string,
      },
      manifest: {
        name: "CARE-Y",
        short_name: "CARE-Y",
        display: "standalone",
        background_color: "#0C0C0C",
        theme_color: "#000000",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    ...("https" in mkcert ? { https: mkcert.https } : {}),
    proxy: {
      "/trpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trpc/, ""),
        headers: { "x-org-slug": orgSlug },
      },
      "/sse/events": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/sse\/events/, "/notifications/stream"),
        headers: { "x-org-slug": orgSlug },
      },
      "/relay": {
        target: "http://localhost:3000",
        changeOrigin: true,
        headers: { "x-org-slug": orgSlug },
      },
      "/api/greetings": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/api/blobs": {
        target: "http://localhost:3000",
        changeOrigin: true,
        headers: { "x-org-slug": orgSlug },
      },
      "/api/branding": {
        target: "http://localhost:3000",
        changeOrigin: true,
        headers: { "x-org-slug": orgSlug },
      },
      "/manifest.webmanifest": {
        target: "http://localhost:3000",
        changeOrigin: true,
        headers: { "x-org-slug": orgSlug },
      },
    },
    fs: {
      // Module Workers resolve imports through Vite's dev server (not the
      // SSR bundler), so workspace packages the Worker depends on must be
      // in the allow list. Without this, the crypto Worker's import of
      // @care-y/crypto resolves to /@fs/.../packages/crypto/... and Vite
      // returns 403 because it falls outside the default allow boundary.
      allow: ["../crypto"],
    },
  },
  ssr: {
    // pnpm-linked workspace packages appear in node_modules,
    // which Vite skips by default during SSR.
    // This ensures @care-y/* packages are transpiled for server-side rendering.
    noExternal: [/^@care-y\//],
  },
});
