// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import ShiftSection from "./ShiftSection.svelte";

// The band shows a coming-soon toast for End shift (no shift backend yet);
// spy on the store to prove it never fakes a mutation.
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// SvelteDate binds the native Date at import (before any useFakeTimers), so
// its clock can't be faked here. The state phrase (ends-in / not-started /
// ended) is therefore time-of-day dependent; the assertions below avoid it,
// checking the shift window and the time-independent segments instead.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeShift(overrides: Record<string, unknown> = {}) {
  return {
    current: { start: "09:00", end: "17:00", label: "Day shift" },
    volunteersOnShift: 3,
    volunteers: [
      { initials: "SM", isCurrentUser: true },
      { initials: "KT", isCurrentUser: false },
      { initials: "JR", isCurrentUser: false },
    ],
    ...overrides,
  };
}

describe("ShiftSection", () => {
  it("renders an always-visible labeled band", () => {
    render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 3 },
    });
    expect(screen.getByRole("region", { name: "Shift" })).toBeTruthy();
  });

  it("composes the existing shift-state key with the shift window", () => {
    const { container } = render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 3 },
    });
    // Every state key (ends-in / not-started / ended) renders the window, so
    // assert the window rather than the clock-dependent state phrase.
    const line = container.querySelector(".t");
    expect(line?.textContent).toContain("09:00");
    expect(line?.textContent).toContain("17:00");
  });

  it("appends the pluralized open-with-you count from myOpenCount", () => {
    const { container } = render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 3 },
    });
    expect(container.querySelector(".t")?.textContent).toContain(
      "3 open with you",
    );
  });

  it("uses the singular open-with-you at a count of one", () => {
    const { container } = render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 1 },
    });
    expect(container.querySelector(".t")?.textContent).toContain(
      "1 open with you",
    );
  });

  it("renders an initials chip per volunteer, marking the current user", () => {
    const { container } = render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 0 },
    });
    const chips = container.querySelectorAll(".chip");
    expect(chips.length).toBe(3);
    expect(container.querySelectorAll(".chip-you").length).toBe(1);
    expect(container.querySelector(".chips")?.getAttribute("aria-label")).toBe(
      "3 on shift",
    );
  });

  it("shows a coming-soon toast when End shift is tapped (never a mutation)", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    render(ShiftSection, {
      props: { shift: makeShift(), loading: false, myOpenCount: 2 },
    });
    await fireEvent.click(screen.getByRole("button", { name: "End shift" }));
    expect(toastStore.show).toHaveBeenCalledOnce();
  });

  it("falls back to the no-shift line when there is no active shift", () => {
    const { container } = render(ShiftSection, {
      props: { shift: null, loading: false, myOpenCount: 0 },
    });
    expect(container.querySelector(".t")?.textContent).toContain(
      "No active shift",
    );
  });

  it("renders a skeleton and disables End shift while loading", () => {
    const { container } = render(ShiftSection, {
      props: { shift: null, loading: true, myOpenCount: 0 },
    });
    expect(container.querySelector(".isk")).toBeTruthy();
    const endButton = screen.getByRole("button", { name: "End shift" });
    expect((endButton as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector(".t")?.textContent).not.toContain(
      "open with you",
    );
  });
});
