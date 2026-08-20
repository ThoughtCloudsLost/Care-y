import { describe, expect, it } from "vitest";
import { createVerify } from "node:crypto";
import {
  generateVapidKeyPair,
  signVapidJwt,
  derToJws,
  base64UrlToBuffer,
} from "./push-crypto.js";
import { CryptoError } from "../errors.js";

describe("generateVapidKeyPair", () => {
  // VAPID spec (RFC 8292) + SEC 1 v2 s2.3.3: uncompressed P-256 point = 0x04 || X (32 bytes) || Y (32 bytes) = 65 bytes.
  it("produces a 65-byte uncompressed P-256 public key (base64url)", () => {
    const { publicKey } = generateVapidKeyPair();
    const decoded = base64UrlToBuffer(publicKey);
    expect(decoded.length).toBe(65);
    // Uncompressed point starts with 0x04
    expect(decoded[0]).toBe(0x04);
  });

  it("produces a PEM-encoded EC private key", () => {
    const { privateKeyPem } = generateVapidKeyPair();
    expect(privateKeyPem).toContain("-----BEGIN EC PRIVATE KEY-----");
    expect(privateKeyPem).toContain("-----END EC PRIVATE KEY-----");
  });

  it("generates different keys on each call", () => {
    const pair1 = generateVapidKeyPair();
    const pair2 = generateVapidKeyPair();
    expect(pair1.publicKey).not.toBe(pair2.publicKey);
  });
});

describe("signVapidJwt", () => {
  const keypair = generateVapidKeyPair();

  it("produces valid JWT structure (3 base64url segments)", () => {
    const result = signVapidJwt({
      audience: "https://fcm.googleapis.com",
      subject: "mailto:admin@care-y.app",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
    });

    // Extract JWT from authorization header
    const jwtMatch = /^vapid t=([^,]+),/.exec(result.authorization);
    expect(jwtMatch).not.toBeNull();
    const jwt = jwtMatch?.[1] ?? "";
    const parts = jwt.split(".");
    expect(parts).toHaveLength(3);
  });

  it("sets correct header algorithm", () => {
    const result = signVapidJwt({
      audience: "https://fcm.googleapis.com",
      subject: "mailto:admin@care-y.app",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
    });

    const jwtMatch = /^vapid t=([^,]+),/.exec(result.authorization);
    const jwt = jwtMatch?.[1] ?? "";
    const headerB64 = jwt.split(".")[0] ?? "";
    const header = JSON.parse(
      Buffer.from(headerB64, "base64url").toString(),
    ) as Record<string, string>;
    expect(header.alg).toBe("ES256");
    expect(header.typ).toBe("JWT");
  });

  it("sets correct payload fields", () => {
    const result = signVapidJwt({
      audience: "https://fcm.googleapis.com",
      subject: "mailto:admin@care-y.app",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
      expSeconds: 3600,
    });

    const jwtMatch = /^vapid t=([^,]+),/.exec(result.authorization);
    const jwt = jwtMatch?.[1] ?? "";
    const payloadB64 = jwt.split(".")[1] ?? "";
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString(),
    ) as Record<string, unknown>;
    expect(payload.aud).toBe("https://fcm.googleapis.com");
    expect(payload.sub).toBe("mailto:admin@care-y.app");
    expect(typeof payload.exp).toBe("number");
  });

  it("produces a signature verifiable with the public key", () => {
    const result = signVapidJwt({
      audience: "https://fcm.googleapis.com",
      subject: "mailto:admin@care-y.app",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
    });

    const jwtMatch = /^vapid t=([^,]+),/.exec(result.authorization);
    const jwt = jwtMatch?.[1] ?? "";
    const [headerB64, payloadB64, signatureB64] = jwt.split(".");

    // The signature in JWS is R||S (64 bytes). We need to convert back to DER for verification.
    // Instead, we verify the JWT using node:crypto which handles JWS format.
    const signingInput = `${headerB64 ?? ""}.${payloadB64 ?? ""}`;
    const signature = base64UrlToBuffer(signatureB64 ?? "");

    // Convert JWS R||S back to DER for createVerify
    const r = signature.subarray(0, 32);
    const s = signature.subarray(32, 64);

    function toDerInteger(val: Buffer): Buffer {
      // DER INTEGERs are minimally encoded: strip leading zero bytes first,
      // then re-add a single 0x00 only when the high bit would otherwise
      // make the value negative. Skipping the strip produces non-minimal
      // DER that OpenSSL rejects, which happens whenever R or S starts with
      // a zero byte (roughly one signature in 128).
      let start = 0;
      while (start < val.length - 1 && val[start] === 0x00) {
        start += 1;
      }
      const trimmed = val.subarray(start);
      const first = trimmed[0];
      if (first !== undefined && first >= 0x80) {
        return Buffer.concat([
          Buffer.from([0x02, trimmed.length + 1, 0x00]),
          trimmed,
        ]);
      }
      return Buffer.concat([Buffer.from([0x02, trimmed.length]), trimmed]);
    }

    const rDer = toDerInteger(r);
    const sDer = toDerInteger(s);
    const derSig = Buffer.concat([
      Buffer.from([0x30, rDer.length + sDer.length]),
      rDer,
      sDer,
    ]);

    // Reconstruct the SPKI public key from the uncompressed point
    const uncompressedPoint = base64UrlToBuffer(keypair.publicKey);
    // SPKI header for P-256 uncompressed point
    const spkiPrefix = Buffer.from(
      "3059301306072a8648ce3d020106082a8648ce3d030107034200",
      "hex",
    );
    const spkiDer = Buffer.concat([spkiPrefix, uncompressedPoint]);

    const verifier = createVerify("SHA256");
    verifier.update(signingInput);
    const isValid = verifier.verify(
      { key: spkiDer, format: "der", type: "spki" },
      derSig,
    );
    expect(isValid).toBe(true);
  });

  it("includes public key in Crypto-Key header", () => {
    const result = signVapidJwt({
      audience: "https://fcm.googleapis.com",
      subject: "mailto:admin@care-y.app",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
    });

    expect(result.cryptoKey).toBe(`p256ecdsa=${keypair.publicKey}`);
  });
});

