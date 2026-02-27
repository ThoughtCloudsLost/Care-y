import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      // SW update strategy: leave defaults (skipWaiting: false, clientsClaim: false).
      // Do NOT enable skipWaiting. It can cause users to receive a new SW mid-session.
      registerType: "prompt",
      workbox: {
        // Exclude tRPC API routes from all caching strategies.
        // These return live ciphertext blobs that must never be served from cache.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Do NOT add a route for /api/* here.
          // Shell assets (JS, CSS, fonts, icons) are precached via generateSW defaults.
        ],
        // Reject oversized assets to prevent the SW cache from growing unbounded.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
      },
      manifest: {
        name: "CARE-Y",
        short_name: "CARE-Y",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  ssr: {
    // pnpm-linked workspace packages appear in node_modules,
    // which Vite skips by default during SSR.
    // This ensures @care-y/* packages are transpiled for server-side rendering.
    noExternal: [/^@care-y\//],
  },
});
