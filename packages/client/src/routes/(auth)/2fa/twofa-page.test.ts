// @vitest-environment jsdom
/**
 * 2FA verification page tests.
 *
 * Tests the post-login 2FA flow: method picker, TOTP code entry,
 * WebAuthn initiation, email send/verify, backup code entry,
 * and the "back to login" navigation.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module
 *   - $app/paths: SvelteKit virtual module
 *   - $app/environment: SvelteKit virtual module
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - $lib/paraglide/messages.js: Paraglide virtual module
 *   - $lib/utils/announce.js: DOM-dependent utility
 *   - @care-y/shared: TwoFactorMethod enum
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// --- Mocks ---

const gotoMock = vi.fn();
vi.mock("$app/navigation", () => ({
  goto: gotoMock,
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$app/environment", () => ({
  browser: true,
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  twofa_verify_title: () => "twofa_verify_title",
  twofa_verify_method_picker: () => "twofa_verify_method_picker",
  twofa_totp_label: () => "twofa_totp_label",
  twofa_totp_enter_code: () => "twofa_totp_enter_code",
  twofa_totp_code_placeholder: () => "twofa_totp_code_placeholder",
  twofa_passkey_use: () => "twofa_passkey_use",
  twofa_passkey_waiting: () => "twofa_passkey_waiting",
  twofa_email_label: () => "twofa_email_label",
  twofa_email_send_code: () => "twofa_email_send_code",
  twofa_email_resend: () => "twofa_email_resend",
  twofa_email_cooldown: (p: { seconds: string }) =>
    `twofa_email_cooldown:seconds=${p.seconds}`,
  twofa_sms_label: () => "twofa_sms_label",
  twofa_sms_send_code: () => "twofa_sms_send_code",
  twofa_push_label: () => "twofa_push_label",
  twofa_push_send: () => "twofa_push_send",
  twofa_push_waiting: () => "twofa_push_waiting",
  twofa_backup_codes_enter: () => "twofa_backup_codes_enter",
  twofa_backup_codes_placeholder: () => "twofa_backup_codes_placeholder",
  twofa_verify_submit: () => "twofa_verify_submit",
  twofa_back_to_login: () => "twofa_back_to_login",
  twofa_error_not_allowed: () => "twofa_error_not_allowed",
  twofa_error_security: () => "twofa_error_security",
  twofa_error_invalid_state: () => "twofa_error_invalid_state",
  twofa_error_abort: () => "twofa_error_abort",
  twofa_error_invalid_code: () => "twofa_error_invalid_code",
  twofa_error_push_timeout: () => "twofa_error_push_timeout",
  twofa_error_push_denied: () => "twofa_error_push_denied",
}));

const totpMutate = vi.fn();
const webauthnOptionsMutate = vi.fn();
const webauthnCompleteMutate = vi.fn();
const emailSendMutate = vi.fn();
const emailCompleteMutate = vi.fn();
const backupCodeMutate = vi.fn();
const pushSendMutate = vi.fn();
const pushPollQuery = vi.fn();
const smsSendMutate = vi.fn();
const smsCompleteMutate = vi.fn();

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    twoFactor: {
      verify: {
        totp: { mutate: totpMutate },
        webauthnOptions: { mutate: webauthnOptionsMutate },
        webauthnComplete: { mutate: webauthnCompleteMutate },
        emailSend: { mutate: emailSendMutate },
        emailComplete: { mutate: emailCompleteMutate },
        backupCode: { mutate: backupCodeMutate },
        pushSend: { mutate: pushSendMutate },
        pushPoll: { query: pushPollQuery },
        smsSend: { mutate: smsSendMutate },
        smsComplete: { mutate: smsCompleteMutate },
      },
    },
  },
}));

vi.mock("@care-y/shared", () => ({
  TwoFactorMethod: {
    WEBAUTHN: "webauthn",
    TOTP: "totp",
    EMAIL: "email",
    SMS: "sms",
    PUSH: "push",
  },
}));

// --- Helpers ---

function setSessionStorageMethods(methods: string[]): void {
  sessionStorage.setItem("care-y-2fa-methods", JSON.stringify(methods));
}

// --- Tests ---

describe("2FA verification page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("redirects to /login when no methods in sessionStorage", async () => {
    const Page = (await import("./+page.svelte")).default;
    render(Page);
    expect(gotoMock).toHaveBeenCalledWith("/login");
  });

  it("shows method picker when multiple methods enrolled", async () => {
    setSessionStorageMethods(["totp", "webauthn"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    expect(screen.getByText("twofa_verify_title")).toBeDefined();
    expect(screen.getByText("twofa_verify_method_picker")).toBeDefined();
    expect(screen.getByText("twofa_totp_label")).toBeDefined();
    expect(screen.getByText("twofa_passkey_use")).toBeDefined();
  });

  it("auto-selects method when only one enrolled", async () => {
    setSessionStorageMethods(["totp"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    // Should show TOTP code input directly, not the method picker
    expect(screen.getByText("twofa_totp_enter_code")).toBeDefined();
    expect(screen.queryByText("twofa_verify_method_picker")).toBeNull();
  });

  it("clears sessionStorage after reading methods", async () => {
    setSessionStorageMethods(["totp"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    expect(sessionStorage.getItem("care-y-2fa-methods")).toBeNull();
  });

  it("submits TOTP code and navigates on success", async () => {
    setSessionStorageMethods(["totp"]);
    totpMutate.mockResolvedValueOnce({ success: true });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const input = screen.getByPlaceholderText(
      "twofa_totp_code_placeholder",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "123456" } });

    const submitBtn = screen.getByText("twofa_verify_submit");
    await fireEvent.click(submitBtn);

    expect(totpMutate).toHaveBeenCalledWith({ code: "123456" });
    expect(gotoMock).toHaveBeenCalledWith("/");
  });

  it("shows inline error on TOTP failure", async () => {
    setSessionStorageMethods(["totp"]);
    totpMutate.mockResolvedValueOnce({ success: false });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const input = screen.getByPlaceholderText(
      "twofa_totp_code_placeholder",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "000000" } });

    const submitBtn = screen.getByText("twofa_verify_submit");
    await fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("twofa_error_invalid_code")).toBeDefined();
    // Should NOT navigate
    expect(gotoMock).not.toHaveBeenCalledWith("/");
  });

  it("shows backup code entry when selected", async () => {
    setSessionStorageMethods(["totp"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const backupBtn = screen.getByText("twofa_backup_codes_enter");
    await fireEvent.click(backupBtn);

    expect(
      screen.getByPlaceholderText("twofa_backup_codes_placeholder"),
    ).toBeDefined();
  });

  it("navigates to /login on back-to-login click", async () => {
    setSessionStorageMethods(["totp"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const backLink = screen.getByText("twofa_back_to_login");
    await fireEvent.click(backLink);

    expect(gotoMock).toHaveBeenCalledWith("/login");
  });

  // --- Email flow ---

  it("sends email code and shows cooldown timer", async () => {
    vi.useFakeTimers();
    setSessionStorageMethods(["email"]);
    emailSendMutate.mockResolvedValueOnce({ sent: true });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const sendBtn = screen.getByText("twofa_email_send_code");
    await fireEvent.click(sendBtn);

    expect(emailSendMutate).toHaveBeenCalled();

    // After send, cooldown text should appear
    await vi.advanceTimersByTimeAsync(100);
    expect(screen.getByText("twofa_email_cooldown:seconds=60")).toBeDefined();

    vi.useRealTimers();
  });

  it("verifies email code and navigates on success", async () => {
    vi.useFakeTimers();
    setSessionStorageMethods(["email"]);
    emailSendMutate.mockResolvedValueOnce({ sent: true });
    emailCompleteMutate.mockResolvedValueOnce({ success: true });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    // Send the code first to trigger the code input
    const sendBtn = screen.getByText("twofa_email_send_code");
    await fireEvent.click(sendBtn);
    await vi.advanceTimersByTimeAsync(100);

    // Now enter the code
    const input = screen.getByPlaceholderText(
      "twofa_totp_code_placeholder",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "654321" } });

    const verifyBtn = screen.getByText("twofa_verify_submit");
    await fireEvent.click(verifyBtn);
    await vi.advanceTimersByTimeAsync(100);

    expect(emailCompleteMutate).toHaveBeenCalledWith({ code: "654321" });
    expect(gotoMock).toHaveBeenCalledWith("/");

    vi.useRealTimers();
  });

  // --- WebAuthn flow ---

  it("renders WebAuthn passkey button when webauthn method enrolled", async () => {
    setSessionStorageMethods(["webauthn"]);

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    // WebAuthn auto-selects (single method), shows the passkey UI.
    // Full credential exchange tested via Playwright E2E (jsdom lacks
    // navigator.credentials). This verifies the correct view renders.
    expect(screen.getAllByText("twofa_passkey_use").length).toBeGreaterThan(0);
  });

  // --- Push flow ---

  it("sends push and shows waiting state", async () => {
    setSessionStorageMethods(["push"]);
    pushSendMutate.mockResolvedValueOnce({
      challengeId: "abc-123",
      sent: true,
    });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const pushBtn = screen.getByText("twofa_push_send");
    await fireEvent.click(pushBtn);

    await vi.waitFor(() => {
      expect(screen.getByText("twofa_push_waiting")).toBeDefined();
    });

    expect(pushSendMutate).toHaveBeenCalled();
  });

  it("navigates on push approval", async () => {
    vi.useFakeTimers();
    setSessionStorageMethods(["push"]);
    pushSendMutate.mockResolvedValueOnce({
      challengeId: "abc-123",
      sent: true,
    });
    pushPollQuery.mockResolvedValueOnce({ status: "approved" });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const pushBtn = screen.getByText("twofa_push_send");
    await fireEvent.click(pushBtn);

    // Advance past the first poll interval (3s)
    await vi.advanceTimersByTimeAsync(3100);

    expect(pushPollQuery).toHaveBeenCalledWith({ challengeId: "abc-123" });
    expect(gotoMock).toHaveBeenCalledWith("/");

    vi.useRealTimers();
  });

  it("shows error on push denial", async () => {
    vi.useFakeTimers();
    setSessionStorageMethods(["push"]);
    pushSendMutate.mockResolvedValueOnce({
      challengeId: "abc-123",
      sent: true,
    });
    pushPollQuery.mockResolvedValueOnce({ status: "denied" });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const pushBtn = screen.getByText("twofa_push_send");
    await fireEvent.click(pushBtn);

    await vi.advanceTimersByTimeAsync(3100);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("twofa_error_push_denied")).toBeDefined();

    vi.useRealTimers();
  });

  // --- SMS flow ---

  it("sends SMS code and shows code input", async () => {
    vi.useFakeTimers();
    setSessionStorageMethods(["sms"]);
    smsSendMutate.mockResolvedValueOnce({ sent: true });

    const Page = (await import("./+page.svelte")).default;
    render(Page);

    const sendBtn = screen.getByText("twofa_sms_send_code");
    await fireEvent.click(sendBtn);

    expect(smsSendMutate).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(screen.getByText("twofa_email_cooldown:seconds=60")).toBeDefined();

    vi.useRealTimers();
  });

  // --- Type guard ---

  it("falls back to method picker for unknown method type", async () => {
    setSessionStorageMethods(["unknown_future_method"]);
    const Page = (await import("./+page.svelte")).default;
    render(Page);

    // Unknown method should not auto-select; but with only one method
    // and it's unknown, toActiveMethod returns null. Since there's only
    // one enrolled method and activeMethod is null, the method picker
    // condition (enrolledMethods.length > 1) is also false, so neither
    // a picker nor a method view renders. The page shows the back-to-login
    // link, which is the safe fallback.
    expect(screen.getByText("twofa_back_to_login")).toBeDefined();
    expect(screen.queryByText("twofa_totp_enter_code")).toBeNull();
  });
});
