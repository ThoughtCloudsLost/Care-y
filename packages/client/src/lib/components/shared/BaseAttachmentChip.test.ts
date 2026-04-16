// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import BaseAttachmentChip from "./BaseAttachmentChip.svelte";

afterEach(() => {
  cleanup();
});

describe("BaseAttachmentChip", () => {
  const ondownload = vi.fn<(id: string) => Promise<void>>().mockResolvedValue();

  const baseProps = {
    attachmentId: "att-001",
    filename: "consent-form.pdf",
    sizeBytes: 245_000,
    ondownload,
  };

  afterEach(() => {
    ondownload.mockClear();
  });

  it("renders filename and formatted size", () => {
    const { container } = render(BaseAttachmentChip, { props: baseProps });
    expect(container.textContent).toContain("consent-form.pdf");
    expect(container.textContent).toContain("239KB");
  });

  it("has correct aria-label for download action", () => {
    const { container } = render(BaseAttachmentChip, { props: baseProps });
    const btn = container.querySelector("[role='button']");
    expect(btn?.getAttribute("aria-label")).toBe("Download consent-form.pdf");
  });

  it("calls ondownload with attachmentId on click", async () => {
    const { container } = render(BaseAttachmentChip, { props: baseProps });
    const btn = container.querySelector("[role='button']") as HTMLElement;
    btn.click();
    // Allow async handler to fire
    await vi.waitFor(() => {
      expect(ondownload).toHaveBeenCalledWith("att-001");
    });
  });

  it("formats sub-1KB sizes correctly", () => {
    const { container } = render(BaseAttachmentChip, {
      props: { ...baseProps, filename: "tiny.txt", sizeBytes: 500 },
    });
    expect(container.textContent).toContain("500B");
  });

  it("formats MB-range sizes correctly", () => {
    const { container } = render(BaseAttachmentChip, {
      props: { ...baseProps, filename: "video.mp4", sizeBytes: 5_242_880 },
    });
    expect(container.textContent).toContain("5.0MB");
  });

  it("marks chip as aria-disabled and unfocusable when disabled", () => {
    const { container } = render(BaseAttachmentChip, {
      props: { ...baseProps, disabled: true },
    });
    const btn = container.querySelector("[role='button']");
    expect(btn?.getAttribute("aria-disabled")).toBe("true");
    expect(btn?.getAttribute("tabindex")).toBe("-1");
  });

  it("does not call ondownload when disabled", async () => {
    const { container } = render(BaseAttachmentChip, {
      props: { ...baseProps, disabled: true },
    });
    const btn = container.querySelector("[role='button']") as HTMLElement;
    btn.click();
    // Give the async handler a tick to fire (it shouldn't)
    await new Promise((r) => setTimeout(r, 50));
    expect(ondownload).not.toHaveBeenCalled();
  });
});
