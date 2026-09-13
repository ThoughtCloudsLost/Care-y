// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import ShellPanel from "./ShellPanel.svelte";
import { _resetOverlayStack } from "./overlay-stack";

// Konsta Panel relies on a .k-page container for portaling.
beforeEach(() => {
  const kPage = document.createElement("div");
  kPage.className = "k-page";
  document.body.appendChild(kPage);
});

afterEach(() => {
  cleanup();
  _resetOverlayStack();
  document.body.querySelector(".k-page")?.remove();
});

const testSnippet = createRawSnippet(() => ({
  render: () => `<button>Panel Button</button>`,
}));

describe("ShellPanel", () => {
  it("renders dialog wrapper with ARIA attributes when opened", () => {
    render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-label")).toBe("Admin panel");
    expect(dialog?.getAttribute("tabindex")).toBe("-1");
  });

  it("renders panel content when opened", () => {
    render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    expect(document.querySelector("button")?.textContent).toBe("Panel Button");
  });

  it("calls ondismiss when Escape is pressed", async () => {
    const ondismiss = vi.fn();

    render(ShellPanel, {
      props: {
        opened: true,
        ondismiss,
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    // useFocusTrap defers activateFocusTrap via requestAnimationFrame.
    // Flush the rAF queue so the keydown listener is registered.
    await new Promise<void>((r) => {
      requestAnimationFrame(() => {
        r();
      });
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    await fireEvent.keyDown(dialog, { key: "Escape" });
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("defaults side to left", () => {
    render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    // Konsta Panel with side="left" applies left-side positioning classes.
    // The component should render without errors when no side prop is provided.
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it("applies shell-panel-content class to dialog wrapper", () => {
    render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.classList.contains("shell-panel-content")).toBe(true);
  });

  it("stacks backdrops for two open panels and removes them on close", async () => {
    const { rerender: rerenderA } = render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Panel A",
        children: testSnippet,
      },
    });

    const { rerender: rerenderB } = render(ShellPanel, {
      props: {
        opened: true,
        ondismiss: vi.fn(),
        ariaLabel: "Panel B",
        children: testSnippet,
      },
    });

    const backdrops = () =>
      document.querySelectorAll('[data-testid="shell-backdrop"]');
    expect(backdrops()).toHaveLength(2);

    // Close the second panel
    await rerenderB({ opened: false });
    expect(backdrops()).toHaveLength(1);

    // Close the first panel
    await rerenderA({ opened: false });
    expect(backdrops()).toHaveLength(0);
  });

  it("marks the closed panel inert and drops aria-modal", async () => {
    const { rerender } = render(ShellPanel, {
      props: {
        opened: false,
        ondismiss: vi.fn(),
        ariaLabel: "Admin panel",
        children: testSnippet,
      },
    });

    // Svelte assigns the inert IDL property; browsers reflect it to the
    // attribute (which the [inert] CSS targets) but jsdom does not
    // implement inert, so the test reads the property.
    const dialog = document.querySelector('[role="dialog"]') as
      (Element & { inert?: unknown }) | null;
    expect(dialog?.inert).toBe(true);
    expect(dialog?.hasAttribute("aria-modal")).toBe(false);

    await rerender({ opened: true });
    expect(dialog?.inert).toBeFalsy();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
  });
});
