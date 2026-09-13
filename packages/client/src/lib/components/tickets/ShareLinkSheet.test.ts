// @vitest-environment jsdom
/**
 * ShareLinkSheet tests: SMS mode vs copy mode rendering, byte-length gate,
 * send-order assertion (createShare before relay), fragment-key isolation,
 * rate-limit toast, and clipboard copy path.
 *
 * ShellSheet is stubbed with the PassthroughShell helper.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import ShareLinkSheet from "./ShareLinkSheet.svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as HapticUtils from "$lib/utils/haptic.js";
import type * as AnnounceUtils from "$lib/utils/announce.js";
import type * as ShareCrypto from "$lib/portal/share-crypto.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as LibErrors from "$lib/errors.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as CareYCrypto from "@care-y/crypto";
import type * as ShellSheetModule from "$lib/shell/ShellSheet.svelte";

interface CreateSharePayload {
  shareId: string;
  ticketId: string;
  ciphertext: string;
  followUpId: string;
  encryptedFollowUp: string;
}

const {
  mockEncrypt,
  mockEncryptShare,
  mockMutate,
  mockInvalidateQueries,
  mockShow,
  mockHaptic,
  mockAnnounce,
} = vi.hoisted(() => ({
  mockEncrypt: vi
    .fn<(ticketId: string, slot: string, text: string) => Promise<string>>()
    .mockResolvedValue("sealed-followup-b64"),
  mockEncryptShare: vi
    .fn<
      (
        shareId: string,
        text: string,
      ) => { ciphertext: string; fragmentKey: string }
    >()
    .mockReturnValue({
      ciphertext: "mock-ciphertext",
      fragmentKey: "mock-fragment-key",
    }),
  mockMutate: vi
    .fn<(input: CreateSharePayload) => Promise<{ expiresAt: string }>>()
    .mockResolvedValue({ expiresAt: "2026-08-22T00:00:00Z" }),
  mockInvalidateQueries: vi
    .fn<(opts: { queryKey: readonly unknown[] }) => Promise<void>>()
    .mockResolvedValue(undefined),
  mockShow: vi.fn<(msg: string, duration?: number) => void>(),
  mockHaptic: vi.fn<(ms?: number) => void>(),
  mockAnnounce: vi.fn<(politeness: string, message: string) => void>(),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  share_sheet_title: () => "Secure link",
  share_sheet_send: () => "Send by text message",
  share_sheet_copy: () => "Copy link",
  share_sheet_sending: () => "Sending...",
  share_sheet_sent: () => "Link sent",
  share_sheet_copied: () => "Link copied",
  share_sheet_note_sms: () =>
    "This link can be opened once and expires in 72 hours. The text is kept in the case record. The client gets it by text message.",
  share_sheet_note_copy: () =>
    "This link can be opened once and expires in 72 hours. The text is kept in the case record. You will copy the link and deliver it yourself.",
  share_sheet_content_label: () => "Content",
  share_sheet_placeholder: () => "Enter the information to share...",
  share_sheet_too_long: () =>
    "This message is too long to send as a secure link.",
  share_sms_body: ({ url }: { url: string }) =>
    `You have a secure message: ${url}`,
  ticket_sms_rate_limited: ({ seconds }: { seconds: string }) =>
    `Rate limited. Try again in ${seconds} seconds.`,
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticUtils>()),
  haptic: mockHaptic,
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceUtils>()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/portal/share-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShareCrypto>()),
  encryptShare: (shareId: string, text: string) =>
    mockEncryptShare(shareId, text),
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({ encrypt: mockEncrypt }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    clientPortal: {
      createShare: {
        mutate: (input: CreateSharePayload) => mockMutate(input),
      },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof LibErrors>()),
  requireRouter: <T>(router: T): T => router,
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CareYCrypto>()),
  followupSlot: (id: string) => `followup:${id}`,
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetModule>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  ticketId: "ticket-001",
};

/** Helper: find the primary action button in the header. */
function actionButton(): HTMLButtonElement {
  // The SoftButton in headerRight contains "Send by text message",
  // "Copy link", or "Sending..." depending on mode and state.
  const buttons = screen.getAllByRole("button");
  // The action button is the one inside the passthrough shell header,
  // containing the send/copy label text.
  const btn = buttons.find(
    (b) =>
      b.textContent.includes("Send by text message") ||
      b.textContent.includes("Copy link") ||
      b.textContent.includes("Sending..."),
  );
  if (!btn) throw new Error("Action button not found");
  return btn as HTMLButtonElement;
}

