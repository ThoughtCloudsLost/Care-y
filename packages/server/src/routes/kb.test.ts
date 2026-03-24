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
  };
}

function createMockItemSvc(): KBItemService {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
      identifier: "volunteer",
      encryptedDisplayName: "encrypted",
      roleId: RoleId.VOLUNTEER,
      isActive: true,
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
      identifier: "manager",
      encryptedDisplayName: "encrypted",
      roleId: RoleId.MANAGER,
      isActive: true,
    },
  };
}

// --- Test setup ---

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_BASE64 = Buffer.from("test-data").toString("base64");

const NOW = new Date();

const MOCK_CATEGORY: KBCategoryRecord = {
  id: VALID_UUID,
  name: "Protocols",
  encryptedDescription: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_ITEM: KBItemRecord = {
  id: VALID_UUID,
  categoryId: VALID_UUID,
  encryptedTitle: Buffer.from("title"),
  encryptedBody: Buffer.from("body"),
  createdBy: USER_ID,
  voteUpCount: 0,
  voteDownCount: 0,
  rating: 0,
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_ITEM_PAGE: KBItemPage = {
  items: [MOCK_ITEM],
  nextCursor: null,
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

function buildDeps(): KBRouterDeps {
  return {
    createCategorySvc: () => mockCatSvc,
    createItemSvc: () => mockItemSvc,
    createVoteSvc: () => mockVoteSvc,
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
});

// --- Category tests ---

describe("KB Category routes", () => {
  it("manager can create a category", async () => {
    vi.mocked(mockCatSvc.create).mockResolvedValue(MOCK_CATEGORY);
    const caller = buildManagerCaller();

    const result = await caller.createCategory({ name: "Protocols" });
    expect(result.name).toBe("Protocols");
    expect(mockCatSvc.create).toHaveBeenCalledWith({
      name: "Protocols",
      encryptedDescription: undefined,
    });
  });

  it("manager can create category with encrypted description", async () => {
    vi.mocked(mockCatSvc.create).mockResolvedValue({
      ...MOCK_CATEGORY,
      encryptedDescription: Buffer.from("test-data"),
    });
    const caller = buildManagerCaller();

    await caller.createCategory({
      name: "Test",
      encryptedDescription: VALID_BASE64,
    });

    const call = vi.mocked(mockCatSvc.create).mock.calls[0]![0];
    expect(Buffer.isBuffer(call.encryptedDescription)).toBe(true);
  });

  it("volunteer cannot create a category", async () => {
    const caller = buildVolunteerCaller();
    await expect(caller.createCategory({ name: "Nope" })).rejects.toThrow(
      TRPCError,
    );
  });

  it("volunteer can list categories", async () => {
    vi.mocked(mockCatSvc.list).mockResolvedValue([MOCK_CATEGORY]);
    const caller = buildVolunteerCaller();

    const result = await caller.listCategories();
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Protocols");
  });

  it("manager can update a category", async () => {
    vi.mocked(mockCatSvc.update).mockResolvedValue({
      ...MOCK_CATEGORY,
      name: "Updated",
    });
    const caller = buildManagerCaller();

    const result = await caller.updateCategory({
      categoryId: VALID_UUID,
      name: "Updated",
    });
    expect(result.name).toBe("Updated");
  });

  it("volunteer cannot update a category", async () => {
    const caller = buildVolunteerCaller();
    await expect(
      caller.updateCategory({ categoryId: VALID_UUID, name: "Nope" }),
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

    await caller.createItem({
      categoryId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
    });

    const call = vi.mocked(mockItemSvc.create).mock.calls[0]!;
    expect(call[0]).toBe(USER_ID); // createdBy
    expect(Buffer.isBuffer(call[1].encryptedTitle)).toBe(true);
    expect(Buffer.isBuffer(call[1].encryptedBody)).toBe(true);
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
  });

  it("volunteer can update an article", async () => {
    vi.mocked(mockItemSvc.update).mockResolvedValue(MOCK_ITEM);
    const caller = buildVolunteerCaller();

    await caller.updateItem({
      itemId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
    });

    const call = vi.mocked(mockItemSvc.update).mock.calls[0]!;
    expect(call[0]).toBe(VALID_UUID);
    expect(Buffer.isBuffer(call[1].encryptedTitle)).toBe(true);
    expect(call[1].encryptedBody).toBeUndefined();
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
