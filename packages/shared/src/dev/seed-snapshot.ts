/**
 * The demo seed snapshot's on-disk format, shared by the Node builder
 * that writes it and the demo boot that reads it.
 *
 * A snapshot is three files:
 *   - db.tar.gz: a PGlite data directory dump (dumpDataDir("gzip")),
 *     restored with the loadDataDir constructor option.
 *   - blobs.bin: every entry of the demo's in-memory blob store, as
 *     length-prefixed key and bytes records (layout below).
 *   - manifest.json holds the build time, the content hash, and the ids
 *     and demo org keys the boot needs. {@link seedSnapshotManifestSchema}
 *     validates it.
 *
 * blobs.bin layout, all integers unsigned 32-bit little-endian:
 *   magic "CYSB" (4 bytes) | version | record count
 *   then per record: key length | key (UTF-8) | value length | value
 */

import { z } from "zod";
import {
  clientAccountIdSchema,
  intakeFormIdSchema,
  orgIdSchema,
  shareIdSchema,
  ticketIdSchema,
  userIdSchema,
} from "../ids.js";
import { base64Bytes } from "../schemas/validators.js";

/** File names inside the snapshot directory. */
export const SEED_SNAPSHOT_FILES = {
  db: "db.tar.gz",
  blobs: "blobs.bin",
  manifest: "manifest.json",
} as const;

/**
 * MIME type to give the db.tar.gz Blob on restore. PGlite gunzips a
 * loadDataDir Blob when its type is one of the gzip types; this is the
 * type its own dumpDataDir("gzip") output carries.
 */
export const SEED_SNAPSHOT_DB_MIME = "application/x-gzip";

/** Raised when a snapshot file does not match the format. */
export class SeedSnapshotFormatError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SeedSnapshotFormatError";
  }
}

// ── Manifest ─────────────────────────────────────────────────────────

const portalSchema = z.object({
  portalChannelId: z.string().min(1),
  portalFragment: z.string().min(1),
  shareId: shareIdSchema,
  shareFragment: z.string().min(1),
  accountId: clientAccountIdSchema,
  accountUsername: z.string().min(1),
  accountPassword: z.string().min(1),
  customFormId: intakeFormIdSchema,
  customFormSlug: z.string().min(1),
  closedFormId: intakeFormIdSchema,
  closedFormSlug: z.string().min(1),
  responseTicketIds: z.array(ticketIdSchema),
  keyNotHeldTicketId: ticketIdSchema,
});

export const seedSnapshotManifestSchema = z.object({
  /** Wall-clock ms epoch the seed's relative timestamps were written against. */
  buildNow: z.number().int().positive(),
  /** Hex SHA-256 over the sources the snapshot is built from. */
  schemaHash: z.string().regex(/^[0-9a-f]{64}$/),
  adminUserId: userIdSchema,
  orgId: orgIdSchema,
  /**
   * The demo org's Curve25519 keypair, in @care-y/crypto's encode()
   * base64url. Demo material only: the same class of key the engine
   * generated in the visitor's browser before snapshots existed.
   */
  orgPublicKey: base64Bytes(32, "orgPublicKey"),
  orgSecretKey: base64Bytes(32, "orgSecretKey"),
  /** Seeded tickets. The handbook story ticket comes first. */
  ticketIds: z.array(ticketIdSchema).min(1),
  articleIds: z.array(z.uuid()),
  /** The ticket whose key wraps were removed, for the denied state. */
  deniedTicketId: ticketIdSchema,
  portal: portalSchema,
  /**
   * Tickets holding a read cursor for the admin. The cursor stores an
   * absolute time inside ciphertext, so boot re-seals each one after
   * shifting the plaintext timestamps.
   */
  readCursorTicketIds: z.array(ticketIdSchema),
});

export type SeedSnapshotManifest = z.infer<typeof seedSnapshotManifestSchema>;

/**
 * Parse manifest.json text. Throws {@link SeedSnapshotFormatError} when
 * the text is not JSON or does not match the schema.
 */
