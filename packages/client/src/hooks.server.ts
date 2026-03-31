import { dev } from "$app/environment";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import {
  extractSubdomain,
  readDevSlugHeader,
} from "$lib/server/org-resolution";

/**
 * Security headers handle.
 *
 * CSP is managed by svelte.config.js (kit.csp) so SvelteKit can inject
 * nonces into inline scripts. Everything else is set here.
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Production only. Dev uses HTTP and HSTS on localhost would lock
  // the browser to HTTPS for the domain.
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
  // microphone=(self) allows WebRTC browser calling from same origin only.
  // camera remains disabled: CARE-Y is voice-only.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), payment=()",
  );

  // COOP + COEP: enables SharedArrayBuffer if libsodium WASM ever requires it
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  return response;
};

/**
 * Org resolution handle.
 *
 * Dev: reads X-Org-Slug header (SOG-07 fallback), then falls back to Host.
 * Prod: extracts subdomain from Host header (slug.care-y.app -> slug).
 * Sets event.locals.orgSlug for downstream load functions.
 */
const orgResolution: Handle = async ({ event, resolve }) => {
  const devSlug = dev ? readDevSlugHeader(event.request.headers) : null;
  const hostSlug = extractSubdomain(event.request.headers.get("host") ?? "");

  event.locals.orgSlug = devSlug ?? hostSlug;
  return resolve(event);
};

export const handle: Handle = sequence(securityHeaders, orgResolution);

/**
 * Global error handler.
 *
 * Logs structured JSON server-side for operator correlation.
 * Returns an opaque { message, id } to the client (no stack, no internals).
 * Never logs request body (may contain passwords).
 */
export const handleError: HandleServerError = ({ error, event, status }) => {
  const id = crypto.randomUUID();

  console.error(
    JSON.stringify({
      errorId: id,
      status,
      path: event.url.pathname,
      method: event.request.method,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }),
  );

  return { message: "An error occurred", id };
};
