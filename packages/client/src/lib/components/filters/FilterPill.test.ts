// @vitest-environment jsdom
/**
 * FilterPill component tests.
 *
 * Verifies pill label rendering, active state, click callback,
 * and a11y attributes.
 *
 * The Popover is owned by FilterPillBar (hoisted out of the scroll
 * container). FilterPill renders a native button in the pinned Inkwell
 * pill anatomy and calls onopen(); keyboard activation is the native
 * button's own behavior.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { SvelteSet } from "svelte/reactivity";
import FilterPill from "./FilterPill.svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  tickets_filter_all: () => "All",
}));

afterEach(cleanup);

const statusOptions = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "hold", label: "On Hold" },
  { value: "closed", label: "Closed" },
];

describe("FilterPill", () => {
  describe("display label", () => {
    it("shows dimension label when nothing is selected", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          onopen: vi.fn(),
        },
      });
      expect(container.textContent).toContain("Status");
    });

    it("shows single selected value label when one item selected", () => {
      const selected = new SvelteSet<string>(["new"]);
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected,
          onopen: vi.fn(),
        },
      });
      expect(container.textContent).toContain("New");
    });

    it("shows count when multiple items selected", () => {
      const selected = new SvelteSet<string>(["new", "active"]);
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected,
          onopen: vi.fn(),
        },
      });
      expect(container.textContent).toContain("Status (2)");
    });

    it("shows dimension label when null selected in single mode", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Assignee",
          options: [{ value: "u1", label: "Alice" }],
          mode: "single" as const,
          selected: null,
          onopen: vi.fn(),
        },
      });
      expect(container.textContent).toContain("Assignee");
    });

    it("shows selected value label in single mode", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Assignee",
          options: [{ value: "u1", label: "Alice" }],
          mode: "single" as const,
          selected: "u1",
          onopen: vi.fn(),
        },
      });
      expect(container.textContent).toContain("Alice");
    });
  });

  describe("interaction", () => {
    it("calls onopen with anchor element on click", async () => {
      const onopen = vi.fn();
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          onopen,
        },
      });
      const pill = container.querySelector("button.pill");
      expect(pill).not.toBeNull();
      await fireEvent.click(pill!);
      expect(onopen).toHaveBeenCalledOnce();
      expect(onopen.mock.calls).toHaveLength(1);
      expect(onopen.mock.calls[0]![0]).toBeInstanceOf(HTMLElement);
    });

    it("renders a native button so keyboard activation is built in", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          onopen: vi.fn(),
        },
      });
      const pill = container.querySelector(".pill");
      expect(pill).toBeInstanceOf(HTMLButtonElement);
      expect((pill as HTMLButtonElement).type).toBe("button");
    });
  });

  describe("active state", () => {
    it("marks the pill active when a value is selected", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Assignee",
          options: [{ value: "u1", label: "Alice" }],
          mode: "single" as const,
          selected: "u1",
          onopen: vi.fn(),
        },
      });
      expect(container.querySelector("button.pill.on")).not.toBeNull();
    });

    it("leaves the pill quiet when nothing is selected", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          onopen: vi.fn(),
        },
      });
      expect(container.querySelector("button.pill.on")).toBeNull();
    });
  });

  describe("a11y", () => {
    it("sets aria-haspopup to true for multi mode", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          onopen: vi.fn(),
        },
      });
      const pill = container.querySelector("button.pill");
      expect(pill?.getAttribute("aria-haspopup")).toBe("true");
    });

    it("sets aria-haspopup to listbox for single mode", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Assignee",
          options: [],
          mode: "single" as const,
          selected: null,
          onopen: vi.fn(),
        },
      });
      const pill = container.querySelector("button.pill");
      expect(pill?.getAttribute("aria-haspopup")).toBe("listbox");
    });

    it("reflects isOpen in aria-expanded", () => {
      const { container } = render(FilterPill, {
        props: {
          label: "Status",
          options: statusOptions,
          mode: "multi" as const,
          selected: new SvelteSet<string>(),
          isOpen: true,
          onopen: vi.fn(),
        },
      });
      const pill = container.querySelector("button.pill");
      expect(pill?.getAttribute("aria-expanded")).toBe("true");
    });
  });
});
