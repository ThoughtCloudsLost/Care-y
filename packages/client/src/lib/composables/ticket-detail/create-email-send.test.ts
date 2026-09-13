import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEmailSend,
  type EmailSendConfig,
} from "./create-email-send.svelte.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as SealModule from "$lib/crypto/seal-portal-copy.js";
import type { ProseMirrorDocJSON } from "@care-y/shared";

// vi.mock required: sealPortalCopy imports from @care-y/crypto barrel which
// triggers libsodium WASM initialization via getSodium(). Stubbing the module
// keeps the sealed triple deterministic and avoids the WASM penalty.
const { mockSealPortalCopy } = vi.hoisted(() => ({
  mockSealPortalCopy: vi.fn((clientPublic: string | null, _text: string) =>
    clientPublic != null && clientPublic !== ""
      ? {
          ephemeralPoint: "ep-sealed",
          nonce: "n-sealed",
          ciphertext: "ct-sealed",
        }
      : undefined,
  ),
}));
vi.mock("$lib/crypto/seal-portal-copy.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SealModule>()),
  sealPortalCopy: mockSealPortalCopy,
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  () =>
    ({
      toastStore: { current: null, show: vi.fn(), dismiss: vi.fn() },
    }) satisfies typeof ToastModule,
);

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  ticket_email_rate_limited: ({ seconds }: { seconds: string }) =>
    `rate-limited-${seconds}`,
  ticket_email_error_send: () => "email-error",
  ticket_email_error_record: () => "email-record-error",
  ticket_email_too_long: () => "too-long",
}));

const sampleDoc: ProseMirrorDocJSON = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Hello" }],
    },
  ],
};

