/**
 * Branding encryption utilities shared by onboarding and admin flows.
 *
 * Two-tier encryption:
 *   - encryptLogoFile: org-key sealed (only volunteers can decrypt)
 *   - buildClientBrandingBlob: public-key-derived (unauthenticated portal can decrypt)
 */

import { encryptClientBranding, encode } from "@care-y/crypto";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import { OrgKeyNotLoadedError } from "$lib/crypto/org-key.js";

const encoder = new TextEncoder();

export async function encryptLogoFile(
  file: File,
  orgKeyManager: OrgKeyManager,
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const cipherBytes = await orgKeyManager.encrypt(new Uint8Array(arrayBuffer));
  return encode(cipherBytes);
}

export interface BrandingBlobParams {
  readonly name: string;
  readonly primaryColor: string;
  readonly accentColor: string;
  readonly clientText: string;
}

export function buildClientBrandingBlob(
  params: BrandingBlobParams,
  orgKeyManager: OrgKeyManager,
): string {
  const orgPubKey = orgKeyManager.getPublicKey();
  if (!orgPubKey) {
    throw new OrgKeyNotLoadedError();
  }

  const payload = JSON.stringify({
    name: params.name,
    primaryColor: params.primaryColor,
    accentColor: params.accentColor,
    clientText: params.clientText,
  });
  const payloadBytes = encoder.encode(payload);
  const ciphertext = encryptClientBranding(payloadBytes, orgPubKey);
  return encode(ciphertext);
}
