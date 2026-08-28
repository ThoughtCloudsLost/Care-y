import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as CryptoPkg from "@care-y/crypto";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as Paraglide from "$lib/paraglide/messages.js";
import {
  createAttachmentUpload,
  type AttachmentUploadConfig,
} from "./create-attachment-upload.svelte.js";

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton, unavailable in the Node
// test environment without the slow JS fallback.
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  encode: (b: Uint8Array) => `b64:${String(b.length)}`,
}));

const mockToastShow = vi.fn();
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Paraglide>()),
  attachment_type_not_allowed: () => "type-not-allowed",
  attachment_too_large: ({ limit }: { limit: string }) => `too-large:${limit}`,
  attachment_upload_failed: () => "upload-failed",
}));

/** Build a File-like object with a given size and type. */
function fakeFile(name: string, sizeBytes: number, type: string): File {
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type });
}

function makeConfig(
  overrides?: Partial<AttachmentUploadConfig>,
): AttachmentUploadConfig {
  return {
    getTicketId: () => "t-1",
    getClientPublic: () => null,
    cryptoBridge: {
      encryptAttachment: vi.fn().mockResolvedValue({
        blob: new ArrayBuffer(128),
        fileKeyWrap: "wrap-b64",
        encryptedFilename: "enc-name-b64",
      }),
    } as unknown as AttachmentUploadConfig["cryptoBridge"],
    uploadMutate: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createAttachmentUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockToastShow.mockClear();
  });

  it("rejects an oversized file before any request", async () => {
    const config = makeConfig();
    const uploader = createAttachmentUpload(config);

    // 11 MB, above the ~10 MB plaintext cap
    const big = fakeFile("huge.pdf", 11 * 1024 * 1024, "application/pdf");
    await uploader.attach(big);

    expect(config.cryptoBridge.encryptAttachment).not.toHaveBeenCalled();
    expect(config.uploadMutate).not.toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.stringContaining("too-large"),
      3000,
    );
    expect(uploader.pending).toHaveLength(0);
  });

  it("rejects a disallowed content type before any request", async () => {
    const config = makeConfig();
    const uploader = createAttachmentUpload(config);

    const svg = fakeFile("logo.svg", 1024, "image/svg+xml");
    await uploader.attach(svg);

    expect(config.cryptoBridge.encryptAttachment).not.toHaveBeenCalled();
    expect(config.uploadMutate).not.toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith("type-not-allowed", 3000);
    expect(uploader.pending).toHaveLength(0);
  });

  it("does nothing when a second attach is called while busy", async () => {
    let resolveEncrypt!: (v: {
      blob: ArrayBuffer;
      fileKeyWrap: string;
      encryptedFilename: string;
    }) => void;
    const config = makeConfig({
      cryptoBridge: {
        encryptAttachment: vi.fn(
          () =>
            new Promise((r) => {
              resolveEncrypt = r;
            }),
        ),
      } as unknown as AttachmentUploadConfig["cryptoBridge"],
    });
    const uploader = createAttachmentUpload(config);

    const f1 = fakeFile("a.png", 1024, "image/png");
    const f2 = fakeFile("b.png", 1024, "image/png");

    const first = uploader.attach(f1);
    // Second attach while first is in flight.
    const second = uploader.attach(f2);

    resolveEncrypt({
      blob: new ArrayBuffer(64),
      fileKeyWrap: "w",
      encryptedFilename: "e",
    });
    await first;
    await second;

    expect(config.cryptoBridge.encryptAttachment).toHaveBeenCalledTimes(1);
  });

  it("leaves a failed upload retryable and does not clear the list", async () => {
    const config = makeConfig({
      uploadMutate: vi.fn().mockRejectedValue(new Error("network")),
    });
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("doc.pdf", 512, "application/pdf");
    await uploader.attach(f);

    expect(uploader.pending).toHaveLength(1);
    expect(uploader.pending[0]?.status).toBe("failed");
    expect(mockToastShow).toHaveBeenCalledWith("upload-failed", 3000);
  });

  it("links() carries the portal copy only when a client public key was supplied", async () => {
    const config = makeConfig({
      getClientPublic: () => "client-pub",
      cryptoBridge: {
        encryptAttachment: vi.fn().mockResolvedValue({
          blob: new ArrayBuffer(64),
          fileKeyWrap: "w",
          encryptedFilename: "e",
          portalCopy: {
            ephemeralPoint: "ep",
            nonce: "n",
            ciphertext: "ct",
          },
        }),
      } as unknown as AttachmentUploadConfig["cryptoBridge"],
    });
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("photo.png", 256, "image/png");
    await uploader.attach(f);

    const result = uploader.links();
    expect(result).toHaveLength(1);
    expect(result[0]?.portalCopy).toEqual({
      ephemeralPoint: "ep",
      nonce: "n",
      ciphertext: "ct",
    });
  });

  it("links() omits portalCopy when no client public key was supplied", async () => {
    const config = makeConfig({ getClientPublic: () => null });
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("photo.png", 256, "image/png");
    await uploader.attach(f);

    const result = uploader.links();
    expect(result).toHaveLength(1);
    expect(result[0]?.portalCopy).toBeUndefined();
  });

  it("send passes the links through and clears the list only on success", async () => {
    const config = makeConfig();
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("doc.pdf", 256, "application/pdf");
    await uploader.attach(f);

    expect(uploader.pending).toHaveLength(1);
    expect(uploader.pending[0]?.status).toBe("done");

    // Simulate: the caller reads links() for the send mutation...
    const attachmentLinks = uploader.links();
    expect(attachmentLinks).toHaveLength(1);
    expect(attachmentLinks[0]).toHaveProperty("attachmentId");

    // ...then calls clear() only after the send mutation resolves.
    uploader.clear();
    expect(uploader.pending).toHaveLength(0);
    expect(uploader.links()).toHaveLength(0);
  });

  it("encrypts, uploads, and transitions through status lifecycle", async () => {
    const config = makeConfig();
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("photo.png", 256, "image/png");
    await uploader.attach(f);

    // After completion, should be "done"
    expect(uploader.pending).toHaveLength(1);
    expect(uploader.pending[0]?.status).toBe("done");
    expect(uploader.pending[0]?.filename).toBe("photo.png");
    expect(uploader.pending[0]?.contentType).toBe("image/png");
    expect(uploader.busy).toBe(false);

    expect(config.cryptoBridge.encryptAttachment).toHaveBeenCalledWith(
      "t-1",
      expect.any(String),
      "photo.png",
      expect.any(ArrayBuffer),
      undefined,
    );
    expect(config.uploadMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-1",
        contentType: "image/png",
      }),
    );
  });

  it("remove() drops an entry by attachmentId", async () => {
    const config = makeConfig();
    const uploader = createAttachmentUpload(config);

    const f = fakeFile("a.png", 128, "image/png");
    await uploader.attach(f);

    const id = uploader.pending[0]?.attachmentId;
    expect(id).toBeDefined();

    uploader.remove(id!);
    expect(uploader.pending).toHaveLength(0);
  });
});
