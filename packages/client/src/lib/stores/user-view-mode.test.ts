// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The store is a module-level singleton that reads localStorage on
// import, so mocks must be in place before each dynamic import.

function setupMocks(options?: { storedMode?: string | null }): void {
  const { storedMode = null } = options ?? {};
  const storage = new Map<string, string>();
  if (storedMode !== null) storage.set("care-y-user-view-mode", storedMode);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
}

describe("userViewModeStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to list when no stored value", async () => {
    setupMocks();
    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    expect(userViewModeStore.mode).toBe("list");
  });

  it("hydrates grid from localStorage", async () => {
    setupMocks({ storedMode: "grid" });
    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    expect(userViewModeStore.mode).toBe("grid");
  });

  it("hydrates list from localStorage", async () => {
    setupMocks({ storedMode: "list" });
    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    expect(userViewModeStore.mode).toBe("list");
  });

  it("defaults to list for garbage stored values", async () => {
    setupMocks({ storedMode: "cards" });
    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    expect(userViewModeStore.mode).toBe("list");
  });

  it("set() updates mode and persists to localStorage", async () => {
    setupMocks();
    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");

    userViewModeStore.set("grid");
    expect(userViewModeStore.mode).toBe("grid");
    expect(localStorage.getItem("care-y-user-view-mode")).toBe("grid");
  });

  it("handles localStorage throwing on getItem", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        // Browsers raise DOMException from restricted storage contexts.
        throw new DOMException("storage restricted", "SecurityError");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    expect(userViewModeStore.mode).toBe("list");
  });

  it("handles localStorage throwing on setItem without crashing", async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: () => {
        // Browsers raise DOMException when the storage quota is exhausted.
        throw new DOMException("quota exceeded", "QuotaExceededError");
      },
      removeItem: vi.fn(),
    });

    const { userViewModeStore } = await import("./user-view-mode.svelte.ts");
    userViewModeStore.set("grid");
    expect(userViewModeStore.mode).toBe("grid");
  });
});
