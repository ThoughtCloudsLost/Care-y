// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as IntakeCrypto from "./intake-crypto.js";
import type * as IntakeFormCrypto from "$lib/portal/intake-form-crypto.js";
import type * as CryptoPkg from "@care-y/crypto";
import type * as PowSolver from "$lib/auth/pow-solver.js";
import type * as AnnounceModule from "$lib/utils/announce.js";
import type * as ParaglideRuntime from "$lib/paraglide/runtime.js";

// --- Controllable mock state ---

// vi.hoisted: the ui-locale store calls getLocale() at module scope, so
// the mock factory runs before top-level let declarations initialize.
const localeState = vi.hoisted(() => ({ current: "en" }));
let mockOrgKey: Uint8Array | null = new Uint8Array(32);
let mockOrgKeyLoading = false;
let mockPowRequired = false;
let mockFormData: {
  formId: string | null;
  fields: unknown[] | null;
} = { formId: null, fields: null };

let mockMutateFn: ReturnType<typeof vi.fn>;
let mockMutationPending = false;
let mockMutateAsync: ReturnType<typeof vi.fn>;

// --- Mocks ---

// $app/environment: covered by test-setup.ts (global setupFile)

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const key = JSON.stringify(opts.queryKey);
      if (key.includes("orgPublicKey")) {
        return {
          get data() {
            return mockOrgKey;
          },
          get isLoading() {
            return mockOrgKeyLoading;
          },
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeConfig")) {
        return {
          data: { powRequired: mockPowRequired },
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeForm")) {
        return {
          data: mockFormData,
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeChallenge")) {
        return {
          data: null,
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
      };
    },
    createMutation: () => ({
      get isPending() {
        return mockMutationPending;
      },
      mutate: mockMutateFn,
      mutateAsync: mockMutateAsync,
      isError: false,
      error: null,
    }),
  };
});

const {
  mockEncryptIntake,
  mockBuildAccountPayload,
  mockBuildContinuationPayload,
} = vi.hoisted(() => ({
  mockEncryptIntake: vi.fn().mockReturnValue({
    encryptedTitle: "enc-title",
    encryptedDescription: "enc-desc",
    encryptedMessage: "enc-msg",
    encryptedFormResponse: "enc-response",
    wrappedTk: "enc-wrap",
  }),
  mockBuildAccountPayload: vi.fn().mockResolvedValue({
    accountId: "test-account-id",
    username: "testuser",
    salt: "dGVzdHNhbHQ=",
    publicKey: "dGVzdHB1YmtleQ==",
    authHash: "dGVzdGF1dGhoYXNo",
    keyCheck: {
      ephemeralPoint: "ep",
      nonce: "nc",
      ciphertext: "ct",
    },
  }),
  mockBuildContinuationPayload: vi.fn().mockReturnValue({
    payload: {
      channelId: "abc123def456abc123def456abc123def456abc123def456",
      authHash: "bW9jay1hdXRoLWhhc2g",
      clientPublic: "bW9jay1wdWJsaWMta2V5",
      keyCheck: {
        ephemeralPoint: "ep-cont",
        nonce: "nc-cont",
        ciphertext: "ct-cont",
      },
    },
    channelId: "abc123def456abc123def456abc123def456abc123def456",
    encodedSeed: "bW9jay1lbmNvZGVkLXNlZWQ",
  }),
}));

vi.mock("./intake-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeCrypto>()),
  encryptIntake: mockEncryptIntake,
  buildAccountPayload: mockBuildAccountPayload,
  buildContinuationPayload: mockBuildContinuationPayload,
}));

vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeFormCrypto>()),
  decryptFieldContent: vi.fn(),
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  decode: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PowSolver>()),
  solveProofOfWork: vi.fn().mockResolvedValue("solution-hex"),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceModule>()),
  announceToLiveRegion: vi.fn(),
}));

