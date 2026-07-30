// @vitest-environment node
/**
 * Unit tests for demo-keys.ts.
 *
 * Covers determinism of the OPRF scalar and the full derivation
 * pipeline, plus round-trip correctness of the demo OPRF service
 * (blind via @care-y/crypto, evaluate via the service, finalize,
 * derive keys, and verify the result matches direct-pipeline output).
 *
 * Runs in Node (not jsdom) because libsodium's WASM input validation
 * uses `instanceof Uint8Array`, which fails in jsdom when TextEncoder
 * returns a Uint8Array from a different realm.
 */

import { describe, it, expect, beforeAll } from "vitest";
import _sodium from "libsodium-wrappers-sumo";
import {
  deriveDemoOprfScalar,
  deriveDemoVolPublic,
  createDemoOprfService,
} from "./demo-keys.js";
import {
  getSodium,
  oprfBlind,
  oprfFinalize,
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  encode,
  type Salt,
  type RistrettoPoint,
} from "@care-y/crypto";

beforeAll(async () => {
  await _sodium.ready;
  await getSodium();
});

describe("deriveDemoOprfScalar", () => {
  it("returns a 32-byte scalar", () => {
    const k = deriveDemoOprfScalar();
    expect(k).toBeInstanceOf(Uint8Array);
    expect(k.length).toBe(32);
  });

  it("is deterministic (same output on repeated calls)", () => {
    const k1 = deriveDemoOprfScalar();
    const k2 = deriveDemoOprfScalar();
    expect(encode(k1)).toBe(encode(k2));
  });
});

describe("deriveDemoVolPublic", () => {
  it("returns a 32-byte ristretto255 point", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const result = deriveDemoVolPublic("TestPassword1234", salt, k);
    expect(result.volPublic).toBeInstanceOf(Uint8Array);
    expect(result.volPublic.length).toBe(32);
  });

  it("is deterministic for the same password, salt, and scalar", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const r1 = deriveDemoVolPublic("TestPassword1234", salt, k);
    const r2 = deriveDemoVolPublic("TestPassword1234", salt, k);
    expect(encode(r1.volPublic)).toBe(encode(r2.volPublic));
  });

  it("produces different results for different passwords", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const r1 = deriveDemoVolPublic("TestPassword1234", salt, k);
    const r2 = deriveDemoVolPublic("DifferentPass123", salt, k);
    expect(encode(r1.volPublic)).not.toBe(encode(r2.volPublic));
  });
});

describe("createDemoOprfService", () => {
  it("round-trips with oprfBlind/oprfFinalize to produce the same keys as the direct pipeline", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);
    const password = "DemoPassword2026";
    const salt = _sodium.randombytes_buf(16);
    const encoder = new TextEncoder();

    // Direct pipeline (standing in for the server-side seed derivation)
    const directResult = deriveDemoVolPublic(password, salt, k);

    // Service pipeline (mimics the client worker path)
    const passwordBytes = encoder.encode(password);
    const stretched = deriveAccountKey(passwordBytes, salt as Salt);
    const { blindedElement, blindState } = oprfBlind(stretched);

    // Evaluate via the service (base64url round-trip)
    const evalResponse = await service.evaluate({
      userId: "test-user",
      blindedElement: encode(blindedElement),
      ip: "127.0.0.1",
      sessionUserId: null,
      powChallenge: undefined,
      powSolution: undefined,
    });

    // Decode the evaluated element back from STANDARD base64 (the
    // service mirrors the real oprf-evaluate-service's Buffer encoding,
    // which the client reads with decodeStandardBase64)
    const evaluatedBytes = new Uint8Array(
      Buffer.from(evalResponse.evaluated, "base64"),
    );

    // Finalize and derive keys
    const oprfOutput = oprfFinalize(
      blindState,
      evaluatedBytes as RistrettoPoint,
      stretched,
    );
    const masterKey = deriveMasterKey(oprfOutput);
    const volPrivate = deriveVolunteerPrivateKey(masterKey);
    const volPublic = deriveVolunteerPublicKey(volPrivate);

    // The service path must produce the same volPublic as the direct pipeline
    expect(encode(volPublic)).toBe(encode(directResult.volPublic));

    // Cleanup
    _sodium.memzero(stretched);
    _sodium.memzero(oprfOutput);
    _sodium.memzero(masterKey);
    _sodium.memzero(volPrivate);
    _sodium.memzero(passwordBytes);
  });

  it("adminEvaluate behaves identically to evaluate", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);

    const stretched = _sodium.randombytes_buf(32);
    const { blindedElement } = oprfBlind(stretched);
    const b64Blinded = encode(blindedElement);

    const evalResult = await service.evaluate({
      userId: "u1",
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      sessionUserId: null,
      powChallenge: undefined,
      powSolution: undefined,
    });
    const adminResult = await service.adminEvaluate({
      userId: "u1",
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      sessionUserId: null,
      powChallenge: undefined,
      powSolution: undefined,
    });

    expect(evalResult.evaluated).toBe(adminResult.evaluated);
  });
});
