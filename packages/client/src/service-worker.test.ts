/**
 * Unit tests for the CARE-Y service worker.
 *
 * The service worker registers event listeners on globalThis.self at import
 * time, so we stub ServiceWorkerGlobalScope globals before importing the
 * module. The $service-worker virtual module is mocked in test-setup.ts.
 *
 * Tests cover: path exclusion logic, cache-first for known assets,
 * network fallback, error classes, precache on install, and old cache
 * pruning on activate.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Stub Service Worker globals ---

/** Captured event listeners from sw.addEventListener calls. */
const listeners: Record<string, (...args: unknown[]) => void> = {};

/** In-memory cache store keyed by cache name. */
let cacheStore: Record<string, Map<string, Response>>;

/** Create a mock CacheStorage that uses cacheStore. */
function createMockCaches(): CacheStorage {
  return {
    open: vi.fn(async (name: string) => {
      cacheStore[name] ??= new Map();
      const store = cacheStore[name]!;
      return {
        addAll: vi.fn(async (urls: string[]) => {
          for (const url of urls) {
            store.set(url, new Response("cached", { status: 200 }));
          }
        }),
        match: vi.fn(async (key: string | Request) => {
          const k = typeof key === "string" ? key : new URL(key.url).pathname;
          return store.get(k) ?? undefined;
        }),
        put: vi.fn(async (req: Request, res: Response) => {
          store.set(new URL(req.url).pathname, res);
        }),
      } as unknown as Cache;
    }),
    keys: vi.fn(async () => Object.keys(cacheStore)),
    delete: vi.fn(async (name: string) => {
      const existed = name in cacheStore;
      delete cacheStore[name];
      return existed;
    }),
    has: vi.fn(),
    match: vi.fn(),
  } as unknown as CacheStorage;
}

// Set up globalThis stubs before the service worker module is imported.
// The module reads globalThis.self and calls addEventListener on it.
const mockSelf = {
  addEventListener: vi.fn(
    (type: string, handler: (...args: unknown[]) => void) => {
      listeners[type] = handler;
    },
  ),
  location: { origin: "http://localhost:5173" },
};

// Must assign before import. The module executes at import time.
Object.assign(globalThis, {
  self: mockSelf,
  caches: createMockCaches(),
});

// Now import triggers addEventListener calls and captures the listeners.
await import("./service-worker.js");

// --- Helpers ---

interface MockFetchEvent {
  request: Request;
  respondWith: ReturnType<typeof vi.fn>;
  /** The promise passed to respondWith, with rejection pre-caught to prevent unhandled rejection. */
  responsePromise: Promise<Response> | null;
  /** If respondWith received a rejected promise, the error is stored here. */
  responseError: unknown;
}

function createFetchEvent(
  url: string,
  options?: { method?: string },
): MockFetchEvent {
  const event: MockFetchEvent = {
    request: new Request(url, { method: options?.method ?? "GET" }),
    respondWith: vi.fn(),
    responsePromise: null,
    responseError: null,
  };

  // Real respondWith consumes the promise. Our mock must .catch() it
  // immediately to prevent Node from flagging an unhandled rejection.
  // Resolved responses go to responsePromise; rejected ones store the
  // error in responseError (the promise itself resolves to undefined).
  event.respondWith.mockImplementation((promise: Promise<Response>) => {
    event.responsePromise = promise.catch((err: unknown) => {
      event.responseError = err;
      return undefined as unknown as Response;
    });
  });

  return event;
}

interface MockExtendableEvent {
  waitUntil: ReturnType<typeof vi.fn>;
}

function createExtendableEvent(): MockExtendableEvent {
  return { waitUntil: vi.fn() };
}

// --- Tests ---

