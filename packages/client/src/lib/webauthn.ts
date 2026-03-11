/**
 * WebAuthn browser-side registration and authentication wrappers.
 *
 * Vendored from @passwordless-id/webauthn v2.3.5 (MIT, Arnaud Dagnelies).
 * Source: https://github.com/passwordless-id/webauthn (commit e158fe0)
 *
 * Adapted for CARE-Y: removed unused features (autocomplete, discoverable,
 * attestation toggle, customProperties), simplified to the two flows we need
 * (register platform/cross-platform, authenticate with allowCredentials).
 * No external dependencies.
 */

import { WebauthnError } from "./errors.js";

// --- Base64url utilities (browser-compatible, no Buffer) ---

function parseBuffer(buffer: ArrayBuffer): string {
  return String.fromCharCode(...new Uint8Array(buffer));
}

function toBase64url(buffer: ArrayBuffer): string {
  return btoa(parseBuffer(buffer))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function toBuffer(txt: string): ArrayBuffer {
  return Uint8Array.from(txt, (c) => c.charCodeAt(0)).buffer;
}

function parseBase64url(txt: string): ArrayBuffer {
  const base64 = txt.replaceAll("-", "+").replaceAll("_", "/");
  return toBuffer(atob(base64));
}

function isBase64url(txt: string): boolean {
  return /^[a-zA-Z0-9\-_]+=*$/.test(txt);
}

// --- Types ---

export interface WebauthnRegistrationResponse {
  readonly id: string;
  readonly rawId: string;
  readonly type: string;
  readonly authenticatorAttachment?: string | null;
  readonly response: {
    readonly attestationObject: string;
    readonly authenticatorData: string;
    readonly clientDataJSON: string;
    readonly transports: string[];
    readonly publicKey: string;
    readonly publicKeyAlgorithm: number;
  };
}

export interface WebauthnAuthenticationResponse {
  readonly id: string;
  readonly rawId: string;
  readonly type: string;
  readonly authenticatorAttachment?: string | null;
  readonly response: {
    readonly authenticatorData: string;
    readonly clientDataJSON: string;
    readonly signature: string;
    readonly userHandle?: string;
  };
}

export interface RegisterOptions {
  readonly challenge: string;
  readonly userId: string;
  readonly userName: string;
  readonly rpId: string;
  readonly rpName: string;
  readonly authenticatorAttachment?: AuthenticatorAttachment;
  readonly userVerification?: UserVerificationRequirement;
  readonly timeout?: number;
  readonly excludeCredentials?: readonly {
    readonly id: string;
    readonly transports?: string[];
  }[];
}

export interface AuthenticateOptions {
  readonly challenge: string;
  readonly rpId: string;
  readonly allowCredentials?: readonly {
    readonly id: string;
    readonly transports?: string[];
  }[];
  readonly userVerification?: UserVerificationRequirement;
  readonly timeout?: number;
}

// --- Type helpers ---

const VALID_TRANSPORTS = new Set<string>([
  "ble",
  "hybrid",
  "internal",
  "nfc",
  "usb",
]);

function toAuthenticatorTransports(
  transports: string[],
): AuthenticatorTransport[] {
  return transports.filter((t): t is AuthenticatorTransport =>
    VALID_TRANSPORTS.has(t),
  );
}

function asPublicKeyCredential(
  credential: Credential | null,
): PublicKeyCredential {
  if (credential === null || !(credential instanceof PublicKeyCredential)) {
    throw new WebauthnError("Browser returned no credential");
  }
  return credential;
}

// --- Abort controller for ongoing operations ---

let ongoingOp: AbortController | null = null;

/** Returns whether WebAuthn is available in this browser. */
export function isWebauthnAvailable(): boolean {
  // typeof check is for SSR (SvelteKit server-side rendering)
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- window.PublicKeyCredential is undefined in non-secure contexts
  return window.PublicKeyCredential !== undefined;
}

/** Returns whether a platform authenticator (biometrics/PIN) is available. */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebauthnAvailable()) return false;
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

/**
 * Creates a new WebAuthn credential (registration).
 *
 * Wraps navigator.credentials.create() and converts the response to
 * JSON-serializable base64url format for sending to the server.
 */
