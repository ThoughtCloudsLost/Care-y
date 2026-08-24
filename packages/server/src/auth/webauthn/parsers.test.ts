import { describe, it, expect } from "vitest";
import {
  parseClient,
  parseAuthenticator,
  getAlgoName,
  toRegistrationResult,
  toAuthenticationResult,
} from "./parsers.js";
import { toBase64url, sha256, toBuffer } from "./utils.js";
import { ValidationError } from "../../errors.js";
import type {
  AuthenticatorParsed,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "./types.js";
import type { WebauthnCredentialId } from "@care-y/shared";

const cid = (s: string): WebauthnCredentialId => s as WebauthnCredentialId;

// --- Helpers ---

/** Encodes a clientDataJSON object as base64url (mimics browser behavior). */
function encodeClientData(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  return toBase64url(new TextEncoder().encode(json));
}

/**
 * Builds a minimal authenticator data buffer.
 *
 * Format: 32 bytes rpIdHash | 1 byte flags | 4 bytes signCount | optional 16 bytes AAGUID + more
 */
async function buildAuthenticatorData(opts: {
  domain: string;
  flags: number;
  signCount: number;
  includeAaguid?: boolean;
  aaguidBytes?: Uint8Array;
}): Promise<string> {
  const rpIdHash = new Uint8Array(await sha256(toBuffer(opts.domain)));

  const flagsByte = new Uint8Array([opts.flags]);

  const signCountBuf = new ArrayBuffer(4);
  new DataView(signCountBuf).setUint32(0, opts.signCount, false); // big-endian

  let data: Uint8Array;
  if (opts.includeAaguid) {
    const aaguid = opts.aaguidBytes ?? new Uint8Array(16); // all zeros default
    // Need at least 53 bytes: 32 + 1 + 4 + 16
    data = new Uint8Array(53);
    data.set(rpIdHash, 0);
    data.set(flagsByte, 32);
    data.set(new Uint8Array(signCountBuf), 33);
    data.set(aaguid, 37);
  } else {
    // Minimal 37 bytes (no attested credential data)
    data = new Uint8Array(37);
    data.set(rpIdHash, 0);
    data.set(flagsByte, 32);
    data.set(new Uint8Array(signCountBuf), 33);
  }

  return toBase64url(data);
}

describe("WebAuthn parsers", () => {
  describe("parseClient", () => {
    it("parses base64url-encoded clientDataJSON", () => {
      const encoded = encodeClientData({
        type: "webauthn.create",
        challenge: "abc123",
        origin: "https://example.com",
      });

      const result = parseClient(encoded);

      expect(result.type).toBe("webauthn.create");
      expect(result.challenge).toBe("abc123");
      expect(result.origin).toBe("https://example.com");
    });

    it("parses ArrayBuffer input directly", () => {
      const json = JSON.stringify({
        type: "webauthn.get",
        challenge: "xyz",
        origin: "https://test.com",
      });
      const buffer = new TextEncoder().encode(json).buffer;

      const result = parseClient(buffer);

      expect(result.type).toBe("webauthn.get");
      expect(result.challenge).toBe("xyz");
    });

    it("preserves optional fields (crossOrigin, topOrigin)", () => {
      const encoded = encodeClientData({
        type: "webauthn.create",
        challenge: "c",
        origin: "https://a.com",
        crossOrigin: true,
        topOrigin: "https://b.com",
      });

      const result = parseClient(encoded);

      expect(result.crossOrigin).toBe(true);
      expect(result.topOrigin).toBe("https://b.com");
    });
  });

  describe("parseAuthenticator", () => {
    it("extracts rpIdHash, flags, and signCount from minimal 37-byte data", async () => {
      const authData = await buildAuthenticatorData({
        domain: "example.com",
        flags: 0b00000101, // userPresent + userVerified
        signCount: 42,
      });

      const result = parseAuthenticator(authData);

      // rpIdHash should match SHA-256 of the domain
      const expectedHash = toBase64url(await sha256(toBuffer("example.com")));
      expect(result.rpIdHash).toBe(expectedHash);
      expect(result.flags.userPresent).toBe(true);
      expect(result.flags.userVerified).toBe(true);
      expect(result.flags.backupEligibility).toBe(false);
      expect(result.flags.backupState).toBe(false);
      expect(result.flags.attestedData).toBe(false);
      expect(result.flags.extensionsIncluded).toBe(false);
      expect(result.signCount).toBe(42);
    });

    it("parses all flag bits correctly", async () => {
      // Set all flags: UP(1) | UV(4) | BE(8) | BS(16) | AT(64) | ED(128) = 0b11011101 = 221
      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 0b11011101,
        signCount: 0,
      });

      const result = parseAuthenticator(authData);

      expect(result.flags.userPresent).toBe(true);
      expect(result.flags.userVerified).toBe(true);
      expect(result.flags.backupEligibility).toBe(true);
      expect(result.flags.backupState).toBe(true);
      expect(result.flags.attestedData).toBe(true);
      expect(result.flags.extensionsIncluded).toBe(true);
    });

    it("parses zero flags as all false", async () => {
      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 0,
        signCount: 0,
      });

      const result = parseAuthenticator(authData);

      expect(result.flags.userPresent).toBe(false);
      expect(result.flags.userVerified).toBe(false);
      expect(result.flags.backupEligibility).toBe(false);
      expect(result.flags.backupState).toBe(false);
      expect(result.flags.attestedData).toBe(false);
      expect(result.flags.extensionsIncluded).toBe(false);
    });

    it("returns zero AAGUID when data is shorter than 53 bytes", async () => {
      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 1,
        signCount: 0,
        includeAaguid: false,
      });

      const result = parseAuthenticator(authData);

      expect(result.aaguid).toBe("00000000-0000-0000-0000-000000000000");
    });

    it("extracts AAGUID when data includes attested credential (53+ bytes)", async () => {
      // AAGUID: 01020304-0506-0708-090a-0b0c0d0e0f10
      const aaguidBytes = new Uint8Array([
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
        0x0d, 0x0e, 0x0f, 0x10,
      ]);

      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 0b01000001, // UP + AT
        signCount: 1,
        includeAaguid: true,
        aaguidBytes,
      });

      const result = parseAuthenticator(authData);

      expect(result.aaguid).toBe("01020304-0506-0708-090a-0b0c0d0e0f10");
    });

    it("handles signCount of zero", async () => {
      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 1,
        signCount: 0,
      });

      expect(parseAuthenticator(authData).signCount).toBe(0);
    });

    it("handles max signCount (2^32 - 1)", async () => {
      const authData = await buildAuthenticatorData({
        domain: "test.com",
        flags: 1,
        signCount: 0xffffffff,
      });

      expect(parseAuthenticator(authData).signCount).toBe(0xffffffff);
    });

    it("accepts ArrayBuffer input directly", async () => {
      const rpIdHash = new Uint8Array(await sha256(toBuffer("test.com")));
      const data = new Uint8Array(37);
      data.set(rpIdHash, 0);
      data[32] = 1; // flags: userPresent
      // signCount: 0 (already zeroed)

      const result = parseAuthenticator(data.buffer);

      expect(result.flags.userPresent).toBe(true);
      expect(result.signCount).toBe(0);
    });
  });

  describe("getAlgoName", () => {
    it("maps COSE -7 to ES256", () => {
      expect(getAlgoName(-7)).toBe("ES256");
    });

    it("maps COSE -257 to RS256", () => {
      expect(getAlgoName(-257)).toBe("RS256");
    });

    it("throws ValidationError for unsupported COSE algorithm", () => {
      expect(() => getAlgoName(-8)).toThrow(ValidationError);
      expect(() => getAlgoName(-8)).toThrow("Unsupported COSE algorithm: -8");
    });

    it("throws ValidationError for zero", () => {
      expect(() => getAlgoName(0)).toThrow(ValidationError);
    });
  });

  describe("toRegistrationResult", () => {
    it("extracts credential info, authenticator metadata, and flags", () => {
      const registration: RegistrationResponseJSON = {
        id: cid("cred-id-123"),
        rawId: "cred-id-123",
        type: "public-key",
        response: {
          attestationObject: "unused",
          authenticatorData: "unused",
          clientDataJSON: "unused",
          publicKey: "pk-base64url",
          publicKeyAlgorithm: -7, // ES256
          transports: ["internal", "hybrid"],
        },
      };

      const authenticator: AuthenticatorParsed = {
        rpIdHash: "hash",
        flags: {
          userPresent: true,
          userVerified: true,
          backupEligibility: true,
          backupState: false,
          attestedData: true,
          extensionsIncluded: false,
        },
        signCount: 5,
        aaguid: "01020304-0506-0708-090a-0b0c0d0e0f10",
      };

      const result = toRegistrationResult(registration, authenticator);

      expect(result.credential.id).toBe("cred-id-123");
      expect(result.credential.publicKey).toBe("pk-base64url");
      expect(result.credential.algorithm).toBe("ES256");
      expect(result.credential.transports).toEqual(["internal", "hybrid"]);
      expect(result.authenticator.aaguid).toBe(
        "01020304-0506-0708-090a-0b0c0d0e0f10",
      );
      expect(result.authenticator.signCount).toBe(5);
      expect(result.synced).toBe(true); // backupEligibility
      expect(result.userVerified).toBe(true);
    });

    it("defaults transports to empty array when absent", () => {
      const registration: RegistrationResponseJSON = {
        id: cid("cred-id"),
        rawId: "cred-id",
        type: "public-key",
        response: {
          attestationObject: "x",
          authenticatorData: "x",
          clientDataJSON: "x",
          publicKey: "pk",
          publicKeyAlgorithm: -257, // RS256
          // transports omitted
        },
      };

      const authenticator: AuthenticatorParsed = {
        rpIdHash: "h",
        flags: {
          userPresent: true,
          userVerified: false,
          backupEligibility: false,
          backupState: false,
          attestedData: false,
          extensionsIncluded: false,
        },
        signCount: 0,
        aaguid: "00000000-0000-0000-0000-000000000000",
      };

      const result = toRegistrationResult(registration, authenticator);

      expect(result.credential.transports).toEqual([]);
      expect(result.credential.algorithm).toBe("RS256");
      expect(result.synced).toBe(false);
      expect(result.userVerified).toBe(false);
    });
  });

  describe("toAuthenticationResult", () => {
    it("extracts credentialId, signCount, userVerified, and authenticatorAttachment", () => {
      const authentication: AuthenticationResponseJSON = {
        id: cid("cred-456"),
        rawId: "cred-456",
        type: "public-key",
        authenticatorAttachment: "platform",
        response: {
          clientDataJSON: "unused",
          authenticatorData: "unused",
          signature: "unused",
        },
      };

      const authenticator: AuthenticatorParsed = {
        rpIdHash: "h",
        flags: {
          userPresent: true,
          userVerified: true,
          backupEligibility: false,
          backupState: false,
          attestedData: false,
          extensionsIncluded: false,
        },
        signCount: 10,
        aaguid: "00000000-0000-0000-0000-000000000000",
      };

      const result = toAuthenticationResult(authentication, authenticator);

      expect(result.credentialId).toBe("cred-456");
      expect(result.userVerified).toBe(true);
      expect(result.signCount).toBe(10);
      expect(result.authenticatorAttachment).toBe("platform");
    });

    it("handles missing authenticatorAttachment", () => {
      const authentication: AuthenticationResponseJSON = {
        id: cid("cred-789"),
        rawId: "cred-789",
        type: "public-key",
        // authenticatorAttachment omitted
        response: {
          clientDataJSON: "unused",
          authenticatorData: "unused",
          signature: "unused",
        },
      };

      const authenticator: AuthenticatorParsed = {
        rpIdHash: "h",
        flags: {
          userPresent: true,
          userVerified: false,
          backupEligibility: false,
          backupState: false,
          attestedData: false,
          extensionsIncluded: false,
        },
        signCount: 0,
        aaguid: "00000000-0000-0000-0000-000000000000",
      };

      const result = toAuthenticationResult(authentication, authenticator);

      expect(result.authenticatorAttachment).toBeUndefined();
    });
  });
});
