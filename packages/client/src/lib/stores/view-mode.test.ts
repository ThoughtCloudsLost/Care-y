// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The view-mode stores are module-level singletons that read localStorage
// on import. We need to set up mocks before importing them.

function setupMocks(options?: {
  storedMode?: string | null;
  storedDashboardMode?: string | null;
}): void {
  const { storedMode = null, storedDashboardMode = null } = options ?? {};

  const storage = new Map<string, string>();
  if (storedMode !== null) storage.set("care-y-view-mode", storedMode);
  if (storedDashboardMode !== null) {
    storage.set("care-y-dashboard-view-mode", storedDashboardMode);
  }

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

  it("hydrates the cards mode added by the three-way union", async () => {
    setupMocks({ storedMode: "cards" });
    const { viewModeStore } = await import("./view-mode.svelte.ts");
    expect(viewModeStore.mode).toBe("cards");
  });

  it("keeps preferences persisted before the union widened", async () => {
    // "list" and "grid" were the only valid values before "cards" existed;
    // both must load unchanged after the widening.
    for (const legacy of ["list", "grid"] as const) {
      vi.resetModules();
      setupMocks({ storedMode: legacy });
      const { viewModeStore } = await import("./view-mode.svelte.ts");
      expect(viewModeStore.mode).toBe(legacy);
    }
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

    viewModeStore.set("cards");
    expect(viewModeStore.mode).toBe("cards");
    expect(localStorage.getItem("care-y-view-mode")).toBe("cards");
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
        // Browsers raise DOMException from restricted storage contexts.
        throw new DOMException("storage restricted", "SecurityError");
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
        // Browsers raise DOMException when the storage quota is exhausted.
        throw new DOMException("quota exceeded", "QuotaExceededError");
      },
      removeItem: vi.fn(),
    });

    const { viewModeStore } = await import("./view-mode.svelte.ts");
    // Should not throw
    viewModeStore.set("grid");
    expect(viewModeStore.mode).toBe("grid");
  });
});

describe("dashboardViewModeStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to list when no stored value", async () => {
    setupMocks();
    const { dashboardViewModeStore } = await import("./view-mode.svelte.ts");
    expect(dashboardViewModeStore.mode).toBe("list");
  });

  it("hydrates from its own localStorage key", async () => {
    setupMocks({ storedDashboardMode: "cards" });
    const { dashboardViewModeStore } = await import("./view-mode.svelte.ts");
    expect(dashboardViewModeStore.mode).toBe("cards");
  });

  it("persists under its own key without touching the tickets key", async () => {
    setupMocks({ storedMode: "grid" });
    const { viewModeStore, dashboardViewModeStore } =
      await import("./view-mode.svelte.ts");

    dashboardViewModeStore.set("cards");
    expect(localStorage.getItem("care-y-dashboard-view-mode")).toBe("cards");
    expect(localStorage.getItem("care-y-view-mode")).toBe("grid");
    expect(viewModeStore.mode).toBe("grid");
  });

  it("stays independent of the tickets store in memory", async () => {
    setupMocks();
    const { viewModeStore, dashboardViewModeStore } =
      await import("./view-mode.svelte.ts");

    viewModeStore.set("grid");
    expect(dashboardViewModeStore.mode).toBe("list");
  });
});
