// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockMutate = vi.fn();
const mockEncrypt = vi.fn(
  (buf: Uint8Array) => new Uint8Array([...buf].map((b) => b ^ 0x42)),
);
const mockEncryptText = vi.fn().mockResolvedValue("encrypted-text");

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      updateOrgBasics: { mutate: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mockMutate(input);
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    encrypt: mockEncrypt,
    encryptText: mockEncryptText,
    isLoaded: true,
    getPublicKey: () => new Uint8Array(32),
  })),
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
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));
vi.mock("$lib/terminology/index.js", () => ({
  cacheTerminology: vi.fn(),
  normalizeLabels: (labels: Record<string, string>) => {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(labels)) {
      result[k] = v.trim().toLowerCase();
    }
    return result;
  },
  getTerminology: () => () => ({}),
  withTerms: () => ({}),
}));
vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => true,
}));

const { default: SetupOrg } = await import("./SetupOrg.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupOrg", () => {
  it("renders the org details form", () => {
    render(SetupOrg, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Organization Details")).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("renders language dropdown with en and es options", () => {
    const { container } = render(SetupOrg, {
      props: { oncomplete: vi.fn() },
    });
    const selects = container.querySelectorAll("select");
    const languageSelect = selects[0];
    expect(languageSelect).toBeTruthy();
    const options = languageSelect?.querySelectorAll("option");
    const values = [...(options ?? [])].map((o) => o.value);
    expect(values).toContain("en");
    expect(values).toContain("es");
  });

  it("renders country code dropdown with placeholder", () => {
    const { container } = render(SetupOrg, {
      props: { oncomplete: vi.fn() },
    });
    const selects = container.querySelectorAll("select");
    const countrySelect = selects[1];
    expect(countrySelect).toBeTruthy();
    const placeholder = countrySelect?.querySelector("option[disabled]");
    expect(placeholder?.textContent).toContain("Select a country");
  });

  it("shows validation error when org name is empty", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupOrg, { props: { oncomplete } });

    const countrySelect = container.querySelectorAll("select")[1];
    if (countrySelect) {
      await fireEvent.change(countrySelect, { target: { value: "+1" } });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(screen.getByText("Organization name is required.")).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it.todo(
    "caches terminology after save with custom terms",
    // cacheTerminology should be called in onSuccess when custom terms are provided
  );

  it("encrypts org name before sending", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupOrg, { props: { oncomplete } });

    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    if (nameInput) {
      await fireEvent.input(nameInput, {
        target: { value: "Test Org" },
      });
    }

    const countrySelect = container.querySelectorAll("select")[1];
    if (countrySelect) {
      await fireEvent.change(countrySelect, { target: { value: "+1" } });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(mockEncryptText).toHaveBeenCalledWith("Test Org");
  });
});
