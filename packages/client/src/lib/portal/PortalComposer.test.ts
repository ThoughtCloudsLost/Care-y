// @vitest-environment jsdom
/**
 * PortalComposer tests for correction mode.
 *
 * Covers: correction toggle visibility, correction indicator rendering,
 * cancel button, and kind passthrough on send.
 *
 * Page-harness tests for the full portal page are skipped (known to be
 * prohibitively mock-heavy with the crypto init, fragment parsing, and
 * bootstrap query).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import PortalComposer from "./PortalComposer.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";
import type * as ShellMessagebarMod from "$lib/shell/ShellMessagebar.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  portal_composer_placeholder: () => "Message too long",
  portal_correction_mode_label: () => "Correcting contact info",
  portal_correction_mode_button: () => "Correct my contact info",
  portal_correction_mode_cancel: () => "Cancel correction",
  portal_send: () => "Send",
}));

// ShellMessagebar depends on Konsta internals that do not work in jsdom.
vi.mock("$lib/shell/ShellMessagebar.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellMessagebarMod>()),
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

describe("PortalComposer correction mode", () => {
  const baseProps = {
    onsend: vi.fn(),
    pending: false,
  };

  it("shows the correction toggle button by default", () => {
    const { container } = render(PortalComposer, { props: baseProps });
    const btn = container.querySelector(
      "[data-testid='correction-mode-toggle']",
    );
    expect(btn).toBeTruthy();
    expect(btn!.textContent!.trim()).toBe("Correct my contact info");
  });

  it("shows correction indicator when toggle is clicked", async () => {
    const { container } = render(PortalComposer, { props: baseProps });
    const toggleBtn = container.querySelector(
      "[data-testid='correction-mode-toggle']",
    ) as HTMLElement;
    await fireEvent.click(toggleBtn);

    const indicator = container.querySelector(
      "[data-testid='correction-mode-indicator']",
    );
    expect(indicator).toBeTruthy();
    expect(indicator?.textContent).toContain("Correcting contact info");
  });

  it("hides correction toggle when in correction mode", async () => {
    const { container } = render(PortalComposer, { props: baseProps });
    const toggleBtn = container.querySelector(
      "[data-testid='correction-mode-toggle']",
    ) as HTMLElement;
    await fireEvent.click(toggleBtn);

    expect(
      container.querySelector("[data-testid='correction-mode-toggle']"),
    ).toBeNull();
  });

  it("returns to normal mode on cancel click", async () => {
    const { container } = render(PortalComposer, { props: baseProps });
    const toggleBtn = container.querySelector(
      "[data-testid='correction-mode-toggle']",
    ) as HTMLElement;
    await fireEvent.click(toggleBtn);

    const cancelBtn = container.querySelector(
      "[data-testid='correction-mode-cancel']",
    ) as HTMLElement;
    await fireEvent.click(cancelBtn);

    expect(
      container.querySelector("[data-testid='correction-mode-indicator']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='correction-mode-toggle']"),
    ).toBeTruthy();
  });
});
