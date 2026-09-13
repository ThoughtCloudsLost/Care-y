/**
 * Tests for the blob download handler.
 *
 * Covers URL parsing, both credentials, permission checks, and the four
 * blob categories. Volunteer categories delegate record lookup to
 * MediaService / KBMediaService; the portal category resolves a channel
 * and then asks whether a wrap ties the file to it. Blob retrieval is
 * BlobStore's job either way.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createBlobDownloadHandler,
  type BlobDownloadHandlerDeps,
} from "./blob-download.js";
import { NotFoundError, ForbiddenError } from "../errors.js";
import type { UserId, OrgId, OrgSchema } from "@care-y/shared";
import * as RelayUtils from "./relay-utils.js";
import * as Roles from "../auth/roles.js";
import * as PortalBlobAuth from "../portal/portal-blob-auth.js";
import * as PortalAttachments from "../portal/portal-attachment-service.js";

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

vi.mock("../portal/portal-blob-auth.js", async (importOriginal) => {
  const orig = await importOriginal<typeof PortalBlobAuth>();
  return {
    ...orig,
    resolvePortalBlobChannel: vi.fn(),
  };
});

vi.mock("../portal/portal-attachment-service.js", async (importOriginal) => {
  const orig = await importOriginal<typeof PortalAttachments>();
  return {
    ...orig,
    resolveChannelBlobKey: vi.fn(),
  };
});

import * as PortalRecordings from "../portal/portal-recording-service.js";

vi.mock("../portal/portal-recording-service.js", async (importOriginal) => {
  const orig = await importOriginal<typeof PortalRecordings>();
  return {
    ...orig,
    resolveChannelRecordingBlobKey: vi.fn(),
  };
});

const mockAuth = RelayUtils.authenticateRelay as ReturnType<typeof vi.fn>;
const mockResolveChannel =
  PortalBlobAuth.resolvePortalBlobChannel as ReturnType<typeof vi.fn>;
const mockResolveBlobKey =
  PortalAttachments.resolveChannelBlobKey as ReturnType<typeof vi.fn>;
const mockResolveRecBlobKey =
  PortalRecordings.resolveChannelRecordingBlobKey as ReturnType<typeof vi.fn>;
const mockHasPermForOrg = Roles.hasPermissionForOrg as ReturnType<typeof vi.fn>;

const TEST_UUID = "00000000-0000-4000-8000-000000000001";

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
    session: {
      userId: "u1" as UserId,
      orgId: TEST_UUID as OrgId,
      orgSchema: "org_test" as OrgSchema,
      sessionId: "s1",
    },
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

describe("portal attachment downloads", () => {
  const ATT_ID = "00000000-0000-4000-8000-0000000000aa";

  beforeEach(() => {
    mockResolveChannel.mockReset();
    mockResolveBlobKey.mockReset();
    mockAuth.mockReset();
  });

  function portalReq(): IncomingMessage {
    return mockReq("GET", `/api/blobs/portal-attachments/${ATT_ID}`, {
      "x-portal-channel": "a".repeat(48),
      "x-portal-auth": "dGVzdA==",
    });
  }

  it("serves a file the channel holds a wrap for", async () => {
    mockResolveChannel.mockResolvedValue({ id: "chan-1" });
    mockResolveBlobKey.mockResolvedValue("blob-key-1");

    const deps = buildDeps({
      blobStore: {
        put: vi.fn(),
        get: vi.fn(async () => Buffer.from("ciphertext")),
        delete: vi.fn(),
        exists: vi.fn(),
      },
    });
    const res = mockRes();
    await createBlobDownloadHandler(deps)(portalReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("application/octet-stream");
    // A volunteer session is never consulted on this path.
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("refuses a request carrying no portal credential", async () => {
    mockResolveChannel.mockResolvedValue(null);

    const res = mockRes();
    await createBlobDownloadHandler(buildDeps())(portalReq(), res);

    expect(res.statusCode).toBe(401);
    expect(mockResolveBlobKey).not.toHaveBeenCalled();
  });

  it("refuses a file no wrap ties to this channel", async () => {
    // The id is a real attachment; it belongs to someone else. This is the
    // check that makes an id useless on its own.
    mockResolveChannel.mockResolvedValue({ id: "chan-1" });
    mockResolveBlobKey.mockResolvedValue(null);

    const deps = buildDeps();
    const res = mockRes();
    await createBlobDownloadHandler(deps)(portalReq(), res);

    expect(res.statusCode).toBe(404);
    expect(deps.blobStore.get).not.toHaveBeenCalled();
  });

  it("answers the same 404 whether the file is missing or not theirs", async () => {
    mockResolveChannel.mockResolvedValue({ id: "chan-1" });
    mockResolveBlobKey.mockResolvedValue(null);
    const notTheirs = mockRes();
    await createBlobDownloadHandler(buildDeps())(portalReq(), notTheirs);

    mockResolveBlobKey.mockResolvedValue("blob-key-gone");
    const missing = mockRes();
    await createBlobDownloadHandler(
      buildDeps({
        blobStore: {
          put: vi.fn(),
          get: vi.fn(async () => null),
          delete: vi.fn(),
          exists: vi.fn(),
        },
      }),
    )(portalReq(), missing);

    // Distinguishing the two would let anyone holding one channel find out
    // which attachment ids exist.
    expect(notTheirs.statusCode).toBe(404);
    expect(missing.statusCode).toBe(404);
  });

  it("refuses when the org cannot be resolved from the request", async () => {
    const res = mockRes();
    await createBlobDownloadHandler(
      buildDeps({ orgResolver: vi.fn(async () => null) }),
    )(portalReq(), res);

    expect(res.statusCode).toBe(401);
    expect(mockResolveChannel).not.toHaveBeenCalled();
  });
});

describe("portal recording downloads", () => {
  const REC_ID = "00000000-0000-4000-8000-0000000000bb";

  beforeEach(() => {
    mockResolveChannel.mockReset();
    mockResolveRecBlobKey.mockReset();
    mockAuth.mockReset();
  });

  function portalRecReq(): IncomingMessage {
    return mockReq("GET", `/api/blobs/portal-recordings/${REC_ID}`, {
      "x-portal-channel": "a".repeat(48),
      "x-portal-auth": "dGVzdA==",
    });
  }

  it("serves a recording the channel holds a wrap for", async () => {
    mockResolveChannel.mockResolvedValue({ id: "chan-1" });
    mockResolveRecBlobKey.mockResolvedValue("blob-key-rec");

    const deps = buildDeps({
      blobStore: {
        put: vi.fn(),
        get: vi.fn(async () => Buffer.from("rec-ciphertext")),
        delete: vi.fn(),
        exists: vi.fn(),
      },
    });
    const res = mockRes();
    await createBlobDownloadHandler(deps)(portalRecReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("application/octet-stream");
    // A volunteer session is never consulted on this path.
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("refuses a request carrying no portal credential", async () => {
    mockResolveChannel.mockResolvedValue(null);

    const res = mockRes();
    await createBlobDownloadHandler(buildDeps())(portalRecReq(), res);

    expect(res.statusCode).toBe(401);
    expect(mockResolveRecBlobKey).not.toHaveBeenCalled();
  });

  it("refuses a recording no wrap ties to this channel (404)", async () => {
    mockResolveChannel.mockResolvedValue({ id: "chan-1" });
    mockResolveRecBlobKey.mockResolvedValue(null);

    const deps = buildDeps();
    const res = mockRes();
    await createBlobDownloadHandler(deps)(portalRecReq(), res);

    expect(res.statusCode).toBe(404);
    expect(deps.blobStore.get).not.toHaveBeenCalled();
  });

  it("refuses when the org cannot be resolved from the request", async () => {
    const res = mockRes();
    await createBlobDownloadHandler(
      buildDeps({ orgResolver: vi.fn(async () => null) }),
    )(portalRecReq(), res);

    expect(res.statusCode).toBe(401);
    expect(mockResolveChannel).not.toHaveBeenCalled();
  });
});
