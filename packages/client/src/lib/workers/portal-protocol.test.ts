/**
 * Type-level tests for the portal Worker message protocol.
 *
 * These verify that the discriminated unions narrow correctly and that
 * PortalResponseForRequest maps request types to their response types.
 * All assertions are compile-time (satisfies checks). The runtime tests
 * confirm the file imports cleanly.
 */

import { describe, it, expect } from "vitest";
import type {
  PortalWorkerResponse,
  PortalErrorResponse,
  PortalWorkerRequestType,
  PortalResponseForRequest,
  PortalInitResponse,
  ChannelSessionStartResponse,
  ChannelSessionRestartResponse,
  ChannelSessionFinishResponse,
  VerifyKeyCheckResponse,
  DecryptMessageResponse,
  EncryptReplyResponse,
  DecryptAttachmentKeyResponse,
  DecryptAttachmentBlobResponse,
  AccountSessionStartResponse,
  AccountSessionFinishResponse,
  PortalZeroAllResponse,
} from "./portal-protocol.js";

describe("portal-protocol types", () => {
  it("PortalWorkerRequestType covers all request discriminants", () => {
    const allTypes: PortalWorkerRequestType[] = [
      "init",
      "channelSessionStart",
      "channelSessionRestart",
      "channelSessionFinish",
      "verifyKeyCheck",
      "decryptMessage",
      "encryptReply",
      "decryptAttachmentKey",
      "decryptAttachmentBlob",
      "accountSessionStart",
      "accountSessionFinish",
      "zeroAll",
    ];
    expect(allTypes).toHaveLength(12);
  });

  it("PortalResponseForRequest maps each type correctly (compile-time)", () => {
    // These are compile-time assertions: if any mapping is wrong,
    // TypeScript will flag a type error.
    const _init: PortalResponseForRequest<"init"> = {} as PortalInitResponse;
    const _channelStart: PortalResponseForRequest<"channelSessionStart"> =
      {} as ChannelSessionStartResponse;
    const _channelRestart: PortalResponseForRequest<"channelSessionRestart"> =
      {} as ChannelSessionRestartResponse;
    const _channelFinish: PortalResponseForRequest<"channelSessionFinish"> =
      {} as ChannelSessionFinishResponse;
    const _keyCheck: PortalResponseForRequest<"verifyKeyCheck"> =
      {} as VerifyKeyCheckResponse;
    const _decrypt: PortalResponseForRequest<"decryptMessage"> =
      {} as DecryptMessageResponse;
    const _encrypt: PortalResponseForRequest<"encryptReply"> =
      {} as EncryptReplyResponse;
    const _attKey: PortalResponseForRequest<"decryptAttachmentKey"> =
      {} as DecryptAttachmentKeyResponse;
    const _attBlob: PortalResponseForRequest<"decryptAttachmentBlob"> =
      {} as DecryptAttachmentBlobResponse;
    const _accStart: PortalResponseForRequest<"accountSessionStart"> =
      {} as AccountSessionStartResponse;
    const _accFinish: PortalResponseForRequest<"accountSessionFinish"> =
      {} as AccountSessionFinishResponse;
    const _zero: PortalResponseForRequest<"zeroAll"> =
      {} as PortalZeroAllResponse;

    // Suppress unused variable warnings
    void [
      _init,
      _channelStart,
      _channelRestart,
      _channelFinish,
      _keyCheck,
      _decrypt,
      _encrypt,
      _attKey,
      _attBlob,
      _accStart,
      _accFinish,
      _zero,
    ];

    expect(true).toBe(true);
  });

  it("ErrorResponse carries type and code", () => {
    const error: PortalErrorResponse = {
      id: 1,
      ok: false,
      type: "decryptMessage",
      error: "Not ready",
      code: "NOT_READY",
    };
    expect(error.ok).toBe(false);
    expect(error.code).toBe("NOT_READY");
  });

  it("PortalWorkerResponse discriminates ok field", () => {
    const success: PortalWorkerResponse = {
      id: 1,
      ok: true,
      type: "init",
    };
    const failure: PortalWorkerResponse = {
      id: 2,
      ok: false,
      type: "init",
      error: "Failed",
      code: "WORKER_ERROR",
    };

    expect(success.ok).toBe(true);
    expect(success.type).toBe("init");
    expect(failure.ok).toBe(false);
    expect(failure.error).toBe("Failed");
  });
});
