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
});
