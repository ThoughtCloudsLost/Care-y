// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    isLoaded: true,
    getSecretKey: vi.fn(() => Promise.resolve(new Uint8Array(32).fill(0xaa))),
    getPublicKey: () => new Uint8Array(32),
  })),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => true,
}));

const mockMemzero = vi.fn();

vi.mock("@care-y/crypto", () => ({
  encryptWithPassphrase: vi.fn(() => ({
    salt: new Uint8Array(16),
    nonce: new Uint8Array(24),
    ciphertext: new Uint8Array(48),
  })),
  ARGON2_ESCROW_PARAMS: {
    memoryKiB: 262144,
    iterations: 4,
    parallelism: 4,
  },
  requireSodium: () => ({ memzero: mockMemzero }),
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
vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

const { default: SetupEscrow } = await import("./SetupEscrow.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());
});

function findButton(container: HTMLElement, text: string): HTMLElement {
  const btn = Array.from(container.querySelectorAll("button")).find((b) =>
    b.textContent.includes(text),
  );
  expect(btn, `Button "${text}" not found`).toBeTruthy();
  return btn!;
}

async function goToPassphrasePage(container: HTMLElement): Promise<void> {
  await fireEvent.click(findButton(container, "Next"));
}

describe("SetupEscrow", () => {
  it("renders the education step first", () => {
    render(SetupEscrow, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("What is an escrow file?")).toBeTruthy();
  });

  it("shows browser safety warnings on step 1", () => {
    render(SetupEscrow, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Before you continue")).toBeTruthy();
  });

  it("shows page dots for 3 sub-pages", () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });
    const dots = container.querySelectorAll(".page-dot");
    expect(dots).toHaveLength(3);
    expect(dots[0]?.classList.contains("page-dot--active")).toBe(true);
  });

  it("advances to passphrase step when Next is clicked", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    const nextBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes("Next"),
    );
    expect(nextBtn).toBeTruthy();
    await fireEvent.click(nextBtn!);

    expect(screen.getByText("Create a passphrase")).toBeTruthy();
  });

  it("shows strength meter on passphrase step", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    await goToPassphrasePage(container);

    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: "this is a valid passphrase for testing" },
    });

    expect(screen.getByText("Good")).toBeTruthy();
  });

  it("shows storage guidance and hash after successful export", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    await goToPassphrasePage(container);

    const phrase = "this is a long passphrase for testing";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    await fireEvent.click(findButton(container, "Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Store this file safely")).toBeTruthy();
    });
  });

  it("shows verification code on step 3", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    await goToPassphrasePage(container);

    const phrase = "this is a long passphrase for testing";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    await fireEvent.click(findButton(container, "Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Verification code")).toBeTruthy();
    });
  });

  it("calls oncomplete when continue is clicked on step 3", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupEscrow, {
      props: { oncomplete },
    });

    await goToPassphrasePage(container);

    const phrase = "this is a long passphrase for testing";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    await fireEvent.click(findButton(container, "Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Store this file safely")).toBeTruthy();
    });

    await fireEvent.click(findButton(container, "Continue"));

    expect(oncomplete).toHaveBeenCalled();
  });

  it("download again returns to step 2", async () => {
    const { container } = render(SetupEscrow, {
      props: { oncomplete: vi.fn() },
    });

    await goToPassphrasePage(container);

    const phrase = "this is a long passphrase for testing";
    const inputs = container.querySelectorAll('input[type="password"]');
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: phrase },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: phrase },
    });

    await fireEvent.click(findButton(container, "Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Store this file safely")).toBeTruthy();
    });

    await fireEvent.click(findButton(container, "Download Again"));

    expect(screen.getByText("Create a passphrase")).toBeTruthy();
  });
});
