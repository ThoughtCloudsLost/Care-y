// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import ShiftSection from "./ShiftSection.svelte";
import type * as ToastNS from "$lib/stores/toast.svelte.js";

// The band shows a coming-soon toast for Start and End shift (no shift
// backend yet); spy on the store to prove it never fakes a mutation.
vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

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

// The page owns the section's collapsed state; most tests render it open.
const sectionProps = { expanded: true, ontoggle: vi.fn() };

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
  it("heads the tile with a Shift section toggle", () => {
    render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 3,
        ...sectionProps,
      },
    });
    expect(screen.getByRole("button", { name: "Shift" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Shift" })).toBeTruthy();
  });

  it("hides the card while the section is collapsed", () => {
    const ontoggle = vi.fn();
    const { container } = render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 3,
        expanded: false,
        ontoggle,
      },
    });
    expect(container.querySelector(".shift")).toBeNull();
    expect(screen.queryByRole("button", { name: "End shift" })).toBeNull();
  });

  it("calls ontoggle from the section header", async () => {
    const ontoggle = vi.fn();
    render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 3,
        expanded: true,
        ontoggle,
      },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Shift" }));
    expect(ontoggle).toHaveBeenCalledOnce();
  });

  it("composes the existing shift-state key with the shift window", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 3,
        ...sectionProps,
      },
    });
    // Every state key (ends-in / not-started / ended) renders the window, so
    // assert the window rather than the clock-dependent state phrase.
    const line = container.querySelector(".t");
    expect(line?.textContent).toContain("09:00");
    expect(line?.textContent).toContain("17:00");
  });

  it("shows the pluralized open-with-you count on its own line", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 3,
        ...sectionProps,
      },
    });
    expect(container.querySelector(".t-open")?.textContent).toContain(
      "3 open with you",
    );
    // The status line carries the window alone; the count line is separate.
    expect(container.querySelector(".t")?.textContent).not.toContain(
      "open with you",
    );
  });

  it("uses the singular open-with-you at a count of one", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 1,
        ...sectionProps,
      },
    });
    expect(container.querySelector(".t-open")?.textContent).toContain(
      "1 open with you",
    );
  });

  it("renders an initials chip per volunteer, marking the current user", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: makeShift(),
        loading: false,
        myOpenCount: 0,
        ...sectionProps,
      },
    });
    const chips = container.querySelectorAll(".chip");
    expect(chips.length).toBe(3);
    expect(container.querySelectorAll(".chip-you").length).toBe(1);
    expect(container.querySelector(".chips")?.getAttribute("aria-label")).toBe(
      "3 on shift",
    );
  });

  // Windows that hold whatever the time of day: 00:00 to 23:59 is active
  // (outside the day's last minute), and 00:00 to 00:00 has always ended.
  const ACTIVE = { start: "00:00", end: "23:59", label: "Day shift" };
  const ENDED = { start: "00:00", end: "00:00", label: "Day shift" };

  it("offers End shift during an active shift, as a coming-soon toast (never a mutation)", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    render(ShiftSection, {
      props: {
        shift: makeShift({ current: ACTIVE }),
        loading: false,
        myOpenCount: 2,
        ...sectionProps,
      },
    });
    await fireEvent.click(screen.getByRole("button", { name: "End shift" }));
    expect(toastStore.show).toHaveBeenCalledOnce();
  });

  it("offers Start shift once the shift has ended, as a coming-soon toast", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    render(ShiftSection, {
      props: {
        shift: makeShift({ current: ENDED }),
        loading: false,
        myOpenCount: 2,
        ...sectionProps,
      },
    });
    expect(screen.queryByRole("button", { name: "End shift" })).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Start shift" }));
    expect(toastStore.show).toHaveBeenCalledOnce();
  });

  it("falls back to the no-shift line when there is no active shift", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: null,
        loading: false,
        myOpenCount: 0,
        ...sectionProps,
      },
    });
    expect(container.querySelector(".t")?.textContent).toContain(
      "No active shift",
    );
  });

  it("renders a skeleton and disables the shift action while loading", () => {
    const { container } = render(ShiftSection, {
      props: {
        shift: null,
        loading: true,
        myOpenCount: 0,
        ...sectionProps,
      },
    });
    expect(container.querySelector(".isk")).toBeTruthy();
    // No shift has loaded, so the action offers to start one.
    const startButton = screen.getByRole("button", { name: "Start shift" });
    expect((startButton as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector(".t")?.textContent).not.toContain(
      "open with you",
    );
  });
});
