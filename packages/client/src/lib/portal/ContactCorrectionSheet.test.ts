// @vitest-environment jsdom
/**
 * ContactCorrectionSheet tests.
 *
 * Covers: title and body render when opened, submit disabled with empty
 * input, typing enables submit, submit calls onsubmit with trimmed value,
 * pending disables submit.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { tick } from "svelte";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ContactCorrectionSheet from "./ContactCorrectionSheet.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  portal_correction_sheet_title: () => "Correct my contact info",
  portal_correction_sheet_body: () => "Enter the phone number",
  portal_correction_phone_label: () => "New phone number",
  portal_correction_sheet_submit: () => "Send correction",
}));

// ShellSheet portals to .k-page and depends on Konsta internals.
vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (
    await import("../components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom has no ResizeObserver
vi.stubGlobal(
  "ResizeObserver",
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

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

describe("ContactCorrectionSheet", () => {
  const baseProps = {
    opened: true,
    ondismiss: vi.fn(),
    onsubmit: vi.fn(),
  };

  it("renders title and body when opened", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    expect(container.textContent).toContain("Correct my contact info");
    expect(container.textContent).toContain("Enter the phone number");
  });

  it("does not render content when closed", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, opened: false },
    });
    // PassthroughShell hides children when opened=false
    expect(container.textContent).not.toContain("Enter the phone number");
  });

  it("submit button is disabled with empty input", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });

  it("typing a value enables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "+1 555-1234" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("submit calls onsubmit with the trimmed value", async () => {
    const onsubmit = vi.fn();
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, onsubmit },
    });

    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "  +1 555-1234  " } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    await fireEvent.click(btn);

    expect(onsubmit).toHaveBeenCalledWith("+1 555-1234");
  });

  it("pending disables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, pending: true },
    });

    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "+1 555-1234" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
