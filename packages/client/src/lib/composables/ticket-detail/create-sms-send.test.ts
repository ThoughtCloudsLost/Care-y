import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSmsSend, type SmsSendConfig } from "./create-sms-send.svelte.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as QueryKeys from "$lib/query/keys.js";
import type * as SealModule from "$lib/crypto/seal-portal-copy.js";

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

// vi.mock required: toast store is a $state rune module; the test asserts on
// the show spy. Stub covers the full toastStore surface via satisfies.
vi.mock(
  "$lib/stores/toast.svelte.js",
  () =>
    ({
      toastStore: { current: null, show: vi.fn(), dismiss: vi.fn() },
    }) satisfies typeof ToastModule,
);
// Overrides return key-shaped strings the assertions match; the spread keeps
// every other message real so the mock cannot drift from the module surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  ticket_sms_rate_limited: ({ seconds }: { seconds: string }) =>
    `rate-limited-${seconds}`,
  ticket_sms_error_send: () => "sms-error",
  ticket_sms_error_record: () => "sms-record-error",
}));
vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof QueryKeys>()),
  ticketKeys: {
    followUps: (id: string) => ["ticket", id, "followUps"],
  },
  ticketsKeys: {
    readStates: () => ["tickets", "readState"],
    readStateSweep: () => ["tickets", "readStateSweep"],
  },
}));

function makeConfig(overrides?: Partial<SmsSendConfig>): SmsSendConfig {
  return {
    getTicketId: () => "t-1",
    cryptoBridge: {
      encrypt: vi.fn().mockResolvedValue("enc-base64"),
      encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    } as unknown as SmsSendConfig["cryptoBridge"],
    queryClient: {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as SmsSendConfig["queryClient"],
    getClientPublic: () => null,
    createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("createSmsSend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // restoreAllMocks does not clear vi.fn() mocks from vi.mock factories
    // (toastStore.show), and the retry tests assert absolute call counts.
    vi.clearAllMocks();
    mockSealPortalCopy.mockClear();
  });

  it("sends SMS via relay, encrypts, creates follow-up, and calls onSuccess", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hi there");

    expect(fetch).toHaveBeenCalledWith(
      "/relay/sms",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(config.cryptoBridge.encrypt).toHaveBeenCalledWith(
      "t-1",
      expect.stringMatching(/^followup:/),
      "hi there",
    );
    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-1",
        type: "sms_outbound",
      }),
    );
    expect(config.onSuccess).toHaveBeenCalledOnce();
    // The outbound SMS is a volunteer follow-up: the list's read-state
    // families refetch alongside the detail's follow-ups.
    expect(config.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-1", "followUps"],
    });
    expect(config.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets", "readState"],
    });
    expect(config.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets", "readStateSweep"],
    });
  });

  it("skips send when body is empty", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("   ");

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
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

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
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

    expect(toastStore.show).toHaveBeenCalledWith("sms-error", 3000);
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
    const sms = createSmsSend(config);

    expect(sms.sending).toBe(false);
    const promise = sms.handleSmsSend("hello");
    expect(sms.sending).toBe(true);
    resolveFetch({ ok: true, status: 200 } as Response);
    await promise;
    expect(sms.sending).toBe(false);
  });

  it("defaults to 30 seconds when 429 has no Retry-After header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(),
      }),
    );

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

    expect(toastStore.show).toHaveBeenCalledWith("rate-limited-30", 5000);
    expect(config.createFollowUpMutate).not.toHaveBeenCalled();
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
    const sms = createSmsSend(config);

    const first = sms.handleSmsSend("first");
    // second call while sending should bail out
    await sms.handleSmsSend("second");

    expect(fetch).toHaveBeenCalledTimes(1);
    resolveFetch({ ok: true, status: 200 } as Response);
    await first;
  });

  it("resets sending to false after error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

    expect(sms.sending).toBe(false);
  });

  it("trims whitespace from body before relay and encrypt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("  padded message  ");

    const fetchBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string,
    ) as { body: string };
    expect(fetchBody.body).toBe("padded message");
    expect(config.cryptoBridge.encrypt).toHaveBeenCalledWith(
      "t-1",
      expect.stringMatching(/^followup:/),
      "padded message",
    );
  });

  it("passes sms_outbound type and volunteer source in follow-up mutation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("check fields");

    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "volunteer",
        type: "sms_outbound",
        isPrivate: false,
        mentionedPseudonyms: [],
      }),
    );
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
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

    expect(toastStore.show).toHaveBeenCalledWith("sms-record-error", 3000);
    expect(config.onSuccess).not.toHaveBeenCalled();
  });

  it("includes portalCopy when getClientPublic returns a key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig({
      getClientPublic: () => "client-pub-b64",
    });
    const sms = createSmsSend(config);
    await sms.handleSmsSend("portal test");

    expect(mockSealPortalCopy).toHaveBeenCalledWith(
      "client-pub-b64",
      "portal test",
    );
    const mutate = config.createFollowUpMutate as ReturnType<typeof vi.fn>;
    const args = mutate.mock.calls[0]?.[0] as {
      portalCopy?: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
      encryptedContent: string;
    };
    expect(args.portalCopy).toEqual({
      ephemeralPoint: "ep-sealed",
      nonce: "n-sealed",
      ciphertext: "ct-sealed",
    });
    // The portal copy is distinct from the org-encrypted content.
    expect(args.portalCopy?.ciphertext).not.toBe(args.encryptedContent);
  });

  it("omits portalCopy when getClientPublic returns null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const sms = createSmsSend(config);
    await sms.handleSmsSend("no portal");

    const mutate = config.createFollowUpMutate as ReturnType<typeof vi.fn>;
    expect(mutate.mock.calls[0]?.[0]?.portalCopy).toBeUndefined();
  });

  it("does not call createFollowUpMutate when relay fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );

    const config = makeConfig({
      getClientPublic: () => "client-pub-b64",
    });
    const sms = createSmsSend(config);
    await sms.handleSmsSend("will fail");

    expect(config.createFollowUpMutate).not.toHaveBeenCalled();
    expect(mockSealPortalCopy).not.toHaveBeenCalled();
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
    const sms = createSmsSend(config);

    // First attempt: relay succeeds, mutation fails.
    await sms.handleSmsSend("hello");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(config.onSuccess).not.toHaveBeenCalled();

    // Second attempt (retry): skips relay, retries mutation only.
    await sms.handleSmsSend("hello");
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
    const sms = createSmsSend(config);

    // Fail then succeed the retry.
    await sms.handleSmsSend("msg1");
    await sms.handleSmsSend("msg1");

    // Third call should go through the full relay path again (new message).
    await sms.handleSmsSend("msg2");
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
    const sms = createSmsSend(config);

    await sms.handleSmsSend("hello");
    await sms.handleSmsSend("hello");
    // Two record-error toasts (one from relayThenRecord, one from retryRecord).
    expect(toastStore.show).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Third retry finally succeeds.
    await sms.handleSmsSend("hello");
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
    const sms = createSmsSend(config);
    await sms.handleSmsSend("hello");

    // The toast says "record-error", not "sms-error".
    expect(toastStore.show).toHaveBeenCalledWith("sms-record-error", 3000);
    expect(toastStore.show).not.toHaveBeenCalledWith("sms-error", 3000);
  });
});
