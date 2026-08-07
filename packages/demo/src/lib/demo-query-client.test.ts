import { describe, it, expect } from "vitest";
import { createDemoQueryClient } from "./demo-query-client.js";
import { authKeys } from "$lib/query/keys.js";

describe("createDemoQueryClient", () => {
  it("does not pre-seed auth.me (the real engine endpoint serves it)", () => {
    const client = createDemoQueryClient();
    expect(client.getQueryData(authKeys.me())).toBeUndefined();
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

  it("keeps refetch triggers off", () => {
    const defaults = createDemoQueryClient().getDefaultOptions();
    expect(defaults.queries?.refetchOnMount).toBe(false);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries?.refetchOnReconnect).toBe(false);
  });
});
