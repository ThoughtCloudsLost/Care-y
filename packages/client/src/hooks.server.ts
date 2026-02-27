import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // --- Content-Security-Policy ---
  // CSP is configured in svelte.config.js via kit.csp, NOT here.
  // SvelteKit manages the CSP header so it can inject nonces (mode: "auto")
  // into inline <script> tags it generates. Key decisions documented there:
  //   - script-src: 'self' + 'wasm-unsafe-eval' (libsodium WASM)
  //   - style-src-attr: 'unsafe-inline' (Konsta UI dynamic style attributes)
  //   - style-src-elem: 'self' (blocks <style> tag injection, the real attack vector)
  //   - upgrade-insecure-requests: auto-upgrades HTTP to HTTPS

  // --- HSTS (HTTP Strict Transport Security) ---
  // Tells browsers to only connect via HTTPS for 2 years, including subdomains.
  // The preload flag allows submission to hstspreload.org for browser-level enforcement.
  // Only set in production: dev uses HTTP (no TLS cert), and HSTS on localhost
  // would lock the browser into HTTPS for the domain.
  if (!dev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Clickjacking protection (defense-in-depth alongside CSP frame-ancestors)
  response.headers.set("X-Frame-Options", "DENY");

  // Limit referrer information sent to external origins
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy: deny all sensitive capabilities by default.
  // camera/microphone will be enabled when WebRTC support lands.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  // COOP + COEP: enables SharedArrayBuffer if libsodium WASM ever requires it
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  return response;
};
