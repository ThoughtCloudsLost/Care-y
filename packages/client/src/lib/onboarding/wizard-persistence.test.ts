import { describe, it, expect, vi } from "vitest";
import {
  loadSavedState,
  saveState,
  clearState,
  resolveRecoveryStep,
} from "./wizard-persistence.js";

function makeStorage(data: Record<string, string> = {}): Storage {
  const store = new Map(Object.entries(data));
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn(() => null),
  };
}

const KEY = "test-wizard";
const MAX_STEPS = 3;

describe("loadSavedState", () => {
  it("returns null when no saved data", () => {
    const storage = makeStorage();
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("parses valid saved state", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 1, completed: [0] }),
    });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toEqual({
      step: 1,
      completed: [0],
    });
  });

  it("returns null and clears storage when step >= maxSteps", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 3, completed: [0, 1, 2] }),
    });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(KEY);
  });

  it("returns null for malformed JSON", () => {
    const storage = makeStorage({ [KEY]: "not-json{" });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("returns null when missing required fields", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 1 }),
    });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("returns null when step is not a number", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: "1", completed: [0] }),
    });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("returns null when completed contains non-numbers", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 1, completed: ["0"] }),
    });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("returns null for null parsed value", () => {
    const storage = makeStorage({ [KEY]: "null" });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });

  it("returns null for non-object parsed value", () => {
    const storage = makeStorage({ [KEY]: '"a string"' });
    expect(loadSavedState(storage, KEY, MAX_STEPS)).toBeNull();
  });
});

describe("saveState", () => {
  it("serializes step and completed to storage", () => {
    const storage = makeStorage();
    saveState(storage, KEY, 2, new Set([0, 1]));
    expect(storage.setItem).toHaveBeenCalledWith(
      KEY,
      JSON.stringify({ step: 2, completed: [0, 1] }),
    );
  });

  it("handles storage errors gracefully", () => {
    const storage = makeStorage();
    (storage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new DOMException("QuotaExceeded", "QuotaExceededError");
    });
    expect(() => {
      saveState(storage, KEY, 0, new Set());
    }).not.toThrow();
  });
});

describe("clearState", () => {
  it("removes key from storage", () => {
    const storage = makeStorage({ [KEY]: "data" });
    clearState(storage, KEY);
    expect(storage.removeItem).toHaveBeenCalledWith(KEY);
  });

  it("handles storage errors gracefully", () => {
    const storage = makeStorage();
    (storage.removeItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new DOMException("SecurityError", "SecurityError");
    });
    expect(() => {
      clearState(storage, KEY);
    }).not.toThrow();
  });
});

describe("resolveRecoveryStep", () => {
  it("restores from saved state when step > 0", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 2, completed: [0, 1] }),
    });
    const result = resolveRecoveryStep(storage, KEY, MAX_STEPS, false);
    expect(result.step).toBe(2);
    expect(result.completed).toEqual(new Set([0, 1]));
  });

  it("ignores saved state when step is 0", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 0, completed: [] }),
    });
    const result = resolveRecoveryStep(storage, KEY, MAX_STEPS, true);
    expect(result.step).toBe(2);
    expect(result.completed).toEqual(new Set([0, 1]));
  });

  it("resumes at step 2 when briefing was seen", () => {
    const storage = makeStorage();
    const result = resolveRecoveryStep(storage, KEY, MAX_STEPS, true);
    expect(result.step).toBe(2);
    expect(result.completed).toEqual(new Set([0, 1]));
  });

  it("resumes at step 1 when briefing not seen", () => {
    const storage = makeStorage();
    const result = resolveRecoveryStep(storage, KEY, MAX_STEPS, false);
    expect(result.step).toBe(1);
    expect(result.completed).toEqual(new Set([0]));
  });

  it("prefers saved state over briefing flag", () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify({ step: 1, completed: [0] }),
    });
    const result = resolveRecoveryStep(storage, KEY, MAX_STEPS, true);
    expect(result.step).toBe(1);
    expect(result.completed).toEqual(new Set([0]));
  });
});
