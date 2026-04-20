/**
 * Unit tests for the branding icon serving handler.
 *
 * Tests URL parsing, 404 cases, and handler wiring.
 * Full crypto roundtrip tests require sodium-native and run in Docker.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createBrandingIconHandler,
  type BrandingIconHandlerDeps,
} from "./branding-icons.js";

function mockReq(method: string, url: string): IncomingMessage {
  return { method, url } as IncomingMessage;
}

function mockRes(): ServerResponse & {
  statusCode: number;
  headers: Record<string, string>;
  body: Buffer | null;
  ended: boolean;
} {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: null as Buffer | null,
    ended: false,
    writeHead(code: number, headers?: Record<string, string>) {
      res.statusCode = code;
      if (headers) res.headers = headers;
    },
    end(data?: Buffer | string) {
      res.ended = true;
      if (data instanceof Buffer) res.body = data;
    },
  };
  return res as unknown as ReturnType<typeof mockRes>;
}

function buildDeps(
  overrides?: Partial<BrandingIconHandlerDeps>,
): BrandingIconHandlerDeps {
  return {
    blobStore: {
      put: vi.fn(async () => "key"),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    },
    orgService: {
      findBySlug: vi.fn(async () => null),
      findById: vi.fn(async () => null),
      createOrg: vi.fn(async () => ({
        id: "id",
        slug: "test",
        schemaName: "org_test",
        isActive: true,
      })),
    },
    corsHeaders: { "Access-Control-Allow-Origin": "*" },
    ...overrides,
  };
}

describe("createBrandingIconHandler", () => {
  let handler: ReturnType<typeof createBrandingIconHandler>;
  let deps: BrandingIconHandlerDeps;

  beforeEach(() => {
    deps = buildDeps();
    handler = createBrandingIconHandler(deps);
  });

  it("returns 405 for non-GET methods", async () => {
    const req = mockReq("POST", "/api/branding/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it("returns 404 for paths not matching prefix", async () => {
    const req = mockReq("GET", "/api/other/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for paths without org slug separator", async () => {
    const req = mockReq("GET", "/api/branding/noslash");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for invalid icon filename", async () => {
    const req = mockReq("GET", "/api/branding/test/icon-999.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 when org is not found", async () => {
    const req = mockReq("GET", "/api/branding/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
    expect(deps.orgService.findBySlug).toHaveBeenCalledWith("test");
  });

  it("returns 404 when org is inactive", async () => {
    const inactiveDeps = buildDeps({
      orgService: {
        findBySlug: vi.fn(async () => ({
          id: "id",
          slug: "test",
          schemaName: "org_test",
          isActive: false,
        })),
        findById: vi.fn(async () => null),
        createOrg: vi.fn(async () => ({
          id: "id",
          slug: "test",
          schemaName: "org_test",
          isActive: true,
        })),
      },
    });
    handler = createBrandingIconHandler(inactiveDeps);

    const req = mockReq("GET", "/api/branding/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("parses all three valid icon filenames", () => {
    // Tested implicitly via handler routing. Verify the expected filenames
    // are recognized by making requests that would succeed if org existed.
    const validPaths = [
      "/api/branding/test/icon-192.png",
      "/api/branding/test/icon-512.png",
      "/api/branding/test/icon-maskable.png",
    ];
    for (const path of validPaths) {
      const req = mockReq("GET", path);
      const res = mockRes();
      void handler(req, res);
      // findBySlug is called, meaning path parsing succeeded
    }
    expect(deps.orgService.findBySlug).toHaveBeenCalledTimes(3);
  });
});
