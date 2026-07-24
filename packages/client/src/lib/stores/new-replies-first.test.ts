// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The store is a module-level singleton that reads localStorage on
// import, so mocks must be in place before each dynamic import.

function setupMocks(stored?: string | null): void {
  const storage = new Map<string, string>();
  if (stored !== null && stored !== undefined) {
    storage.set("care-y-new-replies-first", stored);
  }

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
}

describe("newRepliesFirstStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to enabled when no stored value", async () => {
    setupMocks();
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    expect(newRepliesFirstStore.enabled).toBe(true);
  });

  it("hydrates a stored false", async () => {
    setupMocks("false");
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    expect(newRepliesFirstStore.enabled).toBe(false);
  });

  it("hydrates a stored true", async () => {
    setupMocks("true");
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    expect(newRepliesFirstStore.enabled).toBe(true);
  });

  it("defaults to enabled for garbage stored values", async () => {
    setupMocks("maybe");
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    expect(newRepliesFirstStore.enabled).toBe(true);
  });

  it("set() updates and persists", async () => {
    setupMocks();
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");

    newRepliesFirstStore.set(false);
    expect(newRepliesFirstStore.enabled).toBe(false);
    expect(localStorage.getItem("care-y-new-replies-first")).toBe("false");
  });

  it("toggle() flips and persists", async () => {
    setupMocks("false");
    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");

    newRepliesFirstStore.toggle();
    expect(newRepliesFirstStore.enabled).toBe(true);
    expect(localStorage.getItem("care-y-new-replies-first")).toBe("true");
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

    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    expect(newRepliesFirstStore.enabled).toBe(true);
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

    const { newRepliesFirstStore } =
      await import("./new-replies-first.svelte.ts");
    newRepliesFirstStore.set(false);
    expect(newRepliesFirstStore.enabled).toBe(false);
  });
});
