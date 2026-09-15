/**
 * Base path every tRPC request goes to. Vite proxies it to localhost:3000
 * in dev, Caddy routes it in prod. Same-origin either way: no CORS, and
 * cookies work naturally.
 *
 * Lives beside the client rather than inside it, the same way
 * `DEV_ORG_SLUG` does, so code that needs the path can read it without
 * constructing a tRPC client. The client account page's quick exit is
 * that code: it revokes the session with `navigator.sendBeacon`, which
 * addresses the endpoint by URL because a normal tRPC call would be
 * cancelled by the navigation quick exit performs.
 */
export const TRPC_BASE_PATH = "/trpc";
