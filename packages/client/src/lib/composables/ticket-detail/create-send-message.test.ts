import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSendMessage,
  type SendMessageConfig,
} from "./create-send-message.svelte.js";
import { CryptoWorkerError } from "$lib/workers/crypto-bridge-errors.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_reply_error_encrypt: () => "encrypt-error",
  ticket_reply_error_send: () => "send-error",
}));
vi.mock("$lib/utils/mentions.js", () => ({
  extractMentions: (text: string) =>
    text.includes("@") ? [text.split("@")[1]!.split(" ")[0]!] : [],
}));
vi.mock("$lib/query/keys.js", () => ({
  ticketKeys: {
    followUpsInitial: (id: string) => ["ticket", id, "followUps", "initial"],
    followUps: (id: string) => ["ticket", id, "followUps"],
  },
}));

vi.mock("$lib/workers/crypto-bridge-errors.js", () => ({
  CryptoWorkerError: class MockCryptoWorkerError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

interface FakeEntry {
  id: string;
  ticketId: string;
}

function makeConfig(
  overrides?: Partial<SendMessageConfig<FakeEntry>>,
): SendMessageConfig<FakeEntry> {
  return {
    getTicketId: () => "t-1",
    getCurrentUserId: () => "u-1",
    getDraftText: () => "hello world",
    setDraftText: vi.fn(),
    cryptoBridge: {
      encrypt: vi.fn().mockResolvedValue("enc-base64"),
      encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    } as unknown as SendMessageConfig<FakeEntry>["cryptoBridge"],
    followUpCache: {
      seed: vi.fn(),
      deleteByPrefix: vi.fn(),
    } as unknown as SendMessageConfig<FakeEntry>["followUpCache"],
    queryClient: {
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as SendMessageConfig<FakeEntry>["queryClient"],
    buildPendingEntry: ({ pendingId, ticketId }) => ({
      id: pendingId,
      ticketId,
    }),
    createFollowUpMutate: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createSendMessage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-1" });
  });

  it("encrypts text, seeds cache, calls mutation, and invalidates", async () => {
    const config = makeConfig();
    const msg = createSendMessage(config);
    await msg.handleSend();

    expect(config.cryptoBridge.encrypt).toHaveBeenCalledWith(
      "t-1",
      expect.stringMatching(/^followup:/),
      "hello world",
    );
    expect(config.setDraftText).toHaveBeenCalledWith("");
    expect(config.followUpCache.seed).toHaveBeenCalledWith(
      "pending-uuid-1",
      "hello world",
    );
    expect(config.createFollowUpMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-1",
        encryptedContent: "enc-base64",
        source: "volunteer",
        type: "message",
      }),
    );
    expect(config.queryClient.invalidateQueries).toHaveBeenCalled();
  });

  it("passes computed mentions to buildPendingEntry", async () => {
    const buildPendingEntry = vi.fn(({ pendingId, ticketId }) => ({
      id: pendingId,
      ticketId,
    }));
    const config = makeConfig({
      getDraftText: () => "cc @Alice",
      buildPendingEntry,
    });
    const msg = createSendMessage(config);
    await msg.handleSend();

    expect(buildPendingEntry).toHaveBeenCalledWith(
      expect.objectContaining({ mentionedPseudonyms: ["Alice"] }),
    );
  });

  it("skips send when text is empty", async () => {
    const config = makeConfig({ getDraftText: () => "   " });
    const msg = createSendMessage(config);
    await msg.handleSend();

    expect(config.cryptoBridge.encrypt).not.toHaveBeenCalled();
  });

  it("skips send when already sending (double-tap guard)", async () => {
    let resolveEncrypt!: (v: string) => void;
    const config = makeConfig({
      cryptoBridge: {
        encrypt: vi.fn(
          () =>
            new Promise<string>((r) => {
              resolveEncrypt = r;
            }),
        ),
        encryptText: vi.fn().mockResolvedValue("encrypted-text"),
      } as unknown as SendMessageConfig<FakeEntry>["cryptoBridge"],
    });
    const msg = createSendMessage(config);

    const first = msg.handleSend();
    const second = msg.handleSend();

    resolveEncrypt("enc-base64");
    await first;
    await second;

    expect(config.cryptoBridge.encrypt).toHaveBeenCalledTimes(1);
  });

  it("rolls back on mutation failure and restores draft", async () => {
    const setDraftText = vi.fn();
    let draftCleared = false;
    const config = makeConfig({
      setDraftText: (v: string) => {
        setDraftText(v);
        if (v === "") draftCleared = true;
      },
      getDraftText: () => (draftCleared ? "" : "hello world"),
      createFollowUpMutate: vi.fn().mockRejectedValue(new Error("net")),
    });
    const msg = createSendMessage(config);

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    await msg.handleSend();

    expect(config.followUpCache.deleteByPrefix).toHaveBeenCalledWith(
      "pending-uuid-1",
    );
    expect(setDraftText).toHaveBeenLastCalledWith("hello world");
    expect(toastStore.show).toHaveBeenCalledWith("send-error", 3000);
  });

  it("shows encrypt error for CryptoWorkerError with TK_NOT_CACHED code", async () => {
    const config = makeConfig({
      cryptoBridge: {
        encrypt: vi
          .fn()
          .mockRejectedValue(new CryptoWorkerError("no tk", "TK_NOT_CACHED")),
        encryptText: vi.fn().mockResolvedValue("encrypted-text"),
      } as unknown as SendMessageConfig<FakeEntry>["cryptoBridge"],
    });
    const msg = createSendMessage(config);

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    await msg.handleSend();

    expect(toastStore.show).toHaveBeenCalledWith("encrypt-error", 3000);
  });

  it("shows encrypt error for CryptoWorkerError with ENCRYPT_FAILED code", async () => {
    const config = makeConfig({
      cryptoBridge: {
        encrypt: vi
          .fn()
          .mockRejectedValue(new CryptoWorkerError("bad", "ENCRYPT_FAILED")),
        encryptText: vi.fn().mockResolvedValue("encrypted-text"),
      } as unknown as SendMessageConfig<FakeEntry>["cryptoBridge"],
    });
    const msg = createSendMessage(config);

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    await msg.handleSend();

    expect(toastStore.show).toHaveBeenCalledWith("encrypt-error", 3000);
  });

  it("toggles sending flag during operation", async () => {
    let resolveEncrypt!: (v: string) => void;
    const config = makeConfig({
      cryptoBridge: {
        encrypt: vi.fn(
          () =>
            new Promise<string>((r) => {
              resolveEncrypt = r;
            }),
        ),
        encryptText: vi.fn().mockResolvedValue("encrypted-text"),
      } as unknown as SendMessageConfig<FakeEntry>["cryptoBridge"],
    });
    const msg = createSendMessage(config);

    expect(msg.sending).toBe(false);
    const promise = msg.handleSend();
    expect(msg.sending).toBe(true);
    resolveEncrypt("enc-base64");
    await promise;
    expect(msg.sending).toBe(false);
  });
});
