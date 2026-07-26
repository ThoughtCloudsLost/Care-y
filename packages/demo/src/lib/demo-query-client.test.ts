import { describe, it, expect } from "vitest";
import { createDemoQueryClient } from "./demo-query-client.js";
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
