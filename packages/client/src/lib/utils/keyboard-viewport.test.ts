import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initKeyboardViewport } from "./keyboard-viewport.js";

let resizeHandler: (() => void) | null = null;
let scrollHandler: (() => void) | null = null;
let mockHeight: number;
let mockOffsetTop: number;

function createMockVisualViewport(height: number): VisualViewport {
  mockHeight = height;
  mockOffsetTop = 0;
  return {
    get height() {
      return mockHeight;
    },
    get offsetTop() {
      return mockOffsetTop;
    },
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === "resize") resizeHandler = handler;
      if (event === "scroll") scrollHandler = handler;
    }),
    removeEventListener: vi.fn((_event: string, _handler: () => void) => {
      resizeHandler = null;
      scrollHandler = null;
    }),
  } as unknown as VisualViewport;
}

beforeEach(() => {
  resizeHandler = null;
  scrollHandler = null;
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

  it("sets --app-height, --vv-offset-top, and --keyboard-height on init", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    const cleanup = initKeyboardViewport();

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--app-height",
      "800px",
    );
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--vv-offset-top",
      "0px",
    );
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--keyboard-height",
      "0px",
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
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--keyboard-height",
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

  it("updates --vv-offset-top on scroll events", () => {
    const vv = createMockVisualViewport(400);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    initKeyboardViewport();

    vi.mocked(document.documentElement.style.setProperty).mockClear();

    // Simulate scroll while keyboard is open
    mockOffsetTop = 120;
    scrollHandler?.();

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      "--vv-offset-top",
      "120px",
    );
  });

  it("listens to both resize and scroll events", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    initKeyboardViewport();

    expect(vv.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(vv.addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });

  it("cleanup removes both listeners and resets DOM", () => {
    const vv = createMockVisualViewport(800);
    vi.stubGlobal("window", { visualViewport: vv, innerHeight: 800 });

    const cleanup = initKeyboardViewport();
    cleanup();

    expect(vv.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(vv.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      "--app-height",
    );
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      "--vv-offset-top",
    );
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      "--keyboard-height",
    );
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      "keyboard-open",
    );
  });
});
