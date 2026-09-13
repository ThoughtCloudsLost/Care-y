import { eciesEncrypt, toRistrettoPoint, decode, encode } from "@care-y/crypto";

/** Sealed triple passed to the server for portal-side storage. */
export interface PortalCopy {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/**
 * ECIES-seal `text` to the client's portal public key so the client
 * can read the volunteer's outbound message in the portal thread.
 *
 * Returns `undefined` when no usable key is provided (null or empty
 * string), letting callers omit the field from the mutation payload.
 */
export function sealPortalCopy(
  clientPublic: string | null,
  text: string,
): PortalCopy | undefined {
  if (clientPublic == null || clientPublic === "") return undefined;

  const pubBytes = toRistrettoPoint(decode(clientPublic));
  const textBytes = new TextEncoder().encode(text);
  const ecies = eciesEncrypt(textBytes, pubBytes);

  return {
    ephemeralPoint: encode(ecies.ephemeralPoint),
    nonce: encode(ecies.nonce),
    ciphertext: encode(ecies.ciphertext),
  };
}
