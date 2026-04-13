// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The view-mode store is a module-level singleton that reads localStorage
// on import. We need to set up mocks before importing it.

function setupMocks(options?: { storedMode?: string | null }): void {
  const { storedMode = null } = options ?? {};

  const storage = new Map<string, string>();
  if (storedMode !== null) storage.set("care-y-view-mode", storedMode);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
}

describe("viewModeStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to list when no stored value", async () => {
    setupMocks();
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("list");
  });

  it("hydrates from localStorage", async () => {
    setupMocks({ storedMode: "grid" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("grid");
  });

  it("hydrates list mode from localStorage", async () => {
    setupMocks({ storedMode: "list" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("list");
  });

  it("defaults to list for unknown stored values", async () => {
    setupMocks({ storedMode: "kanban" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("list");
  });

  it("defaults to list for garbage stored values", async () => {
    setupMocks({ storedMode: "not-a-mode" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("list");
  });

  it("set() updates mode and persists to localStorage", async () => {
    setupMocks();
    const { viewModeStore } = await import("./view-mode.svelte.ts");

    viewModeStore.set("grid");
    expect(viewModeStore.mode).toBe("grid");
    expect(localStorage.getItem("care-y-view-mode")).toBe("grid");
  });

  it("set() back to list persists correctly", async () => {
    setupMocks({ storedMode: "grid" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");

    viewModeStore.set("list");
    expect(viewModeStore.mode).toBe("list");
    expect(localStorage.getItem("care-y-view-mode")).toBe("list");
  });

  it("handles localStorage throwing on getItem", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage restricted");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("list");
  });

  it("handles localStorage throwing on setItem without crashing", async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
      removeItem: vi.fn(),
    });

    const { viewModeStore } = await import("./view-mode.svelte.ts");
    // Should not throw
    viewModeStore.set("grid");
    expect(viewModeStore.mode).toBe("grid");
  });
});
