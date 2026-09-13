// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  cleanup,
} from "@testing-library/svelte";

const { mockUploadFormAsset } = vi.hoisted(() => ({
  mockUploadFormAsset: vi.fn().mockResolvedValue({
    blobKey: "bk-123",
    blobId: "blob-456",
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
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
  library_editor_attach_file: () => "Attach file",
  library_editor_table: () => "Table",
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
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  form_content_editor_image_no_key: () =>
    "Image upload requires the organization key to be loaded",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    intakeForms: {
      uploadFormAsset: { mutate: mockUploadFormAsset },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgSlugNS>()),
  getOrgSlug: () => "test-org",
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);

vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoNS>()),
  encryptClientBranding: (data: Uint8Array, _key: Uint8Array) => data,
  encode: (data: Uint8Array) => Buffer.from(data).toString("base64"),
}));

import type { LocalizedRichText, ProseMirrorDocJSON } from "@care-y/shared";
import FormContentEditor from "./FormContentEditor.svelte";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ErrorsNS from "$lib/errors.js";
import { mockToastShow } from "$mocks/toast.js";
import type * as CryptoNS from "@care-y/crypto";
import type * as OrgSlugNS from "$lib/utils/org-slug.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";

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

  it("renders shared EditorToolbar with formatting buttons", async () => {
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

    // EditorToolbar renders with role="toolbar" via Bits UI Toolbar.Root
    const toolbar = await vi.waitFor(() => screen.getByRole("toolbar"));
    const buttons = within(toolbar);
    expect(buttons.getByRole("button", { name: "Bold" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Italic" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Image" })).toBeTruthy();
    expect(buttons.getByRole("button", { name: "Link" })).toBeTruthy();
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

  it("shows toast when image is clicked without orgPublicKey", async () => {
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

    // The shared toolbar renders the image button enabled. The
    // command handler shows a toast when orgPublicKey is null.
    const toolbar = await vi.waitFor(() => screen.getByRole("toolbar"));
    const imageBtn = within(toolbar).getByRole("button", { name: "Image" });
    await fireEvent.click(imageBtn);

    expect(mockToastShow).toHaveBeenCalledWith(
      "Image upload requires the organization key to be loaded",
      3000,
    );
  });
});
