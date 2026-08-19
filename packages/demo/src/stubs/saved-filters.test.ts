// @vitest-environment node
/**
 * Tests for saved-filters.svelte.ts seed sealing.
 *
 * Verifies that sealSeedFilterNames produces sealed-box ciphertexts
 * that decrypt to the expected plaintext names, matching the contract
 * the OrgDecryptCache relies on (base64url-encoded crypto_box_seal
 * ciphertext, decryptable with crypto_box_seal_open).
 */

import { describe, it, expect, beforeAll } from "vitest";
import _sodium from "libsodium-wrappers-sumo";

// The module uses $state internally. The Svelte vite plugin compiles
// it for tests, but we only exercise the exported sealSeedFilterNames
// function and the savedFilterStore.filters getter.
import {
  sealSeedFilterNames,
  savedFilterStore,
} from "./saved-filters.svelte.js";

beforeAll(async () => {
  await _sodium.ready;
});

describe("sealSeedFilterNames", () => {
  it("produces base64url ciphertexts that decrypt to the expected names", () => {
    const kp = _sodium.crypto_box_keypair();
    const orgPublicKey = kp.publicKey;
    const orgSecretKey = kp.privateKey;

    sealSeedFilterNames(orgPublicKey);

    const filters = savedFilterStore.filters;
    expect(filters.length).toBeGreaterThanOrEqual(2);

    const expectedNames = ["Urgent open", "On hold"];

    for (let i = 0; i < expectedNames.length; i++) {
      const filter = filters[i];
      expect(filter).toBeDefined();
      if (filter === undefined) continue;

      // encryptedName must be a non-empty base64url string
      expect(filter.encryptedName.length).toBeGreaterThan(0);

      // Decode base64url to bytes
      const cipherBytes = new Uint8Array(
        Buffer.from(filter.encryptedName, "base64url"),
      );

      // Decrypt with crypto_box_seal_open (same primitive the worker uses)
      const plainBytes = _sodium.crypto_box_seal_open(
        cipherBytes,
        orgPublicKey,
        orgSecretKey,
      );
      const plaintext = new TextDecoder().decode(plainBytes);

      expect(plaintext).toBe(expectedNames[i]);
    }
  });

  it("does not leave placeholder empty strings in encryptedName", () => {
    const kp = _sodium.crypto_box_keypair();
    sealSeedFilterNames(kp.publicKey);

    for (const filter of savedFilterStore.filters) {
      expect(filter.encryptedName).not.toBe("");
    }
  });

  it("preserves non-name fields (color, icon, state) unchanged", () => {
    const kp = _sodium.crypto_box_keypair();
    sealSeedFilterNames(kp.publicKey);

    const filters = savedFilterStore.filters;
    const first = filters[0];
    const second = filters[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first === undefined || second === undefined) return;

    expect(first.color).toBe("red");
    expect(first.icon).toBe("flame");
    expect(first.id).toBe("00000000-0000-4000-a000-000000000001");

    expect(second.color).toBe("orange");
    expect(second.icon).toBe("pause");
    expect(second.id).toBe("00000000-0000-4000-a000-000000000002");
  });
});