export function parseSeedSnapshotManifest(text: string): SeedSnapshotManifest {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err: unknown) {
    throw new SeedSnapshotFormatError(
      `manifest.json is not JSON: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
  const parsed = seedSnapshotManifestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new SeedSnapshotFormatError(
      `manifest.json does not match the schema: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

// ── Blob records ─────────────────────────────────────────────────────

const BLOB_MAGIC = "CYSB";
const BLOB_VERSION = 1;
const U32_BYTES = 4;
const HEADER_BYTES = BLOB_MAGIC.length + 2 * U32_BYTES;

/**
 * Encode blob store entries as blobs.bin. Entries are written in the
 * order given.
 */
export function encodeSeedSnapshotBlobs(
  entries: Iterable<readonly [string, Uint8Array]>,
): Uint8Array {
  const encoder = new TextEncoder();
  const records: { key: Uint8Array; value: Uint8Array }[] = [];
  let total = HEADER_BYTES;
  for (const [key, value] of entries) {
    const keyBytes = encoder.encode(key);
    records.push({ key: keyBytes, value });
    total += 2 * U32_BYTES + keyBytes.byteLength + value.byteLength;
  }

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  out.set(encoder.encode(BLOB_MAGIC), 0);
  view.setUint32(BLOB_MAGIC.length, BLOB_VERSION, true);
  view.setUint32(BLOB_MAGIC.length + U32_BYTES, records.length, true);

  let offset = HEADER_BYTES;
  for (const { key, value } of records) {
    view.setUint32(offset, key.byteLength, true);
    offset += U32_BYTES;
    out.set(key, offset);
    offset += key.byteLength;
    view.setUint32(offset, value.byteLength, true);
    offset += U32_BYTES;
    out.set(value, offset);
    offset += value.byteLength;
  }
  return out;
}

/**
 * Decode blobs.bin into key and bytes pairs, in file order. Each value is
 * a copy, independent of `bytes`. Throws {@link SeedSnapshotFormatError}
 * on a bad header, a truncated record, a duplicate key or trailing bytes.
 */
export function decodeSeedSnapshotBlobs(
  bytes: Uint8Array,
): Map<string, Uint8Array> {
  if (bytes.byteLength < HEADER_BYTES) {
    throw new SeedSnapshotFormatError("blobs.bin is shorter than its header");
  }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const decodeText = (slice: Uint8Array): string => {
    try {
      return decoder.decode(slice);
    } catch (err: unknown) {
      throw new SeedSnapshotFormatError(
        "blobs.bin holds text that is not UTF-8",
        { cause: err },
      );
    }
  };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = decodeText(bytes.subarray(0, BLOB_MAGIC.length));
  if (magic !== BLOB_MAGIC) {
    throw new SeedSnapshotFormatError("blobs.bin has the wrong magic");
  }
  const version = view.getUint32(BLOB_MAGIC.length, true);
  if (version !== BLOB_VERSION) {
    throw new SeedSnapshotFormatError(
      `blobs.bin version ${String(version)} is not ${String(BLOB_VERSION)}`,
    );
  }
  const count = view.getUint32(BLOB_MAGIC.length + U32_BYTES, true);

  const readLength = (at: number): number => {
    if (at + U32_BYTES > bytes.byteLength) {
      throw new SeedSnapshotFormatError("blobs.bin record is truncated");
    }
    return view.getUint32(at, true);
  };
  const readSlice = (at: number, length: number): Uint8Array => {
    if (at + length > bytes.byteLength) {
      throw new SeedSnapshotFormatError("blobs.bin record is truncated");
    }
    return bytes.subarray(at, at + length);
  };

  const out = new Map<string, Uint8Array>();
  let offset = HEADER_BYTES;
  for (let i = 0; i < count; i++) {
    const keyLength = readLength(offset);
    offset += U32_BYTES;
    const key = decodeText(readSlice(offset, keyLength));
    offset += keyLength;
    const valueLength = readLength(offset);
    offset += U32_BYTES;
    const value = readSlice(offset, valueLength).slice();
    offset += valueLength;
    if (out.has(key)) {
      throw new SeedSnapshotFormatError("blobs.bin repeats a key");
    }
    out.set(key, value);
  }
  if (offset !== bytes.byteLength) {
    throw new SeedSnapshotFormatError("blobs.bin has trailing bytes");
  }
  return out;
}
