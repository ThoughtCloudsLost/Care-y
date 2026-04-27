import sodium from "sodium-native";

const BRANDING_LABEL = "care-y-branding-v1";

export function deriveBrandingKey(orgPublicKey: Buffer): Buffer {
  const labelBytes = Buffer.from(BRANDING_LABEL, "utf-8");
  const input = Buffer.concat([labelBytes, orgPublicKey]);
  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  sodium.crypto_generichash(key, input);
  return key;
}

export function decryptBrandingBlob(
  encryptedBlob: Buffer,
  key: Buffer,
): Buffer | null {
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  const macLen = sodium.crypto_secretbox_MACBYTES;

  if (encryptedBlob.length < nonceLen + macLen) return null;

  const nonce = encryptedBlob.subarray(0, nonceLen);
  const ciphertext = encryptedBlob.subarray(nonceLen);
  const plaintext = Buffer.alloc(ciphertext.length - macLen);

  const ok = sodium.crypto_secretbox_open_easy(
    plaintext,
    ciphertext,
    nonce,
    key,
  );
  if (!ok) return null;

  return plaintext;
}
