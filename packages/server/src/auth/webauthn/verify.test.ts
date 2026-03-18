import { describe, it, expect, beforeAll } from "vitest";
import {
  randomChallenge,
  verifyRegistration,
  verifyAuthentication,
  parseCryptoKey,
} from "./verify.js";
import { toBase64url, parseBase64url, sha256, toBuffer } from "./utils.js";
import { ValidationError } from "../../errors.js";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  CredentialInfo,
  RegistrationChecks,
  AuthenticationChecks,
} from "./types.js";

// ---------------------------------------------------------------------------
// Test fixture helpers
//
// These build syntactically valid WebAuthn responses with real crypto.
// The authenticator data is constructed byte-by-byte per the W3C spec.
// Signatures are computed using Node.js SubtleCrypto so verifySignature()
// sees a real ECDSA verification, not a mock.
// ---------------------------------------------------------------------------

/** Encode an object as base64url JSON (mimics clientDataJSON from the browser). */
function encodeClientData(data: Record<string, unknown>): string {
  return toBase64url(new TextEncoder().encode(JSON.stringify(data)));
}

/** Build authenticator data bytes. */
async function buildAuthData(opts: {
  domain: string;
  flags: number;
  signCount: number;
}): Promise<Uint8Array> {
  const rpIdHash = new Uint8Array(await sha256(toBuffer(opts.domain)));
  const buf = new Uint8Array(37);
  buf.set(rpIdHash, 0);
  buf[32] = opts.flags;
  new DataView(buf.buffer).setUint32(33, opts.signCount, false);
  return buf;
}

/** Export a CryptoKey as base64url-encoded SPKI. */
async function exportKeyAsBase64url(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", key);
  return toBase64url(spki);
}

/**
 * Signs authenticatorData || SHA-256(clientDataJSON) with an ECDSA P-256 key.
 * Returns the signature in ASN.1 DER format (what browsers produce).
 */
async function signAuthData(
  privateKey: CryptoKey,
  authenticatorData: string,
  clientDataJSON: string,
): Promise<string> {
  const authDataBytes = parseBase64url(authenticatorData);
  const clientHash = await sha256(parseBase64url(clientDataJSON));

  // Concatenate: authData || clientHash
  const signedData = new Uint8Array(
    authDataBytes.byteLength + clientHash.byteLength,
  );
  signedData.set(new Uint8Array(authDataBytes), 0);
  signedData.set(new Uint8Array(clientHash), authDataBytes.byteLength);

  // SubtleCrypto ECDSA sign returns raw IEEE P1363 format (R||S, 64 bytes).
  // Real browsers return ASN.1 DER. We need to convert to DER for the test
  // since convertASN1toRaw() expects DER input.
  const rawSig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    signedData,
  );

  const derSig = rawToDER(new Uint8Array(rawSig));
  return toBase64url(derSig);
}

/** Convert raw ECDSA signature (R||S, 64 bytes) to ASN.1 DER. */
function rawToDER(raw: Uint8Array): Uint8Array {
  const r = raw.slice(0, 32);
  const s = raw.slice(32, 64);

  function encodeInteger(bytes: Uint8Array): Uint8Array {
    // If high bit set, prepend 0x00 to indicate positive integer
    const needsPad = (bytes[0] ?? 0) >= 0x80;
    const len = bytes.length + (needsPad ? 1 : 0);
    const result = new Uint8Array(2 + len);
    result[0] = 0x02; // INTEGER tag
    result[1] = len;
    if (needsPad) {
      result[2] = 0x00;
      result.set(bytes, 3);
    } else {
      result.set(bytes, 2);
    }
    return result;
  }

  const rDer = encodeInteger(r);
  const sDer = encodeInteger(s);
  const seqLen = rDer.length + sDer.length;
  const der = new Uint8Array(2 + seqLen);
  der[0] = 0x30; // SEQUENCE tag
  der[1] = seqLen;
  der.set(rDer, 2);
  der.set(sDer, 2 + rDer.length);
  return der;
}

// ---------------------------------------------------------------------------
// Shared test fixtures (generated once per test suite)
// ---------------------------------------------------------------------------

const DOMAIN = "example.com";
const ORIGIN = "https://example.com";