export async function register(
  options: RegisterOptions,
): Promise<WebauthnRegistrationResponse> {
  if (!options.challenge) throw new WebauthnError("challenge required");
  if (!isBase64url(options.challenge))
    throw new WebauthnError("challenge must be base64url-encoded");

  const creationOptions: PublicKeyCredentialCreationOptions = {
    challenge: parseBase64url(options.challenge),
    rp: {
      id: options.rpId,
      name: options.rpName,
    },
    user: {
      id: toBuffer(options.userId),
      name: options.userName,
      displayName: options.userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    timeout: options.timeout ?? 60000,
    authenticatorSelection: {
      userVerification: options.userVerification ?? "required",
      ...(options.authenticatorAttachment
        ? { authenticatorAttachment: options.authenticatorAttachment }
        : {}),
      residentKey: "preferred",
      requireResidentKey: false,
    },
    attestation: "none",
    ...(options.excludeCredentials
      ? {
          excludeCredentials: options.excludeCredentials.map((c) => ({
            id: parseBase64url(c.id),
            type: "public-key" as const,
            ...(c.transports
              ? { transports: toAuthenticatorTransports(c.transports) }
              : {}),
          })),
        }
      : {}),
  };

  if (ongoingOp !== null) ongoingOp.abort("New registration started");
  ongoingOp = new AbortController();

  const raw = asPublicKeyCredential(
    await navigator.credentials.create({
      publicKey: creationOptions,
      signal: ongoingOp.signal,
    }),
  );

  ongoingOp = null;

  if (!(raw.response instanceof AuthenticatorAttestationResponse)) {
    throw new WebauthnError("Expected attestation response");
  }
  const response = raw.response;
  const publicKey = response.getPublicKey();
  if (!publicKey)
    throw new WebauthnError("Authenticator did not return a public key");

  return {
    type: raw.type,
    id: raw.id,
    rawId: toBase64url(raw.rawId),
    authenticatorAttachment: raw.authenticatorAttachment,
    response: {
      attestationObject: toBase64url(response.attestationObject),
      authenticatorData: toBase64url(response.getAuthenticatorData()),
      clientDataJSON: toBase64url(response.clientDataJSON),
      publicKey: toBase64url(publicKey),
      publicKeyAlgorithm: response.getPublicKeyAlgorithm(),
      transports: response.getTransports(),
    },
  };
}

/**
 * Authenticates with an existing WebAuthn credential (assertion).
 *
 * Wraps navigator.credentials.get() and converts the response to
 * JSON-serializable base64url format for sending to the server.
 */
export async function authenticate(
  options: AuthenticateOptions,
): Promise<WebauthnAuthenticationResponse> {
  if (!isBase64url(options.challenge))
    throw new WebauthnError("challenge must be base64url-encoded");

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge: parseBase64url(options.challenge),
    rpId: options.rpId,
    ...(options.allowCredentials
      ? {
          allowCredentials: options.allowCredentials.map((c) => ({
            id: parseBase64url(c.id),
            type: "public-key" as const,
            ...(c.transports
              ? { transports: toAuthenticatorTransports(c.transports) }
              : {}),
          })),
        }
      : {}),
    userVerification: options.userVerification ?? "required",
    timeout: options.timeout ?? 60000,
  };

  if (ongoingOp !== null) ongoingOp.abort("New authentication started");
  ongoingOp = new AbortController();

  const raw = asPublicKeyCredential(
    await navigator.credentials.get({
      publicKey: getOptions,
      signal: ongoingOp.signal,
    }),
  );

  ongoingOp = null;

  if (!(raw.response instanceof AuthenticatorAssertionResponse)) {
    throw new WebauthnError("Expected assertion response");
  }
  const response = raw.response;

  return {
    id: raw.id,
    rawId: toBase64url(raw.rawId),
    type: raw.type,
    authenticatorAttachment: raw.authenticatorAttachment,
    response: {
      authenticatorData: toBase64url(response.authenticatorData),
      clientDataJSON: toBase64url(response.clientDataJSON),
      signature: toBase64url(response.signature),
      ...(response.userHandle
        ? { userHandle: toBase64url(response.userHandle) }
        : {}),
    },
  };
}
