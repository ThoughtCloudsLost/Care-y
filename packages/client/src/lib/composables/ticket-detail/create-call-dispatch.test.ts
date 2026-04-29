import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCallDispatch,
  type CallDispatchConfig,
} from "./create-call-dispatch.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_call_error: () => "call-error",
}));
vi.mock("$lib/stores/call.svelte.js", () => ({
  callStore: { start: vi.fn() },
}));
vi.mock("$lib/errors.js", () => {
  class RelayError extends Error {
    constructor(
      public code: string,
      public status: number,
    ) {
      super(`${code}: ${status}`);
    }
  }
  return { RelayError };
});

function makeConfig(
  overrides?: Partial<CallDispatchConfig>,
): CallDispatchConfig {
  return {
    getTicketId: () => "t-1",
    cryptoBridge: {
      orgDecrypt: vi.fn().mockResolvedValue("+15550001234"),
    } as unknown as CallDispatchConfig["cryptoBridge"],
    getEncryptedPhone: () => null,
    ...overrides,
  };
}

describe("createCallDispatch", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const { callStore } = await import("$lib/stores/call.svelte.js");
    vi.mocked(callStore.start).mockClear();
  });

  it("posts to /relay/call and starts call on PSTN response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ method: "pstn", callSid: "CA-123" }),
      }),
    );

    const { callStore } = await import("$lib/stores/call.svelte.js");
    const dispatch = createCallDispatch(makeConfig());
    await dispatch.executeCall();

    expect(fetch).toHaveBeenCalledWith(
      "/relay/call",
      expect.objectContaining({ method: "POST" }),
    );
    expect(callStore.start).toHaveBeenCalledWith({
      ticketId: "t-1",
      callSid: "CA-123",
    });
  });

  it("handles WebRTC response with token fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ method: "webrtc" }),
        })
        .mockResolvedValueOnce({ ok: true }),
    );

    const { callStore } = await import("$lib/stores/call.svelte.js");
    const dispatch = createCallDispatch(makeConfig());
    await dispatch.executeCall();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(
      "/relay/webrtc-token",
      expect.objectContaining({ method: "POST" }),
    );
    expect(callStore.start).toHaveBeenCalledWith({
      ticketId: "t-1",
      callSid: "webrtc",
    });
  });

  it("decrypts consultant phone when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ method: "pstn", callSid: "CA-456" }),
      }),
    );

    const config = makeConfig({
      getEncryptedPhone: () => "encrypted-phone-base64",
    });
    const dispatch = createCallDispatch(config);
    await dispatch.executeCall();

    expect(config.cryptoBridge.orgDecrypt).toHaveBeenCalledWith(
      "encrypted-phone-base64",
    );
    const fetchBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(fetchBody.consultantPhone).toBe("+15550001234");
  });

  it("shows error toast on relay failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const dispatch = createCallDispatch(makeConfig());
    await dispatch.executeCall();

    expect(toastStore.show).toHaveBeenCalledWith("call-error", 3000);
  });

  it("toggles inProgress flag during operation", async () => {
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

    const dispatch = createCallDispatch(makeConfig());

    expect(dispatch.inProgress).toBe(false);
    const promise = dispatch.executeCall();
    expect(dispatch.inProgress).toBe(true);
    resolveFetch({
      ok: true,
      json: async () => ({ method: "pstn" }),
    } as unknown as Response);
    await promise;
    expect(dispatch.inProgress).toBe(false);
  });

  it("does not start call when PSTN response has no callSid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ method: "pstn" }),
      }),
    );

    const { callStore } = await import("$lib/stores/call.svelte.js");
    const dispatch = createCallDispatch(makeConfig());
    await dispatch.executeCall();

    expect(callStore.start).not.toHaveBeenCalled();
  });
});