let keyPair: { publicKey: CryptoKey; privateKey: CryptoKey };
let publicKeyBase64url: string;

beforeAll(async () => {
  const generated = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true, // extractable (needed for SPKI export)
    ["sign", "verify"],
  );
  keyPair = generated as { publicKey: CryptoKey; privateKey: CryptoKey };
  publicKeyBase64url = await exportKeyAsBase64url(keyPair.publicKey);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WebAuthn verify", () => {
  describe("randomChallenge", () => {
    it("returns a base64url string", () => {
      const challenge = randomChallenge();
      expect(typeof challenge).toBe("string");
      // 18 bytes -> 24 base64 chars (no padding with base64url)
      expect(challenge.length).toBe(24);
    });

    it("produces unique values across calls", () => {
      const challenges = new Set(Array.from({ length: 20 }, randomChallenge));
      expect(challenges.size).toBe(20);
    });

    it("decodes to 18 bytes (> 128 bits of entropy)", () => {
      const challenge = randomChallenge();
      const bytes = parseBase64url(challenge);
      expect(bytes.byteLength).toBe(18);
    });
  });

  describe("parseCryptoKey", () => {
    it("imports an ES256 SPKI public key", async () => {
      const cryptoKey = await parseCryptoKey("ES256", publicKeyBase64url);
      expect(cryptoKey.type).toBe("public");
      expect(cryptoKey.algorithm).toMatchObject({ name: "ECDSA" });
      expect(cryptoKey.usages).toContain("verify");
    });

    it("rejects invalid base64url as a key import error", async () => {
      // Valid base64url but not a valid SPKI key
      const bogusKey = toBase64url(new Uint8Array(32));
      await expect(parseCryptoKey("ES256", bogusKey)).rejects.toThrow();
    });

    it("throws ValidationError for unsupported algorithm", async () => {
      await expect(
        parseCryptoKey("EdDSA" as never, publicKeyBase64url),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("verifyRegistration", () => {
    /** Build a valid registration response for the shared keypair. */
    async function buildValidRegistration(
      overrides?: Partial<{
        challenge: string;
        origin: string;
        domain: string;
        clientType: string;
        flags: number;
      }>,
    ): Promise<{
      registration: RegistrationResponseJSON;
      checks: RegistrationChecks;
    }> {
      const challenge = overrides?.challenge ?? randomChallenge();
      const origin = overrides?.origin ?? ORIGIN;
      const domain = overrides?.domain ?? DOMAIN;
      const clientType = overrides?.clientType ?? "webauthn.create";
      // UP + UV = 0b00000101 = 5
      const flags = overrides?.flags ?? 5;

      const clientDataJSON = encodeClientData({
        type: clientType,
        challenge,
        origin,
      });

      const authData = await buildAuthData({ domain, flags, signCount: 0 });
      const authenticatorData = toBase64url(authData);

      const registration: RegistrationResponseJSON = {
        id: "test-cred-id",
        rawId: "test-cred-id",
        type: "public-key",
        response: {
          attestationObject: toBase64url(new Uint8Array(0)),
          authenticatorData,
          clientDataJSON,
          publicKey: publicKeyBase64url,
          publicKeyAlgorithm: -7, // ES256
          transports: ["internal"],
        },
      };

      const checks: RegistrationChecks = {
        challenge,
        origin,
        domain,
        userVerified: true,
      };

      return { registration, checks };
    }

    it("succeeds with a valid registration response", async () => {
      const { registration, checks } = await buildValidRegistration();

      const result = await verifyRegistration(registration, checks);

      expect(result.credential.id).toBe("test-cred-id");
      expect(result.credential.publicKey).toBe(publicKeyBase64url);
      expect(result.credential.algorithm).toBe("ES256");
      expect(result.credential.transports).toEqual(["internal"]);
      expect(result.userVerified).toBe(true);
    });

    // ValidationError is isOperational=true: message passes through the tRPC formatter to the client. These strings are wire-format contracts.
    it("rejects when challenge does not match", async () => {
      const { registration, checks } = await buildValidRegistration();
      const badChecks = { ...checks, challenge: "wrong-challenge" };

      await expect(verifyRegistration(registration, badChecks)).rejects.toThrow(
        ValidationError,
      );
      await expect(verifyRegistration(registration, badChecks)).rejects.toThrow(
        "Challenge mismatch",
      );
    });

    it("rejects when origin does not match", async () => {
      const { registration, checks } = await buildValidRegistration();
      const badChecks = { ...checks, origin: "https://evil.com" };

      await expect(verifyRegistration(registration, badChecks)).rejects.toThrow(
        "Origin mismatch",
      );
    });

    it("rejects when RP ID (domain) does not match", async () => {
      const { registration, checks } = await buildValidRegistration();
      const badChecks = { ...checks, domain: "evil.com" };

      await expect(verifyRegistration(registration, badChecks)).rejects.toThrow(
        "RP ID hash mismatch",
      );
    });

    it("rejects when clientData type is not webauthn.create", async () => {
      const { registration, checks } = await buildValidRegistration({
        clientType: "webauthn.get",
      });

      await expect(verifyRegistration(registration, checks)).rejects.toThrow(
        "Unexpected clientData type",
      );
    });

    it("rejects when user verification is required but not satisfied", async () => {
      // flags = 1 (UP only, no UV)
      const { registration, checks } = await buildValidRegistration({
        flags: 1,
      });

      await expect(verifyRegistration(registration, checks)).rejects.toThrow(
        "User verification required",
      );
    });

    it("succeeds when userVerified check is not required", async () => {
      // flags = 1 (UP only), checks don't require UV
      const { registration, checks } = await buildValidRegistration({
        flags: 1,
      });
      const relaxedChecks = { ...checks, userVerified: false };

      const result = await verifyRegistration(registration, relaxedChecks);
      expect(result.userVerified).toBe(false);
    });
  });

  describe("verifyAuthentication", () => {
    /**
     * Build a valid authentication response with a real ECDSA signature.
     * This tests the full crypto pipeline: key import -> signature verify.
     */
    async function buildValidAuthentication(
      overrides?: Partial<{
        challenge: string;
        origin: string;
        domain: string;
        clientType: string;
        flags: number;
        signCount: number;
        credentialId: string;
        expectedCounter: number;
      }>,
    ): Promise<{
      authentication: AuthenticationResponseJSON;
      credential: CredentialInfo;
      checks: AuthenticationChecks;
    }> {
      const challenge = overrides?.challenge ?? randomChallenge();
      const origin = overrides?.origin ?? ORIGIN;
      const domain = overrides?.domain ?? DOMAIN;
      const clientType = overrides?.clientType ?? "webauthn.get";
      // UP + UV = 5
      const flags = overrides?.flags ?? 5;
      const signCount = overrides?.signCount ?? 1;
      const credentialId = overrides?.credentialId ?? "test-cred-id";

      const clientDataJSON = encodeClientData({
        type: clientType,
        challenge,
        origin,
      });

      const authDataBytes = await buildAuthData({
        domain,
        flags,
        signCount,
      });
      const authenticatorData = toBase64url(authDataBytes);

      // Sign with the real private key
      const signature = await signAuthData(
        keyPair.privateKey,
        authenticatorData,
        clientDataJSON,
      );

      const authentication: AuthenticationResponseJSON = {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        authenticatorAttachment: "platform",
        response: {
          clientDataJSON,
          authenticatorData,
          signature,
        },
      };

      const credential: CredentialInfo = {
        id: credentialId,
        publicKey: publicKeyBase64url,
        algorithm: "ES256",
        transports: ["internal"],
      };

      const checks: AuthenticationChecks =
        overrides?.expectedCounter !== undefined
          ? {
              challenge,
              origin,
              domain,
              userVerified: true,
              counter: overrides.expectedCounter,
            }
          : { challenge, origin, domain, userVerified: true };

      return { authentication, credential, checks };
    }

    it("succeeds with a valid authentication response (real ECDSA signature)", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      const result = await verifyAuthentication(
        authentication,
        credential,
        checks,
      );

      expect(result.credentialId).toBe("test-cred-id");
      expect(result.userVerified).toBe(true);
      expect(result.signCount).toBe(1);
      expect(result.authenticatorAttachment).toBe("platform");
    });

    // ValidationError is isOperational=true: message passes through the tRPC formatter to the client. These strings are wire-format contracts.
    it("rejects when credential ID does not match", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      const wrongCredential = { ...credential, id: "different-cred-id" };

      await expect(
        verifyAuthentication(authentication, wrongCredential, checks),
      ).rejects.toThrow("Credential ID mismatch");
    });

    it("rejects an invalid signature (tampered authenticator data)", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      // Tamper with authenticatorData after signing (invalidates the signature)
      const tamperedAuthData = new Uint8Array(
        parseBase64url(authentication.response.authenticatorData),
      );
      tamperedAuthData[0] = (tamperedAuthData[0] ?? 0) ^ 0xff; // flip bits in rpIdHash

      const tampered: AuthenticationResponseJSON = {
        ...authentication,
        response: {
          ...authentication.response,
          authenticatorData: toBase64url(tamperedAuthData),
        },
      };

      // Tampered data will either fail RP ID hash check or signature check.
      // Both produce ValidationError, which is what we want.
      await expect(
        verifyAuthentication(tampered, credential, checks),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects when challenge does not match", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      const badChecks = { ...checks, challenge: "wrong-challenge" };

      await expect(
        verifyAuthentication(authentication, credential, badChecks),
      ).rejects.toThrow("Challenge mismatch");
    });

    it("rejects when origin does not match", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      const badChecks = { ...checks, origin: "https://evil.com" };

      await expect(
        verifyAuthentication(authentication, credential, badChecks),
      ).rejects.toThrow("Origin mismatch");
    });

    it("rejects when RP ID (domain) does not match", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication();

      const badChecks = { ...checks, domain: "evil.com" };

      await expect(
        verifyAuthentication(authentication, credential, badChecks),
      ).rejects.toThrow("RP ID hash mismatch");
    });

    it("rejects when clientData type is not webauthn.get", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication({ clientType: "webauthn.create" });

      await expect(
        verifyAuthentication(authentication, credential, checks),
      ).rejects.toThrow("Unexpected clientData type");
    });

    it("rejects when user presence flag is not set", async () => {
      // flags = 4 (UV only, no UP)
      const { authentication, credential, checks } =
        await buildValidAuthentication({ flags: 4 });

      await expect(
        verifyAuthentication(authentication, credential, checks),
      ).rejects.toThrow("User presence flag not set");
    });

    it("rejects when user verification is required but not satisfied", async () => {
      // flags = 1 (UP only, no UV)
      const { authentication, credential, checks } =
        await buildValidAuthentication({ flags: 1 });

      await expect(
        verifyAuthentication(authentication, credential, checks),
      ).rejects.toThrow("User verification required");
    });

    it("rejects when sign count does not increase (possible cloning)", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication({
          signCount: 5,
          expectedCounter: 5, // same as signCount, not greater
        });

      await expect(
        verifyAuthentication(authentication, credential, checks),
      ).rejects.toThrow("Sign count did not increase");
    });

    it("rejects when sign count is lower than expected (regression)", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication({
          signCount: 3,
          expectedCounter: 10, // authenticator reports 3, but we expected > 10
        });

      await expect(
        verifyAuthentication(authentication, credential, checks),
      ).rejects.toThrow("Sign count did not increase");
    });

    it("succeeds when sign count is greater than expected counter", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication({
          signCount: 11,
          expectedCounter: 10,
        });

      const result = await verifyAuthentication(
        authentication,
        credential,
        checks,
      );
      expect(result.signCount).toBe(11);
    });

    it("skips sign count check when expected counter is undefined", async () => {
      const { authentication, credential, checks } =
        await buildValidAuthentication({
          signCount: 0, // zero is valid when counter tracking is disabled
        });
      // counter defaults to undefined in buildValidAuthentication

      const result = await verifyAuthentication(
        authentication,
        credential,
        checks,
      );
      expect(result.signCount).toBe(0);
    });

    it("succeeds without user verification when not required", async () => {
      // flags = 1 (UP only)
      const { authentication, credential, checks } =
        await buildValidAuthentication({ flags: 1 });
      const relaxedChecks = { ...checks, userVerified: false };

      const result = await verifyAuthentication(
        authentication,
        credential,
        relaxedChecks,
      );
      expect(result.userVerified).toBe(false);
    });
  });
});
