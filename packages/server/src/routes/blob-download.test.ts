/**
 * Tests for the blob download handler.
 *
 * Covers URL parsing, authentication, permission checks, and the three
 * blob categories (recordings, attachments, kb-attachments). The handler
 * delegates record lookup to MediaService / KBMediaService and blob
 * retrieval to BlobStore.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createBlobDownloadHandler,
  type BlobDownloadHandlerDeps,
} from "./blob-download.js";
import { NotFoundError, ForbiddenError } from "../errors.js";
import * as RelayUtils from "./relay-utils.js";
import * as Roles from "../auth/roles.js";

vi.mock("./relay-utils.js", async (importOriginal) => {
  const orig = await importOriginal<typeof RelayUtils>();
  return {
    ...orig,
    authenticateRelay: vi.fn(),
  };
});

vi.mock("../auth/roles.js", async (importOriginal) => {
  const orig = await importOriginal<typeof Roles>();
  return {
    ...orig,
    hasPermissionForOrg: vi.fn(),
  };
});

const mockAuth = RelayUtils.authenticateRelay as ReturnType<typeof vi.fn>;
const mockHasPermForOrg = Roles.hasPermissionForOrg as ReturnType<typeof vi.fn>;

const TEST_UUID = "00000000-0000-0000-0000-000000000001";

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
  overrides?: Record<string, unknown>,
): BlobDownloadHandlerDeps {
  return {
    blobStore: {
      put: vi.fn(async () => "key"),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    },
    orgResolver: vi.fn(async () => "org_test"),
    createSessionRepo: vi.fn(),
    corsHeaders: { "Access-Control-Allow-Origin": "*" },
    createMediaSvc: vi.fn(() => ({
      getRecording: vi.fn(),
      getAttachment: vi.fn(),
    })),
    createKBMediaSvc: vi.fn(() => ({
      getAttachment: vi.fn(),
    })),
    getUserRole: vi.fn(async () => "volunteer"),
    createTenantDb: vi.fn(() => ({})),
    ...overrides,
  } as unknown as BlobDownloadHandlerDeps;
}

function authOk(): void {
  mockAuth.mockResolvedValue({
    ok: true,
    session: { userId: "u1", orgSchema: "org_test", sessionId: "s1" },
  });
}

describe("blob download handler", () => {
  let handler: ReturnType<typeof createBlobDownloadHandler>;
  let deps: BlobDownloadHandlerDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = buildDeps();
    handler = createBlobDownloadHandler(deps);
  });

  it("returns 405 for non-GET requests", async () => {
    const req = mockReq("POST", `/api/blobs/recordings/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it("returns 400 for invalid category", async () => {
    authOk();
    const req = mockReq("GET", `/api/blobs/invalid-cat/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for non-UUID id", async () => {
    authOk();
    const req = mockReq("GET", "/api/blobs/recordings/not-a-uuid");
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when auth fails", async () => {
    mockAuth.mockResolvedValue({ ok: false, status: 401 });
    const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when 2FA not verified", async () => {
    mockAuth.mockResolvedValue({ ok: false, status: 403 });
    const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when user role is null", async () => {
    authOk();
    deps = buildDeps({ getUserRole: vi.fn(async () => null) });
    handler = createBlobDownloadHandler(deps);

    const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when user lacks VIEW_TICKETS permission", async () => {
    authOk();
    mockHasPermForOrg.mockResolvedValue(false);
    deps = buildDeps({ getUserRole: vi.fn(async () => "some_role") });
    handler = createBlobDownloadHandler(deps);

    const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  describe("recordings", () => {
    it("returns 200 with blob data", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      const blobData = Buffer.from([1, 2, 3]);
      const getRecording = vi.fn().mockResolvedValue({ blobKey: "rec-key" });
      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createMediaSvc: vi.fn(() => ({
          getRecording,
          getAttachment: vi.fn(),
        })),
        blobStore: {
          put: vi.fn(async () => "key"),
          get: vi.fn(async () => blobData),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(blobData);
      expect(res.headers["Content-Type"]).toBe("application/octet-stream");
      expect(res.headers["Content-Length"]).toBe("3");
      expect(res.headers["Cache-Control"]).toBe("private, no-store");
      expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
    });

    it("returns 404 when recording not found", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createMediaSvc: vi.fn(() => ({
          getRecording: vi
            .fn()
            .mockRejectedValue(new NotFoundError("not found")),
          getAttachment: vi.fn(),
        })),
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);
      expect(res.statusCode).toBe(404);
    });

    it("returns 403 when access denied", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createMediaSvc: vi.fn(() => ({
          getRecording: vi
            .fn()
            .mockRejectedValue(new ForbiddenError("forbidden")),
          getAttachment: vi.fn(),
        })),
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);
      expect(res.statusCode).toBe(403);
    });

    it("returns 404 when blob missing from store", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createMediaSvc: vi.fn(() => ({
          getRecording: vi.fn().mockResolvedValue({ blobKey: "rec-key" }),
          getAttachment: vi.fn(),
        })),
        blobStore: {
          put: vi.fn(async () => "key"),
          get: vi.fn(async () => null),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/recordings/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("attachments", () => {
    it("returns 200 with blob data", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      const blobData = Buffer.from([4, 5, 6, 7]);
      const getAttachment = vi.fn().mockResolvedValue({ blobKey: "att-key" });
      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createMediaSvc: vi.fn(() => ({
          getRecording: vi.fn(),
          getAttachment,
        })),
        blobStore: {
          put: vi.fn(async () => "key"),
          get: vi.fn(async () => blobData),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/attachments/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(blobData);
      expect(res.headers["Content-Type"]).toBe("application/octet-stream");
      expect(res.headers["Content-Length"]).toBe("4");
    });
  });

  describe("kb-attachments", () => {
    it("returns 200 with blob data", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      const blobData = Buffer.from([8, 9]);
      const getAttachment = vi.fn().mockResolvedValue({ blobKey: "kb-key" });
      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createKBMediaSvc: vi.fn(() => ({
          getAttachment,
        })),
        blobStore: {
          put: vi.fn(async () => "key"),
          get: vi.fn(async () => blobData),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/kb-attachments/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(blobData);
      expect(res.headers["Content-Type"]).toBe("application/octet-stream");
      expect(res.headers["Content-Length"]).toBe("2");
    });

    it("returns 404 when kb attachment not found", async () => {
      authOk();
      mockHasPermForOrg.mockResolvedValue(true);

      deps = buildDeps({
        getUserRole: vi.fn(async () => "volunteer"),
        createKBMediaSvc: vi.fn(() => ({
          getAttachment: vi
            .fn()
            .mockRejectedValue(new NotFoundError("not found")),
        })),
      });
      handler = createBlobDownloadHandler(deps);

      const req = mockReq("GET", `/api/blobs/kb-attachments/${TEST_UUID}`);
      const res = mockRes();
      await handler(req, res);
      expect(res.statusCode).toBe(404);
    });
  });
});
