import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    // pnpm-linked workspace packages appear in node_modules,
    // which Vite skips by default during SSR. This ensures
    // @care-y/* packages are transpiled for server-side rendering.
    noExternal: [/^@care-y\//],
  },
});
