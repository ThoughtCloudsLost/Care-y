// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RoleId } from "@care-y/shared";

describe("userFilterStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function getStore() {
    const { userFilterStore } = await import("./user-filters.svelte.js");
    return userFilterStore;
  }

  describe("toggleRole", () => {
    it("adds a role on first call", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.VOLUNTEER);
      expect(store.roles.has(RoleId.VOLUNTEER)).toBe(true);
      expect(store.roles.size).toBe(1);
    });

    it("removes a role on second call", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.ADMIN);
      store.toggleRole(RoleId.ADMIN);
      expect(store.roles.has(RoleId.ADMIN)).toBe(false);
      expect(store.roles.size).toBe(0);
    });

    it("accumulates multiple roles", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.VOLUNTEER);
      store.toggleRole(RoleId.MANAGER);
      store.toggleRole(RoleId.ADMIN);
      expect(store.roles.size).toBe(3);
      expect(store.roles.has(RoleId.VOLUNTEER)).toBe(true);
      expect(store.roles.has(RoleId.MANAGER)).toBe(true);
      expect(store.roles.has(RoleId.ADMIN)).toBe(true);
    });
  });

  describe("toggleStatus", () => {
    it("adds a status on first call", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      expect(store.statuses.has("active")).toBe(true);
      expect(store.statuses.size).toBe(1);
    });

    it("removes a status on second call", async () => {
      const store = await getStore();
      store.toggleStatus("inactive");
      store.toggleStatus("inactive");
      expect(store.statuses.has("inactive")).toBe(false);
      expect(store.statuses.size).toBe(0);
    });

    it("accumulates both statuses", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      store.toggleStatus("inactive");
      expect(store.statuses.size).toBe(2);
      expect(store.statuses.has("active")).toBe(true);
      expect(store.statuses.has("inactive")).toBe(true);
    });
  });

  describe("toggleKeyStatus", () => {
    it("adds a key status on first call", async () => {
      const store = await getStore();
      store.toggleKeyStatus("ok");
      expect(store.keyStatuses.has("ok")).toBe(true);
      expect(store.keyStatuses.size).toBe(1);
    });

    it("removes a key status on second call", async () => {
      const store = await getStore();
      store.toggleKeyStatus("no_keys");
      store.toggleKeyStatus("no_keys");
      expect(store.keyStatuses.has("no_keys")).toBe(false);
      expect(store.keyStatuses.size).toBe(0);
    });

    it("accumulates all key statuses", async () => {
      const store = await getStore();
      store.toggleKeyStatus("ok");
      store.toggleKeyStatus("no_keys");
      store.toggleKeyStatus("no_org_key");
      expect(store.keyStatuses.size).toBe(3);
    });
  });

  describe("sort", () => {
    it("defaults to name ascending", async () => {
      const store = await getStore();
      expect(store.sort).toEqual({ field: "name", direction: "asc" });
    });

    it("setSort updates field and direction", async () => {
      const store = await getStore();
      store.setSort("role", "desc");
      expect(store.sort).toEqual({ field: "role", direction: "desc" });
    });

    it("setSort can change to status field", async () => {
      const store = await getStore();
      store.setSort("status", "asc");
      expect(store.sort).toEqual({ field: "status", direction: "asc" });
    });
  });

  describe("clearAll", () => {
    it("empties all three sets", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.VOLUNTEER);
      store.toggleRole(RoleId.MANAGER);
      store.toggleStatus("active");
      store.toggleKeyStatus("no_keys");

      store.clearAll();

      expect(store.roles.size).toBe(0);
      expect(store.statuses.size).toBe(0);
      expect(store.keyStatuses.size).toBe(0);
    });

    it("does not reset sort", async () => {
      const store = await getStore();
      store.setSort("role", "desc");
      store.clearAll();
      expect(store.sort).toEqual({ field: "role", direction: "desc" });
    });
  });

  describe("multiple toggles", () => {
    it("toggle-on, toggle-off, toggle-on re-adds the value", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.ADMIN);
      store.toggleRole(RoleId.ADMIN);
      store.toggleRole(RoleId.ADMIN);
      expect(store.roles.has(RoleId.ADMIN)).toBe(true);
      expect(store.roles.size).toBe(1);
    });

    it("interleaved toggles across dimensions track independently", async () => {
      const store = await getStore();
      store.toggleRole(RoleId.VOLUNTEER);
      store.toggleStatus("active");
      store.toggleKeyStatus("ok");
      store.toggleRole(RoleId.VOLUNTEER);

      expect(store.roles.size).toBe(0);
      expect(store.statuses.size).toBe(1);
      expect(store.keyStatuses.size).toBe(1);
    });
  });
});
