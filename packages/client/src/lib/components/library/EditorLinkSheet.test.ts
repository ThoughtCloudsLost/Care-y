// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  library_editor_link_url: () => "URL",
  library_editor_link_text: () => "Link text",
  library_editor_link_apply: () => "Apply",
  library_editor_link_insert_title: () => "Insert Link",
  library_editor_link_edit_title: () => "Edit Link",
  library_editor_url_placeholder: () => "https://",
  library_editor_link_generic_warning: ({ text }: { text: string }) =>
    `"${text}" is not descriptive`,
  common_cancel: () => "Cancel",
}));

import EditorLinkSheet from "./EditorLinkSheet.svelte";
import type * as MessagesNS from "$lib/paraglide/messages.js";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditorLinkSheet", () => {
  it("renders insert title when url is empty", () => {
    const ondismiss = vi.fn();
    const onapply = vi.fn();
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "",
        text: "",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply,
        ondismiss,
      },
    });

    expect(screen.getByText("Insert Link")).toBeTruthy();
  });

  it("renders edit title when url is non-empty", () => {
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "https://example.com",
        text: "Example",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    expect(screen.getByText("Edit Link")).toBeTruthy();
  });

  it("disables Apply when url is empty", () => {
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "",
        text: "some text",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    const applyBtn = screen.getByRole("button", { name: "Apply" });
    expect(applyBtn).toHaveProperty("disabled", true);
  });

  it("shows generic link text warning", () => {
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "https://example.com",
        text: "click here",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    expect(screen.getByText('"click here" is not descriptive')).toBeTruthy();
  });

  it("calls ondismiss when Cancel is clicked", async () => {
    const ondismiss = vi.fn();
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "",
        text: "",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply: vi.fn(),
        ondismiss,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("calls onapply when Apply is clicked with a url", async () => {
    const onapply = vi.fn();
    render(EditorLinkSheet, {
      props: {
        opened: true,
        url: "https://example.com",
        text: "Example",
        onurlchange: vi.fn(),
        ontextchange: vi.fn(),
        onapply,
        ondismiss: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onapply).toHaveBeenCalledOnce();
  });
});
