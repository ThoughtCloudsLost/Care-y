import { describe, it, expect, vi, afterEach } from "vitest";
import { copyToClipboard } from "./clipboard-copy.js";
import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";

type ToastStore = typeof ToastStoreType;

const labels = { success: "Copied", failure: "Copy failed" } as const;

function makeToast(): ToastStore {
  return {
    current: null,
    show: vi.fn(),
    dismiss: vi.fn(),
  };
}

describe("copyToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call clipboard API when plaintext is undefined", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const toast = makeToast();

    await copyToClipboard(undefined, toast, labels);

    expect(writeText).not.toHaveBeenCalled();
    expect(toast.show).not.toHaveBeenCalled();
  });

  it("does not call clipboard API when plaintext is empty string", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const toast = makeToast();

    await copyToClipboard("", toast, labels);

    expect(writeText).not.toHaveBeenCalled();
    expect(toast.show).not.toHaveBeenCalled();
  });

  it("writes to clipboard and shows success toast on successful copy", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const toast = makeToast();

    await copyToClipboard("some text", toast, labels);

    expect(writeText).toHaveBeenCalledWith("some text");
    expect(toast.show).toHaveBeenCalledWith("Copied");
  });

  it("shows failure toast when clipboard write rejects", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValue(new Error("permission denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    const toast = makeToast();

    await copyToClipboard("some text", toast, labels);

    expect(toast.show).toHaveBeenCalledWith("Copy failed");
  });
});