/** Helper: type into the textarea. */
async function typeContent(value: string): Promise<void> {
  const textarea = screen.getByPlaceholderText(
    "Enter the information to share...",
  );
  await fireEvent.input(textarea, { target: { value } });
}

/** Stub fetch to return a successful relay response. */
function stubFetchOk(): ReturnType<typeof vi.fn> {
  const fetchSpy =
    vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
  fetchSpy.mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
  } as Response);
  global.fetch = fetchSpy as unknown as typeof fetch;
  return fetchSpy;
}

/** Stub clipboard.writeText. */
function stubClipboard(): ReturnType<typeof vi.fn> {
  const writeSpy = vi
    .fn<(text: string) => Promise<void>>()
    .mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: writeSpy },
    writable: true,
    configurable: true,
  });
  return writeSpy;
}

beforeEach(() => {
  vi.clearAllMocks();
  baseProps.ondismiss = vi.fn();
  // Stable UUID sequence for predictable assertions.
  let uuidCounter = 0;
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () =>
      `uuid-${String(uuidCounter++)}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});

afterEach(() => {
  cleanup();
});

describe("ShareLinkSheet", () => {
  describe("mode rendering", () => {
    it("renders SMS mode button when client has a phone", () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      const btn = actionButton();
      expect(btn.textContent).toContain("Send by text message");
    });

    it("renders copy mode button when client has no phone", () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: null },
      });
      const btn = actionButton();
      expect(btn.textContent).toContain("Copy link");
    });

    it("renders SMS note text in SMS mode", () => {
      const { container } = render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      const register = container.querySelector("[data-register='note']");
      expect(register?.textContent).toContain(
        "The client gets it by text message.",
      );
    });

    it("renders copy note text in copy mode", () => {
      const { container } = render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: null },
      });
      const register = container.querySelector("[data-register='note']");
      expect(register?.textContent).toContain(
        "You will copy the link and deliver it yourself.",
      );
    });
  });

  describe("send disabled states", () => {
    it("disables send when textarea is empty", () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      expect(actionButton().disabled).toBe(true);
    });

    it("disables send when textarea is only whitespace", async () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("   ");
      expect(actionButton().disabled).toBe(true);
    });

    it("enables send once non-empty text is entered", async () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Some content");
      expect(actionButton().disabled).toBe(false);
    });

    it("disables send while sending is in progress", async () => {
      // Make createShare hang so sending stays true.
      mockMutate.mockReturnValue(new Promise<never>(() => undefined));
      stubFetchOk();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Content to send");

      await fireEvent.click(actionButton());

      // The button should now show "Sending..." and be disabled.
      await waitFor(() => {
        const btn = actionButton();
        expect(btn.textContent).toContain("Sending...");
        expect(btn.disabled).toBe(true);
      });
    });
  });

  describe("SMS send flow", () => {
    it("calls createShare BEFORE fetch to /relay/sms", async () => {
      const callOrder: string[] = [];
      mockMutate.mockImplementation(async () => {
        callOrder.push("createShare");
        return { expiresAt: "2026-08-22T00:00:00Z" };
      });
      const fetchSpy =
        vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
      fetchSpy.mockImplementation(async () => {
        callOrder.push("relay");
        return { ok: true, status: 200, headers: new Headers() } as Response;
      });
      global.fetch = fetchSpy as unknown as typeof fetch;

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Shelter address");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(callOrder).toEqual(["createShare", "relay"]);
      });
    });

    it("builds the URL as origin/share/{id}#{key}", async () => {
      stubFetchOk();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Shelter address");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // The fetch body contains the SMS text with the URL.
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall).toBeDefined();
      const body = JSON.parse(fetchCall?.[1]?.body as string) as {
        body: string;
        ticketId: string;
      };
      // shareId is uuid-0 (first randomUUID call).
      expect(body.body).toContain("/share/uuid-0#mock-fragment-key");
      expect(body.body).toContain(window.location.origin);
    });

    it("never passes the fragment key to any tRPC call", async () => {
      stubFetchOk();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Shelter address");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const payload = mockMutate.mock.calls[0]?.[0];
      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain("mock-fragment-key");
      // The payload should contain the share-key ciphertext, not the
      // fragment key itself.
      expect(payload?.ciphertext).toBe("mock-ciphertext");
    });

    it("calls ondismiss and haptic on success", async () => {
      stubFetchOk();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Shelter address");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(baseProps.ondismiss).toHaveBeenCalledTimes(1);
      });
      expect(mockHaptic).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith("Link sent");
      expect(mockAnnounce).toHaveBeenCalledWith("polite", "Link sent");
    });

    it("invalidates followUps and shares query keys on success", async () => {
      stubFetchOk();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Content");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
      });

      const keys = mockInvalidateQueries.mock.calls.map(
        (c) => (c[0] as { queryKey: readonly unknown[] }).queryKey,
      );
      expect(keys).toContainEqual(["ticket", "ticket-001", "followUps"]);
      expect(keys).toContainEqual(["ticket", "ticket-001", "shares"]);
    });
  });

  describe("429 rate limit", () => {
    it("shows the rate-limit toast with seconds on relay 429", async () => {
      mockMutate.mockResolvedValue({ expiresAt: "2026-08-22T00:00:00Z" });
      const fetchSpy =
        vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "42" }),
      } as unknown as Response);
      global.fetch = fetchSpy as unknown as typeof fetch;

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });
      await typeContent("Content");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalledWith(
          "Rate limited. Try again in 42 seconds.",
          5000,
        );
      });
      // ondismiss and haptic should NOT be called on error.
      expect(baseProps.ondismiss).not.toHaveBeenCalled();
      expect(mockHaptic).not.toHaveBeenCalled();
    });
  });

  describe("copy mode flow", () => {
    it("writes the URL to the clipboard and never calls relay", async () => {
      const writeSpy = stubClipboard();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: null },
      });
      await typeContent("Resource info");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(writeSpy).toHaveBeenCalledTimes(1);
      });
      const clipUrl = writeSpy.mock.calls[0]?.[0] as string;
      expect(clipUrl).toContain("/share/uuid-0#mock-fragment-key");

      // Relay fetch should never have been called.
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("shows the copied toast and calls haptic on success", async () => {
      stubClipboard();

      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: null },
      });
      await typeContent("Resource info");
      await fireEvent.click(actionButton());

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalledWith("Link copied");
      });
      expect(mockHaptic).toHaveBeenCalledTimes(1);
      expect(baseProps.ondismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("byte-length gate", () => {
    it("shows FieldError and disables send when content exceeds 64,000 bytes", async () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });

      // Generate a string that exceeds 64,000 UTF-8 bytes.
      // Each 4-byte emoji pushes the count up faster than ASCII.
      const oversized = "\u{1F600}".repeat(16_001); // 16001 * 4 = 64004 bytes
      await typeContent(oversized);

      // FieldError renders with role="alert".
      const error = screen.getByRole("alert");
      expect(error.textContent).toContain(
        "This message is too long to send as a secure link.",
      );

      expect(actionButton().disabled).toBe(true);
    });

    it("does not show FieldError when content is exactly at the limit", async () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });

      // 64,000 bytes of ASCII (1 byte per char).
      const atLimit = "a".repeat(64_000);
      await typeContent(atLimit);

      expect(screen.queryByRole("alert")).toBeNull();
      expect(actionButton().disabled).toBe(false);
    });

    it("hides FieldError once content is shortened below the limit", async () => {
      render(ShareLinkSheet, {
        props: { ...baseProps, clientPhone: "+15551234567" },
      });

      const oversized = "a".repeat(64_001);
      await typeContent(oversized);
      expect(screen.getByRole("alert")).toBeTruthy();

      await typeContent("short");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(actionButton().disabled).toBe(false);
    });
  });
});
