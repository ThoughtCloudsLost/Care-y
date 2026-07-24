// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { createPersistedState } from "./persisted-state.svelte.ts";

// The primitive is a factory (no module-level state), so unlike the
// store singletons it can be imported statically and constructed after
// each test's globals are stubbed.

function stubStorage(initial?: Record<string, string>): Map<string, string> {
  const storage = new Map<string, string>(Object.entries(initial ?? {}));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  return storage;
}

function validateAb(raw: string): "a" | "b" | undefined {
  return raw === "a" || raw === "b" ? raw : undefined;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createPersistedState", () => {
  it("returns the fallback when nothing is stored", () => {
    stubStorage();
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });
    expect(state.value).toBe("a");
  });

  it("hydrates a stored value the validator accepts", () => {
    stubStorage({ "test-key": "b" });
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });
    expect(state.value).toBe("b");
  });

  it("falls back when the validator rejects the stored value", () => {
    stubStorage({ "test-key": "garbage" });
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });
    expect(state.value).toBe("a");
  });

  it("falls back when getItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        // Browsers raise DOMException from restricted storage contexts.
        throw new DOMException("storage restricted", "SecurityError");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });
    expect(state.value).toBe("a");
  });

  it("set() updates the value and persists the serialized form", () => {
    const storage = stubStorage();
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });

    state.set("b");
    expect(state.value).toBe("b");
    expect(storage.get("test-key")).toBe("b");
  });

  it("set() keeps the in-memory value when setItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        // Browsers raise DOMException when the storage quota is exhausted.
        throw new DOMException("quota exceeded", "QuotaExceededError");
      },
      removeItem: vi.fn(),
    });
    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });

    state.set("b");
    expect(state.value).toBe("b");
  });

  it("returns the fallback without touching storage when window is undefined", () => {
    const getItem = vi.fn(() => "b");
    vi.stubGlobal("localStorage", {
      getItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("window", undefined);

    const state = createPersistedState("test-key", "a", {
      validate: validateAb,
    });
    expect(state.value).toBe("a");
    expect(getItem).not.toHaveBeenCalled();
  });

  it("uses a custom serializer for persistence", () => {
    const storage = stubStorage();
    const state = createPersistedState("test-key", 1, {
      validate: (raw) => {
        const parsed = Number.parseInt(raw.replace("n:", ""), 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      },
      serialize: (value) => `n:${String(value)}`,
    });

    state.set(2);
    expect(storage.get("test-key")).toBe("n:2");
  });

  it("round-trips a value through the custom serializer", () => {
    stubStorage({ "test-key": "n:7" });
    const state = createPersistedState("test-key", 1, {
      validate: (raw) => {
        const parsed = Number.parseInt(raw.replace("n:", ""), 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      },
      serialize: (value) => `n:${String(value)}`,
    });
    expect(state.value).toBe(7);
  });
});
