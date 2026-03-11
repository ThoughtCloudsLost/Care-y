/**
 * WebAuthn types for server-side verification.
 *
 * Vendored from @passwordless-id/webauthn v2.3.5 (MIT, Arnaud Dagnelies).
 * Source: https://github.com/passwordless-id/webauthn (commit e158fe0)
 *
 * Adapted for CARE-Y: removed browser-only types, removed `any` usage,
 * added explicit types where the original used implicit inference.
 */

export type NamedAlgo = "RS256" | "ES256";
export type Base64URLString = string;

/** Parsed clientDataJSON from the browser. */
export interface CollectedClientData {
  readonly type: string;
  readonly challenge: Base64URLString;
  readonly origin: string;
  readonly topOrigin?: string;
  readonly crossOrigin?: boolean;
}

/** Parsed authenticator data (first 37+ bytes of authData). */
export interface AuthenticatorParsed {
  readonly rpIdHash: Base64URLString;
  readonly flags: {
    readonly userPresent: boolean;
    readonly userVerified: boolean;
    readonly backupEligibility: boolean;
    readonly backupState: boolean;
    readonly attestedData: boolean;
    readonly extensionsIncluded: boolean;
  };
  readonly signCount: number;
  readonly aaguid: string;
}

/** Credential info extracted during registration. */
export interface CredentialInfo {
  readonly id: string;
  readonly publicKey: Base64URLString;
  readonly algorithm: NamedAlgo;
  readonly transports: string[];
}

/** Result of successful registration verification. */
export interface RegistrationResult {
  readonly credential: CredentialInfo;
  readonly authenticator: {
    readonly aaguid: string;
    readonly signCount: number;
  };
  readonly synced: boolean;
  readonly userVerified: boolean;
}

/** Result of successful authentication verification. */
export interface AuthenticationResult {
  readonly credentialId: Base64URLString;
  readonly userVerified: boolean;
  readonly signCount: number;
  readonly authenticatorAttachment?: string | undefined;
}

/** Registration response JSON from the browser (base64url-encoded fields). */
export interface RegistrationResponseJSON {
  readonly id: Base64URLString;
  readonly rawId: Base64URLString;
  readonly type: string;
  readonly authenticatorAttachment?: string;
  readonly response: {
    readonly attestationObject: Base64URLString;
    readonly authenticatorData: Base64URLString;
    readonly clientDataJSON: Base64URLString;
    readonly transports?: string[];
    readonly publicKey: Base64URLString;
    readonly publicKeyAlgorithm: number;
  };
}

/** Authentication response JSON from the browser (base64url-encoded fields). */
export interface AuthenticationResponseJSON {
  readonly id: Base64URLString;
  readonly rawId: Base64URLString;
  readonly type: string;
  readonly authenticatorAttachment?: string;
  readonly response: {
    readonly clientDataJSON: Base64URLString;
    readonly authenticatorData: Base64URLString;
    readonly signature: Base64URLString;
    readonly userHandle?: Base64URLString;
  };
}

/** Checks to perform during registration verification. */
export interface RegistrationChecks {
  readonly challenge: string;
  readonly origin: string;
  readonly domain: string;
  readonly userVerified?: boolean;
}

/** Checks to perform during authentication verification. */
export interface AuthenticationChecks {
  readonly challenge: string;
  readonly origin: string;
  readonly domain: string;
  readonly userVerified: boolean;
  readonly counter?: number;
}
