// @vitest-environment jsdom
/**
 * Tests for EmailActionContent: verifies copy/edit action rendering
 * and callback wiring based on the canCopy prop.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import EmailActionContent from "./EmailActionContent.svelte";
import type * as Messages from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  email_copy_clipboard: () => "Copy email address",
  client_email_edit: () => "Edit email",
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

describe("EmailActionContent", () => {
  it("renders both copy and edit actions when canCopy is true", () => {
    const { container } = render(EmailActionContent, {
      props: {
        canCopy: true,
        oncopy: vi.fn(),
        onedit: vi.fn(),
      },
    });

    expect(container.textContent).toContain("Copy email address");
    expect(container.textContent).toContain("Edit email");
  });

  it("hides copy action and shows only edit when canCopy is false", () => {
    const { container } = render(EmailActionContent, {
      props: {
        canCopy: false,
        oncopy: vi.fn(),
        onedit: vi.fn(),
      },
    });

    expect(container.textContent).not.toContain("Copy email address");
    expect(container.textContent).toContain("Edit email");
  });

  it("calls oncopy when the copy action is tapped", async () => {
    const oncopy = vi.fn();
    const { getByText } = render(EmailActionContent, {
      props: {
        canCopy: true,
        oncopy,
        onedit: vi.fn(),
      },
    });

    const copyItem = getByText("Copy email address").closest("[class]");
    if (copyItem) {
      await fireEvent.click(copyItem);
    }
    expect(oncopy).toHaveBeenCalledOnce();
  });

  it("calls onedit when the edit action is tapped", async () => {
    const onedit = vi.fn();
    const { getByText } = render(EmailActionContent, {
      props: {
        canCopy: false,
        oncopy: vi.fn(),
        onedit,
      },
    });

    const editItem = getByText("Edit email").closest("[class]");
    if (editItem) {
      await fireEvent.click(editItem);
    }
    expect(onedit).toHaveBeenCalledOnce();
  });
});
