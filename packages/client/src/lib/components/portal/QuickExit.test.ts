// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import QuickExit from "./QuickExit.svelte";

describe("QuickExit", () => {
  afterEach(cleanup);

  const mockDestroy = vi.fn();

  beforeEach(() => {
    mockDestroy.mockClear();
    // Stub location.replace to avoid JSDOM navigation errors
    Object.defineProperty(window, "location", {
      value: { replace: vi.fn() },
      writable: true,
    });
  });

  it("renders an icon-only button with aria-label", () => {
    const { getByTestId } = render(QuickExit, {
      props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
    });
    const btn = getByTestId("quick-exit");
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-label")).toBeTruthy();
    // No visible text (icon-only)
    expect(btn.textContent.trim()).toBe("");
  });

  it("calls ondestroy and location.replace on click", async () => {
    const { getByTestId } = render(QuickExit, {
      props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
    });
    await fireEvent.click(getByTestId("quick-exit"));
    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(window.location.replace).toHaveBeenCalledWith("https://weather.gov");
  });

  it("scrubs document.title before navigation", async () => {
    document.title = "Portal - Messages";
    const { getByTestId } = render(QuickExit, {
      props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
    });
    await fireEvent.click(getByTestId("quick-exit"));
    // The component writes " ", but the document.title getter strips and
    // collapses ASCII whitespace, so the scrubbed title reads back empty.
    expect(document.title).toBe("");
  });

  it("Escape key triggers exit", async () => {
    render(QuickExit, {
      props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
    });
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(window.location.replace).toHaveBeenCalledWith("https://weather.gov");
  });

  it("pagehide event triggers ondestroy", async () => {
    render(QuickExit, {
      props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
    });
    window.dispatchEvent(new Event("pagehide"));
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  describe("onrevoke", () => {
    it("calls onrevoke before ondestroy on click exit", async () => {
      const callOrder: string[] = [];
      const revoke = vi.fn(() => callOrder.push("revoke"));
      const destroy = vi.fn(() => callOrder.push("destroy"));

      const { getByTestId } = render(QuickExit, {
        props: {
          ondestroy: destroy,
          onrevoke: revoke,
          safeUrl: "https://weather.gov",
        },
      });
      await fireEvent.click(getByTestId("quick-exit"));

      expect(revoke).toHaveBeenCalledOnce();
      expect(destroy).toHaveBeenCalledOnce();
      expect(callOrder).toEqual(["revoke", "destroy"]);
    });

    it("calls onrevoke before ondestroy on Escape exit", async () => {
      const callOrder: string[] = [];
      const revoke = vi.fn(() => callOrder.push("revoke"));
      const destroy = vi.fn(() => callOrder.push("destroy"));

      render(QuickExit, {
        props: {
          ondestroy: destroy,
          onrevoke: revoke,
          safeUrl: "https://weather.gov",
        },
      });
      await fireEvent.keyDown(window, { key: "Escape" });

      expect(revoke).toHaveBeenCalledOnce();
      expect(destroy).toHaveBeenCalledOnce();
      expect(callOrder).toEqual(["revoke", "destroy"]);
    });

    it("does NOT call onrevoke on pagehide", () => {
      const revoke = vi.fn();
      render(QuickExit, {
        props: {
          ondestroy: mockDestroy,
          onrevoke: revoke,
          safeUrl: "https://weather.gov",
        },
      });
      window.dispatchEvent(new Event("pagehide"));

      expect(mockDestroy).toHaveBeenCalledOnce();
      expect(revoke).not.toHaveBeenCalled();
    });

    it("works when onrevoke is not supplied", async () => {
      const { getByTestId } = render(QuickExit, {
        props: { ondestroy: mockDestroy, safeUrl: "https://weather.gov" },
      });
      await fireEvent.click(getByTestId("quick-exit"));

      expect(mockDestroy).toHaveBeenCalledOnce();
      expect(window.location.replace).toHaveBeenCalledWith(
        "https://weather.gov",
      );
    });
  });
});
