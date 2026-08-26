// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import type * as ErrorsMod from "$lib/errors.js";
import type * as KeysMod from "$lib/query/keys.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as WithTermsMod from "$lib/terminology/with-terms.js";
import type * as IndexMod from "$lib/trpc/index.js";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as FormatTimeMod from "$lib/utils/format-time.js";
import type * as SvelteQueryMod from "@tanstack/svelte-query";
import type * as ShellDialogMod from "$lib/shell/ShellDialog.svelte";
import type * as SecureLinkSheetMod from "./SecureLinkSheet.svelte";
import * as m from "$lib/paraglide/messages.js";

const {
  mockRevoke,
  mockSetAccountOffer,
  mockResetClientAccount,
  mockInvalidateQueries,
  mockHaptic,
  mockToastShow,
} = vi.hoisted(() => ({
  mockRevoke: vi
    .fn<(input: { ticketId: string }) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockSetAccountOffer: vi
    .fn<(input: { ticketId: string; enabled: boolean }) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockResetClientAccount: vi
    .fn<(input: { ticketId: string }) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockInvalidateQueries: vi
    .fn<(opts: { queryKey: readonly unknown[] }) => Promise<void>>()
    .mockResolvedValue(undefined),
  mockHaptic: vi.fn(),
  mockToastShow: vi.fn(),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IndexMod>()),
  trpc: {
    tickets: {
      revokeSecureLink: { mutate: mockRevoke },
      upgradeToSecureLink: { mutate: vi.fn() },
      regenerateSecureLink: { mutate: vi.fn() },
      setAccountOffer: { mutate: mockSetAccountOffer },
      resetClientAccount: { mutate: mockResetClientAccount },
    },
  },
}));

vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KeysMod>()),
  ticketKeys: {
    detail: (id: string) => ["ticket", id],
  },
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryMod>()),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsMod>()),
  withTerms: () => ({}),
}));

vi.mock("$lib/utils/format-time.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FormatTimeMod>()),
  formatRelativeTime: (d: Date) => d.toISOString(),
}));

// vi.mock required: ShellDialog depends on portal action, focus-trap,
// and deferred-unmount, none of which work in jsdom.
vi.mock("$lib/shell/ShellDialog.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellDialogMod>()),
  default: (
    await import("$lib/components/admin/test-helpers/StubShellDialog.svelte")
  ).default,
}));

// vi.mock required: SecureLinkSheet imports crypto modules that
// trigger libsodium WASM initialization via getSodium() singleton.
vi.mock("./SecureLinkSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof SecureLinkSheetMod>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const baseSecureLinkChannel = {
  clientPublic: "pk-base64",
  hasPassphrase: false,
  createdAt: "2026-04-01T10:00:00Z",
  lastSeenAt: null,
  kind: "secure_link",
  accountOffer: false,
};

const baseContinuationChannel = {
  clientPublic: "pk-base64",
  hasPassphrase: false,
  createdAt: "2026-03-15T08:00:00Z",
  lastSeenAt: "2026-03-20T12:00:00Z",
  kind: "intake_continuation",
  accountOffer: false,
};

const baseAccountChannel = {
  clientPublic: "pk-base64",
  hasPassphrase: false,
  createdAt: "2026-05-01T10:00:00Z",
  lastSeenAt: "2026-05-10T14:30:00Z",
  kind: "account",
  accountOffer: false,
};

beforeEach(() => {
  mockRevoke.mockClear();
  mockSetAccountOffer.mockClear();
  mockResetClientAccount.mockClear();
  mockInvalidateQueries.mockClear();
  mockHaptic.mockClear();
  mockToastShow.mockClear();
});

afterEach(cleanup);

const PortalTierSection = (await import("./PortalTierSection.svelte")).default;