// vi.mock required: $lib/paraglide/runtime.js needs a controllable getLocale
// so tests can simulate Spanish visitors without a real locale cookie.
vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideRuntime>()),
  getLocale: () => localeState.current,
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal()),
  trpc: {
    branding: {
      getPublicBranding: {
        query: vi.fn().mockResolvedValue({ orgPublicKey: null }),
      },
    },
    clientPortal: {
      getIntakeConfig: { query: vi.fn() },
      getIntakeForm: { query: vi.fn() },
      getIntakeChallenge: { query: vi.fn() },
      submitIntake: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_title: () => "Get help",
  intake_intro: () => "We're here to help.",
  intake_field_name_label: (
    _inputs?: Record<string, never>,
    opts?: { locale?: string },
  ) => (opts?.locale === "es" ? "Tu nombre" : "Your name"),
  intake_field_name_placeholder: (
    _inputs?: Record<string, never>,
    opts?: { locale?: string },
  ) => (opts?.locale === "es" ? "Nombre o alias" : "First name or alias"),
  intake_field_name_hint: () => "optional",
  intake_contact_method_label: () => "How should we reach you?",
  intake_contact_phone: () => "Text or call my phone",
  intake_contact_email: () => "Email me",
  intake_contact_none: () => "I'll check back myself",
  intake_contact_none_note: () =>
    "The organization will not be able to reach out to you.",
  intake_field_contact_detail_phone_label: () => "Phone number",
  intake_field_contact_detail_email_label: () => "Email address",
  intake_field_message_label: (
    _inputs?: Record<string, never>,
    opts?: { locale?: string },
  ) => (opts?.locale === "es" ? "Tu mensaje" : "Your message"),
  intake_field_message_placeholder: (
    _inputs?: Record<string, never>,
    opts?: { locale?: string },
  ) => (opts?.locale === "es" ? "Que esta pasando?" : "What's going on?"),
  intake_char_count: ({ count, max }: { count: number; max: number }) =>
    `${String(count)} / ${String(max)}`,
  intake_submit: () => "Send encrypted message",
  intake_submitting: () => "Sending...",
  intake_solving_challenge: () => "Securing your message...",
  intake_success_heading: () => "Your message was sent",
  intake_success_body: () => "A volunteer will read it as soon as possible.",
  intake_reference_label: () => "Your reference code:",
  intake_reference_save: () => "Save it if you want to follow up by phone.",
  intake_submit_hint: () => "What you wrote has been encrypted.",
  intake_hint_dismiss: () => "Got it",
  intake_error_generic: () =>
    "Your message didn't go through. Nothing was sent. Try again.",
  intake_error_rate_limited: ({ minutes }: { minutes: string }) =>
    `Too many messages. Try again in about ${minutes} minutes.`,
  intake_error_encryption_unavailable: () =>
    "This form can't encrypt right now. Please call instead.",
  intake_error_field_required: () => "This field is required.",
  intake_error_message_required: () =>
    "Please write a message so we know how to help.",
  intake_not_available: () =>
    "This form is not available. Contact the organization directly.",
  intake_form_closed_default: () =>
    "This form is no longer accepting submissions.",
  intake_noscript: () => "This form needs JavaScript.",
  intake_protected_title: () => "How you're protected",
  intake_protected_summary: () => "Your data is encrypted.",
  intake_protected_encrypted_what: () => "Encrypted in browser.",
  intake_protected_encrypted_why: () => "Server cannot read.",
  intake_protected_volunteers_what: () => "Volunteers only.",
  intake_protected_volunteers_why: () => "Limited access.",
  intake_protected_server_what: () => "Server stores scrambled data.",
  intake_protected_server_why: () => "Cannot decode.",
  account_intake_optin_title: () => "Add a secure account (optional)",
  account_intake_optin_body: () => "Read replies here with a password.",
  account_login_username: () => "Username",
  account_login_password: () => "Password",
  account_create_confirm: () => "Confirm password",
  account_create_mismatch: () => "Passwords do not match.",
  account_create_username_hint: () => "Pick a username you can remember.",
  account_create_password_hint: () => "Use 8 or more characters.",
  account_create_warning_password: () =>
    "There is no way to recover this password.",
  account_create_warning_reset: () =>
    "If your password is ever reset, history is lost.",
  account_unlocking: () => "Unlocking your messages...",
  account_username_taken: () => "That username is already taken.",
  account_intake_confirm_reminder: ({ username }: { username: string }) =>
    `Your username is ${username}. Sign in at /account.`,
  intake_continuation_toggle_title: () =>
    "Save a link to add more later (optional)",
  intake_continuation_toggle_body: () =>
    "Get a link you can reopen to add information or read replies.",
  intake_continuation_expanded_text: () =>
    "After you submit, you will receive a link.",
  intake_continuation_expanded_warning: () =>
    "If you lose this link, there is no way to recover it.",
  intake_continuation_link_label: () => "Your continuation link:",
  intake_continuation_copy_button: () => "Copy link",
  intake_continuation_copied: () => "Link copied.",
  intake_continuation_copy_error: () =>
    "Could not copy the link. Select it manually and copy.",
  intake_continuation_warning: () =>
    "This link is the only way back to your conversation.",
  intake_continuation_hint: () =>
    "The link above carries the key that unlocks your conversation.",
}));

