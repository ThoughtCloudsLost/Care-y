import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSmsSend, type SmsSendConfig } from "./create-sms-send.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_sms_rate_limited: ({ seconds }: { seconds: string }) =>
    `rate-limited-${seconds}`,
  ticket_sms_error_send: () => "sms-error",
}));
vi.mock("$lib/query/keys.js", () => ({
  ticketKeys: {
    followUps: (id: string) => ["ticket", id, "followUps"],
  },
}));
vi.mock("$lib/errors.js", () => {
  class RateLimitError extends Error {
    retryAfterSeconds: number;
    constructor(seconds: number) {
      super("rate limited");
      this.retryAfterSeconds = seconds;
    }
  }
  class RelayError extends Error {
    constructor(
      public code: string,
      public status: number,
    ) {
      super(`${code}: ${status}`);
    }
  }
  return { RateLimitError, RelayError };
});

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
    createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("createSmsSend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
});
