/**
 * Tests for the branding icon serving handler.
 *
 * The first suite covers URL parsing, 404 cases, and handler wiring with no
 * DB. The second covers the serving path, which needs a real schema: the
 * handler reaches for tenantDb(org.schemaName) itself rather than taking a
 * DB dependency, so its org_config reads cannot be mocked out.
 *
 * Icons are stored as plain PNG bytes (ADR-094). No decryption in the
 * serving path.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createBrandingIconHandler,
  type BrandingIconHandlerDeps,
} from "./branding-icons.js";
import type { BlobStore } from "../storage/store.js";
import type { OrgId, OrgSlug, OrgSchema, BlobKey } from "@care-y/shared";
import { createTestDb, seedOrgPublicKey, type TestDb } from "../test-utils.js";

function mockReq(
  method: string,
  url: string,
  headers: Record<string, string> = {},
): IncomingMessage {
  return { method, url, headers } as unknown as IncomingMessage;
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
      put: vi.fn(async () => "key" as BlobKey),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    },
    orgService: {
      findBySlug: vi.fn(async () => null),
      findById: vi.fn(async () => null),
      createOrg: vi.fn(async () => ({
        id: "id" as OrgId,
        slug: "test" as OrgSlug,
        schemaName: "org_test" as OrgSchema,
        isActive: true,
        setupToken: "test-token",
      })),
      validateSetupToken: vi.fn(async () => false),
      consumeSetupToken: vi.fn(async () => undefined),
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
          id: "id" as OrgId,
          slug: "test" as OrgSlug,
          schemaName: "org_test" as OrgSchema,
          isActive: false,
        })),
        findById: vi.fn(async () => null),
        createOrg: vi.fn(async () => ({
          id: "id" as OrgId,
          slug: "test" as OrgSlug,
          schemaName: "org_test" as OrgSchema,
          isActive: true,
          setupToken: "test-token",
        })),
        validateSetupToken: vi.fn(async () => false),
        consumeSetupToken: vi.fn(async () => undefined),
      },
    });
    handler = createBrandingIconHandler(inactiveDeps);

    const req = mockReq("GET", "/api/branding/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("parses all three valid icon filenames", () => {
    const validPaths = [
      "/api/branding/test/icon-192.png",
      "/api/branding/test/icon-512.png",
      "/api/branding/test/icon-maskable.png",
    ];
    for (const path of validPaths) {
      const req = mockReq("GET", path);
      const res = mockRes();
      void handler(req, res);
    }
    expect(deps.orgService.findBySlug).toHaveBeenCalledTimes(3);
  });

  it("strips query parameters from icon URL before matching", () => {
    const req = mockReq("GET", "/api/branding/test/icon-192.png?v=abc12345");
    const res = mockRes();
    void handler(req, res);
    expect(deps.orgService.findBySlug).toHaveBeenCalledWith("test");
  });

  it("returns 500 when orgService.findBySlug throws", async () => {
    const throwDeps = buildDeps({
      orgService: {
        findBySlug: vi.fn(async () => {
          throw new Error("connection lost");
        }),
        findById: vi.fn(async () => null),
        createOrg: vi.fn(async () => ({
          id: "id" as OrgId,
          slug: "test" as OrgSlug,
          schemaName: "org_test" as OrgSchema,
          isActive: true,
          setupToken: "test-token",
        })),
        validateSetupToken: vi.fn(async () => false),
        consumeSetupToken: vi.fn(async () => undefined),
      },
    });
    handler = createBrandingIconHandler(throwDeps);
    const req = mockReq("GET", "/api/branding/test/icon-192.png");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });

  it("returns 404 for undefined req.url", async () => {
    const req = { method: "GET", url: undefined } as unknown as IncomingMessage;
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "createBrandingIconHandler serving path (DB)",
  () => {
    let testDb: TestDb;
    let handler: ReturnType<typeof createBrandingIconHandler>;
    const blobs = new Map<string, Buffer>();

    /** PNG magic bytes plus filler. */
    const ICON = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from("icon-bytes"),
    ]);
    const BLOB_KEY = "branding/icon-192-test" as BlobKey;
    const ETAG = `"${BLOB_KEY}"`;

    const memoryStore: BlobStore = {
      put: async (_orgSchema, _kind, buf) => {
        blobs.set(BLOB_KEY, buf);
        return BLOB_KEY;
      },
      get: async (key) => blobs.get(key) ?? null,
      delete: async (key) => {
        blobs.delete(key);
      },
      exists: async (key) => blobs.has(key),
    };

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      await testDb.db
        .updateTable("org_config")
        .set({ icon_192_blob_key: BLOB_KEY })
        .execute();

      handler = createBrandingIconHandler({
        blobStore: memoryStore,
        orgService: {
          findBySlug: vi.fn(async () => ({
            id: "org-id" as OrgId,
            slug: "test" as OrgSlug,
            schemaName: testDb.schemaName as OrgSchema,
            isActive: true,
          })),
          findById: vi.fn(async () => null),
          createOrg: vi.fn(async () => ({
            id: "org-id" as OrgId,
            slug: "test" as OrgSlug,
            schemaName: testDb.schemaName as OrgSchema,
            isActive: true,
            setupToken: "test-token",
          })),
          validateSetupToken: vi.fn(async () => false),
          consumeSetupToken: vi.fn(async () => undefined),
        },
        corsHeaders: { "Access-Control-Allow-Origin": "*" },
      });
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    beforeEach(() => {
      blobs.clear();
      // Store the icon as plain PNG bytes (no encryption)
      blobs.set(BLOB_KEY, ICON);
    });

    it("serves the stored icon bytes with PNG headers and an ETag", async () => {
      const res = mockRes();
      await handler(mockReq("GET", "/api/branding/test/icon-192.png"), res);

      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("image/png");
      expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(res.headers.ETag).toBe(ETAG);
      expect(res.body).toEqual(ICON);
    });

    it("returns 304 without a body when the ETag matches", async () => {
      const res = mockRes();
      await handler(
        mockReq("GET", "/api/branding/test/icon-192.png", {
          "if-none-match": ETAG,
        }),
        res,
      );

      expect(res.statusCode).toBe(304);
      expect(res.body).toBeNull();
    });

    it("returns 404 when the blob is missing from the store", async () => {
      blobs.clear();
      const res = mockRes();
      await handler(mockReq("GET", "/api/branding/test/icon-192.png"), res);

      expect(res.statusCode).toBe(404);
    });

    it("returns 404 for a size whose blob key is not set", async () => {
      const res = mockRes();
      await handler(mockReq("GET", "/api/branding/test/icon-512.png"), res);

      expect(res.statusCode).toBe(404);
    });
  },
);
