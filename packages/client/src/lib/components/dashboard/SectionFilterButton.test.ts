// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import SectionFilterButton from "./SectionFilterButton.svelte";

afterEach(cleanup);

function renderButton(
  props: Partial<{ activeCount: number; expanded: boolean }> = {},
): { ontoggle: ReturnType<typeof vi.fn> } {
  const ontoggle = vi.fn();
  render(SectionFilterButton, {
    props: {
      section: "Unassigned",
      activeCount: 0,
      expanded: false,
      controls: "unassigned-filters",
      ontoggle,
      ...props,
    },
  });
  return { ontoggle };
}

describe("SectionFilterButton", () => {
  it("is a button named after its section", () => {
    renderButton();
    expect(
      screen.getByRole("button", { name: "Filter Unassigned" }),
    ).toBeTruthy();
  });

  it("reports the row closed and points at nothing while it is hidden", () => {
    renderButton();
    const button = screen.getByRole("button", { name: "Filter Unassigned" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBeNull();
  });

  it("points at the row while it shows", () => {
    renderButton({ expanded: true });
    const button = screen.getByRole("button", { name: "Filter Unassigned" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-controls")).toBe("unassigned-filters");
  });

  it("shows no badge without active filters", () => {
    renderButton();
    const button = screen.getByRole("button", { name: "Filter Unassigned" });
    expect(button.textContent).not.toMatch(/\d/);
  });

  it("badges the active filter count", () => {
    renderButton({ activeCount: 2, expanded: true });
    const button = screen.getByRole("button", { name: "Filter Unassigned" });
    expect(button.textContent).toContain("2");
  });

  it("toggles on press", async () => {
    const { ontoggle } = renderButton();
    await fireEvent.click(
      screen.getByRole("button", { name: "Filter Unassigned" }),
    );
    expect(ontoggle).toHaveBeenCalledOnce();
  });
});
