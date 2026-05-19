// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockSaveBrandingField = vi.fn().mockResolvedValue({});
const mockEncrypt = vi.fn(
  (buf: Uint8Array) => new Uint8Array([...buf].map((b) => b ^ 0x42)),
);

vi.mock("@care-y/crypto", () => ({
  encryptClientBranding: (payload: Uint8Array) => payload,
}));

const mockUploadIcons = vi.fn().mockResolvedValue({});

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    branding: {
      saveBrandingField: { mutate: mockSaveBrandingField },
      uploadIcons: { mutate: mockUploadIcons },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      | (() => Promise<void> | void)
      | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => void Promise.resolve(onSuccess?.()),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    encrypt: mockEncrypt,
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    isLoaded: true,
    getPublicKey: () => new Uint8Array(32),
  })),
}));

vi.mock("$lib/branding/index.js", () => ({
  DEFAULT_PRIMARY: "#636366",
  DEFAULT_ACCENT: "#8e8e93",
  updateBrandingCache: vi.fn(),
}));

vi.mock("$lib/branding/icon-generator.js", () => ({
  generateIconVariants: vi.fn().mockResolvedValue([]),
}));

vi.mock("$lib/branding/icon-link.svelte.js", () => ({
  setAppleTouchIconHref: vi.fn(),
}));

vi.mock("$lib/utils/org-slug.js", () => ({
  DEV_ORG_SLUG: "dev-org",
  getOrgSlug: () => "dev-org",
}));

vi.mock("$lib/branding/color-utils.js", () => ({
  isValidHexColor: (c: string) => /^#[0-9a-fA-F]{6}$/.test(c),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: (buf: Uint8Array) => btoa(String.fromCharCode(...buf)),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/query/keys.js", () => ({
  adminKeys: { branding: () => ["admin", "branding"] },
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));
vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => true,
}));

const { default: SetupBranding } = await import("./SetupBranding.svelte");

const mockCanvasBlob = new Blob([new Uint8Array(8)], { type: "image/png" });

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();

  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 64, height: 64, close: vi.fn() }),
  );
  vi.stubGlobal(
    "OffscreenCanvas",
    vi.fn().mockImplementation(() => ({
      getContext: () => ({
        drawImage: vi.fn(),
        fillStyle: "",
        fillRect: vi.fn(),
      }),
      convertToBlob: vi.fn().mockResolvedValue(mockCanvasBlob),
    })),
  );
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-logo-url");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());
});

describe("SetupBranding", () => {
  it("renders branding form with heading", () => {
    render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete: vi.fn(), onskip: vi.fn() },
    });
    expect(screen.getByText("Branding")).toBeTruthy();
    expect(screen.getByText("Save Branding")).toBeTruthy();
    expect(screen.getByText("Skip for now")).toBeTruthy();
  });

  it("renders color inputs for primary and accent", () => {
    const { container } = render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete: vi.fn(), onskip: vi.fn() },
    });
    const colorInputs = container.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBe(2);
  });

  it("skip button calls onskip without server call", async () => {
    const onskip = vi.fn();
    render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete: vi.fn(), onskip },
    });

    const skipButton = screen.getByText("Skip for now");
    await fireEvent.click(skipButton);

    expect(onskip).toHaveBeenCalledOnce();
    expect(mockSaveBrandingField).not.toHaveBeenCalled();
  });

  it("save button is disabled when org name is empty and no content entered", () => {
    render(SetupBranding, {
      props: { orgName: "", oncomplete: vi.fn(), onskip: vi.fn() },
    });
    const saveButton = screen.getByText("Save Branding");
    expect(saveButton.closest("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("save button is enabled when org name is provided", () => {
    render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete: vi.fn(), onskip: vi.fn() },
    });
    const saveButton = screen.getByText("Save Branding");
    expect(saveButton.closest("button")?.hasAttribute("disabled")).toBe(false);
  });

  it("renders file upload for logo", () => {
    const { container } = render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete: vi.fn(), onskip: vi.fn() },
    });
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    expect(fileInput?.getAttribute("accept")).toContain("image/png");
  });

  it("save without logo does not trigger icon upload", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupBranding, {
      props: { orgName: "Test Org", oncomplete, onskip: vi.fn() },
    });

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(oncomplete).toHaveBeenCalledOnce();
    });
    expect(mockUploadIcons).not.toHaveBeenCalled();
  });

  it.todo(
    "save with logo triggers icon upload and updates branding cache",
    // Tested via icon-upload.ts unit tests.
    // jsdom cannot simulate the file-input -> rasterize -> state chain
    // (createImageBitmap + OffscreenCanvas are stubs, async handler timing is unreliable).
  );
});
