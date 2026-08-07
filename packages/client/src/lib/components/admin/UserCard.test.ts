// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ShellContext from "$lib/shell/context.js";

// IntersectionObserver stub (jsdom lacks it, DecryptPlaceholder needs it).
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  admin_role_unknown: () => "Unknown",
  admin_status_inactive: () => "Inactive",
  admin_users_key_ok: () => "Ready",
  admin_users_key_no_keys: () => "No keys",
  admin_users_key_no_org: () => "No org key",
  admin_user_edit_actions: () => "Actions",
  admin_reachability_callable: () => "Callable",
  admin_reachability_callable_sms: () => "Callable + SMS",
  admin_reachability_phone_unverified: () => "Phone unverified",
}));

// vi.mock required: createContext throws outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: () => "Decrypted Name",
    decryptAsync: vi.fn().mockResolvedValue("decrypted-identifier"),
    delete: vi.fn().mockReturnValue(true),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getCurrentUserId: () => () => "current-user-id",
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
  }),
}));

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import UserCard from "./UserCard.svelte";

const BASE_PROPS = {
  viewMode: "list" as const,
  userId: "u-1",
  displayName: "Test User",
  roleId: "vol",
  isActive: true,
  hasKeys: true,
  hasOrgKeyWrap: true,
  isSelf: false,
  onedit: vi.fn(),
};

describe("UserCard reachability chip", () => {
  afterEach(cleanup);

  it("renders 'Callable + SMS' chip for verified_sms reachability", () => {
    const { container } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "verified_sms" },
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("Callable + SMS");
  });

  it("renders 'Callable' chip for verified reachability", () => {
    const { container } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "verified" },
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("Callable");
    // Must not contain SMS
    expect(chip!.textContent).not.toContain("SMS");
  });

  it("renders 'Phone unverified' chip for unverified reachability", () => {
    const { container } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "unverified" },
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("Phone unverified");
  });

  it("does not render a chip when reachability is 'none'", () => {
    const { container } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "none" },
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).toBeNull();
  });

  it("does not render a chip when reachability prop is omitted", () => {
    const { container } = render(UserCard, {
      props: BASE_PROPS,
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).toBeNull();
  });

  it("includes an icon in the reachability chip", () => {
    const { container } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "verified" },
    });
    const chip = container.querySelector(".reachability-chip");
    expect(chip).not.toBeNull();
    // Lucide icons render as SVG elements.
    const svg = chip!.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
  });

  it("distinguishes verified from verified_sms by wording, not just icon", () => {
    const { container: c1 } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "verified", userId: "u-v1" },
    });
    const { container: c2 } = render(UserCard, {
      props: { ...BASE_PROPS, reachability: "verified_sms", userId: "u-v2" },
    });

    const chipV = c1.querySelector(".reachability-chip");
    const chipS = c2.querySelector(".reachability-chip");
    expect(chipV!.textContent).not.toBe(chipS!.textContent);
  });
});
