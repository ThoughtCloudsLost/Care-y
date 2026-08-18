// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// --- Controllable mock state ---

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

const { mockEncryptIntake } = vi.hoisted(() => ({
  mockEncryptIntake: vi.fn().mockReturnValue({
    encryptedTitle: "enc-title",
    encryptedDescription: "enc-desc",
    encryptedMessage: "enc-msg",
    encryptedFormResponse: "enc-response",
    wrappedTk: "enc-wrap",
  }),
}));

vi.mock("./intake-crypto.js", async (importOriginal) => ({
  ...(await importOriginal()),
  encryptIntake: mockEncryptIntake,
}));

vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal()),
  decryptFieldContent: vi.fn(),
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal()),
  decode: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal()),
  solveProofOfWork: vi.fn().mockResolvedValue("solution-hex"),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal()),
  announceToLiveRegion: vi.fn(),
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
  intake_field_name_label: () => "Your name",
  intake_field_name_hint: () => "optional",
  intake_contact_method_label: () => "How should we reach you?",
  intake_contact_phone: () => "Text or call my phone",
  intake_contact_email: () => "Email me",
  intake_contact_none: () => "I'll check back myself",
  intake_contact_none_note: () =>
    "The organization will not be able to reach out to you.",
  intake_field_contact_detail_phone_label: () => "Phone number",
  intake_field_contact_detail_email_label: () => "Email address",
  intake_field_message_label: () => "Your message",
  intake_field_message_placeholder: () => "What's going on?",
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
  intake_noscript: () => "This form needs JavaScript.",
  intake_protected_title: () => "How you're protected",
  intake_protected_summary: () => "Your data is encrypted.",
  intake_protected_encrypted_what: () => "Encrypted in browser.",
  intake_protected_encrypted_why: () => "Server cannot read.",
  intake_protected_volunteers_what: () => "Volunteers only.",
  intake_protected_volunteers_why: () => "Limited access.",
  intake_protected_server_what: () => "Server stores scrambled data.",
  intake_protected_server_why: () => "Cannot decode.",
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

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import IntakePage from "./+page.svelte";

// --- Tests ---

describe("intake page", () => {
  beforeEach(() => {
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
});
