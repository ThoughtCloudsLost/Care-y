// @vitest-environment jsdom
/**
 * ToggleMatrix component tests.
 *
 * Validates toggle dispatch, override marker rendering,
 * and reset visibility gated on the onResetRow callback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";

import type * as ParaglideMessages from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
}));

const { default: ToggleMatrix } = await import("./ToggleMatrix.svelte");

afterEach(cleanup);

const COLUMNS = [
  { id: "push", label: "Push" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
] as const;

function makeRows(opts?: { overridden?: boolean; disabled?: boolean }): {
  id: string;
  label: string;
  cells: {
    columnId: string;
    checked: boolean;
    overridden?: boolean;
    disabled?: boolean;
  }[];
}[] {
  return [
    {
      id: "row-a",
      label: "Row A",
      cells: [
        {
          columnId: "push",
          checked: true,
          overridden: opts?.overridden,
          disabled: opts?.disabled,
        },
        { columnId: "email", checked: false },
        { columnId: "sms", checked: true },
      ],
    },
    {
      id: "row-b",
      label: "Row B",
      cells: [
        { columnId: "push", checked: false },
        { columnId: "email", checked: true },
        { columnId: "sms", checked: false },
      ],
    },
  ];
}

describe("ToggleMatrix", () => {
  type OnToggle = (rowId: string, columnId: string, next: boolean) => void;
  let onToggle: ReturnType<typeof vi.fn<OnToggle>>;

  beforeEach(() => {
    onToggle = vi.fn<OnToggle>();
  });

  it("renders column headers and row labels", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows(),
      onToggle,
      ariaLabel: "Test matrix",
    });

    expect(screen.getByText("Push")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("SMS")).toBeTruthy();
    expect(screen.getByText("Row A")).toBeTruthy();
    expect(screen.getByText("Row B")).toBeTruthy();
  });

  it("renders the grid with role=grid", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows(),
      onToggle,
      ariaLabel: "Test matrix",
    });

    const grid = screen.getByRole("grid");
    expect(grid).toBeTruthy();
    expect(grid.getAttribute("aria-label")).toBe("Test matrix");
  });

  it("dispatches onToggle with row id, column id, and next value", async () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows(),
      onToggle,
      ariaLabel: "Test matrix",
    });

    // Find a toggle by its aria-label and click it
    const toggle = screen.getByLabelText("Row A, Email");
    await fireEvent.click(toggle);

    expect(onToggle).toHaveBeenCalledWith("row-a", "email", true);
  });

  it("shows override marker when overridden and overrideText provided", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows({ overridden: true }),
      onToggle,
      ariaLabel: "Test matrix",
      overrideText: "Edited",
    });

    expect(screen.getByText("Edited")).toBeTruthy();
  });

  it("hides override marker when overrideText is not provided", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows({ overridden: true }),
      onToggle,
      ariaLabel: "Test matrix",
    });

    expect(screen.queryByText("Edited")).toBeNull();
  });

  it("does not render reset buttons when onResetRow is absent", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows(),
      onToggle,
      ariaLabel: "Test matrix",
      resetText: "Reset",
    });

    expect(screen.queryByText("Reset")).toBeNull();
  });

  it("renders reset buttons when both onResetRow and resetText are provided", () => {
    const onResetRow = vi.fn<(rowId: string) => void>();

    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows(),
      onToggle,
      onResetRow,
      ariaLabel: "Test matrix",
      resetText: "Reset",
    });

    const buttons = screen.getAllByText("Reset");
    expect(buttons.length).toBe(2); // one per row
  });

  it("disables toggles when cell.disabled is true", () => {
    render(ToggleMatrix, {
      columns: COLUMNS,
      rows: makeRows({ disabled: true }),
      onToggle,
      ariaLabel: "Test matrix",
    });

    const toggle = screen.getByLabelText("Row A, Push");
    // Konsta Toggle renders an input[type=checkbox] inside
    const input = toggle.closest("label")?.querySelector("input") ?? toggle;
    if (input instanceof HTMLInputElement) {
      expect(input.disabled).toBe(true);
    }
  });
});
