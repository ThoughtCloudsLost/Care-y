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

vi.mock("@care-y/crypto", () => ({
  encryptWithPassphrase: vi.fn(() => mockEscrowBlob),
  serializeEscrowBlob: vi.fn(() => new Uint8Array(89)),
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

  it("zeros org secret key and clears passphrase state after generation", async () => {
    const secretKey = new Uint8Array(32).fill(0xaa);
    const fillSpy = vi.spyOn(secretKey, "fill");
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
      expect(fillSpy).toHaveBeenCalledWith(0);
    });

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    for (const input of passwordInputs) {
      expect((input as HTMLInputElement).value).toBe("");
    }
  });
});