function makeConfig(overrides?: Partial<EmailSendConfig>): EmailSendConfig {
  return {
    getTicketId: () => "t-1",
    cryptoBridge: {
      encrypt: vi.fn().mockResolvedValue("enc-base64"),
    } as unknown as EmailSendConfig["cryptoBridge"],
    queryClient: {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as EmailSendConfig["queryClient"],
    getClientPublic: () => null,
    createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("createEmailSend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // restoreAllMocks does not clear vi.fn() mocks from vi.mock factories
    // (toastStore.show), and the retry tests assert absolute call counts.
    vi.clearAllMocks();
    mockSealPortalCopy.mockClear();
  });

  it("posts to /relay/email, encrypts, creates follow-up, and calls onSuccess", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("Re: test", "<p>Hello</p>", "Hello", sampleDoc);

    expect(fetch).toHaveBeenCalledWith(
      "/relay/email",
      expect.objectContaining({ method: "POST" }),
    );

    const fetchBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string,
    ) as { subject: string; html: string; text: string };
    expect(fetchBody.subject).toBe("Re: test");
    expect(fetchBody.html).toBe("<p>Hello</p>");
    expect(fetchBody.text).toBe("Hello");

    expect(config.cryptoBridge.encrypt).toHaveBeenCalledWith(
      "t-1",
      expect.stringMatching(/^followup:/),
      expect.stringContaining('"subject"'),
    );
    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-1",
        type: "email_outbound",
        source: "volunteer",
        isPrivate: false,
      }),
    );
    expect(config.onSuccess).toHaveBeenCalledOnce();
  });

  it("skips send when subject is empty", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("  ", "<p>Body</p>", "Body", sampleDoc);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("skips send when text body is empty", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("Subject", "<p></p>", "   ", sampleDoc);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows too-long toast when payload exceeds limits", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const config = makeConfig();
    const email = createEmailSend(config);
    // Subject over 512 bytes
    const longSubject = "x".repeat(600);
    await email.handleEmailSend(longSubject, "<p>ok</p>", "ok", sampleDoc);

    expect(toastStore.show).toHaveBeenCalledWith("too-long", 3000);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("handles rate limiting (429) with Retry-After header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "45" }),
      }),
    );

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    expect(toastStore.show).toHaveBeenCalledWith("rate-limited-45", 5000);
    expect(config.createFollowUpMutate).not.toHaveBeenCalled();
  });

  it("shows generic error on relay failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    expect(toastStore.show).toHaveBeenCalledWith("email-error", 3000);
  });

  it("does not call createFollowUpMutate when relay fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );

    const config = makeConfig({
      getClientPublic: () => "client-pub-b64",
    });
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    expect(config.createFollowUpMutate).not.toHaveBeenCalled();
    expect(mockSealPortalCopy).not.toHaveBeenCalled();
  });

  it("includes portalCopy when getClientPublic returns a key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig({
      getClientPublic: () => "client-pub-b64",
    });
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    expect(mockSealPortalCopy).toHaveBeenCalledWith(
      "client-pub-b64",
      expect.stringContaining('"subject"'),
    );
    const mutate = config.createFollowUpMutate as ReturnType<typeof vi.fn>;
    const args = mutate.mock.calls[0]?.[0] as {
      portalCopy?: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
    };
    expect(args.portalCopy).toEqual({
      ephemeralPoint: "ep-sealed",
      nonce: "n-sealed",
      ciphertext: "ct-sealed",
    });
  });

  it("omits portalCopy when getClientPublic returns null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    const mutate = config.createFollowUpMutate as ReturnType<typeof vi.fn>;
    expect(mutate.mock.calls[0]?.[0]?.portalCopy).toBeUndefined();
  });

  it("toggles sending flag during operation", async () => {
    let resolveFetch!: (v: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((r) => {
            resolveFetch = r;
          }),
      ),
    );

    const config = makeConfig();
    const email = createEmailSend(config);

    expect(email.sending).toBe(false);
    const promise = email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    expect(email.sending).toBe(true);
    resolveFetch({ ok: true, status: 200 } as Response);
    await promise;
    expect(email.sending).toBe(false);
  });

  it("skips send while already sending", async () => {
    let resolveFetch!: (v: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((r) => {
            resolveFetch = r;
          }),
      ),
    );

    const config = makeConfig();
    const email = createEmailSend(config);

    const first = email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    await email.handleEmailSend("Sub2", "<p>Hi2</p>", "Hi2", sampleDoc);

    expect(fetch).toHaveBeenCalledTimes(1);
    resolveFetch({ ok: true, status: 200 } as Response);
    await first;
  });

  it("shows record-error toast when createFollowUpMutate rejects after relay 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const config = makeConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("mutation")),
    });
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    // Post-relay failure shows the record-error toast, not the send-error.
    expect(toastStore.show).toHaveBeenCalledWith("email-record-error", 3000);
    expect(config.onSuccess).not.toHaveBeenCalled();
    // Only one fetch call (the relay), not a retry.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // ── Retry-after-relay-success ──

  it("does not re-POST the relay when retrying after a mutation failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const mutateFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("mutation fail"))
      .mockResolvedValueOnce(undefined);

    const config = makeConfig({ createFollowUpMutate: mutateFn });
    const email = createEmailSend(config);

    // First attempt: relay succeeds, mutation fails.
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(config.onSuccess).not.toHaveBeenCalled();

    // Second attempt (retry): skips relay, retries mutation only.
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    expect(fetch).toHaveBeenCalledTimes(1); // still just 1
    expect(mutateFn).toHaveBeenCalledTimes(2);
    expect(config.onSuccess).toHaveBeenCalledOnce();
  });

  it("clears pending state after successful retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const mutateFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const config = makeConfig({ createFollowUpMutate: mutateFn });
    const email = createEmailSend(config);

    // Fail then succeed the retry.
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    // Third call should go through the full relay path again (new message).
    await email.handleEmailSend("Sub2", "<p>Hi2</p>", "Hi2", sampleDoc);
    expect(fetch).toHaveBeenCalledTimes(2); // original + new
  });

  it("keeps pending state when retry also fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const mutateFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce(undefined);

    const config = makeConfig({ createFollowUpMutate: mutateFn });
    const email = createEmailSend(config);

    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    // Two record-error toasts (one from relayThenRecord, one from retryRecord).
    expect(toastStore.show).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Third retry finally succeeds.
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(config.onSuccess).toHaveBeenCalledOnce();
  });

  it("uses the record-specific toast message, not the send-error message, for post-relay failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const config = makeConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("mutation")),
    });
    const email = createEmailSend(config);
    await email.handleEmailSend("Sub", "<p>Hi</p>", "Hi", sampleDoc);

    expect(toastStore.show).toHaveBeenCalledWith("email-record-error", 3000);
    expect(toastStore.show).not.toHaveBeenCalledWith("email-error", 3000);
  });
});
