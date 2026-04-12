// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock required: @lucide/svelte exports Svelte components that
// need a browser rendering context. Stubs preserve identity for assertions.
vi.mock("@lucide/svelte", () => ({
  Paperclip: "Paperclip",
  FileText: "FileText",
  FileArchive: "FileArchive",
  FileSpreadsheet: "FileSpreadsheet",
  FileHeadphone: "FileHeadphone",
  FilePlay: "FilePlay",
  File: "File",
}));

import {
  fileIcon,
  fileTypeLabel,
  downloadDecryptedAttachment,
  type DownloadDeps,
} from "./attachment-download.js";

describe("fileIcon", () => {
  it("returns File for null content type", () => {
    expect(fileIcon(null)).toBe("File");
  });

  it("returns File for empty string", () => {
    expect(fileIcon("")).toBe("File");
  });

  it("returns FileText for text/* types", () => {
    expect(fileIcon("text/plain")).toBe("FileText");
    expect(fileIcon("text/html")).toBe("FileText");
  });

  it("returns FileText for PDF", () => {
    expect(fileIcon("application/pdf")).toBe("FileText");
  });

  it("returns FileText for Word documents", () => {
    expect(fileIcon("application/msword")).toBe("FileText");
    expect(
      fileIcon(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe("FileText");
  });

  it("returns FileArchive for archive types", () => {
    expect(fileIcon("application/zip")).toBe("FileArchive");
    expect(fileIcon("application/gzip")).toBe("FileArchive");
    expect(fileIcon("application/x-tar")).toBe("FileArchive");
    expect(fileIcon("application/x-7z-compressed")).toBe("FileArchive");
    expect(fileIcon("application/x-rar-compressed")).toBe("FileArchive");
  });

  it("returns FileSpreadsheet for spreadsheet types", () => {
    expect(fileIcon("application/vnd.ms-excel")).toBe("FileSpreadsheet");
    expect(
      fileIcon(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
    ).toBe("FileSpreadsheet");
    // Note: text/csv matches text/* first, returning FileText.
    // The spreadsheet check handles Excel-specific MIME types only.
  });

  it("returns FileHeadphone for audio types", () => {
    expect(fileIcon("audio/mpeg")).toBe("FileHeadphone");
    expect(fileIcon("audio/wav")).toBe("FileHeadphone");
  });

  it("returns FilePlay for video types", () => {
    expect(fileIcon("video/mp4")).toBe("FilePlay");
    expect(fileIcon("video/webm")).toBe("FilePlay");
  });

  it("returns Paperclip for unrecognized types", () => {
    expect(fileIcon("application/octet-stream")).toBe("Paperclip");
  });
});

describe("fileTypeLabel", () => {
  it("returns empty string for null", () => {
    expect(fileTypeLabel(null)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(fileTypeLabel("")).toBe("");
  });

  it("returns known MIME labels", () => {
    expect(fileTypeLabel("application/pdf")).toBe("PDF");
    expect(fileTypeLabel("application/zip")).toBe("ZIP");
    expect(fileTypeLabel("text/csv")).toBe("CSV");
    expect(fileTypeLabel("application/json")).toBe("JSON");
    expect(fileTypeLabel("application/msword")).toBe("DOC");
  });

  it("extracts subtype for unknown MIME types", () => {
    expect(fileTypeLabel("audio/mpeg")).toBe("MPEG");
    expect(fileTypeLabel("video/webm")).toBe("WEBM");
  });

  it("strips x- prefix from unknown subtypes", () => {
    expect(fileTypeLabel("application/x-custom")).toBe("CUSTOM");
  });
});

describe("downloadDecryptedAttachment", () => {
  let deps: DownloadDeps;
  let mockClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    deps = {
      ticketRouter: {
        downloadAttachmentBlob: {
          query: vi.fn().mockResolvedValue({ data: "ZW5jcnlwdGVkLWRhdGE=" }),
        },
      } as unknown as DownloadDeps["ticketRouter"],
      bridge: {
        decryptBlob: vi.fn().mockResolvedValue(new Uint8Array([100, 101, 99])),
      } as unknown as DownloadDeps["bridge"],
      ticketId: "t-1",
      keyWrap: {
        ephemeralPoint: "ep",
        nonce: "nc",
        wrappedKey: "wk",
      } as unknown as DownloadDeps["keyWrap"],
    };

    mockClick = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      set href(_: string) {
        /* stub */
      },
      set download(_: string) {
        /* stub */
      },
      click: mockClick,
    } as unknown as HTMLAnchorElement);

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("fetches, decrypts, and triggers a browser download", async () => {
    await downloadDecryptedAttachment("att-1", "photo.jpg", deps);

    expect(deps.ticketRouter.downloadAttachmentBlob.query).toHaveBeenCalledWith(
      { attachmentId: "att-1" },
    );
    expect(deps.bridge.decryptBlob).toHaveBeenCalledWith(
      "t-1",
      "ep",
      "nc",
      "wk",
      "ZW5jcnlwdGVkLWRhdGE=",
    );
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
