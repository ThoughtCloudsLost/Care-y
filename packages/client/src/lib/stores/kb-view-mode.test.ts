// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

function setupMocks(options?: { storedMode?: string | null }): void {
  const { storedMode = null } = options ?? {};
  const storage = new Map<string, string>();
  if (storedMode !== null) storage.set("care-y-kb-view-mode", storedMode);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
}

describe("kbViewModeStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to cards when no stored value", async () => {
    setupMocks();
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("cards");
  });

  it("hydrates grid from localStorage", async () => {
    setupMocks({ storedMode: "grid" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("grid");
  });

  it("hydrates list from localStorage", async () => {
    setupMocks({ storedMode: "list" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("list");
  });

  it("hydrates table from localStorage", async () => {
    setupMocks({ storedMode: "table" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("table");
  });

  it("hydrates cards from localStorage", async () => {
    setupMocks({ storedMode: "cards" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("cards");
  });

  it("defaults to cards for garbage stored values", async () => {
    setupMocks({ storedMode: "not-a-mode" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("cards");
  });

  it("defaults to cards for empty string", async () => {
    setupMocks({ storedMode: "" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("cards");
  });

  it("set() updates mode and persists to localStorage", async () => {
    setupMocks();
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");

    kbViewModeStore.set("grid");
    expect(kbViewModeStore.mode).toBe("grid");
    expect(localStorage.getItem("care-y-kb-view-mode")).toBe("grid");
  });

  it("set() to table persists correctly", async () => {
    setupMocks();
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");

    kbViewModeStore.set("table");
    expect(kbViewModeStore.mode).toBe("table");
    expect(localStorage.getItem("care-y-kb-view-mode")).toBe("table");
  });

  it("set() back to cards persists correctly", async () => {
    setupMocks({ storedMode: "grid" });
    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");

    kbViewModeStore.set("cards");
    expect(kbViewModeStore.mode).toBe("cards");
    expect(localStorage.getItem("care-y-kb-view-mode")).toBe("cards");
  });

  it("handles localStorage throwing on getItem", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage restricted");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    expect(kbViewModeStore.mode).toBe("cards");
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

    const { kbViewModeStore } = await import("./kb-view-mode.svelte.ts");
    kbViewModeStore.set("grid");
    expect(kbViewModeStore.mode).toBe("grid");
  });
});
