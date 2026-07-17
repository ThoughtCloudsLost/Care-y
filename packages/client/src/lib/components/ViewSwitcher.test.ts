// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import ViewSwitcher from "./ViewSwitcher.svelte";

afterEach(cleanup);

describe("ViewSwitcher", () => {
  it("renders the three view buttons inside a labeled group", () => {
    render(ViewSwitcher, {
      props: { mode: "list", onchange: vi.fn() },
    });
    const group = screen.getByRole("group", { name: "View as" });
    expect(group).toBeTruthy();
    expect(screen.getByRole("button", { name: "Compact rows" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cards" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Grid" })).toBeTruthy();
  });

  it("marks only the current mode as pressed", () => {
    render(ViewSwitcher, {
      props: { mode: "cards", onchange: vi.fn() },
    });
    expect(
      screen
        .getByRole("button", { name: "Cards" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Compact rows" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(
      screen.getByRole("button", { name: "Grid" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("calls onchange with the tapped mode", async () => {
    const onchange = vi.fn();
    render(ViewSwitcher, { props: { mode: "list", onchange } });

    screen.getByRole("button", { name: "Grid" }).click();
    await Promise.resolve();
    expect(onchange).toHaveBeenCalledWith("grid");

    screen.getByRole("button", { name: "Cards" }).click();
    await Promise.resolve();
    expect(onchange).toHaveBeenCalledWith("cards");

    screen.getByRole("button", { name: "Compact rows" }).click();
    await Promise.resolve();
    expect(onchange).toHaveBeenCalledWith("list");
  });

  it("accepts a group label override", () => {
    render(ViewSwitcher, {
      props: { mode: "list", onchange: vi.fn(), label: "Ticket views" },
    });
    expect(screen.getByRole("group", { name: "Ticket views" })).toBeTruthy();
  });

  it("updates the pressed state when the mode prop changes", async () => {
    const { rerender } = render(ViewSwitcher, {
      props: { mode: "list", onchange: vi.fn() },
    });
    await rerender({ mode: "grid" });
    expect(
      screen.getByRole("button", { name: "Grid" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Compact rows" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("renders buttons in the order given by modes", () => {
    render(ViewSwitcher, {
      props: {
        mode: "table",
        onchange: vi.fn(),
        modes: ["grid", "table", "list"],
      },
    });
    const labels = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    expect(labels).toEqual(["Grid", "Table", "Compact rows"]);
  });

  it("hides the icon svgs from assistive tech (labels carry the meaning)", () => {
    const { container } = render(ViewSwitcher, {
      props: { mode: "list", onchange: vi.fn() },
    });
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(4);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
