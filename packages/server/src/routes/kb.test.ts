/**
 * Unit tests for the KB tRPC router.
 *
 * Service layer is mocked via deps. These verify:
 * - Router delegates correctly to services
 * - Base64-to-Buffer conversion works
 * - Permission enforcement (volunteer vs manager)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createKbRouter, type KBRouterDeps } from "./kb.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type {
  KBCategoryService,
  KBItemService,
  KBVoteService,
  KBCategoryRecord,
  KBItemRecord,
  KBItemPage,
  KBVoteRecord,
} from "../kb/service.js";
import { RoleId } from "@care-y/shared";

// --- Mock services ---

function createMockCategorySvc(): KBCategoryService {
  return {
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  };
}

function createMockItemSvc(): KBItemService {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    listRecentlyUpdated: vi.fn(),
    listAuthors: vi.fn(),
    listBodies: vi.fn(),
  };
}

function createMockVoteSvc(): KBVoteService {
  return {
    castVote: vi.fn(),
    removeVote: vi.fn(),
    getUserVote: vi.fn(),
  };
}

// --- Context helpers ---

const USER_ID = "user-kb-1";
const MANAGER_ID = "manager-kb-1";

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-kb-test",
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function volunteerContext(): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "sess-1",
      token: "tok-1",
      userId: USER_ID,
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: USER_ID,
      encryptedIdentifier: "volunteer",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function managerContext(): Context {
  return {
    ...volunteerContext(),
    session: {
      ...volunteerContext().session!,
      userId: MANAGER_ID,
    },
    user: {
      id: MANAGER_ID,
      encryptedIdentifier: "manager",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId: RoleId.MANAGER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

// --- Test setup ---

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_BASE64 = Buffer.from("test-data").toString("base64");

const NOW = new Date();

const MOCK_CATEGORY: KBCategoryRecord = {
  id: VALID_UUID,
  encryptedName: Buffer.from("Protocols"),
  sortOrder: 1,
  encryptedDescription: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_ITEM: KBItemRecord = {
  id: VALID_UUID,
  categoryId: VALID_UUID,
  encryptedTitle: Buffer.from("title"),
  encryptedBody: Buffer.from("body"),
  encryptedExcerpt: null,
  createdBy: USER_ID,
  voteUpCount: 0,
  voteDownCount: 0,
  rating: 0,
  attachmentCount: 0,
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_ITEM_PAGE: KBItemPage = {
  items: [MOCK_ITEM],
  nextCursor: null,
  total: 1,
};

const MOCK_VOTE: KBVoteRecord = {
  id: VALID_UUID,
  kbItemId: VALID_UUID,
  voterPseudonym: USER_ID,
  direction: "up",
  createdAt: NOW,
};

let mockCatSvc: KBCategoryService;
let mockItemSvc: KBItemService;
let mockVoteSvc: KBVoteService;

const mockBlobStore = {
  put: vi.fn().mockResolvedValue("blob-key-1"),
  get: vi.fn().mockResolvedValue(Buffer.from("encrypted-blob")),
  delete: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue(true),
};

const mockMediaSvc = {
  createAttachment: vi.fn().mockResolvedValue({
    id: "att-1",
    itemId: "item-1",
    blobKey: "blob-key-1",
    sizeBytes: 1024,
    encryptedFilename: null,
    contentType: "image/png",
    createdAt: NOW,
    deletedAt: null,
  }),
  getAttachment: vi.fn().mockResolvedValue({
    id: "att-1",
    itemId: "item-1",
    blobKey: "blob-key-1",
    sizeBytes: 1024,
    encryptedFilename: null,
    contentType: "image/png",
    createdAt: NOW,
    deletedAt: null,
  }),
  listAttachments: vi.fn().mockResolvedValue([]),
  softDeleteAttachment: vi.fn().mockResolvedValue(undefined),
};

const mockUploadLimiter = {
  check: vi
    .fn()
    .mockReturnValue({ allowed: true, remaining: 4, retryAfterMs: 0 }),
  reset: vi.fn(),
};

function buildDeps(): KBRouterDeps {
  return {
    createCategorySvc: () => mockCatSvc,
    createItemSvc: () => mockItemSvc,
    createVoteSvc: () => mockVoteSvc,
    createMediaSvc: () => mockMediaSvc,
    blobStore: mockBlobStore,
    uploadLimiter: mockUploadLimiter,
  };
}

function buildVolunteerCaller() {
  const routerInstance = createKbRouter(buildDeps());
  return createCallerFactory(routerInstance)(volunteerContext());
}

function buildManagerCaller() {
  const routerInstance = createKbRouter(buildDeps());
  return createCallerFactory(routerInstance)(managerContext());
}

beforeEach(() => {
  mockCatSvc = createMockCategorySvc();
  mockItemSvc = createMockItemSvc();
  mockVoteSvc = createMockVoteSvc();
  vi.clearAllMocks();
});

// --- Category tests ---

describe("KB Category routes", () => {
  it("manager can create a category", async () => {
    vi.mocked(mockCatSvc.create).mockResolvedValue(MOCK_CATEGORY);
    const caller = buildManagerCaller();

    const result = await caller.createCategory({
      encryptedName: VALID_BASE64,
    });
    expect(result.id).toBe(MOCK_CATEGORY.id);
    expect(Buffer.isBuffer(result.encryptedName)).toBe(true);
    expect(mockCatSvc.create).toHaveBeenCalledOnce();
  });

  it("manager can create category with encrypted description", async () => {
    vi.mocked(mockCatSvc.create).mockResolvedValue({
      ...MOCK_CATEGORY,
      encryptedDescription: Buffer.from("test-data"),
    });
    const caller = buildManagerCaller();

    const result = await caller.createCategory({
      encryptedName: VALID_BASE64,
      encryptedDescription: VALID_BASE64,
    });

    expect(result.id).toBe(MOCK_CATEGORY.id);
    expect(Buffer.isBuffer(result.encryptedDescription)).toBe(true);
    expect(mockCatSvc.create).toHaveBeenCalledOnce();
  });

  it("volunteer cannot create a category", async () => {
    const caller = buildVolunteerCaller();
    await expect(
      caller.createCategory({ encryptedName: VALID_BASE64 }),
    ).rejects.toThrow(TRPCError);
  });

  it("volunteer can list categories", async () => {
    vi.mocked(mockCatSvc.list).mockResolvedValue([MOCK_CATEGORY]);
    const caller = buildVolunteerCaller();

    const result = await caller.listCategories();
    expect(result).toHaveLength(1);
    expect(Buffer.isBuffer(result[0]!.encryptedName)).toBe(true);
  });

  it("manager can update a category", async () => {
    const updatedName = Buffer.from("Updated");
    vi.mocked(mockCatSvc.update).mockResolvedValue({
      ...MOCK_CATEGORY,
      encryptedName: updatedName,
    });
    const caller = buildManagerCaller();

    const result = await caller.updateCategory({
      categoryId: VALID_UUID,
      encryptedName: VALID_BASE64,
    });
    expect(Buffer.isBuffer(result.encryptedName)).toBe(true);
  });

  it("volunteer cannot update a category", async () => {
    const caller = buildVolunteerCaller();
    await expect(
      caller.updateCategory({
        categoryId: VALID_UUID,
        encryptedName: VALID_BASE64,
      }),
    ).rejects.toThrow(TRPCError);
  });

  it("manager can delete a category", async () => {
    vi.mocked(mockCatSvc.delete).mockResolvedValue(undefined);
    const caller = buildManagerCaller();

    await caller.deleteCategory({ categoryId: VALID_UUID });
    expect(mockCatSvc.delete).toHaveBeenCalledWith(VALID_UUID);
  });

  it("volunteer cannot delete a category", async () => {
    const caller = buildVolunteerCaller();
    await expect(
      caller.deleteCategory({ categoryId: VALID_UUID }),
    ).rejects.toThrow(TRPCError);
  });
});

// --- Article tests ---

describe("KB Article routes", () => {
  it("volunteer can create an article", async () => {
    vi.mocked(mockItemSvc.create).mockResolvedValue(MOCK_ITEM);
    const caller = buildVolunteerCaller();

    const result = await caller.createItem({
      categoryId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
    });

    expect(result.id).toBe(MOCK_ITEM.id);
    expect(result.categoryId).toBe(VALID_UUID);
    expect(mockItemSvc.create).toHaveBeenCalledOnce();
  });

  it("volunteer can get an article", async () => {
    vi.mocked(mockItemSvc.findById).mockResolvedValue(MOCK_ITEM);
    const caller = buildVolunteerCaller();

    const result = await caller.getItem({ itemId: VALID_UUID });
    expect(result.id).toBe(VALID_UUID);
  });

  it("volunteer can list articles with pagination", async () => {
    vi.mocked(mockItemSvc.list).mockResolvedValue(MOCK_ITEM_PAGE);
    const caller = buildVolunteerCaller();

    const result = await caller.listItems({ limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
    expect(result.total).toBe(1);
    expect(mockItemSvc.list).toHaveBeenCalledOnce();
  });

  it("volunteer can list articles with sort and filter params", async () => {
    vi.mocked(mockItemSvc.list).mockResolvedValue(MOCK_ITEM_PAGE);
    const caller = buildVolunteerCaller();

    const result = await caller.listItems({
      limit: 20,
      sortBy: "rating",
      sortDirection: "asc",
      minRating: 0.5,
      createdBy: "user-1",
      createdAfter: "2026-01-01T00:00:00.000Z",
      createdBefore: "2026-12-31T23:59:59.999Z",
    });

    expect(result.items).toHaveLength(1);
    expect(mockItemSvc.list).toHaveBeenCalledOnce();
  });

  it("volunteer can update an article", async () => {
    vi.mocked(mockItemSvc.update).mockResolvedValue(MOCK_ITEM);
    const caller = buildVolunteerCaller();

    const result = await caller.updateItem({
      itemId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
    });

    expect(result.id).toBe(MOCK_ITEM.id);
    expect(mockItemSvc.update).toHaveBeenCalledOnce();
  });

  it("volunteer cannot delete an article", async () => {
    const caller = buildVolunteerCaller();
    await expect(caller.deleteItem({ itemId: VALID_UUID })).rejects.toThrow(
      TRPCError,
    );
  });

  it("manager can delete an article", async () => {
    vi.mocked(mockItemSvc.delete).mockResolvedValue(undefined);
    const caller = buildManagerCaller();

    await caller.deleteItem({ itemId: VALID_UUID });
    expect(mockItemSvc.delete).toHaveBeenCalledWith(VALID_UUID);
  });
});

// --- Bulk body fetch tests ---

describe("KB listBodies route", () => {
  const ITEM_ID_1 = "550e8400-e29b-41d4-a716-446655440001";
  const ITEM_ID_2 = "550e8400-e29b-41d4-a716-446655440002";

  it("volunteer can fetch bodies by item IDs", async () => {
    const mockResults = [
      { id: ITEM_ID_1, encryptedBody: Buffer.from("body-1") },
      { id: ITEM_ID_2, encryptedBody: Buffer.from("body-2") },
    ];
    vi.mocked(mockItemSvc.listBodies).mockResolvedValue(mockResults);
    const caller = buildVolunteerCaller();

    const result = await caller.listBodies({ itemIds: [ITEM_ID_1, ITEM_ID_2] });
    expect(result).toHaveLength(2);
    expect(mockItemSvc.listBodies).toHaveBeenCalledWith([ITEM_ID_1, ITEM_ID_2]);
  });

  it("rejects empty itemIds array", async () => {
    const caller = buildVolunteerCaller();
    await expect(caller.listBodies({ itemIds: [] })).rejects.toThrow();
  });
});

// --- Voting tests ---

describe("KB Voting routes", () => {
  it("volunteer can cast a vote", async () => {
    vi.mocked(mockVoteSvc.castVote).mockResolvedValue(undefined);
    const caller = buildVolunteerCaller();

    await caller.castVote({ itemId: VALID_UUID, direction: "up" });
    expect(mockVoteSvc.castVote).toHaveBeenCalledWith(USER_ID, {
      itemId: VALID_UUID,
      direction: "up",
    });
  });

  it("volunteer can remove a vote", async () => {
    vi.mocked(mockVoteSvc.removeVote).mockResolvedValue(undefined);
    const caller = buildVolunteerCaller();

    await caller.removeVote({ itemId: VALID_UUID });
    expect(mockVoteSvc.removeVote).toHaveBeenCalledWith(USER_ID, VALID_UUID);
  });

  it("volunteer can get their vote", async () => {
    vi.mocked(mockVoteSvc.getUserVote).mockResolvedValue(MOCK_VOTE);
    const caller = buildVolunteerCaller();

    const result = await caller.getUserVote({ itemId: VALID_UUID });
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("up");
  });

  it("getUserVote returns null when no vote", async () => {
    vi.mocked(mockVoteSvc.getUserVote).mockResolvedValue(null);
    const caller = buildVolunteerCaller();

    const result = await caller.getUserVote({ itemId: VALID_UUID });
    expect(result).toBeNull();
  });
});

// --- Attachment tests ---

describe("KB Attachment routes", () => {
  // PNG magic bytes prefix so validateMagicBytes accepts it as image/png
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const SMALL_BLOB = Buffer.concat([
    pngHeader,
    Buffer.from("test-payload"),
  ]).toString("base64");

  it("volunteer can upload an attachment", async () => {
    const caller = buildVolunteerCaller();

    const result = await caller.uploadAttachment({
      itemId: VALID_UUID,
      blob: SMALL_BLOB,
      sizeBytes: 20,
      contentType: "image/png",
    });

    expect(result.id).toBe("att-1");
    expect(mockBlobStore.put).toHaveBeenCalledOnce();
    expect(mockMediaSvc.createAttachment).toHaveBeenCalledOnce();
  });

  it("upload rejects files exceeding 10MB via Zod schema", async () => {
    const caller = buildVolunteerCaller();

    // sizeBytes exceeds the max: Zod will reject before the route runs
    await expect(
      caller.uploadAttachment({
        itemId: VALID_UUID,
        blob: SMALL_BLOB,
        sizeBytes: 10 * 1024 * 1024 + 1,
        contentType: "image/png",
      }),
    ).rejects.toThrow();

    // blobStore.put should never be called
    expect(mockBlobStore.put).not.toHaveBeenCalled();
  });

  it("upload rejects disallowed content types", async () => {
    const caller = buildVolunteerCaller();

    await expect(
      caller.uploadAttachment({
        itemId: VALID_UUID,
        blob: SMALL_BLOB,
        sizeBytes: 100,
        contentType: "text/html" as unknown as "image/png",
      }),
    ).rejects.toThrow();

    expect(mockBlobStore.put).not.toHaveBeenCalled();
  });

  it("volunteer can download an attachment blob", async () => {
    const caller = buildVolunteerCaller();

    const result = await caller.downloadAttachmentBlob({
      attachmentId: VALID_UUID,
    });

    expect(result.data).toBeDefined();
    expect(typeof result.data).toBe("string");
    expect(mockMediaSvc.getAttachment).toHaveBeenCalledWith(VALID_UUID);
    expect(mockBlobStore.get).toHaveBeenCalledWith("blob-key-1");
  });

  it("download throws when blob is missing from store", async () => {
    mockBlobStore.get.mockResolvedValueOnce(null);
    const caller = buildVolunteerCaller();

    await expect(
      caller.downloadAttachmentBlob({ attachmentId: VALID_UUID }),
    ).rejects.toThrow(TRPCError);
  });

  it("volunteer can list attachments for an item", async () => {
    mockMediaSvc.listAttachments.mockResolvedValueOnce([
      {
        id: "att-1",
        itemId: VALID_UUID,
        blobKey: "key-1",
        sizeBytes: 100,
        encryptedFilename: null,
        contentType: "image/png",
        createdAt: NOW,
        deletedAt: null,
      },
    ]);

    const caller = buildVolunteerCaller();
    const result = await caller.listAttachments({ itemId: VALID_UUID });

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("att-1");
  });

  it("upload is rate-limited (5/min per user)", async () => {
    mockUploadLimiter.check.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterMs: 30_000,
    });

    const caller = buildVolunteerCaller();
    await expect(
      caller.uploadAttachment({
        itemId: VALID_UUID,
        blob: SMALL_BLOB,
        sizeBytes: 20,
        contentType: "image/png",
      }),
    ).rejects.toThrow(TRPCError);

    expect(mockBlobStore.put).not.toHaveBeenCalled();
  });

  it("upload rejects sizeBytes mismatch with actual blob", async () => {
    const caller = buildVolunteerCaller();

    // Declared sizeBytes (999) does not match actual blob (20 bytes)
    await expect(
      caller.uploadAttachment({
        itemId: VALID_UUID,
        blob: SMALL_BLOB,
        sizeBytes: 999,
        contentType: "image/png",
      }),
    ).rejects.toThrow(TRPCError);

    expect(mockBlobStore.put).not.toHaveBeenCalled();
  });
});
