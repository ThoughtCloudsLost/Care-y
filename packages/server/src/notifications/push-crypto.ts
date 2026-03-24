// VAPID JWT signing utilities (DIY, no web-push dependency).
// Implements RFC 8292 (VAPID) using node:crypto P-256 ECDSA.
//
// The push notification itself sends an empty body (metadata-only).
// No RFC 8291 content encryption is implemented. Push payloads
// traverse third-party push services; keeping them empty prevents
// content from being subpoenaed from those services.

import { createSign, generateKeyPairSync } from "node:crypto";

/** Generates a VAPID P-256 key pair. Returns base64url public key and PEM private key. */
export function generateVapidKeyPair(): {
  publicKey: string; // base64url-encoded uncompressed P-256 point (65 bytes)
  privateKeyPem: string;
} {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });

  // Export public key as uncompressed point for applicationServerKey
  const rawPublic = publicKey.export({ type: "spki", format: "der" });
  // The last 65 bytes of the SPKI DER are the uncompressed point
  const uncompressedPoint = rawPublic.subarray(rawPublic.length - 65);
  const publicKeyB64Url = bufferToBase64Url(uncompressedPoint);

  const privateKeyPem = privateKey.export({
    type: "sec1",
    format: "pem",
  });

  return { publicKey: publicKeyB64Url, privateKeyPem };
}

/**
 * Signs a VAPID JWT (ES256) for the given audience.
 * Returns the Authorization and Crypto-Key header values.
 */
export function signVapidJwt(params: {
  readonly audience: string; // push service origin (e.g., "https://fcm.googleapis.com")
  readonly subject: string; // contact URI (e.g., "mailto:admin@care-y.app")
  readonly publicKey: string; // base64url-encoded uncompressed P-256 point
  readonly privateKeyPem: string;
  readonly expSeconds?: number; // TTL in seconds, default 12 hours, max 24 hours
}): { authorization: string; cryptoKey: string } {
  const exp = Math.floor(Date.now() / 1000) + (params.expSeconds ?? 43200);

  const header = bufferToBase64Url(
    Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })),
  );
  const payload = bufferToBase64Url(
    Buffer.from(
      JSON.stringify({
        aud: params.audience,
        exp,
        sub: params.subject,
      }),
    ),
  );

  const signingInput = `${header}.${payload}`;
  const signer = createSign("SHA256");
  signer.update(signingInput);
  const derSignature = signer.sign(params.privateKeyPem);

  // Convert DER-encoded ECDSA signature to JWS fixed-width R||S (64 bytes)
  const jwsSignature = derToJws(derSignature);
  const signatureB64Url = bufferToBase64Url(jwsSignature);

  const jwt = `${signingInput}.${signatureB64Url}`;

  return {
    authorization: `vapid t=${jwt}, k=${params.publicKey}`,
    cryptoKey: `p256ecdsa=${params.publicKey}`,
  };
}

/**
 * Converts a DER-encoded ECDSA signature to JWS fixed-width R||S format.
 * P-256 produces 32-byte R and S values. DER encoding may add leading
 * zero bytes (when the high bit is set) or omit them (when R or S < 32 bytes).
 * This function normalizes both cases to exactly 32 bytes each.
 */
export function derToJws(derSig: Buffer): Buffer {
  // DER structure: 0x30 <length> 0x02 <r-length> <r-bytes> 0x02 <s-length> <s-bytes>
  let offset = 2; // skip 0x30 and total length
  if (derSig.readUInt8(0) !== 0x30) {
    throw new Error("Invalid DER signature: missing SEQUENCE tag");
  }

  // Parse R
  if (derSig.readUInt8(offset) !== 0x02) {
    throw new Error("Invalid DER signature: missing INTEGER tag for R");
  }
  offset += 1;
  const rLen = derSig.readUInt8(offset);
  offset += 1;
  const rBytes = derSig.subarray(offset, offset + rLen);
  offset += rLen;

  // Parse S
  if (derSig.readUInt8(offset) !== 0x02) {
    throw new Error("Invalid DER signature: missing INTEGER tag for S");
  }
  offset += 1;
  const sLen = derSig.readUInt8(offset);
  offset += 1;
  const sBytes = derSig.subarray(offset, offset + sLen);

  // Normalize to exactly 32 bytes each
  const result = Buffer.alloc(64);
  padOrTruncate(rBytes, result, 0, 32);
  padOrTruncate(sBytes, result, 32, 32);

  return result;
}

/** Pads (leading zeros) or truncates (strip leading zero) to targetLen bytes. */
function padOrTruncate(
  src: Buffer,
  dest: Buffer,
  destOffset: number,
  targetLen: number,
): void {
  if (src.length === targetLen) {
    src.copy(dest, destOffset);
  } else if (src.length > targetLen) {
    // Strip leading zero byte(s) (DER adds 0x00 when high bit is set)
    src.copy(dest, destOffset, src.length - targetLen);
  } else {
    // Pad with leading zeros
    src.copy(dest, destOffset + (targetLen - src.length));
  }
}

export function bufferToBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function base64UrlToBuffer(str: string): Buffer {
  return Buffer.from(str, "base64url");
}
