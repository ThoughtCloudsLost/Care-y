import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  relayThenRecord,
  retryRecord,
  type RelayThenRecordConfig,
  type PendingRecord,
  type RetryRecordConfig,
} from "./relay-then-record.js";
import { RateLimitError, RelayError } from "$lib/errors.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as SealModule from "$lib/crypto/seal-portal-copy.js";
import type * as QueryKeys from "$lib/query/keys.js";

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

function makeConfig(
  overrides?: Partial<RelayThenRecordConfig>,
): RelayThenRecordConfig {
  return {
    ticketId: "t-1",
    cryptoBridge: {
      encrypt: vi.fn().mockResolvedValue("enc-base64"),
    } as unknown as RelayThenRecordConfig["cryptoBridge"],
    queryClient: {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as RelayThenRecordConfig["queryClient"],
    getClientPublic: () => null,
    createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
    onSuccess: vi.fn(),
    relayUrl: "/relay/sms",
    relayBody: { ticketId: "t-1", body: "hello" },
    followUpType: "sms_outbound",
    plaintext: "hello",
    errorRecordMessage: "record-error",
    ...overrides,
  };
}

describe("relayThenRecord", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSealPortalCopy.mockClear();
  });

  it("returns ok on full success and calls onSuccess", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    const result = await relayThenRecord(config);

    expect(result.status).toBe("ok");
    expect(config.onSuccess).toHaveBeenCalledOnce();
    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-1",
        type: "sms_outbound",
        source: "volunteer",
      }),
    );
  });

  it("throws RateLimitError on 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "60" }),
      }),
    );

    const config = makeConfig();
    await expect(relayThenRecord(config)).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });

  it("throws RelayError on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );

    const config = makeConfig();
    await expect(relayThenRecord(config)).rejects.toBeInstanceOf(RelayError);
  });

  it("returns record_pending when mutation fails after relay 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const config = makeConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("db down")),
    });
    const result = await relayThenRecord(config);

    expect(result.status).toBe("record_pending");
    if (result.status === "record_pending") {
      expect(result.pending.ticketId).toBe("t-1");
      expect(result.pending.encryptedContent).toBe("enc-base64");
      expect(result.pending.followUpType).toBe("sms_outbound");
    }
    expect(toastStore.show).toHaveBeenCalledWith("record-error", 3000);
    expect(config.onSuccess).not.toHaveBeenCalled();
  });

  it("invalidates follow-up and read-state caches on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig();
    await relayThenRecord(config);

    expect(config.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-1", "followUps"],
    });
  });

  it("does not invalidate caches when mutation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );

    const config = makeConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("fail")),
    });
    await relayThenRecord(config);

    expect(config.queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});

describe("retryRecord", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const pending: PendingRecord = {
    followUpId: "fu-1",
    ticketId: "t-1",
    encryptedContent: "enc-base64",
    portalCopy: undefined,
    followUpType: "sms_outbound",
  };

  function makeRetryConfig(
    overrides?: Partial<RetryRecordConfig>,
  ): RetryRecordConfig {
    return {
      queryClient: {
        invalidateQueries: vi.fn().mockResolvedValue(undefined),
      } as unknown as RetryRecordConfig["queryClient"],
      createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
      onSuccess: vi.fn(),
      errorRecordMessage: "record-error",
      ...overrides,
    };
  }

  it("returns true and calls onSuccess when mutation lands", async () => {
    const config = makeRetryConfig();
    const result = await retryRecord(pending, config);

    expect(result).toBe(true);
    expect(config.onSuccess).toHaveBeenCalledOnce();
    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "fu-1",
        ticketId: "t-1",
        encryptedContent: "enc-base64",
      }),
    );
  });

  it("returns false and shows toast when mutation fails again", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const config = makeRetryConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("still down")),
    });
    const result = await retryRecord(pending, config);

    expect(result).toBe(false);
    expect(config.onSuccess).not.toHaveBeenCalled();
    expect(toastStore.show).toHaveBeenCalledWith("record-error", 3000);
  });

  it("does not call fetch (no relay re-POST)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const config = makeRetryConfig();
    await retryRecord(pending, config);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("invalidates caches on success", async () => {
    const config = makeRetryConfig();
    await retryRecord(pending, config);

    expect(config.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-1", "followUps"],
    });
  });

  it("does not invalidate caches on failure", async () => {
    const config = makeRetryConfig({
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("fail")),
    });
    await retryRecord(pending, config);

    expect(config.queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("passes portalCopy through to the mutation", async () => {
    const withPortal: PendingRecord = {
      ...pending,
      portalCopy: {
        ephemeralPoint: "ep",
        nonce: "n",
        ciphertext: "ct",
      },
    };
    const config = makeRetryConfig();
    await retryRecord(withPortal, config);

    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        portalCopy: { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
      }),
    );
  });
});
