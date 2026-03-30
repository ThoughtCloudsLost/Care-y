/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

/**
 * Custom service worker for CARE-Y.
 *
 * Uses SvelteKit's native $service-worker module for asset lists.
 * @vite-pwa/sveltekit handles manifest.webmanifest generation
 * and registerSW.js registration (with update prompt UI).
 * No Workbox runtime is shipped.
 *
 * Caching strategy:
 *  - Known assets (build + static) are precached on install, served cache-first
 *  - /api/ and /trpc/ routes are NEVER intercepted (live ciphertext)
 *  - Navigation requests fall back to network
 *  - Everything else is network-only
 */

import { build, files, version } from "$service-worker";

const sw = globalThis.self as unknown as ServiceWorkerGlobalScope;

/** fetch() returned a non-Response value (can happen in some browsers when offline). */
class InvalidFetchResponseError extends Error {
  override readonly name = "InvalidFetchResponseError";
}

/** Network unavailable and no cached fallback exists. */
class OfflineError extends Error {
  override readonly name = "OfflineError";
}

const CACHE_NAME = `care-y-cache-${version}`;

// `build`: compiled JS/CSS chunks (hashed filenames, immutable).
// `files`: everything in static/ (icons, robots.txt, etc.).
// Set gives O(1) lookup on every fetch instead of Array.includes().
const KNOWN_ASSETS = new Set([...build, ...files]);

/**
 * Install: precache all build artifacts and static files.
 */
sw.addEventListener("install", (event: ExtendableEvent) => {
  async function precache(): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...KNOWN_ASSETS]);
  }
  event.waitUntil(precache());
});

/**
 * Activate: delete caches from previous deployments.
 */
sw.addEventListener("activate", (event: ExtendableEvent) => {
  async function pruneOldCaches(): Promise<void> {
    for (const key of await caches.keys()) {
      if (key !== CACHE_NAME) await caches.delete(key);
    }
  }
  event.waitUntil(pruneOldCaches());
});

/**
 * Returns true if the URL path must never be intercepted by the SW.
 * These routes return live ciphertext that must always hit the network.
 *
 * MAINTENANCE: if new server-side route prefixes are added (e.g. /webhooks/,
 * /sse/), they must be added here to prevent accidental caching of live data.
 */
function isExcludedPath(url: URL): boolean {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/trpc/") ||
    url.pathname.startsWith("/sse/")
  );
}

/**
 * Fetch handler. Early returns keep excluded paths on the default network path
 * (no respondWith call = browser handles it normally).
 */
sw.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== sw.location.origin) return;

  // Excluded paths bypass the SW entirely.
  if (isExcludedPath(url)) return;

  event.respondWith(respond(event.request, url));
});

/**
 * Only called for same-origin GET requests that pass isExcludedPath().
 * KNOWN_ASSETS contains only build artifacts (JS/CSS) and static files.
 */
async function respond(request: Request, url: URL): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);

  // Known build/static assets: serve from cache, fall back to network.
  if (KNOWN_ASSETS.has(url.pathname)) {
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
  }

  // Unknown requests (navigations, etc.): network with offline fallback.
  try {
    const response = await fetch(request);

    // Some browsers can return a non-Response when offline instead of throwing.
    // See: SvelteKit service worker docs.
    if (!(response instanceof Response)) {
      throw new InvalidFetchResponseError(
        "fetch returned a non-Response value",
      );
    }

    // Opportunistically re-cache known assets fetched from network (e.g. after
    // a cache eviction or if addAll missed an entry). Fire-and-forget: quota
    // errors are swallowed since the asset was already precached on install.
    if (response.status === 200 && KNOWN_ASSETS.has(url.pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional fire-and-forget
      cache.put(request, response.clone()).catch(() => {});
    }

    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    throw new OfflineError("network unavailable and no cached response");
  }
}
