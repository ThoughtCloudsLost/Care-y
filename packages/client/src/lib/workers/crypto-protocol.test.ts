/**
 * Type-level tests for the Worker message protocol.
 *
 * These verify that the discriminated unions narrow correctly and that
 * the ResponseForRequest helper maps request types to their response
 * types. All assertions are compile-time (satisfies checks). The
 * runtime tests just confirm the file imports cleanly.
 */

import { describe, it, expect } from "vitest";
import type {
  WorkerRequest,
  WorkerResponse,
  ErrorResponse,
  WorkerRequestType,
  ResponseForRequest,
  InitResponse,
  Argon2idResponse,
  OprfBlindResponse,
  DeriveKeysResponse,
  DecryptContentResponse,
  EncryptContentResponse,
  GetVolPublicResponse,
  UnwrapOrgKeyResponse,
  RewrapTkResponse,
  EvictTkResponse,
  ZeroAllResponse,
  CreateTicketKeyResponse,
} from "./crypto-protocol.js";

describe("crypto-protocol types", () => {
  it("WorkerRequestType covers all request discriminants", () => {
    const allTypes: WorkerRequestType[] = [
      "init",
      "argon2id",
      "oprfBlind",
      "deriveKeys",
      "decryptContent",
      "decryptAndRewrap",
      "rewrapBlob",
      "encryptContent",
      "decryptBlob",
      "evictTk",
      "zeroAll",
      "getVolPublic",
      "unwrapOrgKey",
      "unwrapTk",
      "wrapWithVolPublic",
      "rewrapTk",
      "createTicketKey",
    ];
    expect(allTypes).toHaveLength(17);
  });

  it("ResponseForRequest maps each request type to its response", () => {
    // These are compile-time checks. If the mapping is wrong, tsc fails.
    true satisfies ResponseForRequest<"init"> extends InitResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"argon2id"> extends Argon2idResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"oprfBlind"> extends OprfBlindResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"deriveKeys"> extends DeriveKeysResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"decryptContent"> extends DecryptContentResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"encryptContent"> extends EncryptContentResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"getVolPublic"> extends GetVolPublicResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"unwrapOrgKey"> extends UnwrapOrgKeyResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"rewrapTk"> extends RewrapTkResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"evictTk"> extends EvictTkResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"zeroAll"> extends ZeroAllResponse
      ? true
      : false;
    true satisfies ResponseForRequest<"createTicketKey"> extends CreateTicketKeyResponse
      ? true
      : false;

    expect(true).toBe(true);
  });

  it("WorkerResponse success variant satisfies WorkerSuccessResponse", () => {
    const response: WorkerResponse = { id: 1, ok: true, type: "init" };
    response satisfies WorkerResponse;
    expect(response.ok).toBe(true);
  });

  it("WorkerResponse error variant satisfies ErrorResponse", () => {
    const response: WorkerResponse = {
      id: 1,
      ok: false,
      type: "init",
      error: "test",
      code: "WORKER_ERROR",
    };
    response satisfies ErrorResponse;
    expect(response.ok).toBe(false);
  });

  it("WorkerRequest variants are assignable to the union", () => {
    const request: WorkerRequest = { type: "zeroAll", id: 42 };
    request satisfies WorkerRequest;
    expect(request.id).toBe(42);
  });
});
