// @vitest-environment jsdom
/**
 * FilterPill component tests.
 *
 * Verifies pill label rendering, active state, click callback,
 * keyboard interaction, and a11y attributes.
 *
 * The Popover is now owned by FilterPillBar (hoisted out of the scroll
 * container). FilterPill only renders the Chip and calls onopen().
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
      const chip = container.querySelector("[role='button']");
      expect(chip).not.toBeNull();
      await fireEvent.click(chip!);
      expect(onopen).toHaveBeenCalledOnce();
      expect(onopen.mock.calls).toHaveLength(1);
      expect(onopen.mock.calls[0]![0]).toBeInstanceOf(HTMLElement);
    });

    it("calls onopen on Enter key", async () => {
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
      const chip = container.querySelector("[role='button']");
      await fireEvent.keyDown(chip!, { key: "Enter" });
      expect(onopen).toHaveBeenCalledOnce();
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
      const chip = container.querySelector("[role='button']");
      expect(chip?.getAttribute("aria-haspopup")).toBe("true");
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
      const chip = container.querySelector("[role='button']");
      expect(chip?.getAttribute("aria-haspopup")).toBe("listbox");
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
      const chip = container.querySelector("[role='button']");
      expect(chip?.getAttribute("aria-expanded")).toBe("true");
    });
  });
});