describe("service-worker", () => {
  beforeEach(() => {
    cacheStore = {};
    // Re-assign caches so the SW module picks up a fresh store.
    Object.assign(globalThis, { caches: createMockCaches() });
  });

  describe("fetch listener (path exclusion)", () => {
    it("ignores /api/ paths (no respondWith call)", () => {
      const event = createFetchEvent("http://localhost:5173/api/data");
      listeners.fetch!(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it("ignores /trpc/ paths (no respondWith call)", () => {
      const event = createFetchEvent("http://localhost:5173/trpc/auth.login");
      listeners.fetch!(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it("ignores non-GET requests", () => {
      const event = createFetchEvent("http://localhost:5173/", {
        method: "POST",
      });
      listeners.fetch!(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it("ignores cross-origin requests", () => {
      const event = createFetchEvent("https://cdn.example.com/script.js");
      listeners.fetch!(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it("intercepts same-origin GET requests to non-excluded paths", () => {
      const event = createFetchEvent("http://localhost:5173/dashboard");
      listeners.fetch!(event);
      expect(event.respondWith).toHaveBeenCalledOnce();
    });
  });

  describe("fetch listener (respond logic)", () => {
    it("returns cached response for known assets", async () => {
      // Pre-populate cache with a known asset from test-setup mock values.
      cacheStore["care-y-cache-test-v1"] = new Map([
        ["/immutable/app.js", new Response("cached-app", { status: 200 })],
      ]);
      Object.assign(globalThis, { caches: createMockCaches() });

      const event = createFetchEvent("http://localhost:5173/immutable/app.js");
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("cached-app");
    });

    it("falls back to network for unknown paths", async () => {
      const networkResponse = new Response("from-network", { status: 200 });
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(networkResponse);

      const event = createFetchEvent("http://localhost:5173/about");
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      expect(response.status).toBe(200);

      fetchSpy.mockRestore();
    });

    it("falls back to network when known asset is not in cache", async () => {
      // Empty cache, so the known asset path falls through to fetch.
      const networkResponse = new Response("network-app", { status: 200 });
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(networkResponse);

      const event = createFetchEvent("http://localhost:5173/immutable/app.js");
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      expect(await response.text()).toBe("network-app");

      fetchSpy.mockRestore();
    });

    it("throws OfflineError when network fails and no cache exists", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new TypeError("Failed to fetch"));

      const event = createFetchEvent("http://localhost:5173/dashboard");
      listeners.fetch!(event);

      // Wait for the caught promise to settle, then check the stored error.
      await event.responsePromise;
      expect(event.responseError).toHaveProperty("name", "OfflineError");
      expect(event.responseError).toHaveProperty(
        "message",
        "network unavailable and no cached response",
      );

      fetchSpy.mockRestore();
    });

    it("returns cached fallback when network fails for previously cached request", async () => {
      // Pre-populate cache with a navigation page.
      const cachedPage = new Response("cached-page", { status: 200 });
      cacheStore["care-y-cache-test-v1"] = new Map();
      // cache.match(request) uses the full URL, so store by request URL.
      // Our mock normalizes to pathname, but for non-known-asset requests
      // the SW passes the Request object to cache.match.
      cacheStore["care-y-cache-test-v1"]!.set("/dashboard", cachedPage);
      Object.assign(globalThis, { caches: createMockCaches() });

      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new TypeError("Failed to fetch"));

      const event = createFetchEvent("http://localhost:5173/dashboard");
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      expect(response.status).toBe(200);

      fetchSpy.mockRestore();
    });
  });

  describe("install listener (precache)", () => {
    it("precaches all known assets into the versioned cache", async () => {
      const event = createExtendableEvent();
      listeners.install!(event);

      // Wait for the precache promise to resolve.
      await event.waitUntil.mock.calls[0]![0];

      // The cache should now contain entries for build + files.
      const cache = cacheStore["care-y-cache-test-v1"];
      expect(cache).toBeDefined();
      expect(cache!.has("/immutable/app.js")).toBe(true);
      expect(cache!.has("/immutable/start.js")).toBe(true);
      expect(cache!.has("/favicon.ico")).toBe(true);
      expect(cache!.has("/robots.txt")).toBe(true);
    });
  });

  describe("activate listener (cache pruning)", () => {
    it("calls waitUntil with a cleanup promise", () => {
      const event = createExtendableEvent();
      listeners.activate!(event);
      expect(event.waitUntil).toHaveBeenCalledOnce();
    });

    it("deletes old caches and keeps the current versioned cache", async () => {
      // Pre-populate with old and current caches.
      cacheStore["care-y-cache-old-v0"] = new Map();
      cacheStore["care-y-cache-test-v1"] = new Map();
      cacheStore["care-y-cache-stale"] = new Map();
      Object.assign(globalThis, { caches: createMockCaches() });

      const event = createExtendableEvent();
      listeners.activate!(event);
      await event.waitUntil.mock.calls[0]![0];

      expect(cacheStore["care-y-cache-test-v1"]).toBeDefined();
      expect(cacheStore["care-y-cache-old-v0"]).toBeUndefined();
      expect(cacheStore["care-y-cache-stale"]).toBeUndefined();
    });

    it("preserves the branding cache during pruning", async () => {
      cacheStore["care-y-cache-old-v0"] = new Map();
      cacheStore["care-y-cache-test-v1"] = new Map();
      cacheStore["care-y-branding"] = new Map([
        ["/branding-data", new Response('{"orgName":"TestOrg"}')],
      ]);
      Object.assign(globalThis, { caches: createMockCaches() });

      const event = createExtendableEvent();
      listeners.activate!(event);
      await event.waitUntil.mock.calls[0]![0];

      expect(cacheStore["care-y-branding"]).toBeDefined();
      expect(cacheStore["care-y-cache-old-v0"]).toBeUndefined();
    });
  });

  describe("dynamic manifest", () => {
    it("intercepts /manifest.webmanifest with respondWith", () => {
      const event = createFetchEvent(
        "http://localhost:5173/manifest.webmanifest",
      );
      listeners.fetch!(event);
      expect(event.respondWith).toHaveBeenCalledOnce();
    });

    it("serves default manifest when no branding is cached", async () => {
      const event = createFetchEvent(
        "http://localhost:5173/manifest.webmanifest",
      );
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      const manifest = await response.json();
      expect(manifest.name).toBe("CARE-Y");
      expect(manifest.short_name).toBe("CARE-Y");
      expect(manifest.theme_color).toBe("#000000");
      expect(response.headers.get("Content-Type")).toBe(
        "application/manifest+json",
      );
    });

    it("serves branded manifest when branding is cached", async () => {
      cacheStore["care-y-branding"] = new Map([
        [
          "/branding-data",
          new Response(
            JSON.stringify({
              orgName: "Test Org",
              primaryColor: "#FF5C35",
            }),
          ),
        ],
      ]);
      Object.assign(globalThis, { caches: createMockCaches() });

      const event = createFetchEvent(
        "http://localhost:5173/manifest.webmanifest",
      );
      listeners.fetch!(event);

      const response = await event.responsePromise!;
      const manifest = await response.json();
      expect(manifest.name).toBe("Test Org");
      expect(manifest.short_name).toBe("Test Org");
      expect(manifest.theme_color).toBe("#FF5C35");
    });
  });
});
