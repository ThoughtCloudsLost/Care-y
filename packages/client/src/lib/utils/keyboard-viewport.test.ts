import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initKeyboardViewport } from "./keyboard-viewport.js";

let resizeHandler: (() => void) | null = null;
let mockHeight: number;

function createMockVisualViewport(height: number): VisualViewport {
  mockHeight = height;
  return {
    get height() {
      return mockHeight;
    },
    addEventListener: vi.fn((_event: string, handler: () => void) => {
      resizeHandler = handler;
    }),
    removeEventListener: vi.fn((_event: string, _handler: () => void) => {
      resizeHandler = null;
    }),
  } as unknown as VisualViewport;
}

beforeEach(() => {
  resizeHandler = null;
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
    cb();
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());

  vi.stubGlobal("document", {
    documentElement: {
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
      },
      classList: {
        toggle: vi.fn(),
        remove: vi.fn(),
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("initKeyboardViewport", () => {
  it("returns a no-op cleanup when visualViewport is unavailable", () => {
    vi.stubGlobal("window", { visualViewport: null, innerHeight: 800 });
    const cleanup = initKeyboardViewport();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });

  it("sets --app-height on init", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    const cleanup = initKeyboardViewport();

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--app-height",
      "800px",
    );
    cleanup();
  });

  it("toggles .keyboard-open when viewport shrinks by more than 150px", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    initKeyboardViewport();

    // Initial: no keyboard
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      "keyboard-open",
      false,
    );

    // Simulate keyboard open (viewport shrinks to 400px, delta = 400 > 150)
    mockHeight = 400;
    resizeHandler?.();

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      "keyboard-open",
      true,
    );
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--app-height",
      "400px",
    );
  });

  it("does not toggle .keyboard-open for small viewport changes", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    initKeyboardViewport();

    // Clear initial calls
    vi.mocked(document.documentElement.classList.toggle).mockClear();

    // Small change (100px < 150 threshold)
    mockHeight = 700;
    resizeHandler?.();

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      "keyboard-open",
      false,
    );
  });

  it("cleanup removes listener and resets DOM", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    const cleanup = initKeyboardViewport();
    cleanup();

    expect(vv.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      "--app-height",
    );
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      "keyboard-open",
    );
  });
});
