/**
 * WebAuthn response parsers: clientDataJSON and authenticatorData.
 *
 * Vendored from @passwordless-id/webauthn v2.3.5 (MIT, Arnaud Dagnelies).
 * Source: https://github.com/passwordless-id/webauthn (commit e158fe0)
 *
 * Adapted for CARE-Y: removed authenticatorMetadata dependency (no AAGUID
 * name lookup needed), added explicit return types, removed unused functions.
 */

import * as utils from "./utils.js";
import { ValidationError } from "../../errors.js";
import type {
  Base64URLString,
  CollectedClientData,
  NamedAlgo,
  AuthenticatorParsed,
  RegistrationResponseJSON,
  RegistrationResult,
  AuthenticationResponseJSON,
  AuthenticationResult,
} from "./types.js";

const utf8Decoder = new TextDecoder("utf-8");

/** DataView.getUint32 littleEndian=false means big-endian (WebAuthn spec). */
const BIG_ENDIAN = false;

/** Authenticator data flag bits (W3C WebAuthn Level 2, Section 6.1). */
const FLAG_USER_PRESENT = 0x01;
const FLAG_USER_VERIFIED = 0x04;
const FLAG_BACKUP_ELIGIBILITY = 0x08;
const FLAG_BACKUP_STATE = 0x10;
const FLAG_ATTESTED_DATA = 0x40;
const FLAG_EXTENSIONS_INCLUDED = 0x80;

function isCollectedClientData(value: unknown): value is CollectedClientData {
  if (typeof value !== "object" || value === null) return false;
  return (
    "type" in value &&
    typeof value.type === "string" &&
    "challenge" in value &&
    typeof value.challenge === "string" &&
    "origin" in value &&
    typeof value.origin === "string"
  );
}

/** Parses base64url-encoded clientDataJSON into a structured object. */
export function parseClient(
  data: Base64URLString | ArrayBuffer,
): CollectedClientData {
  const buffer = typeof data === "string" ? utils.parseBase64url(data) : data;
  const parsed: unknown = JSON.parse(utf8Decoder.decode(buffer));
  if (!isCollectedClientData(parsed)) {
    throw new ValidationError("Invalid clientDataJSON structure");
  }
  return parsed;
}

/** Parses the authenticator data binary format (37+ bytes). */
export function parseAuthenticator(
  authData: Base64URLString | ArrayBuffer,
): AuthenticatorParsed {
  const buffer =
    typeof authData === "string" ? utils.parseBase64url(authData) : authData;

  const flags = new DataView(buffer.slice(32, 33)).getUint8(0);

  return {
    rpIdHash: utils.toBase64url(buffer.slice(0, 32)),
    flags: {
      userPresent: !!(flags & FLAG_USER_PRESENT),
      userVerified: !!(flags & FLAG_USER_VERIFIED),
      backupEligibility: !!(flags & FLAG_BACKUP_ELIGIBILITY),
      backupState: !!(flags & FLAG_BACKUP_STATE),
      attestedData: !!(flags & FLAG_ATTESTED_DATA),
      extensionsIncluded: !!(flags & FLAG_EXTENSIONS_INCLUDED),
    },
    signCount: new DataView(buffer.slice(33, 37)).getUint32(0, BIG_ENDIAN),
    aaguid: extractAaguid(buffer),
  };
}

/** Extracts AAGUID from authenticator data (bytes 37-53). */
function extractAaguid(authData: ArrayBuffer): string {
  if (authData.byteLength < 53) {
    return "00000000-0000-0000-0000-000000000000";
  }
  const hex = utils.bufferToHex(authData.slice(37, 53));
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

/** Maps COSE algorithm identifier to named algorithm. */
export function getAlgoName(num: number): NamedAlgo {
  switch (num) {
    case -7:
      return "ES256";
    case -257:
      return "RS256";
    default:
      throw new ValidationError(`Unsupported COSE algorithm: ${String(num)}`);
  }
}

/** Extracts registration result from a registration response and parsed authenticator data. */
export function toRegistrationResult(
  registration: RegistrationResponseJSON,
  authenticator: AuthenticatorParsed,
): RegistrationResult {
  return {
    credential: {
      id: registration.id,
      publicKey: registration.response.publicKey,
      algorithm: getAlgoName(registration.response.publicKeyAlgorithm),
      transports: registration.response.transports ?? [],
    },
    authenticator: {
      aaguid: authenticator.aaguid,
      signCount: authenticator.signCount,
    },
    synced: authenticator.flags.backupEligibility,
    userVerified: authenticator.flags.userVerified,
  };
}

/** Extracts authentication result from an authentication response and parsed authenticator data. */
export function toAuthenticationResult(
  authentication: AuthenticationResponseJSON,
  authenticator: AuthenticatorParsed,
): AuthenticationResult {
  return {
    credentialId: authentication.id,
    userVerified: authenticator.flags.userVerified,
    signCount: authenticator.signCount,
    authenticatorAttachment: authentication.authenticatorAttachment,
  };
}
