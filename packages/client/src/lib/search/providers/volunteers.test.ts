import { describe, it, expect, vi } from "vitest";
import {
  createVolunteerSearchProvider,
  type RawAdminUser,
  type VolunteerSearchProviderDeps,
} from "./volunteers.js";

vi.mock("$lib/paraglide/messages.js", () => ({
  search_section_volunteers: () => "Volunteers",
}));

vi.mock("$lib/components/search/VolunteerResultItem.svelte", () => ({
  default: {} as never,
}));

function makeUser(
  overrides: Partial<RawAdminUser> & { id: string },
): RawAdminUser {
  return {
    encryptedDisplayName: new Uint8Array([1, 2, 3]),
    roleId: "volunteer",
    isActive: true,
    hasKeys: true,
    hasOrgKeyWrap: true,
    ...overrides,
  };
}

const testUsers: RawAdminUser[] = [
  makeUser({ id: "u1" }),
  makeUser({ id: "u2", isActive: false }),
  makeUser({ id: "u3", roleId: "admin" }),
];

const nameMap: Record<string, string> = {
  u1: "Maria Garcia",
  u2: "Jose Rodriguez",
  u3: "Ana Lopez",
};

function createDeps(
  users: readonly RawAdminUser[] = testUsers,
): VolunteerSearchProviderDeps {
  return {
    fetchUsers: vi.fn(async () => users),
    decryptDisplayName: (userId) => nameMap[userId] ?? null,
    currentUserId: () => "u1",
  };
}

async function createLoadedProvider(
  deps?: VolunteerSearchProviderDeps,
): Promise<ReturnType<typeof createVolunteerSearchProvider>> {
  const provider = createVolunteerSearchProvider(deps ?? createDeps());
  // First call triggers loadAll; await the microtask to populate cache.
  provider.search("trigger");
  await vi.waitFor(() => {
    const { loading } = provider.search("trigger");
    if (loading) throw new Error("still loading");
  });
  return provider;
}

describe("createVolunteerSearchProvider", () => {
  it("matches on decrypted display name", async () => {
    const provider = await createLoadedProvider();
    const { results } = provider.search("maria");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("u1");
    expect(results[0]!.data.displayName).toBe("Maria Garcia");
  });

  it("returns empty results for non-matching query", async () => {
    const provider = await createLoadedProvider();
    const { results } = provider.search("nonexistent person xyz");
    expect(results).toHaveLength(0);
  });

  it("triggers lazy fetch and returns loading on first search", () => {
    const fetchUsers = vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentionally never-resolving to test loading state
      () => new Promise<readonly RawAdminUser[]>(() => {}),
    );
    const provider = createVolunteerSearchProvider({
      fetchUsers,
      decryptDisplayName: () => null,
      currentUserId: () => "u1",
    });
    const { results, totalCached, loading } = provider.search("maria");
    expect(results).toHaveLength(0);
    expect(totalCached).toBe(0);
    expect(loading).toBe(true);
    expect(fetchUsers).toHaveBeenCalledOnce();
  });

  it("returns empty results for empty user list", async () => {
    const provider = await createLoadedProvider(createDeps([]));
    const { results, totalCached } = provider.search("maria");
    expect(results).toHaveLength(0);
    expect(totalCached).toBe(0);
  });

  it("includes inactive users in results", async () => {
    const provider = await createLoadedProvider();
    const { results } = provider.search("jose");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("u2");
    expect(results[0]!.data.isActive).toBe(false);
  });

  it("handles accent folding (jose matches Jose)", async () => {
    const accented: Record<string, string> = {
      u1: "Jose Rodriguez",
    };
    const provider = await createLoadedProvider({
      fetchUsers: vi.fn(async () => [makeUser({ id: "u1" })]),
      decryptDisplayName: (id) => accented[id] ?? null,
      currentUserId: () => "other",
    });
    const { results } = provider.search("jose");
    expect(results).toHaveLength(1);
  });

  it("sets isSelf for the current user", async () => {
    const provider = await createLoadedProvider();
    const { results } = provider.search("maria");
    expect(results[0]!.data.isSelf).toBe(true);
  });

  it("sets isSelf to false for other users", async () => {
    const provider = await createLoadedProvider();
    const { results } = provider.search("ana");
    expect(results[0]!.data.isSelf).toBe(false);
  });

  it("reports totalCached as the number of users", async () => {
    const provider = await createLoadedProvider();
    const { totalCached } = provider.search("garcia");
    expect(totalCached).toBe(3);
  });

  it("skips users whose names fail to decrypt", async () => {
    const provider = await createLoadedProvider({
      fetchUsers: vi.fn(async () => testUsers),
      decryptDisplayName: (userId) => (userId === "u1" ? "Maria" : null),
      currentUserId: () => "other",
    });
    const { results, totalCached } = provider.search("maria");
    expect(results).toHaveLength(1);
    expect(totalCached).toBe(3);
  });

  it("generates correct showAllHref", async () => {
    const provider = await createLoadedProvider();
    expect(provider.showAllHref("test query")).toBe(
      "/admin/people?tab=users&q=test%20query",
    );
  });

  it("generates correct getResultHref", async () => {
    const provider = await createLoadedProvider();
    expect(provider.getResultHref("u1")).toBe("/admin/people?user=u1");
  });

  it("has card-strip render mode", async () => {
    const provider = await createLoadedProvider();
    expect(provider.renderMode).toBe("card-strip");
  });

  it("does not implement fullSearch", async () => {
    const provider = await createLoadedProvider();
    expect(provider.fullSearch).toBeUndefined();
  });
});
