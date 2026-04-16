// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import MoveCategorySheet from "./MoveCategorySheet.svelte";

// Mock ShellActionSheet with a pass-through that renders children
vi.mock("$lib/shell/ShellActionSheet.svelte", async () => ({
  default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
    .default,
}));

afterEach(cleanup);

describe("MoveCategorySheet", () => {
  const ondismiss = vi.fn();
  const onmove = vi.fn();

  const categories = [
    { id: "cat-1", name: "Protocols" },
    { id: "cat-2", name: "Resources" },
    { id: "cat-3", name: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders category names as action buttons", () => {
    const { getByText } = render(MoveCategorySheet, {
      opened: true,
      categories,
      ondismiss,
      onmove,
    });

    expect(getByText("Protocols")).toBeTruthy();
    expect(getByText("Resources")).toBeTruthy();
    // null name shows fallback
    expect(getByText("...")).toBeTruthy();
  });

  it("renders the title label", () => {
    const { getByText } = render(MoveCategorySheet, {
      opened: true,
      categories,
      ondismiss,
      onmove,
    });

    expect(getByText("Move to category")).toBeTruthy();
  });

  it("calls onmove with category id when a category is tapped", async () => {
    const { getByText } = render(MoveCategorySheet, {
      opened: true,
      categories,
      ondismiss,
      onmove,
    });

    await fireEvent.click(getByText("Protocols"));
    expect(onmove).toHaveBeenCalledWith("cat-1");
    expect(ondismiss).toHaveBeenCalled();
  });

  it("calls ondismiss when cancel is tapped", async () => {
    const { getByText } = render(MoveCategorySheet, {
      opened: true,
      categories,
      ondismiss,
      onmove,
    });

    await fireEvent.click(getByText("Cancel"));
    expect(ondismiss).toHaveBeenCalled();
    expect(onmove).not.toHaveBeenCalled();
  });
});
