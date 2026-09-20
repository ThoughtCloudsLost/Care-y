// @vitest-environment node
/**
 * Unit tests for demo-keys.ts.
 *
 * Covers determinism of the OPRF scalar and the full derivation
 * pipeline, plus round-trip correctness of the demo OPRF service
 * (blind via @care-y/crypto, evaluate via the per-tag service,
 * finalize, derive keys). The per-tag service derives a working share
 * from the master scalar via deriveTaggedShare, matching production
 * (ADR-091).
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
import { markSodiumReady } from "./sodium-ready.js";
import {
  getSodium,
  oprfBlind,
  oprfFinalize,
  deriveTaggedShare,
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  toRistrettoPoint,
  decode,
  encode,
  type Salt,
} from "@care-y/crypto";
import type { UserId, OrgId, ChannelSecret } from "@care-y/shared";
import {
  volunteerTag,
  channelTag,
} from "../../../../../server/src/crypto/oprf-tags.js";

beforeAll(async () => {
  await _sodium.ready;
  await getSodium();
  // The shims gate every sodium call on the engine's readiness flag;
  // tests own the boot sequence here, so they mark it themselves.
  markSodiumReady();
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
  const userId = "seed-admin" as UserId;

  it("returns a 32-byte ristretto255 point", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const result = deriveDemoVolPublic("TestPassword1234", salt, k, userId);
    expect(result.volPublic).toBeInstanceOf(Uint8Array);
    expect(result.volPublic.length).toBe(32);
  });

  it("is deterministic for the same password, salt, and scalar", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const r1 = deriveDemoVolPublic("TestPassword1234", salt, k, userId);
    const r2 = deriveDemoVolPublic("TestPassword1234", salt, k, userId);
    expect(encode(r1.volPublic)).toBe(encode(r2.volPublic));
  });

  it("produces different results for different passwords", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const r1 = deriveDemoVolPublic("TestPassword1234", salt, k, userId);
    const r2 = deriveDemoVolPublic("DifferentPass123", salt, k, userId);
    expect(encode(r1.volPublic)).not.toBe(encode(r2.volPublic));
  });

  it("produces different keys for different volunteers", () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const r1 = deriveDemoVolPublic("TestPassword1234", salt, k, userId);
    const r2 = deriveDemoVolPublic(
      "TestPassword1234",
      salt,
      k,
      "other-admin" as UserId,
    );
    expect(encode(r1.volPublic)).not.toBe(encode(r2.volPublic));
  });

  // The seeded volPublic must be the key login reproduces. Seeding derives
  // locally while login evaluates through the service, so the two agree only
  // while both use the same per-tag share. This is the guard for that.
  it("matches the key derived through the evaluate service", async () => {
    const salt = _sodium.randombytes_buf(16);
    const k = deriveDemoOprfScalar();
    const seeded = deriveDemoVolPublic("TestPassword1234", salt, k, userId);

    const service = createDemoOprfService(k);
    const stretched = deriveAccountKey(
      new TextEncoder().encode("TestPassword1234"),
      salt as Salt,
    );
    const { blindedElement, blindState } = oprfBlind(stretched);
    const { evaluated } = await service.evaluate({
      kind: "volunteer" as const,
      userId,
      blindedElement: encode(blindedElement),
      ip: "127.0.0.1",
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });
    const oprfOutput = oprfFinalize(
      blindState,
      toRistrettoPoint(decode(evaluated)),
      stretched,
    );
    const volPublic = deriveVolunteerPublicKey(
      deriveVolunteerPrivateKey(deriveMasterKey(oprfOutput)),
    );

    expect(encode(volPublic)).toBe(encode(seeded.volPublic));
  });
});

describe("createDemoOprfService", () => {
  it("evaluate uses per-tag derivation and produces a valid ristretto255 point", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);
    const userId = "test-user" as UserId;

    const stretched = _sodium.randombytes_buf(32);
    const { blindedElement } = oprfBlind(stretched);

    const evalResponse = await service.evaluate({
      userId,
      blindedElement: encode(blindedElement),
      ip: "127.0.0.1",
      kind: "volunteer" as const,
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });

    // Response is base64url (matching real service)
    const evaluatedBytes = decode(evalResponse.evaluated);
    expect(evaluatedBytes.length).toBe(_sodium.crypto_core_ristretto255_BYTES);

    // Verify it matches a manual per-tag evaluation
    const tag = volunteerTag(userId);
    const tagScalar = deriveTaggedShare(k, tag);
    const expectedBytes = _sodium.crypto_scalarmult_ristretto255(
      tagScalar,
      blindedElement,
    );
    expect(encode(evaluatedBytes)).toBe(encode(expectedBytes));
    _sodium.memzero(tagScalar);
    _sodium.memzero(stretched);
  });

  // The account branch re-parses the id to mint the ClientAccountId brand,
  // the same way the real evaluate service does, so this one needs a UUID
  // that actually parses where the volunteer-only tests can pass a short
  // label. Zod checks the version and variant nibbles, so the digits in
  // those two positions are load-bearing rather than decorative.
  const ACCOUNT_CAPABLE_ID = "00000000-0000-4000-8000-00000000000a" as UserId;

  it("different tags produce different evaluations for the same blinded element", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);

    const stretched = _sodium.randombytes_buf(32);
    const { blindedElement } = oprfBlind(stretched);
    const b64Blinded = encode(blindedElement);

    const volResult = await service.evaluate({
      userId: ACCOUNT_CAPABLE_ID,
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      kind: "volunteer" as const,
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });
    const acctResult = await service.evaluate({
      userId: ACCOUNT_CAPABLE_ID,
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      kind: "account" as const,
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });

    expect(volResult.evaluated).not.toBe(acctResult.evaluated);
    _sodium.memzero(stretched);
  });

  it("adminEvaluate behaves identically to evaluate", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);

    const stretched = _sodium.randombytes_buf(32);
    const { blindedElement } = oprfBlind(stretched);
    const b64Blinded = encode(blindedElement);

    const evalResult = await service.evaluate({
      userId: "u1" as UserId,
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      kind: "volunteer" as const,
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });
    const adminResult = await service.adminEvaluate({
      userId: "u1" as UserId,
      blindedElement: b64Blinded,
      ip: "127.0.0.1",
      kind: "volunteer" as const,
      sessionUserId: null,
      twofaVerified: true,
      powChallenge: undefined,
      powSolution: undefined,
    });

    expect(evalResult.evaluated).toBe(adminResult.evaluated);
    _sodium.memzero(stretched);
  });

  it("evaluateChannel derives from the channel tag", async () => {
    const k = deriveDemoOprfScalar();
    const service = createDemoOprfService(k);

    const stretched = _sodium.randombytes_buf(32);
    const { blindedElement } = oprfBlind(stretched);
    const b64Blinded = encode(blindedElement);

    const orgUuid = "00000000-0000-0000-0000-000000000001" as OrgId;
    const channelId = "aabbccdd" as ChannelSecret;

    // Provide a null db since the demo service does not read from it
    const channelResult = await service.evaluateChannel(
      null as unknown as Parameters<typeof service.evaluateChannel>[0],
      {
        channelId,
        blindedElement: b64Blinded,
        ip: "127.0.0.1",
        orgUuid,
      },
    );

    // Verify it matches a manual per-tag evaluation
    const tag = channelTag(orgUuid, channelId);
    const tagScalar = deriveTaggedShare(k, tag);
    const expectedBytes = _sodium.crypto_scalarmult_ristretto255(
      tagScalar,
      blindedElement,
    );
    expect(channelResult.evaluated).toBe(encode(expectedBytes));
    _sodium.memzero(tagScalar);
    _sodium.memzero(stretched);
  });
});
