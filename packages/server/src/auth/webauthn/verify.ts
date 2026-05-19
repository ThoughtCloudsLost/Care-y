/**
 * WebAuthn server-side registration and authentication verification.
 *
 * Vendored from @passwordless-id/webauthn v2.3.5 (MIT, Arnaud Dagnelies).
 * Source: https://github.com/passwordless-id/webauthn (commit e158fe0)
 *
 * Adapted for CARE-Y: removed `any` types, removed `Function` validators
 * (challenge/origin are always string comparisons in our use case), added
 * explicit return types, replaced console.debug with thrown errors, removed
 * verbose/debug mode (no logging of crypto material).
 *
 * Supports ES256 and RS256 algorithms via SubtleCrypto.
 */

import {
  parseAuthenticator,
  parseClient,
  toRegistrationResult,
  toAuthenticationResult,
} from "./parsers.js";
import type {
  NamedAlgo,
  Base64URLString,
  CredentialInfo,
  RegistrationResponseJSON,
  RegistrationResult,
  AuthenticationResponseJSON,
  AuthenticationResult,
  RegistrationChecks,
  AuthenticationChecks,
} from "./types.js";
import * as utils from "./utils.js";
import { ValidationError } from "../../errors.js";

/** Generates a random challenge (18 bytes, > 128 bits). */
export function randomChallenge(): string {
  const buffer = crypto.getRandomValues(new Uint8Array(18));
  return utils.toBase64url(buffer);
}

/**
 * Verifies a WebAuthn registration response.
 *
 * Checks: clientData type, challenge, origin, RP ID hash, user verification flag.
 * Returns the credential info (id, publicKey, algorithm) for storage.
 */
export async function verifyRegistration(
  registration: RegistrationResponseJSON,
  expected: RegistrationChecks,
): Promise<RegistrationResult> {
  const client = parseClient(registration.response.clientDataJSON);
  const authenticator = parseAuthenticator(
    registration.response.authenticatorData,
  );

  if (expected.userVerified === true && !authenticator.flags.userVerified) {
    throw new ValidationError("User verification required but not satisfied.");
  }

  const expectedRpIdHash = utils.toBase64url(
    await utils.sha256(utils.toBuffer(expected.domain)),
  );
  if (authenticator.rpIdHash !== expectedRpIdHash) {
    throw new ValidationError("RP ID hash mismatch.");
  }

  if (client.type !== "webauthn.create") {
    throw new ValidationError(`Unexpected clientData type: ${client.type}`);
  }

  if (client.origin !== expected.origin) {
    throw new ValidationError("Origin mismatch.");
  }

  if (client.challenge !== expected.challenge) {
    throw new ValidationError("Challenge mismatch.");
  }

  return toRegistrationResult(registration, authenticator);
}

/**
 * Verifies a WebAuthn authentication (assertion) response.
 *
 * Checks: credential ID match, signature validity, clientData type/challenge/origin,
 * RP ID hash, user presence, user verification, sign count progression.
 */
export async function verifyAuthentication(
  authentication: AuthenticationResponseJSON,
  credential: CredentialInfo,
  expected: AuthenticationChecks,
): Promise<AuthenticationResult> {
  if (authentication.id !== credential.id) {
    throw new ValidationError("Credential ID mismatch.");
  }

  const signatureValid = await verifySignature({
    algorithm: credential.algorithm,
    publicKey: credential.publicKey,
    authenticatorData: authentication.response.authenticatorData,
    clientData: authentication.response.clientDataJSON,
    signature: authentication.response.signature,
  });

  if (!signatureValid) {
    throw new ValidationError("Invalid signature.");
  }

  const client = parseClient(authentication.response.clientDataJSON);
  const authenticator = parseAuthenticator(
    authentication.response.authenticatorData,
  );

  if (client.type !== "webauthn.get") {
    throw new ValidationError(`Unexpected clientData type: ${client.type}`);
  }

  if (client.origin !== expected.origin) {
    throw new ValidationError("Origin mismatch.");
  }

  if (client.challenge !== expected.challenge) {
    throw new ValidationError("Challenge mismatch.");
  }

  const expectedRpIdHash = utils.toBase64url(
    await utils.sha256(utils.toBuffer(expected.domain)),
  );
  if (authenticator.rpIdHash !== expectedRpIdHash) {
    throw new ValidationError("RP ID hash mismatch.");
  }

  if (!authenticator.flags.userPresent) {
    throw new ValidationError("User presence flag not set.");
  }

  if (expected.userVerified && !authenticator.flags.userVerified) {
    throw new ValidationError("User verification required but not satisfied.");
  }

  // W3C WebAuthn L2 Section 7.2 Step 21: if both stored and response
  // counters are 0, neither side implements the counter (common with
  // synced passkeys like iCloud Keychain). Skip clone detection.
  if (
    expected.counter !== undefined &&
    !(expected.counter === 0 && authenticator.signCount === 0) &&
    authenticator.signCount <= expected.counter
  ) {
    throw new ValidationError(
      `Sign count did not increase (got ${String(authenticator.signCount)}, expected > ${String(expected.counter)}). Possible credential cloning.`,
    );
  }

  return toAuthenticationResult(authentication, authenticator);
}

