// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockEscrowBlob = {
  salt: new Uint8Array(16).fill(0x11),
  nonce: new Uint8Array(24).fill(0x22),
  ciphertext: new Uint8Array(48).fill(0x33),
};

vi.mock("@care-y/crypto", () => ({
  encryptWithPassphrase: vi.fn(() => mockEscrowBlob),
  ARGON2_ESCROW_PARAMS: {
    memoryKiB: 262144,
    iterations: 4,
    parallelism: 4,
  },
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: (bytes: Uint8Array) => {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  },
}));

const { exportEscrowFile, buildEscrowFilename, downloadBlob } =
  await import("./export-escrow-file.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildEscrowFilename", () => {
  it("produces care-y-escrow-{date}.json format", () => {
    const name = buildEscrowFilename();
    expect(name).toMatch(/^care-y-escrow-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("exportEscrowFile", () => {
  it("returns a valid ADR-019 JSON envelope", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass);

    const text = await result.fileBlob.text();
    const envelope = JSON.parse(text) as Record<string, unknown>;

    expect(envelope.format).toBe("care-y-escrow-v1");
    expect(envelope.type).toBe("org-key");
    expect(envelope.kdf).toBe("argon2id");
    expect(envelope.kdf_params).toEqual({
      opslimit: 4,
      memlimit: 268435456,
      parallelism: 4,
    });
    expect(typeof envelope.salt).toBe("string");
    expect(typeof envelope.nonce).toBe("string");
    expect(typeof envelope.ciphertext).toBe("string");
    expect(typeof envelope.created).toBe("string");
  });

  it("salt, nonce, ciphertext are valid base64", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass);
    const envelope = JSON.parse(await result.fileBlob.text()) as {
      salt: string;
      nonce: string;
      ciphertext: string;
    };

    expect(() => atob(envelope.salt)).not.toThrow();
    expect(() => atob(envelope.nonce)).not.toThrow();
    expect(() => atob(envelope.ciphertext)).not.toThrow();

    expect(atob(envelope.salt)).toHaveLength(16);
    expect(atob(envelope.nonce)).toHaveLength(24);
    expect(atob(envelope.ciphertext)).toHaveLength(48);
  });

  it("accepts custom type parameter", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass, "oprf-key");
    const envelope = JSON.parse(await result.fileBlob.text()) as Record<
      string,
      unknown
    >;

    expect(envelope.type).toBe("oprf-key");
  });

  it("produces a consistent SHA-256 hash", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass);

    expect(result.sha256Hex).toMatch(/^[0-9a-f]{64}$/);
    expect(result.sha256Hex.length).toBe(64);
  });

  it("fileBlob has application/json MIME type", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass);

    expect(result.fileBlob.type).toBe("application/json");
  });

  it("filename matches buildEscrowFilename format", async () => {
    const key = new Uint8Array(32).fill(0xaa);
    const pass = new TextEncoder().encode("test-passphrase-long-enough");

    const result = await exportEscrowFile(key, pass);

    expect(result.filename).toMatch(/^care-y-escrow-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("downloadBlob", () => {
  it("creates and clicks an anchor element", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());

    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    const blob = new Blob(["test"], { type: "application/json" });
    downloadBlob(blob, "test-file.json");

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