describe("derToJws", () => {
  // JWS compact serialization for ES256 (RFC 7518 s3.4): signature = R (32 bytes) || S (32 bytes) = 64 bytes.
  // Push services reject non-conforming signature lengths.
  it("produces exactly 64 bytes", () => {
    const keypair = generateVapidKeyPair();
    const result = signVapidJwt({
      audience: "https://example.com",
      subject: "mailto:test@test.com",
      publicKey: keypair.publicKey,
      privateKeyPem: keypair.privateKeyPem,
    });

    const jwtMatch = /^vapid t=([^,]+),/.exec(result.authorization);
    const jwt = jwtMatch?.[1] ?? "";
    const signatureB64 = jwt.split(".")[2] ?? "";
    const signature = base64UrlToBuffer(signatureB64);
    expect(signature.length).toBe(64);
  });

  it("throws CryptoError on invalid DER (wrong SEQUENCE tag)", () => {
    expect(() => derToJws(Buffer.from([0x31, 0x00]))).toThrow(CryptoError);
    expect(() => derToJws(Buffer.from([0x31, 0x00]))).toThrow(
      "missing SEQUENCE tag",
    );
  });

  it("throws CryptoError on invalid DER (wrong INTEGER tag for R)", () => {
    expect(() => derToJws(Buffer.from([0x30, 0x02, 0x03, 0x01]))).toThrow(
      CryptoError,
    );
    expect(() => derToJws(Buffer.from([0x30, 0x02, 0x03, 0x01]))).toThrow(
      "missing INTEGER tag for R",
    );
  });
});