// --- Crypto helpers ---

interface AlgoParams {
  readonly name: string;
  readonly hash: string;
  readonly namedCurve?: string;
}

function getAlgoParams(algorithm: NamedAlgo): AlgoParams {
  switch (algorithm) {
    case "RS256":
      return { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
    case "ES256":
      return { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" };
    default:
      throw new ValidationError(
        `Unsupported algorithm: ${String(algorithm)}. Only RS256 and ES256 are supported.`,
      );
  }
}

/** Imports a base64url-encoded SPKI public key as a CryptoKey. */
export async function parseCryptoKey(
  algorithm: NamedAlgo,
  publicKey: Base64URLString,
): Promise<CryptoKey> {
  const algoParams = getAlgoParams(algorithm);
  const buffer = utils.parseBase64url(publicKey);
  return crypto.subtle.importKey("spki", buffer, algoParams, false, ["verify"]);
}

interface VerifySignatureParams {
  readonly algorithm: NamedAlgo;
  readonly publicKey: Base64URLString;
  readonly authenticatorData: Base64URLString;
  readonly clientData: Base64URLString;
  readonly signature: Base64URLString;
}

/**
 * Verifies the assertion signature per W3C WebAuthn spec section 6.5.6.
 *
 * The signed data is: authenticatorData || SHA-256(clientDataJSON).
 * ES256 signatures arrive ASN.1 DER-encoded and must be converted to raw R||S.
 * RS256 signatures are used as-is.
 */
async function verifySignature({
  algorithm,
  publicKey,
  authenticatorData,
  clientData,
  signature,
}: VerifySignatureParams): Promise<boolean> {
  const cryptoKey = await parseCryptoKey(algorithm, publicKey);
  const clientHash = await utils.sha256(utils.parseBase64url(clientData));
  const signedData = utils.concatenateBuffers(
    utils.parseBase64url(authenticatorData),
    clientHash,
  );

  const rawSignature = utils.parseBase64url(signature);
  const signatureBytes: Uint8Array =
    algorithm === "ES256"
      ? convertASN1toRaw(rawSignature)
      : new Uint8Array(rawSignature);

  const algoParams = getAlgoParams(algorithm);
  return crypto.subtle.verify(
    algoParams,
    cryptoKey,
    Uint8Array.from(signatureBytes),
    Uint8Array.from(signedData),
  );
}

/**
 * Converts an ECDSA signature from ASN.1 DER to raw R||S (IEEE P1363) format.
 *
 * Authenticators produce ASN.1 DER; SubtleCrypto.verify() requires IEEE P1363
 * (SEC-199). DER encodes each INTEGER with an optional leading 0x00 byte when
 * the high bit is set to distinguish positive from negative values. That padding
 * must be stripped and each component left-padded to the fixed curve length
 * (32 bytes for P-256) before concatenation (SEC-198, SEC-200).
 *
 * The upstream vendored implementation used fixed offsets that fail when both R
 * and S carry the 0x00 pad (~25% of real P-256 signatures): sig.slice(sStart)
 * included S's padding byte, producing a 65-byte result that SubtleCrypto
 * rejects. This implementation reads DER length fields directly.
 *
 * DER layout: 0x30 <seqLen> 0x02 <rLen> [0x00] <r> 0x02 <sLen> [0x00] <s>
 */
function convertASN1toRaw(signatureBuffer: ArrayBuffer): Uint8Array {
  const sig = new Uint8Array(signatureBuffer);
  // sig[2] = 0x02 (INTEGER tag for R), sig[3] = rLen
  const rLen = sig[3] ?? 0;
  const rBytes = sig.slice(4, 4 + rLen);
  // S INTEGER tag starts right after R
  const sLenOffset = 4 + rLen + 1; // +1 to skip 0x02 tag
  // eslint-disable-next-line security/detect-object-injection -- Uint8Array index, not plain object; no prototype pollution risk
  const sLen = sig[sLenOffset] ?? 0;
  const sBytes = sig.slice(sLenOffset + 1, sLenOffset + 1 + sLen);

  // Strip DER positive-integer padding and left-pad to 32 bytes (P-256 curve length)
  function toFixed32(bytes: Uint8Array): Uint8Array {
    const stripped = bytes[0] === 0x00 ? bytes.slice(1) : bytes;
    const out = new Uint8Array(32);
    out.set(stripped, 32 - stripped.length);
    return out;
  }

  return new Uint8Array([...toFixed32(rBytes), ...toFixed32(sBytes)]);
}
