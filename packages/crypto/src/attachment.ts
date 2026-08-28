/**
 * The payload that opens an attachment.
 *
 * A portal-tier attachment is encrypted once under a key of its own, and
 * that key is wrapped separately for each reader (ADR-089). A reader
 * unwraps the file key together with the filename. The name travels with
 * the key so it never sits in plaintext beside the file it describes.
 *
 * Both sides encode it here rather than each building their own JSON. The
 * volunteer's Worker produces one of these for the client and the client
 * produces one for itself, so a difference of a single key name would
 * leave a file that encrypts fine and cannot be opened.
 *
 * The encoding is JSON because the payload is small, is never a hot path,
 * and benefits from being readable in a test failure. It is not a
 * ciphertext format: the bytes below are what gets encrypted, never what
 * gets stored.
 */

import { InvalidInputError } from "./errors.js";
import { encode, decode } from "./serialize.js";
import type { SymmetricKey } from "./types.js";
import { toSymmetricKey } from "./types.js";

/** File key and filename, as carried inside one wrap. */
export interface FileKeyPayload {
  readonly fileKey: SymmetricKey;
  readonly filename: string;
}

/** JSON shape on the wire. Short names: this rides inside every wrap. */
interface FileKeyPayloadJson {
  readonly k: string;
  readonly n: string;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Serialize a file key and filename into the bytes a wrap encrypts.
 *
 * @param fileKey - 32-byte key the attachment blob is encrypted under
 * @param filename - Name shown to the reader
 * @returns UTF-8 JSON bytes, ready to encrypt
 */
export function encodeFileKeyPayload(
  fileKey: SymmetricKey,
  filename: string,
): Uint8Array {
  const json: FileKeyPayloadJson = { k: encode(fileKey), n: filename };
  return textEncoder.encode(JSON.stringify(json));
}

/**
 * Parse the bytes a reader recovered from a wrap.
 *
 * Everything reaching here has already passed an AEAD tag check, so a
 * malformed payload means a caller bug rather than tampering. It still
 * throws rather than returning a partial value, because a payload missing
 * its key would otherwise surface as a decrypt failure one layer away
 * from the mistake.
 *
 * @param bytes - Plaintext recovered from a file key wrap
 * @returns The file key and filename
 * @throws InvalidInputError if the bytes are not the expected shape or the
 *         key is not 32 bytes
 */
export function decodeFileKeyPayload(bytes: Uint8Array): FileKeyPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(textDecoder.decode(bytes));
  } catch {
    throw new InvalidInputError("File key payload is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new InvalidInputError("File key payload is not an object");
  }

  const { k, n } = parsed as Partial<FileKeyPayloadJson>;
  if (typeof k !== "string" || typeof n !== "string") {
    throw new InvalidInputError("File key payload is missing key or filename");
  }

  let fileKey: SymmetricKey;
  try {
    // toSymmetricKey throws RangeError on a wrong length. Both failures are
    // the same thing to a caller (this payload does not carry a usable
    // key), so they leave here as one error type.
    fileKey = toSymmetricKey(decode(k));
  } catch {
    throw new InvalidInputError("File key is not a base64url 32-byte key");
  }

  return { fileKey, filename: n };
}