describe("PortalTierSection", () => {
  it("renders sms_email tier with setup button", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "sms_email",
        portalChannel: null,
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText(m.ticket_tier_sms_email())).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_setup())).toBeTruthy();
  });

  it("renders secure_link tier with regenerate and revoke buttons", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseSecureLinkChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText(m.ticket_tier_secure_link())).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_regenerate())).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_revoke())).toBeTruthy();
  });

  it("shows passphrase chip when channel has passphrase", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseSecureLinkChannel, hasPassphrase: true },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText(m.ticket_tier_passphrase_toggle())).toBeTruthy();
  });

  it("shows loading skeleton when isLoading is true", () => {
    const { container } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: undefined,
        portalChannel: null,
        clientPhone: null,
        isLoading: true,
      },
    });

    const skeletons = container.querySelectorAll("[data-skeleton]");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("hides SMS send button in SecureLinkSheet when no phone on file", () => {
    const { container } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "sms_email",
        portalChannel: null,
        clientPhone: null,
        isLoading: false,
      },
    });

    const passthrough = container.querySelector(
      "[data-testid='passthrough-shell']",
    );
    expect(passthrough).toBeTruthy();
  });

  // --- Account offer toggle ---

  it("renders offer toggle only for secure_link tier with kind secure_link", () => {
    const { container: slContainer } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseSecureLinkChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(slContainer.querySelector(".offer-row")).toBeTruthy();

    cleanup();

    const { container: smsContainer } = render(PortalTierSection, {
      props: {
        ticketId: "t-2",
        clientTier: "sms_email",
        portalChannel: null,
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(smsContainer.querySelector(".offer-row")).toBeNull();
  });

  it("fires setAccountOffer with flipped value on toggle change", async () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseSecureLinkChannel, accountOffer: false },
        clientPhone: null,
        isLoading: false,
      },
    });

    const toggle = screen.getByRole("checkbox", {
      name: m.ticket_tier_offer_toggle(),
    });
    await fireEvent.change(toggle);

    await waitFor(() => {
      expect(mockSetAccountOffer).toHaveBeenCalledWith({
        ticketId: "t-1",
        enabled: true,
      });
    });

    expect(mockHaptic).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith(m.ticket_toast_offer_updated());
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-1"],
    });
  });

  it("shows error toast without haptic on offer toggle failure", async () => {
    mockSetAccountOffer.mockRejectedValueOnce(new Error("network error"));

    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseSecureLinkChannel, accountOffer: false },
        clientPhone: null,
        isLoading: false,
      },
    });

    const toggle = screen.getByRole("checkbox", {
      name: m.ticket_tier_offer_toggle(),
    });
    await fireEvent.change(toggle);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(m.error_generic(), 3000);
    });

    expect(mockHaptic).not.toHaveBeenCalled();
  });

  // --- Account tier state ---

  it("renders account tier state with meta and reset action", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText(m.ticket_tier_account())).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_account_reset())).toBeTruthy();
    expect(screen.getByText("2026-05-01T10:00:00.000Z")).toBeTruthy();
    expect(screen.getByText("2026-05-10T14:30:00.000Z")).toBeTruthy();
  });

  it("hides regenerate, revoke, and link actions for account tier", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.queryByText(m.ticket_tier_regenerate())).toBeNull();
    expect(screen.queryByText(m.ticket_tier_revoke())).toBeNull();
    expect(screen.queryByText(m.ticket_tier_setup())).toBeNull();
  });

  it("does not show offer toggle for account tier", () => {
    const { container } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(container.querySelector(".offer-row")).toBeNull();
  });

  // --- Account reset confirm ---

  it("shows reset confirm dialog with warning key on reset button click", async () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    const resetBtn = screen.getByText(m.ticket_tier_account_reset());
    await fireEvent.click(resetBtn);

    const dialog = screen.getByTestId("stub-dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("data-title")).toBe(
      m.ticket_tier_account_reset(),
    );
  });

  it("fires resetClientAccount on confirm and haptic + toast on success", async () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    const resetBtn = screen.getByText(m.ticket_tier_account_reset());
    await fireEvent.click(resetBtn);

    const dialog = screen.getByTestId("stub-dialog");
    const dialogButtons = dialog.querySelectorAll("button");
    const confirmBtn = Array.from(dialogButtons).find(
      (btn) => btn.textContent.trim() === m.ticket_tier_account_reset(),
    );
    expect(confirmBtn).toBeTruthy();
    await fireEvent.click(confirmBtn!);

    await waitFor(() => {
      expect(mockResetClientAccount).toHaveBeenCalledWith({ ticketId: "t-1" });
    });

    expect(mockHaptic).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith(m.ticket_toast_account_reset());
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-1"],
    });
  });

  it("does nothing on reset dialog cancel", async () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    const resetBtn = screen.getByText(m.ticket_tier_account_reset());
    await fireEvent.click(resetBtn);

    const dialog = screen.getByTestId("stub-dialog");
    const cancelBtn = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent.trim() === m.common_cancel(),
    );
    expect(cancelBtn).toBeTruthy();
    await fireEvent.click(cancelBtn!);

    expect(mockResetClientAccount).not.toHaveBeenCalled();
    expect(mockHaptic).not.toHaveBeenCalled();
    expect(mockToastShow).not.toHaveBeenCalled();
  });

  it("shows error toast without haptic on reset failure", async () => {
    mockResetClientAccount.mockRejectedValueOnce(new Error("network error"));

    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "account",
        portalChannel: { ...baseAccountChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    const resetBtn = screen.getByText(m.ticket_tier_account_reset());
    await fireEvent.click(resetBtn);

    const dialog = screen.getByTestId("stub-dialog");
    const confirmBtn = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent.trim() === m.ticket_tier_account_reset(),
    );
    await fireEvent.click(confirmBtn!);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(m.error_generic(), 3000);
    });

    expect(mockHaptic).not.toHaveBeenCalled();
  });

  // --- Continuation (intake_continuation) tier ---

  it("renders continuation branch for secure_link tier with intake_continuation kind", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseContinuationChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText(m.ticket_tier_continuation())).toBeTruthy();
    expect(screen.getByTestId("continuation-provenance")).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_regenerate())).toBeTruthy();
    expect(screen.getByText(m.ticket_tier_revoke())).toBeTruthy();
  });

  it("shows offer toggle for continuation tier", () => {
    const { container } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseContinuationChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(container.querySelector(".offer-row")).toBeTruthy();
  });

  it("renders created/last-seen times for continuation channel", () => {
    render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: "secure_link",
        portalChannel: { ...baseContinuationChannel },
        clientPhone: null,
        isLoading: false,
      },
    });

    expect(screen.getByText("2026-03-15T08:00:00.000Z")).toBeTruthy();
    expect(screen.getByText("2026-03-20T12:00:00.000Z")).toBeTruthy();
  });

  it("uses InlineSkeleton for account tier meta while loading", () => {
    const { container } = render(PortalTierSection, {
      props: {
        ticketId: "t-1",
        clientTier: undefined,
        portalChannel: null,
        clientPhone: null,
        isLoading: true,
      },
    });

    const skeletons = container.querySelectorAll("[data-skeleton]");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(m.ticket_tier_account())).toBeNull();
    expect(screen.queryByText(m.ticket_tier_secure_link())).toBeNull();
  });
});
