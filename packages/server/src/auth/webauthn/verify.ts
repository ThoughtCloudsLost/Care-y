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

  if (
    expected.counter !== undefined &&
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
 * Converts an ECDSA signature from ASN.1 DER to raw R||S format.
 * SubtleCrypto.verify() expects raw format for ECDSA.
 */
function convertASN1toRaw(signatureBuffer: ArrayBuffer): Uint8Array {
  const sig = new Uint8Array(signatureBuffer);
  const rStart = sig[4] === 0 ? 5 : 4;
  const rEnd = rStart + 32;
  const sStart = sig[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
  const r = sig.slice(rStart, rEnd);
  const s = sig.slice(sStart);
  return new Uint8Array([...r, ...s]);
}
