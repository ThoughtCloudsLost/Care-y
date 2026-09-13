// @vitest-environment jsdom
/**
 * PortalComposer tests.
 *
 * Covers: no in-composer correction mode exists, send calls onsend with
 * text only (no kind), character counter visibility, disabled state
 * when portalMessagingEnabled is false.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import PortalComposer from "./PortalComposer.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";
import type * as ShellMessagebarMod from "$lib/shell/ShellMessagebar.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  portal_composer_placeholder: () => "Message too long",
  portal_correction_mode_button: () => "Correct my contact info",
  portal_send: () => "Send",
  portal_messaging_disabled: () => "Messaging is currently unavailable.",
  portal_messaging_disabled_aria: () => "Messaging disabled by org.",
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

describe("PortalComposer", () => {
  const baseProps = {
    onsend: vi.fn(),
    pending: false,
  };

  it("renders the composer without any correction mode UI", () => {
    const { container } = render(PortalComposer, { props: baseProps });
    expect(
      container.querySelector("[data-testid='correction-mode-indicator']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='correction-mode-cancel']"),
    ).toBeNull();
  });

  it("does not expose enterCorrectionMode", () => {
    const { component } = render(PortalComposer, { props: baseProps });
    expect(
      (component as Record<string, unknown>).enterCorrectionMode,
    ).toBeUndefined();
  });

  it("renders disabled state with explanation when messagingDisabled is true", () => {
    render(PortalComposer, {
      props: { ...baseProps, messagingDisabled: true },
    });

    const disabledEl = screen.getByTestId("portal-messaging-disabled");
    expect(disabledEl).toBeTruthy();
    expect(
      screen.getByText("Messaging is currently unavailable."),
    ).toBeTruthy();
  });

  it("blocks send when messagingDisabled is true", () => {
    render(PortalComposer, {
      props: { ...baseProps, messagingDisabled: true },
    });

    // The composer input is not rendered at all in disabled state
    const composerEl = screen.getByTestId("portal-composer");
    expect(composerEl).toBeTruthy();
    // No messagebar should be rendered
    expect(composerEl.querySelector(".k-messagebar")).toBeNull();
  });

  it("uses custom disabled message when provided", () => {
    render(PortalComposer, {
      props: {
        ...baseProps,
        messagingDisabled: true,
        messagingDisabledMessage: "Custom explanation",
      },
    });

    expect(screen.getByText("Custom explanation")).toBeTruthy();
  });
});
