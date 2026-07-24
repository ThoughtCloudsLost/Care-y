import adapter from "@sveltejs/adapter-node";

const isDev = process.env.NODE_ENV !== "production";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["self"],
        "script-src": ["self", "wasm-unsafe-eval"],
        "style-src": ["self"],
        "style-src-elem": ["self"],
        "style-src-attr": ["unsafe-inline"],
        "img-src": ["self", "data:", "blob:"],
        "connect-src": ["self"],
        "font-src": ["self"],
        "worker-src": ["self"],
        "object-src": ["none"],
        "base-uri": ["self"],
        "form-action": ["self"],
        "frame-ancestors": ["none"],
        ...(isDev ? {} : { "upgrade-insecure-requests": true }),
      },
    },
  },
};

export default config;
