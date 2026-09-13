// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  cleanup,
} from "@testing-library/svelte";

const { mockToastShow, mockUploadFormAsset } = vi.hoisted(() => ({
  mockToastShow: vi.fn(),
  mockUploadFormAsset: vi.fn().mockResolvedValue({
    blobKey: "bk-123",
    blobId: "blob-456",
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  library_editor_toolbar: () => "Editor toolbar",
  library_editor_bold: () => "Bold",
  library_editor_italic: () => "Italic",
  library_editor_strikethrough: () => "Strikethrough",
  library_editor_code: () => "Inline code",
  library_editor_heading: () => "Heading",
  library_editor_heading_level: ({ level }: { level: string }) =>
    `Heading ${level}`,
  library_editor_paragraph: () => "Normal text",
  library_editor_bullet_list: () => "Bullet list",
  library_editor_ordered_list: () => "Numbered list",
  library_editor_blockquote: () => "Blockquote",
  library_editor_code_block: () => "Code block",
  library_editor_link: () => "Link",
  library_editor_image: () => "Image",
  library_editor_horizontal_rule: () => "Horizontal rule",
  library_editor_undo: () => "Undo",
  library_editor_redo: () => "Redo",
  library_editor_alt_text_title: () => "Describe this image",
  library_editor_alt_text_placeholder: () => "Description for screen readers",
  library_editor_decorative: () => "Decorative (no description needed)",
  library_editor_insert: () => "Insert",
  library_editor_link_url: () => "URL",
  library_editor_link_text: () => "Link text",
  library_editor_link_apply: () => "Apply",
  library_editor_link_generic_warning: ({ text }: { text: string }) =>
    `"${text}" is not descriptive`,
  library_editor_link_insert_title: () => "Insert Link",
  library_editor_link_edit_title: () => "Edit Link",
  library_editor_url_placeholder: () => "https://",
  library_image_uploading: () => "Uploading image...",
  library_image_upload_failed: () => "Image upload failed",
  library_file_too_large: () => "File must be under 10 MB",
  library_file_type_not_allowed: () => "This file type is not supported",
  library_editor_ordered_list_symbol: () => "1.",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  form_content_editor_image_no_key: () =>
    "Image upload requires the organization key to be loaded",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  trpc: {
    intakeForms: {
      uploadFormAsset: { mutate: mockUploadFormAsset },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgSlug: () => "test-org",
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  haptic: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  encryptClientBranding: (data: Uint8Array, _key: Uint8Array) => data,
  encode: (data: Uint8Array) => Buffer.from(data).toString("base64"),
}));

import type { LocalizedRichText, ProseMirrorDocJSON } from "@care-y/shared";
import FormContentEditor from "./FormContentEditor.svelte";

// Helper: minimal ProseMirror doc JSON with text content
function makeDocJson(text: string): ProseMirrorDocJSON {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FormContentEditor", () => {
  it("renders with label and hint", () => {
    const onchange = vi.fn();
    render(FormContentEditor, {
      props: {
        value: undefined,
        locale: "en",
        onchange,
        label: "Description",
        hint: "Shown above the form.",
        orgPublicKey: new Uint8Array(32),
      },
    });

    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Shown above the form.")).toBeTruthy();
  });

  it("renders toolbar with formatting buttons", async () => {
    const onchange = vi.fn();
    render(FormContentEditor, {
      props: {
        value: undefined,
        locale: "en",
        onchange,
        label: "Description",
        orgPublicKey: new Uint8Array(32),
      },
    });

    // The toolbar renders once ProseMirror mounts (useProseMirror defers
    // to onMount), so flush the mount before asserting.
    const toolbar = await vi.waitFor(() => screen.getByRole("toolbar"));
    const buttons = within(toolbar);
    expect(buttons.getByRole("button", { name: "Bold" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Italic" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Redo" })).toBeTruthy();
  });

  it("loads initial value from plain string", () => {
    const onchange = vi.fn();
    const value: LocalizedRichText = { en: "Hello world" };

    render(FormContentEditor, {
      props: {
        value,
        locale: "en",
        onchange,
        label: "Description",
        orgPublicKey: null,
      },
    });

    // The component should have initialized. If ProseMirror mounted,
    // onchange would eventually fire with doc JSON, not a plain string.
    // We verify the component does not throw on string input.
    expect(screen.getByText("Description")).toBeTruthy();
  });

  it("loads initial value from ProseMirror doc JSON", () => {
    const onchange = vi.fn();
    const value: LocalizedRichText = {
      en: makeDocJson("Rich content"),
      es: makeDocJson("Contenido enriquecido"),
    };

    render(FormContentEditor, {
      props: {
        value,
        locale: "en",
        onchange,
        label: "Content",
        orgPublicKey: null,
      },
    });

    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("preserves per-locale content structure", () => {
    const onchange = vi.fn();
    const enDoc = makeDocJson("English text");
    const esDoc = makeDocJson("Texto en espanol");
    const value: LocalizedRichText = { en: enDoc, es: esDoc };

    render(FormContentEditor, {
      props: {
        value,
        locale: "en",
        onchange,
        label: "Field",
        orgPublicKey: null,
      },
    });

    // The component initializes both locale docs internally.
    // On locale switch (tested at the integration level), the
    // previously-stored doc for the other locale is preserved.
    expect(screen.getByText("Field")).toBeTruthy();
  });

  it("onchange emits doc JSON, not strings", async () => {
    // Contract: onchange receives LocalizedRichText with
    // ProseMirrorDocJSON values, even when the initial value was a
    // plain string. Drive a real transaction via a toolbar command.
    const onchange = vi.fn();
    render(FormContentEditor, {
      props: {
        value: { en: "plain text" },
        locale: "en",
        onchange,
        label: "Test",
        orgPublicKey: null,
      },
    });

    const toolbar = await vi.waitFor(() => screen.getByRole("toolbar"));
    await fireEvent.click(
      within(toolbar).getByRole("button", { name: "Blockquote" }),
    );

    expect(onchange).toHaveBeenCalled();
    const firstCall = onchange.mock.calls[0] as [LocalizedRichText];
    const enValue = firstCall[0].en;
    // enValue is string | ProseMirrorDocJSON | undefined per the union
    // type. When the editor emits, it always emits doc JSON (object).
    expect(enValue).toBeDefined();
    expect(typeof enValue).toBe("object");
    if (typeof enValue === "object") {
      expect(enValue.type).toBe("doc");
      expect(Array.isArray(enValue.content)).toBe(true);
    }
  });

  it("renders without hint when hint prop is omitted", () => {
    const onchange = vi.fn();
    render(FormContentEditor, {
      props: {
        value: undefined,
        locale: "en",
        onchange,
        label: "No hint",
        orgPublicKey: null,
      },
    });

    expect(screen.getByText("No hint")).toBeTruthy();
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("disables image button when orgPublicKey is null", async () => {
    const onchange = vi.fn();
    render(FormContentEditor, {
      props: {
        value: undefined,
        locale: "en",
        onchange,
        label: "Editor",
        orgPublicKey: null,
      },
    });

    // Scope to the toolbar: the hidden file input shares the "Image"
    // accessible name (input[type=file] maps to role button).
    const toolbar = await vi.waitFor(() => screen.getByRole("toolbar"));
    const imageBtn = within(toolbar).getByRole("button", { name: "Image" });
    expect(imageBtn).toHaveProperty("disabled", true);
  });
});
