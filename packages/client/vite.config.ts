import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      registerType: "prompt",
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
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/trpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trpc/, ""),
      },
    },
  },
  ssr: {
    // pnpm-linked workspace packages appear in node_modules,
    // which Vite skips by default during SSR.
    // This ensures @care-y/* packages are transpiled for server-side rendering.
    noExternal: [/^@care-y\//],
  },
});
