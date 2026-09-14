// @vitest-environment jsdom
/**
 * PrioritySelectSheet: renders the four priority options from the schema
 * and fires onselect with the chosen value on click.
 *
 * ShellSheet is stubbed with the PassthroughShell helper.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import PrioritySelectSheet from "./PrioritySelectSheet.svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as ShellSheetModule from "$lib/shell/ShellSheet.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  ticket_priority_sheet_title: () => "Change priority",
  ticket_new_priority_low: () => "Low",
  ticket_new_priority_normal: () => "Normal",
  ticket_new_priority_high: () => "High",
  ticket_new_priority_urgent: () => "Urgent",
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetModule>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

afterEach(() => {
  cleanup();
});

describe("PrioritySelectSheet", () => {
  it("renders all four priority options", () => {
    render(PrioritySelectSheet, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        onselect: vi.fn(),
      },
    });

    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("Normal")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
  });

  it("fires onselect with the chosen priority on click", async () => {
    const onselect = vi.fn();
    const ondismiss = vi.fn();

    render(PrioritySelectSheet, {
      props: {
        opened: true,
        ondismiss,
        onselect,
      },
    });

    await fireEvent.click(screen.getByText("Urgent"));
    expect(onselect).toHaveBeenCalledWith("urgent");
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("shows a check mark next to the current priority", () => {
    render(PrioritySelectSheet, {
      props: {
        opened: true,
        currentPriority: "high",
        ondismiss: vi.fn(),
        onselect: vi.fn(),
      },
    });

    // Selection is conveyed by aria-current on the row; the check icon
    // beside it is aria-hidden decoration.
    const highItem = screen.getByText("High").closest("li");
    expect(highItem?.getAttribute("aria-current")).toBe("true");

    const lowItem = screen.getByText("Low").closest("li");
    expect(lowItem?.getAttribute("aria-current")).toBeNull();
  });

  it("does not render content when opened is false", () => {
    render(PrioritySelectSheet, {
      props: {
        opened: false,
        ondismiss: vi.fn(),
        onselect: vi.fn(),
      },
    });

    expect(screen.queryByText("Low")).toBeNull();
  });
});
