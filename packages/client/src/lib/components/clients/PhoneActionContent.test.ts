// @vitest-environment jsdom
/**
 * Tests for PhoneActionContent: verifies copy/edit action rendering
 * and callback wiring based on the canCopy prop.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import PhoneActionContent from "./PhoneActionContent.svelte";
import type * as Messages from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  phone_copy_clipboard: () => "Copy phone number",
  phone_edit: () => "Edit phone number",
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

describe("PhoneActionContent", () => {
  it("renders both copy and edit actions when canCopy is true", () => {
    const { container } = render(PhoneActionContent, {
      props: {
        canCopy: true,
        oncopy: vi.fn(),
        onedit: vi.fn(),
      },
    });

    expect(container.textContent).toContain("Copy phone number");
    expect(container.textContent).toContain("Edit phone number");
  });

  it("hides copy action and shows only edit when canCopy is false", () => {
    const { container } = render(PhoneActionContent, {
      props: {
        canCopy: false,
        oncopy: vi.fn(),
        onedit: vi.fn(),
      },
    });

    expect(container.textContent).not.toContain("Copy phone number");
    expect(container.textContent).toContain("Edit phone number");
  });

  it("calls oncopy when the copy action is tapped", async () => {
    const oncopy = vi.fn();
    const { getByText } = render(PhoneActionContent, {
      props: {
        canCopy: true,
        oncopy,
        onedit: vi.fn(),
      },
    });

    const copyItem = getByText("Copy phone number").closest("[class]");
    if (copyItem) {
      await fireEvent.click(copyItem);
    }
    expect(oncopy).toHaveBeenCalledOnce();
  });

  it("calls onedit when the edit action is tapped", async () => {
    const onedit = vi.fn();
    const { getByText } = render(PhoneActionContent, {
      props: {
        canCopy: false,
        oncopy: vi.fn(),
        onedit,
      },
    });

    const editItem = getByText("Edit phone number").closest("[class]");
    if (editItem) {
      await fireEvent.click(editItem);
    }
    expect(onedit).toHaveBeenCalledOnce();
  });
});
