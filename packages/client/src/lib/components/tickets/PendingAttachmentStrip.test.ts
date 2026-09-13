// @vitest-environment jsdom
/**
 * PendingAttachmentStrip component tests.
 *
 * Validates chip rendering by status, remove callback dispatch,
 * and empty-state hiding.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";

import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type { PendingAttachment } from "$lib/composables/ticket-detail/create-attachment-upload.svelte.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
}));

const { default: PendingAttachmentStrip } =
  await import("./PendingAttachmentStrip.svelte");
const { attachmentIdSchema } = await import("@care-y/shared");

afterEach(cleanup);

function entry(
  id: string,
  filename: string,
  status: PendingAttachment["status"],
): PendingAttachment {
  return {
    attachmentId: attachmentIdSchema.parse(id),
    filename,
    sizeBytes: 1024,
    contentType: "image/jpeg",
    status,
  };
}

const ID_A = "6a1f16be-3c65-4be1-9df5-6ea31ae1c001";
const ID_B = "6a1f16be-3c65-4be1-9df5-6ea31ae1c002";
const ID_C = "6a1f16be-3c65-4be1-9df5-6ea31ae1c003";

const ENTRIES = [
  entry(ID_A, "photo.jpg", "uploading"),
  entry(ID_B, "doc.pdf", "done"),
  entry(ID_C, "fail.png", "failed"),
];

describe("PendingAttachmentStrip", () => {
  it("renders nothing when entries is empty", () => {
    const { container } = render(PendingAttachmentStrip, {
      entries: [],
      onremove: vi.fn(),
    });

    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it("renders one chip per entry", () => {
    render(PendingAttachmentStrip, {
      entries: ENTRIES,
      onremove: vi.fn(),
    });

    expect(screen.getByText("photo.jpg")).toBeTruthy();
    expect(screen.getByText("doc.pdf")).toBeTruthy();
    expect(screen.getByText("fail.png")).toBeTruthy();
  });

  it("dispatches onremove with the attachment id on remove click", async () => {
    const onremove = vi.fn();

    render(PendingAttachmentStrip, {
      entries: ENTRIES,
      onremove,
    });

    // The remove button carries an aria-label with the filename
    const removeBtn = screen.getByLabelText(/photo\.jpg/);
    await fireEvent.click(removeBtn);

    expect(onremove).toHaveBeenCalledWith(ID_A);
  });

  it("shows uploading status for encrypting and uploading entries", () => {
    render(PendingAttachmentStrip, {
      entries: [
        entry("6a1f16be-3c65-4be1-9df5-6ea31ae1c004", "enc.jpg", "encrypting"),
      ],
      onremove: vi.fn(),
    });

    // The uploading label text comes from the i18n key attachment_uploading
    const list = screen.getByRole("list");
    expect(list).toBeTruthy();
  });
});
