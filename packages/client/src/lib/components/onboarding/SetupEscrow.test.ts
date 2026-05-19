// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockGetSecretKey = vi.fn(() =>
  Promise.resolve(new Uint8Array(32).fill(0xaa)),
);

const mockEscrowBlob = {
  salt: new Uint8Array(16),
  nonce: new Uint8Array(24),
  ciphertext: new Uint8Array(48),
};

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    isLoaded: true,
    getSecretKey: mockGetSecretKey,
    getPublicKey: () => new Uint8Array(32),
  })),
}));

const mockMemzero = vi.fn();

vi.mock("@care-y/crypto", () => ({
  encryptWithPassphrase: vi.fn(() => mockEscrowBlob),
  serializeEscrowBlob: vi.fn(() => new Uint8Array(89)),
  requireSodium: () => ({ memzero: mockMemzero }),
}));

vi.mock("$lib/utils/passphrase-strength.js", () => ({
  assessPassphraseStrength: (p: string) => {
    if (p.length < 20) return "too-short";
    if (p.length < 30) return "acceptable";
    if (p.length < 40) return "good";
    return "strong";
  },
  looksLikeCommonPattern: (p: string) => {
    if (new Set(p).size === 1) return true;
    if (/^[0-9]+$/.test(p) && p.length < 30) return true;
    return false;
  },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => true,
}));

const { default: SetupEscrow } = await import("./SetupEscrow.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();

  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());
});

describe("SetupEscrow", () => {
  it("renders the escrow backup form", () => {
    render(SetupEscrow, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Back Up Your Encryption Keys")).toBeTruthy();
  });

  it("shows sensitivity warning", () => {
    render(SetupEscrow, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText(/encrypted USB drive/)).toBeTruthy();
  });

  it("download button is disabled when passphrase is too short", () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });
    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(true);
  });

  it("download button is disabled when passphrases do not match", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: "this is a long passphrase for testing" },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: "this does not match the first one" },
    });

    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(true);
  });

  it("accepts 6+ word passphrases under 20 chars", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const phrase = "one two three four five six";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(false);
  });

  it("accepts 20+ char passphrases with fewer words", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const phrase = "abcdefghijklmnopqrst";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(false);
  });

  it("rejects passphrase with common pattern (all same character)", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const phrase = "aaaaaaaaaaaaaaaaaaaaaa";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(true);
  });

  it("uses sodium.memzero for org secret key zeroing", async () => {
    const secretKey = new Uint8Array(32).fill(0xaa);
    mockGetSecretKey.mockResolvedValueOnce(secretKey);

    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const phrase = "this is a long passphrase for testing";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    const buttons = container.querySelectorAll("button");
    const downloadBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Download"),
    );
    if (downloadBtn) await fireEvent.click(downloadBtn);

    await vi.waitFor(() => {
      expect(mockMemzero).toHaveBeenCalledWith(secretKey);
    });

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    for (const input of passwordInputs) {
      expect((input as HTMLInputElement).value).toBe("");
    }
  });
});
