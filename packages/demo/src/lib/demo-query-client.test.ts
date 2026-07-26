import { describe, it, expect } from "vitest";
import {
  createDemoQueryClient,
  reseedDemoQueryClient,
} from "./demo-query-client.js";
import { authKeys } from "$lib/query/keys.js";

describe("createDemoQueryClient", () => {
  it("returns a QueryClient with auth.me pre-seeded", () => {
    const client = createDemoQueryClient();
    const data = client.getQueryData(authKeys.me());
    expect(data).toBeDefined();
  });

  it("auth.me data has the expected user shape", () => {
    const client = createDemoQueryClient();
    const data = client.getQueryData<{
      user: { id: string; roleId: string; encryptedDisplayName: string };
      permissions: readonly string[];
    }>(authKeys.me());
    expect(data?.user.id).toBe("demo-user-001");
    expect(data?.user.roleId).toBe("demo-role-001");
    expect(data?.user.encryptedDisplayName).toBeDefined();
    expect(data?.permissions).toContain("tickets:read");
  });

  it("has retry disabled by default", () => {
    const client = createDemoQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(false);
  });

  it("has infinite staleTime", () => {
    const client = createDemoQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(Infinity);
  });
});

describe("reseedDemoQueryClient", () => {
  it("clears all query data and re-seeds auth.me", () => {
    const client = createDemoQueryClient();
    // Add some extra data that should be cleared
    client.setQueryData(["test-key"], { value: 42 });
    expect(client.getQueryData(["test-key"])).toBeDefined();

    reseedDemoQueryClient(client);

    // Extra data should be gone
    expect(client.getQueryData(["test-key"])).toBeUndefined();
    // auth.me should still be present
    const me = client.getQueryData(authKeys.me());
    expect(me).toBeDefined();
  });

  it("preserves auth.me shape after reseed", () => {
    const client = createDemoQueryClient();
    reseedDemoQueryClient(client);

    const data = client.getQueryData<{
      user: { id: string };
      permissions: readonly string[];
    }>(authKeys.me());
    expect(data?.user.id).toBe("demo-user-001");
    expect(data?.permissions).toContain("tickets:read");
  });
});
