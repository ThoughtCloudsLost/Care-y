/**
 * WebAuthn server-side verification, vendored from @passwordless-id/webauthn.
 *
 * MIT License, Copyright (c) 2022 Arnaud Dagnelies.
 * Source: https://github.com/passwordless-id/webauthn v2.3.5 (commit e158fe0)
 */

export {
  randomChallenge,
  verifyRegistration,
  verifyAuthentication,
  parseCryptoKey,
} from "./verify.js";

export { parseClient, parseAuthenticator, getAlgoName } from "./parsers.js";

export { toBase64url, parseBase64url, isBase64url } from "./utils.js";

export type {
  NamedAlgo,
  Base64URLString,
  CollectedClientData,
  AuthenticatorParsed,
  CredentialInfo,
  RegistrationResult,
  AuthenticationResult,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  RegistrationChecks,
  AuthenticationChecks,
} from "./types.js";
