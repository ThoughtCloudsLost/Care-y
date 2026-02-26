import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Content-Security-Policy
  // - wasm-unsafe-eval: required by libsodium-wrappers browser WASM build (cannot be avoided)
  // - unsafe-inline in style-src: required by Tailwind CSS / Konsta UI (inline styles at runtime)
  // - All other directives locked to 'self' or 'none'
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  // HSTS: 2 years, include subdomains
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Clickjacking protection - defense-in-depth alongside CSP frame-ancestors
  response.headers.set("X-Frame-Options", "DENY");

  // Limit referrer information sent to external origins
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy: deny all sensitive capabilities by default.
  // camera/microphone will be enabled when WebRTC lands in Phase 12.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  // COOP + COEP: enables SharedArrayBuffer if libsodium WASM ever requires it
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  return response;
};
