import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // --- Content-Security-Policy ---
  // - wasm-unsafe-eval: required by libsodium-wrappers browser WASM build (cannot be avoided)
  // - unsafe-inline in style-src: required by Tailwind CSS / Konsta UI (inline styles at runtime)
  // - worker-src: explicit allowlist for PWA service worker (falls back to script-src if omitted,
  //   but wasm-unsafe-eval in script-src should not propagate to workers)
  // - All other directives locked to 'self' or 'none'
  //
  // In dev mode, Vite's HMR uses WebSocket connections and may inject inline scripts.
  // The strict CSP would block both, breaking hot reload. Skip CSP in dev only.
  // All other security headers still apply in dev - they don't interfere with HMR.
  if (!dev) {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self'",
        "worker-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join("; "),
    );
  }

  // TODO (Phase 9): add HSTS header (max-age=63072000; includeSubDomains; preload)
  // Omit in dev - only set when the domain has a valid TLS cert.

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Clickjacking protection - defense-in-depth alongside CSP frame-ancestors
  response.headers.set("X-Frame-Options", "DENY");

  // Limit referrer information sent to external origins
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy: deny all sensitive capabilities by default.
  // NOTE: microphone=() must be revisited in Phase 4 when WebRTC browser-to-browser calls are added.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  // COOP + COEP: enables SharedArrayBuffer if libsodium WASM ever requires it
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  return response;
};
