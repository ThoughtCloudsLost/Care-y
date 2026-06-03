// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "$lib/components/onboarding/wizard-nav-context.js";

// Mock query state: controls which branch the component renders.
let inviteQueryState: {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: { valid: boolean; expiresAt?: string } | undefined;
} = { isLoading: true, isSuccess: false, isError: false, data: undefined };

vi.mock("$app/state", () => ({
  page: {
    params: { token: "test-invite-token-abc123" },
    url: new URL("http://localhost/first-login/test-invite-token-abc123"),
  },
}));

vi.mock("$app/environment", () => ({
  browser: true,
}));

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => inviteQueryState,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      validateInvite: { query: vi.fn() },
      markBriefingSeen: { mutate: vi.fn() },
    },
    twoFactor: {
      enroll: {
        markVerifiedOnFirstEnrollment: { mutate: vi.fn() },
      },
    },
  },
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: vi.fn(() => true),
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));

const wizardNavContainer: WizardNavContainer = { current: undefined };
const mockUpdateStep = vi.fn();

vi.mock("svelte", async () => {
  const actual = await vi.importActual("svelte");
  return {
    ...actual,
    getContext: (key: string) => {
      if (key === "onboarding-update-step") return mockUpdateStep;
      return undefined;
    },
  };
});

vi.mock("$lib/components/onboarding/wizard-nav-context.js", () => ({
  getWizardNavCtx: () => wizardNavContainer,
}));

// Mock sessionStorage
const storageMap = new Map<string, string>();
vi.stubGlobal("sessionStorage", {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
});

const { default: FirstLoginPage } = await import("./+page.svelte");

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
  storageMap.clear();
});
beforeEach(() => {
  vi.clearAllMocks();
  inviteQueryState = {
    isLoading: true,
    isSuccess: false,
    isError: false,
    data: undefined,
  };
});

describe("FirstLoginPage", () => {
  it("shows Preloader while validating invite token", () => {
    inviteQueryState = {
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    };
    render(FirstLoginPage);
    expect(document.querySelector(".wizard-loading")).toBeTruthy();
  });

  it("shows error when invite token is invalid", () => {
    inviteQueryState = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { valid: false },
    };
    render(FirstLoginPage);
    expect(
      screen.getByText(m.onboarding_firstlogin_error_invalid_token()),
    ).toBeTruthy();
  });

  it("renders SetupInviteAccount at step 0 when token is valid", () => {
    inviteQueryState = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);
    expect(screen.getByText(m.onboarding_firstlogin_heading())).toBeTruthy();
    expect(screen.getByText(m.onboarding_firstlogin_submit())).toBeTruthy();
  });

  it("disables submit when required fields are empty at step 0", () => {
    inviteQueryState = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);
    const button = screen.getByText(m.onboarding_firstlogin_submit());
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(true);
  });
});
