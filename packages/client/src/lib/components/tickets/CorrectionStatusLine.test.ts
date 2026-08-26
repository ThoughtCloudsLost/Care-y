// @vitest-environment jsdom
/**
 * CorrectionStatusLine component tests.
 *
 * Exercises the flag label, the acknowledge button and its handled
 * state with user name resolution, and the toggle callback.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import CorrectionStatusLine from "./CorrectionStatusLine.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  contact_correction_flag_label: () =>
    "Contact correction, verify before contacting",
  contact_correction_mark_handled: () => "Mark handled",
  contact_correction_handled: () => "Handled",
  contact_correction_handled_by: (p: { name: string }) =>
    `Handled by ${p.name}`,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

describe("CorrectionStatusLine", () => {
  it("renders the flag label", () => {
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [],
        ontoggleacknowledge: vi.fn(),
      },
    });

    expect(container.textContent).toContain(
      "Contact correction, verify before contacting",
    );
  });

  it("shows 'Mark handled' button when not acknowledged", () => {
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [],
        ontoggleacknowledge: vi.fn(),
      },
    });

    const btn = container.querySelector("[data-testid='correction-ack-btn']");
    expect(btn).toBeTruthy();
    expect(btn!.textContent!.trim()).toBe("Mark handled");
  });

  it("shows 'Handled' button when acknowledged", () => {
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [{ reaction: "acknowledge", userIds: ["user-1"] }],
        ontoggleacknowledge: vi.fn(),
      },
    });

    const btn = container.querySelector("[data-testid='correction-ack-btn']");
    expect(btn!.textContent!.trim()).toBe("Handled");
  });

  it("shows acknowledged-by label with resolved user name", () => {
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [{ reaction: "acknowledge", userIds: ["user-1"] }],
        ontoggleacknowledge: vi.fn(),
        resolveUserName: (uid: string) =>
          uid === "user-1" ? "Alice" : undefined,
      },
    });

    const ackLabel = container.querySelector(
      "[data-testid='correction-ack-label']",
    );
    expect(ackLabel?.textContent).toContain("Handled by Alice");
  });

  it("calls ontoggleacknowledge when the button is clicked", async () => {
    const ontoggleacknowledge = vi.fn();
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [],
        ontoggleacknowledge,
      },
    });

    const btn = container.querySelector(
      "[data-testid='correction-ack-btn']",
    ) as HTMLElement;
    await fireEvent.click(btn);
    expect(ontoggleacknowledge).toHaveBeenCalledOnce();
  });

  it("applies correction-handled class when acknowledged", () => {
    const { container } = render(CorrectionStatusLine, {
      props: {
        reactions: [{ reaction: "acknowledge", userIds: ["user-1"] }],
        ontoggleacknowledge: vi.fn(),
      },
    });

    const statusEl = container.querySelector(
      "[data-testid='correction-status-line']",
    );
    expect(statusEl?.classList.contains("correction-handled")).toBe(true);
  });
});
