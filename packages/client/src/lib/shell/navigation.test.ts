// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// vi.mock required: $app/navigation and $app/paths are SvelteKit virtual
// modules with no on-disk source.
vi.mock("$app/navigation", () => ({
  goto: vi.fn(() => Promise.resolve()),
}));
vi.mock("$app/paths", () => ({
  resolve: vi.fn((path: string) => path),
}));

describe("navigation", () => {
  let markNavigated: () => void;
  let shellBack: (fallbackRoute?: `/${string}`) => void;
  let mockGoto: ReturnType<typeof vi.fn>;
  let historySpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    // Reset module state (singleton counters) between tests
    vi.resetModules();
    const nav = await import("./navigation.js");
    markNavigated = nav.markNavigated;
    shellBack = nav.shellBack;

    const { goto } = await import("$app/navigation");
    mockGoto = goto as ReturnType<typeof vi.fn>;
    mockGoto.mockClear();

    historySpy = vi.spyOn(history, "back").mockImplementation(() => undefined);
  });

  afterEach(() => {
    historySpy.mockRestore();
  });

  describe("shellBack", () => {
    it("falls back to goto when no in-app navigation has occurred", () => {
      shellBack("/tickets");
      expect(historySpy).not.toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith("/tickets");
    });

    it("falls back to goto after only one afterNavigate (initial page load)", () => {
      markNavigated();
      shellBack("/tickets");
      expect(historySpy).not.toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalled();
    });

    it("uses history.back after two afterNavigate calls", () => {
      markNavigated();
      markNavigated();
      shellBack("/tickets");
      expect(historySpy).toHaveBeenCalledOnce();
      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("defaults fallback route to /", () => {
      shellBack();
      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("continues using history.back after many navigations", () => {
      for (let i = 0; i < 5; i++) markNavigated();
      shellBack("/tickets");
      expect(historySpy).toHaveBeenCalledOnce();
      expect(mockGoto).not.toHaveBeenCalled();
    });
  });
});
