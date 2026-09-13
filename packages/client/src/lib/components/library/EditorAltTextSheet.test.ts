// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  library_editor_alt_text_title: () => "Describe this image",
  library_editor_alt_text_placeholder: () => "Description for screen readers",
  library_editor_decorative: () => "Decorative (no description needed)",
  library_editor_insert: () => "Insert",
  common_cancel: () => "Cancel",
}));

import EditorAltTextSheet from "./EditorAltTextSheet.svelte";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditorAltTextSheet", () => {
  it("renders the sheet title", () => {
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    expect(screen.getByText("Describe this image")).toBeTruthy();
  });

  it("disables Insert when alt text is empty and not decorative", () => {
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    const insertBtn = screen.getByRole("button", { name: "Insert" });
    expect(insertBtn).toHaveProperty("disabled", true);
  });

  it("enables Insert when alt text has content", () => {
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "A chart showing monthly growth",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    const insertBtn = screen.getByRole("button", { name: "Insert" });
    expect(insertBtn).toHaveProperty("disabled", false);
  });

  it("enables Insert when decorative is checked", () => {
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "",
        decorative: true,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    const insertBtn = screen.getByRole("button", { name: "Insert" });
    expect(insertBtn).toHaveProperty("disabled", false);
  });

  it("calls ondismiss when Cancel is clicked", async () => {
    const ondismiss = vi.fn();
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("calls oninsert when Insert is clicked with alt text", async () => {
    const oninsert = vi.fn();
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "Description of image",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert,
        ondismiss: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(oninsert).toHaveBeenCalledOnce();
  });

  it("renders decorative checkbox", () => {
    render(EditorAltTextSheet, {
      props: {
        opened: true,
        altText: "",
        decorative: false,
        onalttextchange: vi.fn(),
        ondecorativechange: vi.fn(),
        oninsert: vi.fn(),
        ondismiss: vi.fn(),
      },
    });

    expect(screen.getByText("Decorative (no description needed)")).toBeTruthy();
  });
});
