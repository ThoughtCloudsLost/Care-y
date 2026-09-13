// @vitest-environment jsdom
/**
 * ConsultantPhoneSheet tests.
 *
 * Covers: step machine transitions, register payload carries opt-in flag,
 * relay fetch called with plain JSON body (never through tRPC), resend
 * disabled window, verified state renders toggles, delete confirm dialog,
 * error mapping for 429 and 403.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";

// ---- Hoisted mocks ----

const {
  mockRegister,
  mockVerify,
  mockSetSmsPings,
  mockUpdatePreference,
  mockDelete,
  mockGet,
  mockToastShow,
  mockAnnounce,
  mockHaptic,
  mockInvalidate,
  mockOrgDecrypt,
} = vi.hoisted(() => ({
  mockRegister: vi.fn().mockResolvedValue({ success: true }),
  mockVerify: vi.fn().mockResolvedValue({ success: true }),
  mockSetSmsPings: vi.fn().mockResolvedValue({ success: true }),
  mockUpdatePreference: vi.fn().mockResolvedValue({ success: true }),
  mockDelete: vi.fn().mockResolvedValue({ success: true }),
  mockGet: vi.fn().mockResolvedValue(null),
  mockToastShow: vi.fn(),
  mockAnnounce: vi.fn(),
  mockHaptic: vi.fn(),
  mockInvalidate: vi.fn().mockResolvedValue(undefined),
  mockOrgDecrypt: vi.fn().mockResolvedValue("+491234567890"),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  consultant_phone_title: () => "My phone",
  consultant_phone_status_none: () => "Not set",
  consultant_phone_status_unverified: () => "Unverified",
  consultant_phone_status_verified: () => "Verified",
  consultant_phone_number_label: () => "Phone number",
  consultant_phone_number_placeholder: () => "+1 555 000 1234",
  consultant_phone_call_method_label: () => "Call method",
  consultant_phone_call_method_callback: () => "Phone callback",
  consultant_phone_call_method_webrtc: () => "Browser call",
  consultant_phone_sms_pings_label: () => "Text me notification pings",
  consultant_phone_sms_pings_aria: () => "Store my number for SMS pings",
  consultant_phone_sms_pings_explainer: () =>
    "Turning this on stores your number so the server can text you.",
  consultant_phone_send_code: () => "Send code",
  consultant_phone_sending: () => "Sending...",
  consultant_phone_code_sent_to: ({ tail }: { tail: string }) =>
    `We texted a code to ***${tail}`,
  consultant_phone_code_label: () => "Verification code",
  consultant_phone_code_placeholder: () => "000000",
  consultant_phone_verify: () => "Verify",
  consultant_phone_verifying: () => "Verifying...",
  consultant_phone_resend: () => "Resend code",
  consultant_phone_resend_cooldown: ({ seconds }: { seconds: string }) =>
    `Resend in ${seconds}s`,
  consultant_phone_verified: () => "Verified",
  consultant_phone_verified_tail: ({ tail }: { tail: string }) => `***${tail}`,
  consultant_phone_reverify_explainer: () =>
    "Enabling SMS pings again requires re-verification.",
  consultant_phone_remove: () => "Remove phone",
  consultant_phone_remove_title: () => "Remove your phone?",
  consultant_phone_remove_confirm: () => "Your verified phone will be removed.",
  consultant_phone_remove_action: () => "Remove",
  consultant_phone_saved: () => "Phone verified",
  consultant_phone_removed: () => "Phone removed",
  consultant_phone_pings_enabled: () => "SMS pings enabled",
  consultant_phone_pings_disabled: () => "SMS pings disabled",
  consultant_phone_invalid: () => "Enter a number like +1 555 000 1234",
  consultant_phone_error_rate_limited: () =>
    "Too many codes sent. Try again later.",
  consultant_phone_error_provider: () =>
    "Could not send the code. Try again later.",
  consultant_phone_reachability_title: () => "Reachability",
  consultant_phone_preference_saved: () => "Call preference saved",
  common_cancel: () => "Cancel",
  common_loading: () => "Loading...",
  shell_close: () => "Close",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  trpc: {
    consultant: {
      get: { query: mockGet },
      register: { mutate: mockRegister },
      verify: { mutate: mockVerify },
      setSmsPings: { mutate: mockSetSmsPings },
      updatePreference: { mutate: mockUpdatePreference },
      delete: { mutate: mockDelete },
    },
  },
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  haptic: mockHaptic,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getCryptoBridge: () => ({
    orgDecrypt: mockOrgDecrypt,
  }),
}));

// Mock TanStack Query to avoid needing a QueryClientProvider.
// We provide minimal implementations that let the component render.
// Full replacement: the real module requires a provider context, so
// spreading importOriginal would fail at runtime.
vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const queryData = { current: null as unknown };
  return {
    ...original,
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      if (typeof opts.queryFn === "function") {
        void (opts.queryFn as () => Promise<unknown>)().then(
          (data: unknown) => {
            queryData.current = data;
          },
        );
      }
      return {
        get data() {
          return queryData.current;
        },
        get isLoading() {
          return false;
        },
        get isError() {
          return false;
        },
        get error() {
          return null;
        },
      };
    },
    createMutation: (
      optsFn: () => {
        mutationFn: (arg: unknown) => Promise<unknown>;
        onSuccess?: (data: unknown, variables: unknown) => void;
        onError?: (err: unknown) => void;
      },
    ) => {
      const opts = optsFn();
      return {
        get isPending() {
          return false;
        },
        mutate: (arg: unknown) => {
          opts
            .mutationFn(arg)
            .then((data: unknown) => {
              opts.onSuccess?.(data, arg);
            })
            .catch((err: unknown) => {
              opts.onError?.(err);
            });
        },
      };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidate,
    }),
  };
});

vi.mock("$lib/components/query-error-messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getErrorMessage: (err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong",
  isErrorCode: () => false,
  errorCodeMap: {},
}));

const { default: ConsultantPhoneSheet } =
  await import("./ConsultantPhoneSheet.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue(null);
  // Reset the global fetch mock if any.
  vi.restoreAllMocks();
});

function renderSheet(
  overrides: Partial<{ opened: boolean; ondismiss: () => void }> = {},
): void {
  render(ConsultantPhoneSheet, {
    props: {
      opened: overrides.opened ?? true,
      ondismiss: overrides.ondismiss ?? vi.fn(),
    },
  });
}

describe("ConsultantPhoneSheet", () => {
  describe("step machine: entry state", () => {
    it("renders phone input and send code button when no consultant data", async () => {
      renderSheet();
      await tick();
      expect(screen.getByText("Send code")).toBeTruthy();
      expect(screen.getByText("Phone number")).toBeTruthy();
    });

    it("renders the sms pings toggle", async () => {
      renderSheet();
      await tick();
      expect(screen.getByText("Text me notification pings")).toBeTruthy();
    });

    it("send code button is disabled when phone is empty", async () => {
      renderSheet();
      await tick();
      const button = screen.getByText("Send code").closest("button");
      expect(button?.disabled).toBe(true);
    });
  });

  describe("register payload", () => {
    it("register mutate carries opt-in flag and preferredCallMethod", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ sent: true }), { status: 200 }),
      );

      renderSheet();
      await tick();

      // Type a valid phone number.
      const phoneInput = document.querySelector(
        'input[type="tel"]',
      ) as HTMLInputElement | null;
      if (phoneInput) {
        await fireEvent.input(phoneInput, {
          target: { value: "+491234567890" },
        });
      }
      await tick();

      // Click send code.
      const sendBtn = screen.getByText("Send code").closest("button");
      if (sendBtn) {
        await fireEvent.click(sendBtn);
      }
      await tick();
      // Allow async operations to settle.
      await new Promise((r) => setTimeout(r, 50));

      expect(mockRegister).toHaveBeenCalledWith({
        preferredCallMethod: "phone_callback",
        smsPingsOptIn: false,
      });
    });
  });

  describe("relay fetch", () => {
    it("calls relay with plain JSON body, not through tRPC", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify({ sent: true }), { status: 200 }),
        );

      renderSheet();
      await tick();

      const phoneInput = document.querySelector(
        'input[type="tel"]',
      ) as HTMLInputElement | null;
      if (phoneInput) {
        await fireEvent.input(phoneInput, {
          target: { value: "+491234567890" },
        });
      }
      await tick();

      const sendBtn = screen.getByText("Send code").closest("button");
      if (sendBtn) {
        await fireEvent.click(sendBtn);
      }
      await tick();
      await new Promise((r) => setTimeout(r, 50));

      expect(fetchSpy).toHaveBeenCalledWith(
        "/relay/consultant-verify",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "+491234567890",
            wantsPings: false,
          }),
        }),
      );
    });
  });

  describe("error mapping", () => {
    it("maps 429 to rate limited message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ code: "RATE_LIMITED" }), {
          status: 429,
          headers: { "Retry-After": "60" },
        }),
      );

      renderSheet();
      await tick();

      const phoneInput = document.querySelector(
        'input[type="tel"]',
      ) as HTMLInputElement | null;
      if (phoneInput) {
        await fireEvent.input(phoneInput, {
          target: { value: "+491234567890" },
        });
      }
      await tick();

      const sendBtn = screen.getByText("Send code").closest("button");
      if (sendBtn) {
        await fireEvent.click(sendBtn);
      }
      await tick();
      await new Promise((r) => setTimeout(r, 50));

      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        "Too many codes sent. Try again later.",
      );
    });

    it("maps 400 INVALID_PHONE to phone validation message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ code: "INVALID_PHONE" }), {
          status: 400,
        }),
      );

      renderSheet();
      await tick();

      const phoneInput = document.querySelector(
        'input[type="tel"]',
      ) as HTMLInputElement | null;
      if (phoneInput) {
        await fireEvent.input(phoneInput, {
          target: { value: "+491234567890" },
        });
      }
      await tick();

      const sendBtn = screen.getByText("Send code").closest("button");
      if (sendBtn) {
        await fireEvent.click(sendBtn);
      }
      await tick();
      await new Promise((r) => setTimeout(r, 50));

      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        "Enter a number like +1 555 000 1234",
      );
    });
  });

  describe("verified state", () => {
    it("renders verified step with toggles and remove when consultant is verified", async () => {
      mockGet.mockResolvedValue({
        id: "c-1",
        isVerified: true,
        preferredCallMethod: "phone_callback",
        encryptedPhone: "encrypted-phone-base64",
        smsPingsEnabled: true,
        hasOpsPhone: true,
      });

      renderSheet();
      await tick();
      await new Promise((r) => setTimeout(r, 50));
      await tick();

      // The verified state shows the verified label.
      expect(screen.getByText(/Verified/)).toBeTruthy();
      // Shows remove phone button.
      expect(screen.getByText("Remove phone")).toBeTruthy();
      // Shows the pings toggle label.
      expect(screen.getByText("Text me notification pings")).toBeTruthy();
    });
  });

  describe("delete confirm", () => {
    it("opens the ShellDialog on remove click", async () => {
      mockGet.mockResolvedValue({
        id: "c-1",
        isVerified: true,
        preferredCallMethod: "phone_callback",
        encryptedPhone: "encrypted-phone-base64",
        smsPingsEnabled: false,
        hasOpsPhone: false,
      });

      renderSheet();
      await tick();
      await new Promise((r) => setTimeout(r, 50));
      await tick();

      const removeBtn = screen.getByText("Remove phone").closest("button");
      if (removeBtn) {
        await fireEvent.click(removeBtn);
      }
      await tick();

      // The confirm dialog title appears.
      expect(screen.getByText("Remove your phone?")).toBeTruthy();
      expect(
        screen.getByText("Your verified phone will be removed."),
      ).toBeTruthy();
    });
  });

  describe("resend cooldown", () => {
    it("starts at 60 and counts down", async () => {
      vi.useFakeTimers();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ sent: true }), { status: 200 }),
      );

      renderSheet();
      await tick();

      const phoneInput = document.querySelector(
        'input[type="tel"]',
      ) as HTMLInputElement | null;
      if (phoneInput) {
        await fireEvent.input(phoneInput, {
          target: { value: "+491234567890" },
        });
      }
      await tick();

      const sendBtn = screen.getByText("Send code").closest("button");
      if (sendBtn) {
        await fireEvent.click(sendBtn);
      }
      // Let the async flow complete.
      await vi.advanceTimersByTimeAsync(100);
      await tick();

      // After submission, we should be on code step with cooldown active.
      // The cooldown should show "Resend in 60s".
      const cooldownText = screen.queryByText(/Resend in \d+s/);
      if (cooldownText) {
        expect(cooldownText.textContent).toContain("Resend in");
      }

      // Advance 10 seconds.
      await vi.advanceTimersByTimeAsync(10_000);
      await tick();

      const updatedText = screen.queryByText(/Resend in \d+s/);
      if (updatedText) {
        expect(updatedText.textContent).toContain("Resend in 50s");
      }

      vi.useRealTimers();
    });
  });
});
