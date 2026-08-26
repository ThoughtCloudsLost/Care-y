/**
 * Tests for the form asset serving handler.
 *
 * Unit suite covers URL parsing, 404 cases, and handler wiring with mocked
 * dependencies. DB suite covers the full serving path with encrypted blobs
 * and a real form_assets table, matching the branding-icons test structure.
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
import sodium from "sodium-native";
import {
  createFormAssetHandler,
  type FormAssetHandlerDeps,
} from "./form-assets.js";
import { deriveBrandingKey } from "../branding/branding-crypto.js";
import type { BlobStore } from "../storage/store.js";
import { newFormAssetId } from "@care-y/shared";
import type {
  BlobKey,
  OrgId,
  OrgSlug,
  OrgSchema,
  FormAssetId,
} from "@care-y/shared";
import {
  createTestDb,
  seedOrgPublicKey,
  sealBrandingBlob,
  TEST_ORG_PUBLIC_KEY,
  type TestDb,
} from "../test-utils.js";

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
  overrides?: Partial<FormAssetHandlerDeps>,
): FormAssetHandlerDeps {
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
    createTenantDb: vi.fn(() => {
      throw new Error("no DB in unit tests");
    }),
    ...overrides,
  };
}

describe("createFormAssetHandler", () => {
  let handler: ReturnType<typeof createFormAssetHandler>;
  let deps: FormAssetHandlerDeps;

  beforeEach(() => {
    deps = buildDeps();
    handler = createFormAssetHandler(deps);
  });

  it("returns 405 for non-GET methods", async () => {
    const res = mockRes();
    await handler(mockReq("POST", "/api/forms/test/abc-123"), res);
    expect(res.statusCode).toBe(405);
  });

  it("returns 404 for paths not matching prefix", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/other/test/abc-123"), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for paths without org slug separator", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/noslash"), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for empty blobId", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/"), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for blobId with path traversal (..)", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/..%2F..%2Fetc"), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for blobId with nested slash", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/a/b"), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 when org is not found", async () => {
    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/abc-123"), res);
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
    handler = createFormAssetHandler(inactiveDeps);

    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/abc-123"), res);
    expect(res.statusCode).toBe(404);
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
    handler = createFormAssetHandler(throwDeps);

    const res = mockRes();
    await handler(mockReq("GET", "/api/forms/test/abc-123"), res);
    expect(res.statusCode).toBe(500);
  });

  it("returns 404 for undefined req.url", async () => {
    const req = {
      method: "GET",
      url: undefined,
    } as unknown as IncomingMessage;
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("strips query parameters from the URL before matching", () => {
    const res = mockRes();
    void handler(mockReq("GET", "/api/forms/test/abc-123?v=1"), res);
    expect(deps.orgService.findBySlug).toHaveBeenCalledWith("test");
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "createFormAssetHandler serving path (DB)",
  () => {
    let testDb: TestDb;
    let handler: ReturnType<typeof createFormAssetHandler>;
    const blobs = new Map<string, Buffer>();

    /** Valid JPEG magic bytes plus filler. */
    const IMAGE = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from("image-body-content"),
    ]);

    const BLOB_ID: FormAssetId = newFormAssetId();

    // Blob key will be set after schema name is known
    let BLOB_KEY: BlobKey;
    let ETAG: string;

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

      BLOB_KEY = `${testDb.schemaName}/form-asset/${BLOB_ID}` as BlobKey;
      ETAG = `"${BLOB_KEY}"`;

      // Seed a form_assets row
      await testDb.db
        .insertInto("form_assets")
        .values({
          blob_id: BLOB_ID,
          blob_key: BLOB_KEY,
          content_type: "image/jpeg",
        })
        .execute();

      handler = createFormAssetHandler({
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
        createTenantDb: () => testDb.db,
      });
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    beforeEach(() => {
      blobs.clear();
      const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
      try {
        blobs.set(BLOB_KEY, sealBrandingBlob(IMAGE, key));
      } finally {
        sodium.sodium_memzero(key);
      }
    });

    it("serves the decrypted image with correct headers and ETag", async () => {
      const res = mockRes();
      await handler(mockReq("GET", `/api/forms/test/${BLOB_ID}`), res);

      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("image/jpeg");
      expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(res.headers["Cache-Control"]).toBe(
        "public, max-age=300, must-revalidate",
      );
      expect(res.headers.ETag).toBe(ETAG);
      expect(res.body).toEqual(IMAGE);
    });

    it("returns 304 without a body when the ETag matches", async () => {
      const res = mockRes();
      await handler(
        mockReq("GET", `/api/forms/test/${BLOB_ID}`, {
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
      await handler(mockReq("GET", `/api/forms/test/${BLOB_ID}`), res);

      expect(res.statusCode).toBe(404);
    });

    it("returns 500 when the blob fails to decrypt", async () => {
      const corrupt = Buffer.alloc(64);
      sodium.randombytes_buf(corrupt);
      blobs.set(BLOB_KEY, corrupt);

      const res = mockRes();
      await handler(mockReq("GET", `/api/forms/test/${BLOB_ID}`), res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toBeNull();
    });

    it("returns 404 for an unknown blob ID", async () => {
      const unknownId = newFormAssetId();
      const res = mockRes();
      await handler(mockReq("GET", `/api/forms/test/${unknownId}`), res);

      expect(res.statusCode).toBe(404);
    });

    it("refuses to serve a blob with non-form-asset prefix", async () => {
      // Insert a form_assets row that points to a kb-attachment key
      const badBlobId = newFormAssetId();
      const badBlobKey =
        `${testDb.schemaName}/kb-attachment/${badBlobId}` as BlobKey;

      await testDb.db
        .insertInto("form_assets")
        .values({
          blob_id: badBlobId,
          blob_key: badBlobKey,
          content_type: "image/jpeg",
        })
        .execute();

      const res = mockRes();
      await handler(mockReq("GET", `/api/forms/test/${badBlobId}`), res);

      expect(res.statusCode).toBe(404);
    });

    it("refuses to serve a blob with disallowed content type", async () => {
      const pdfBlobId = newFormAssetId();

      await testDb.db
        .insertInto("form_assets")
        .values({
          blob_id: pdfBlobId,
          blob_key: `${testDb.schemaName}/form-asset/${pdfBlobId}` as BlobKey,
          content_type: "application/pdf",
        })
        .execute();

      const res = mockRes();
      await handler(mockReq("GET", `/api/forms/test/${pdfBlobId}`), res);

      expect(res.statusCode).toBe(404);
    });
  },
);