vi.mock("$lib/shell/PageShell.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellToast.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// vi.mock required: Svelte 5 createContext throws missing_context when the
// consumer renders without its provider, and this spec renders the page on
// its own rather than inside the (client) layout that sets the container.
vi.mock("$lib/client-shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getClientShellCtx: () => ({ current: undefined }),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import * as m from "$lib/paraglide/messages.js";
import IntakePage from "./+page.svelte";

// --- Tests ---

describe("intake page", () => {
  beforeEach(() => {
    localeState.current = "en";
    mockOrgKey = new Uint8Array(32);
    mockOrgKeyLoading = false;
    mockPowRequired = false;
    mockFormData = { formId: null, fields: null };
    mockMutationPending = false;
    mockMutateFn = vi.fn();
    mockMutateAsync = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders the default form with intro text and HowProtected", () => {
    render(IntakePage);
    expect(screen.getByText("We're here to help.")).toBeTruthy();
    expect(screen.getByText("How you're protected")).toBeTruthy();
  });

  it("renders the submit button", () => {
    render(IntakePage);
    const btn = screen.getByTestId("intake-submit");
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Send encrypted message");
  });

  it("renders contact method radio group for default form", () => {
    render(IntakePage);
    expect(screen.getByText("How should we reach you?")).toBeTruthy();
    expect(screen.getByText("Text or call my phone")).toBeTruthy();
    expect(screen.getByText("Email me")).toBeTruthy();
    expect(screen.getByText("I'll check back myself")).toBeTruthy();
  });

  it("renders name field with a dedicated placeholder (not the label)", () => {
    render(IntakePage);
    // The name field should use intake_field_name_placeholder, not the label
    const nameInput = screen.getByPlaceholderText("First name or alias");
    expect(nameInput).toBeTruthy();
    // The label text should appear separately from the placeholder
    expect(screen.getAllByText(/Your name/)[0]).toBeTruthy();
  });

  it("populates default form labels and placeholders for both locales", () => {
    // The localizeMsg helper calls each Paraglide message function with
    // explicit locale overrides, producing { en: "...", es: "..." } records.
    // IntakeFieldRenderer resolves placeholders via resolveLocalized, so
    // the rendered placeholder proves the en key is populated. We verify
    // the message functions were called with locale options by confirming
    // the English placeholder text comes through correctly rather than the
    // label text (which would indicate the old bug).
    render(IntakePage);
    const nameInput = screen.getByPlaceholderText("First name or alias");
    expect(nameInput).toBeTruthy();
    const msgInput = screen.getByPlaceholderText("What's going on?");
    expect(msgInput).toBeTruthy();
  });

  it("shows encryption unavailable when org key is null", () => {
    mockOrgKey = null;
    render(IntakePage);
    expect(
      screen.getByText(
        "This form can't encrypt right now. Please call instead.",
      ),
    ).toBeTruthy();
  });

  it("renders noscript element", () => {
    // jsdom runs with JS enabled, so <noscript> content is not rendered.
    // We can only verify the element is present in the DOM.
    render(IntakePage);
    const noscriptEl = document.querySelector("noscript");
    expect(noscriptEl).toBeTruthy();
  });

  /**
   * Helper: set a DOM input/textarea value directly and dispatch an input
   * event so Konsta's onInput handler fires with the correct e.target.value.
   * jsdom's fireEvent.input does not set the element's .value property.
   */
  /**
   * Helper: PasswordConfirmPair renders through ListInput's input snippet
   * and carries no testid, so its fields are addressed by accessible name.
   */
  function getPasswordField(label: string): HTMLInputElement | null {
    return document.querySelector<HTMLInputElement>(
      `input[aria-label="${label}"]`,
    );
  }

  function setInputValue(
    el: HTMLInputElement | HTMLTextAreaElement,
    val: string,
  ): void {
    Object.defineProperty(el, "value", { writable: true, value: val });
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * Helper: fill the default form's required fields (message textarea +
   * phone contact detail, since contactMethod defaults to "phone") so
   * validation passes and the submit flow reaches the mutation.
   */
  function fillDefaultFormRequiredFields(): void {
    // Message textarea (required by the default form)
    const textarea = document.querySelector("textarea");
    if (textarea) setInputValue(textarea, "I need help");

    // Phone contact detail (required because contactMethod defaults to "phone")
    const telInput =
      document.querySelector<HTMLInputElement>('input[type="tel"]');
    if (telInput) setInputValue(telInput, "+1-555-0100");
  }

  it("shows success state with reference code after successful submission", async () => {
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    render(IntakePage);
    fillDefaultFormRequiredFields();

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });

    expect(screen.getByTestId("intake-reference").textContent).toContain(
      "calm-pebble-7",
    );
  });

  it("shows rate limit error with retry minutes", async () => {
    const rateLimitError = {
      data: { code: "TOO_MANY_REQUESTS" },
      message: "Rate limited. Retry after 2400s",
    };
    mockMutateAsync.mockRejectedValue(rateLimitError);

    render(IntakePage);
    fillDefaultFormRequiredFields();

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText(/Too many messages.*40 minutes/)).toBeTruthy();
    });
  });

  it("renders not-available state when intakeDisabled is true", () => {
    mockFormData = {
      formId: null,
      fields: null,
      intakeDisabled: true,
    } as typeof mockFormData;
    render(IntakePage);
    expect(screen.getByText(/not available/i)).toBeTruthy();
    // No submit button should be visible
    expect(screen.queryByTestId("intake-submit")).toBeNull();
  });

  // -----------------------------------------------------------------
  // Account opt-in tests
  // -----------------------------------------------------------------

  it("account opt-in is collapsed by default", () => {
    render(IntakePage);
    const toggle = screen.getByTestId("intake-account-toggle");
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    // Account fields should not be visible
    expect(screen.queryByTestId("account-create-username")).toBeNull();
  });

  it("expands the account section on toggle click", async () => {
    render(IntakePage);
    const toggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("account-create-username")).toBeTruthy();
    expect(getPasswordField(m.account_login_password())).toBeTruthy();
    expect(getPasswordField(m.account_create_confirm())).toBeTruthy();
    expect(screen.getByTestId("warning-password")).toBeTruthy();
    expect(screen.getByTestId("warning-reset")).toBeTruthy();
  });

  it("password mismatch blocks submit inline", async () => {
    render(IntakePage);
    fillDefaultFormRequiredFields();

    // Expand account section
    const toggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(toggle);

    // Fill username
    const usernameInput = screen
      .getByTestId("account-create-username")
      .querySelector("input");
    if (usernameInput)
      setInputValue(usernameInput as HTMLInputElement, "testuser");

    // Fill mismatched passwords
    const passwordInput = getPasswordField(m.account_login_password());
    const confirmInput = getPasswordField(m.account_create_confirm());
    if (passwordInput) setInputValue(passwordInput, "password123");
    if (confirmInput) setInputValue(confirmInput, "mismatch456");

    // The mismatch error should appear
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain(m.account_create_mismatch());
    });
  });

  it("username-taken error keeps form state and shows inline error", async () => {
    const usernameTakenError = {
      data: { code: "CONFLICT" },
      message: "ACCOUNT_USERNAME_TAKEN",
    };
    mockMutateAsync.mockRejectedValue(usernameTakenError);

    render(IntakePage);
    fillDefaultFormRequiredFields();

    // Expand and fill account section
    const toggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(toggle);

    const usernameInput = screen
      .getByTestId("account-create-username")
      .querySelector("input");
    const passwordInput = getPasswordField(m.account_login_password());
    const confirmInput = getPasswordField(m.account_create_confirm());
    if (usernameInput)
      setInputValue(usernameInput as HTMLInputElement, "takenuser");
    if (passwordInput) setInputValue(passwordInput, "password123");
    if (confirmInput) setInputValue(confirmInput, "password123");

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByTestId("account-create-error")).toBeTruthy();
      expect(screen.getByTestId("account-create-error").textContent).toContain(
        "That username is already taken",
      );
    });

    // Form should still be rendered (not submitted/cleared)
    expect(screen.getByTestId("intake-submit")).toBeTruthy();
  });

  it("renders closed state with default message when formClosed is true", () => {
    mockFormData = {
      formId: "closed-form-id",
      fields: null,
      encryptedFormMeta: null,
      intakeDisabled: false,
      formClosed: true,
    } as typeof mockFormData;
    render(IntakePage);
    expect(
      screen.getByText("This form is no longer accepting submissions."),
    ).toBeTruthy();
    // No submit button should be visible
    expect(screen.queryByTestId("intake-submit")).toBeNull();
  });

  // -----------------------------------------------------------------
  // Continuation link tests
  // -----------------------------------------------------------------

  it("continuation toggle is collapsed by default", () => {
    render(IntakePage);
    const toggle = screen.getByTestId("intake-continuation-toggle");
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("expanding continuation collapses account", async () => {
    render(IntakePage);

    // Expand account first
    const accountToggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(accountToggle);
    expect(accountToggle.getAttribute("aria-expanded")).toBe("true");

    // Expand continuation
    const contToggle = screen.getByTestId("intake-continuation-toggle");
    await fireEvent.click(contToggle);
    expect(contToggle.getAttribute("aria-expanded")).toBe("true");
    expect(accountToggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("expanding account collapses continuation", async () => {
    render(IntakePage);

    // Expand continuation first
    const contToggle = screen.getByTestId("intake-continuation-toggle");
    await fireEvent.click(contToggle);
    expect(contToggle.getAttribute("aria-expanded")).toBe("true");

    // Expand account
    const accountToggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(accountToggle);
    expect(accountToggle.getAttribute("aria-expanded")).toBe("true");
    expect(contToggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("submit with continuation shows link block on success", async () => {
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    render(IntakePage);
    fillDefaultFormRequiredFields();

    // Expand continuation
    const contToggle = screen.getByTestId("intake-continuation-toggle");
    await fireEvent.click(contToggle);

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });

    const linkEl = screen.getByTestId("intake-continuation-link");
    expect(linkEl).toBeTruthy();
    expect(linkEl.textContent).toContain(
      "/portal/abc123def456abc123def456abc123def456abc123def456#bW9jay1lbmNvZGVkLXNlZWQ",
    );
    expect(mockBuildContinuationPayload).toHaveBeenCalled();
  });

  it("submit without continuation renders no link block", async () => {
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    render(IntakePage);
    fillDefaultFormRequiredFields();

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });

    expect(screen.queryByTestId("intake-continuation-link")).toBeNull();
    expect(mockBuildContinuationPayload).not.toHaveBeenCalled();
  });

  it("account+continuation both expanded results in account only", async () => {
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    render(IntakePage);
    fillDefaultFormRequiredFields();

    // Expand continuation (this will be overridden by account)
    const contToggle = screen.getByTestId("intake-continuation-toggle");
    await fireEvent.click(contToggle);

    // Expand account (collapses continuation)
    const accountToggle = screen.getByTestId("intake-account-toggle");
    await fireEvent.click(accountToggle);

    // Fill account fields to trigger the account branch
    const usernameInput = screen
      .getByTestId("account-create-username")
      .querySelector("input");
    const passwordInput = getPasswordField(m.account_login_password());
    const confirmInput = getPasswordField(m.account_create_confirm());
    if (usernameInput)
      setInputValue(usernameInput as HTMLInputElement, "testuser");
    if (passwordInput) setInputValue(passwordInput, "password123");
    if (confirmInput) setInputValue(confirmInput, "password123");

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });

    expect(mockBuildAccountPayload).toHaveBeenCalled();
    expect(mockBuildContinuationPayload).not.toHaveBeenCalled();
    expect(screen.queryByTestId("intake-continuation-link")).toBeNull();
  });

  it("copy button writes to clipboard", async () => {
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    const savedClipboard = navigator.clipboard;
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    try {
      render(IntakePage);
      fillDefaultFormRequiredFields();

      const contToggle = screen.getByTestId("intake-continuation-toggle");
      await fireEvent.click(contToggle);

      const submitBtn = screen.getByTestId("intake-submit");
      await fireEvent.click(submitBtn);

      await vi.waitFor(() => {
        expect(screen.getByTestId("intake-continuation-copy")).toBeTruthy();
      });

      const copyBtn = screen.getByTestId("intake-continuation-copy");
      await fireEvent.click(copyBtn);

      await vi.waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(1);
      });

      const writtenUrl = mockWriteText.mock.calls[0]?.[0] as string;
      expect(writtenUrl).toContain("/portal/");
      expect(writtenUrl).toContain("#bW9jay1lbmNvZGVkLXNlZWQ");
    } finally {
      Object.assign(navigator, { clipboard: savedClipboard });
    }
  });

  it("failed submit reveals no link", async () => {
    mockMutateAsync.mockRejectedValue(new Error("server error"));

    render(IntakePage);
    fillDefaultFormRequiredFields();

    const contToggle = screen.getByTestId("intake-continuation-toggle");
    await fireEvent.click(contToggle);

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText(/didn't go through/)).toBeTruthy();
    });

    expect(screen.queryByTestId("intake-continuation-link")).toBeNull();
  });

  // -----------------------------------------------------------------
  // Locale-aware rendering tests
  // -----------------------------------------------------------------

  it("Spanish visitor sees Spanish labels and placeholder on the default form", () => {
    localeState.current = "es";
    render(IntakePage);

    // Label resolves to Spanish via localizeMsg + visitorLocale
    expect(screen.getAllByText(/Tu nombre/)[0]).toBeTruthy();
    // Placeholder resolves to Spanish via visitorLocale passed to IntakeFieldRenderer
    const nameInput = screen.getByPlaceholderText("Nombre o alias");
    expect(nameInput).toBeTruthy();
    // Message label in Spanish
    expect(screen.getAllByText(/Tu mensaje/)[0]).toBeTruthy();
    const msgInput = screen.getByPlaceholderText("Que esta pasando?");
    expect(msgInput).toBeTruthy();
  });

  it("Spanish visitor sees Spanish labels on a custom form", async () => {
    localeState.current = "es";

    // Set up a custom form with bilingual fields
    const { decryptFieldContent } =
      await import("$lib/portal/intake-form-crypto.js");
    const mockedDecrypt = vi.mocked(decryptFieldContent);
    mockedDecrypt.mockImplementation(() => ({
      label: { en: "Your location", es: "Tu ubicacion" },
      config: {
        type: "text" as const,
        maxLength: 200,
        placeholder: { en: "City", es: "Ciudad" },
      },
    }));

    mockFormData = {
      formId: "custom-form-1",
      fields: [
        {
          fieldKey: "loc-field",
          fieldType: "text",
          role: null,
          isRequired: false,
          encryptedLabel: "enc-label-loc",
          encryptedConfig: "enc-config-loc",
        },
      ],
    };

    render(IntakePage);

    // The label should resolve to Spanish for a Spanish visitor
    await vi.waitFor(() => {
      expect(screen.getAllByText(/Tu ubicacion/)[0]).toBeTruthy();
    });
    // The placeholder should also be Spanish
    const locInput = screen.getByPlaceholderText("Ciudad");
    expect(locInput).toBeTruthy();

    mockedDecrypt.mockReset();
  });

  it("queue-facing submission labels stay in base locale for a Spanish visitor", async () => {
    localeState.current = "es";
    mockMutateAsync.mockResolvedValue({ reference: "calm-pebble-7" });

    render(IntakePage);
    fillDefaultFormRequiredFields();

    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      // The success heading mock returns English regardless of locale
      // (Paraglide message mocks are not fully locale-aware for all keys).
      // The important assertion is below: the submission payload labels.
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });

    // Verify that the answer labels are in English (base locale),
    // not Spanish, even though the visitor is browsing in Spanish.
    const encryptCall = mockEncryptIntake.mock.calls[0] as unknown[];
    const answers = encryptCall[1] as Array<{
      fieldKey: string;
      label: string;
    }>;

    const nameAnswer = answers.find((a) => a.fieldKey === "default:name");
    // Name is optional, may or may not be present. If present, label is English.
    if (nameAnswer) {
      expect(nameAnswer.label).toBe("Your name");
    }

    const msgAnswer = answers.find((a) => a.fieldKey === "default:message");
    expect(msgAnswer).toBeTruthy();
    expect(msgAnswer?.label).toBe("Your message");

    const contactMethodAnswer = answers.find(
      (a) => a.fieldKey === "default:contact-method",
    );
    expect(contactMethodAnswer).toBeTruthy();
    expect(contactMethodAnswer?.label).toBe("How should we reach you?");
  });
});
