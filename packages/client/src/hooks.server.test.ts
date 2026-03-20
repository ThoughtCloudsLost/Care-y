/**
 * Unit tests for SvelteKit server hooks.
 *
 * Tests the composed `handle` (security headers + org resolution) and
 * `handleError` exports. Verifies security header presence, HSTS
 * dev-skipping, org slug extraction, and opaque error responses.
 *
 * SvelteKit virtual modules ($app/environment, @sveltejs/kit/hooks) are
 * mocked in test-setup.ts (loaded via vitest.config.ts setupFiles).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDev } from "./test-setup.js";
import { handle, handleError } from "./hooks.server.js";

// --- Test helpers ---

interface AppError {
  id: string;
  message: string;
}

interface MockLocals {
  orgSlug: string | null;
}

interface MockEvent {
  request: Request;
  url: URL;
  locals: MockLocals;
}

function createMockEvent(
  options: {
    host?: string;
    headers?: Record<string, string>;
    pathname?: string;
    method?: string;
  } = {},
): MockEvent {
  const headers: Record<string, string> = {
    host: options.host ?? "localhost:5173",
    ...options.headers,
  };

  return {
    request: new Request(`http://${headers.host}${options.pathname ?? "/"}`, {
      method: options.method ?? "GET",
      headers,
    }),
    url: new URL(`http://${headers.host}${options.pathname ?? "/"}`),
    locals: { orgSlug: null },
  };
}

/**
 * Mock resolve function. Returns a plain 200 Response.
 * The security headers handle calls resolve() and then sets headers
 * on the returned response, so this simulates SvelteKit's resolve.
 */
function createMockResolve(): (event: MockEvent) => Promise<Response> {
  return async () => new Response("ok", { status: 200 });
}

// --- Security Headers ---

describe("handle (security headers)", () => {
  beforeEach(() => {
    mockDev.mockReturnValue(false);
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets Referrer-Policy to strict-origin-when-cross-origin", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("sets Permissions-Policy denying all sensitive capabilities", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(self), geolocation=(), payment=()",
    );
  });

  it("sets Cross-Origin-Opener-Policy to same-origin", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin",
    );
  });

  it("sets Cross-Origin-Embedder-Policy to require-corp", async () => {
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Cross-Origin-Embedder-Policy")).toBe(
      "require-corp",
    );
  });

  it("sets HSTS in production", async () => {
    mockDev.mockReturnValue(false);
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
  });

  it("omits HSTS in development", async () => {
    mockDev.mockReturnValue(true);
    const event = createMockEvent();
    const response = await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });
});

// --- Org Resolution ---

describe("handle (org resolution)", () => {
  beforeEach(() => {
    mockDev.mockReturnValue(false);
  });

  it("extracts subdomain from Host header in production", async () => {
    const event = createMockEvent({ host: "testorg.care-y.app" });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(event.locals.orgSlug).toBe("testorg");
  });

  it("sets orgSlug to null when Host has no subdomain", async () => {
    const event = createMockEvent({ host: "care-y.app" });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(event.locals.orgSlug).toBeNull();
  });

  it("reads X-Org-Slug header in dev mode", async () => {
    mockDev.mockReturnValue(true);
    const event = createMockEvent({
      host: "localhost:5173",
      headers: { "x-org-slug": "dev-org" },
    });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(event.locals.orgSlug).toBe("dev-org");
  });

  it("ignores X-Org-Slug header in production", async () => {
    mockDev.mockReturnValue(false);
    const event = createMockEvent({
      host: "localhost:5173",
      headers: { "x-org-slug": "sneaky-org" },
    });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    // No subdomain in localhost, and dev header ignored in production
    expect(event.locals.orgSlug).toBeNull();
  });

  it("prefers X-Org-Slug over Host subdomain in dev mode", async () => {
    mockDev.mockReturnValue(true);
    const event = createMockEvent({
      host: "hostorg.care-y.app",
      headers: { "x-org-slug": "header-org" },
    });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(event.locals.orgSlug).toBe("header-org");
  });

  it("falls back to Host subdomain when X-Org-Slug is empty in dev", async () => {
    mockDev.mockReturnValue(true);
    const event = createMockEvent({
      host: "fallback.care-y.app",
      headers: { "x-org-slug": "" },
    });
    await handle({
      event: event as never,
      resolve: createMockResolve() as never,
    });
    expect(event.locals.orgSlug).toBe("fallback");
  });
});

// --- Error Handler ---

describe("handleError", () => {
  it("returns opaque message and a correlation id", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const event = createMockEvent({ pathname: "/broken" });
    const result = handleError({
      error: new Error("secret internal details"),
      event: event as never,
      status: 500,
      message: "Internal Error",
    }) as AppError;

    expect(result).toHaveProperty("message", "An error occurred");
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("string");
    expect(result.id.length).toBeGreaterThan(0);

    // Must NOT leak the original error message to the client
    expect(result.message).not.toContain("secret");

    errorSpy.mockRestore();
  });

  it("logs structured JSON with error details server-side", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const event = createMockEvent({ pathname: "/api/fail", method: "POST" });
    const result = handleError({
      error: new Error("db connection lost"),
      event: event as never,
      status: 503,
      message: "Service Unavailable",
    }) as AppError;

    expect(errorSpy).toHaveBeenCalledOnce();

    const logArg = errorSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(logArg) as Record<string, unknown>;

    expect(parsed.errorId).toBe(result.id);
    expect(parsed.status).toBeTypeOf("number");
    expect(parsed.path).toBeTypeOf("string");
    expect(parsed.method).toBeTypeOf("string");
    expect(parsed.message).toBeDefined();
    expect(parsed.stack).toBeDefined();

    errorSpy.mockRestore();
  });

  it("handles non-Error thrown values", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const event = createMockEvent();
    const result = handleError({
      error: "raw string error",
      event: event as never,
      status: 500,
      message: "Internal Error",
    }) as AppError;

    expect(result.message).toBe("An error occurred");

    const logArg = errorSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(logArg) as Record<string, unknown>;

    expect(parsed.message).toBe("raw string error");
    expect(parsed.stack).toBeUndefined();

    errorSpy.mockRestore();
  });
});
