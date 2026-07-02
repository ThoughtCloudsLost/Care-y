/**
 * Shared escrow file export utility.
 *
 * Produces ADR-019-compliant JSON envelopes with self-describing metadata
 * so the file is parseable on an air-gapped machine without CARE-Y code.
 *
 * The caller owns orgSecretKey and passphrase lifecycle (zeroing in finally).
 * This utility zeros only internally-derived material via @care-y/crypto.
 */

import { encryptWithPassphrase, ARGON2_ESCROW_PARAMS } from "@care-y/crypto";
import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";

export interface EscrowExportResult {
  readonly fileBlob: Blob;
  readonly sha256Hex: string;
  readonly filename: string;
}

interface EscrowEnvelope {
  readonly format: "care-y-escrow-v1";
  readonly type: string;
  readonly created: string;
  readonly kdf: "argon2id";
  readonly kdf_params: {
    readonly opslimit: number;
    readonly memlimit: number;
    readonly parallelism: number;
  };
  readonly salt: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

export function buildEscrowFilename(): string {
  return `care-y-escrow-${new Date().toISOString().slice(0, 10)}.json`;
}

async function computeSha256Hex(data: Uint8Array): Promise<string> {
  const copy = new Uint8Array(data);
  const hashBuf = await crypto.subtle.digest("SHA-256", copy);
  const hashArr = new Uint8Array(hashBuf);
  return Array.from(hashArr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function exportEscrowFile(
  orgSecretKey: Uint8Array,
  passphrase: Uint8Array,
  type = "org-key",
): Promise<EscrowExportResult> {
  const blob = encryptWithPassphrase(orgSecretKey, passphrase);

  const envelope: EscrowEnvelope = {
    format: "care-y-escrow-v1",
    type,
    created: new Date().toISOString(),
    kdf: "argon2id",
    kdf_params: {
      opslimit: ARGON2_ESCROW_PARAMS.iterations,
      memlimit: ARGON2_ESCROW_PARAMS.memoryKiB * 1024,
      // libsodium's Argon2id always runs a single lane, so the ciphertext was
      // derived with parallelism 1. The self-describing envelope must report
      // the true value or a by-the-book air-gapped recovery would derive the
      // wrong key.
      parallelism: 1,
    },
    salt: uint8ArrayToBase64(blob.salt),
    nonce: uint8ArrayToBase64(blob.nonce),
    ciphertext: uint8ArrayToBase64(blob.ciphertext),
  };

  const json = JSON.stringify(envelope, null, 2);
  const jsonBytes = new TextEncoder().encode(json);
  const sha256Hex = await computeSha256Hex(jsonBytes);
  const filename = buildEscrowFilename();

  const fileBlob = new Blob([json], { type: "application/json" });

  return { fileBlob, sha256Hex, filename };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
