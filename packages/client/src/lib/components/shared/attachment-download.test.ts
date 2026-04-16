// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub Lucide icons (Svelte components need browser rendering context)
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
  triggerBlobDownload,
  fileIcon,
  fileTypeLabel,
} from "./attachment-download.js";

describe("triggerBlobDownload", () => {
  let mockClick: ReturnType<typeof vi.fn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
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

    createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
  });

  it("creates a blob URL, clicks anchor, and revokes the URL", () => {
    const buf = new Uint8Array([72, 101, 108, 108, 111]);
    triggerBlobDownload(buf, "hello.txt");

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(mockClick).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("works with ArrayBuffer input", () => {
    createObjectURLSpy.mockClear();
    revokeObjectURLSpy.mockClear();
    mockClick.mockClear();

    const buf = new ArrayBuffer(8);
    triggerBlobDownload(buf, "data.bin");

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    expect(mockClick).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});

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
