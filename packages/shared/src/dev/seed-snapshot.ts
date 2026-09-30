/**
 * The demo seed snapshot's on-disk format, shared by the Node builder
 * that writes it and the demo boot that reads it.
 *
 * A snapshot is three files.
 *   - rows.bin.gz holds every row the seed wrote, gzipped. Boot runs the
 *     product's migrations on an empty database and then inserts these
 *     rows, so the file carries data only, never Postgres files.
 *   - blobs.bin holds every entry of the demo's in-memory blob store, as
 *     length-prefixed key and bytes records (layout below).
 *   - manifest.json holds the format version, the build time, the content
 *     hash, the rows file's tables in load order with their row counts,
 *     and the ids and demo org keys the boot needs.
 *     {@link seedSnapshotManifestSchema} validates it.
 *
 * All integers below are unsigned 32-bit little-endian. A "string" is a
 * byte length followed by that many bytes of UTF-8.
 *
 * Layout of rows.bin before gzip.
 *   file   = "CYSR" (4 bytes), version, table count, table...
 *   table  = schema (string), table (string), row count, column count,
 *            column..., then the values of each column in turn, each
 *            column's values in row order
 *   column = name (string), kind (1 byte, 1 for text or 2 for bytes)
 *   value  = byte length (0xFFFFFFFF for SQL NULL), value bytes
 * Tables come in an order that satisfies every foreign key between them.
 * A text value is Postgres's own text output for the column's type, so
 * inserting it back parses to the identical value (timestamptz keeps its
 * microseconds, json keeps its exact text). A bytes value is a bytea
 * column's raw bytes. Values are stored column by column so that similar
 * text sits together for gzip, while ciphertext, which gzip cannot
 * shrink, is stored raw rather than inflated by hex or base64.
 *
 * Layout of blobs.bin.
 *   file   = "CYSB" (4 bytes), version, record count, record...
 *   record = key length, key (UTF-8), value length, value
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
  rows: "rows.bin.gz",
  blobs: "blobs.bin",
  manifest: "manifest.json",
} as const;

/**
 * Version of the snapshot as a whole, recorded in the manifest. Bumped
 * whenever any of the three files changes shape.
 */
export const SEED_SNAPSHOT_FORMAT_VERSION = 2;

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

const rowsTableSchema = z.object({
  schema: z.string().min(1),
  table: z.string().min(1),
  rowCount: z.number().int().nonnegative(),
});

export type SeedSnapshotRowsTable = z.infer<typeof rowsTableSchema>;

export const seedSnapshotManifestSchema = z.object({
  formatVersion: z.literal(SEED_SNAPSHOT_FORMAT_VERSION),
  rows: z.object({
    file: z.literal(SEED_SNAPSHOT_FILES.rows),
    /**
     * Every table in rows.bin.gz, in the file's order, which is an order
     * that satisfies every foreign key between them.
     */
    tables: z.array(rowsTableSchema).min(1),
  }),
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

// ── Seeded rows ──────────────────────────────────────────────────────

/**
 * One value in rows.bin. It is Postgres text output for a text column,
 * raw bytes for a bytea column, or null for SQL NULL.
 */
export type SeedSnapshotValue = string | Uint8Array | null;

export type SeedSnapshotColumnKind = "text" | "bytes";

export interface SeedSnapshotColumn {
  readonly name: string;
  readonly kind: SeedSnapshotColumnKind;
}

export interface SeedSnapshotTable {
  readonly schema: string;
  readonly table: string;
  readonly columns: readonly SeedSnapshotColumn[];
  /** Each row holds one value per column, in column order. */
  readonly rows: readonly (readonly SeedSnapshotValue[])[];
}

const ROWS_MAGIC = "CYSR";
const ROWS_VERSION = 1;
const ROWS_HEADER_BYTES = ROWS_MAGIC.length + 2 * U32_BYTES;
const NULL_LENGTH = 0xffffffff;
const TEXT_KIND_CODE = 1;
const BYTES_KIND_CODE = 2;

function kindCode(kind: SeedSnapshotColumnKind): number {
  return kind === "text" ? TEXT_KIND_CODE : BYTES_KIND_CODE;
}

function kindFromCode(code: number): SeedSnapshotColumnKind {
  if (code === TEXT_KIND_CODE) return "text";
  if (code === BYTES_KIND_CODE) return "bytes";
  throw new SeedSnapshotFormatError(
    `rows.bin has an unknown column kind ${String(code)}`,
  );
}

/** Appends length-prefixed pieces and joins them once at the end. */
class ByteWriter {
  private readonly chunks: Uint8Array[] = [];
  private total = 0;
  private readonly encoder = new TextEncoder();

  u32(value: number): void {
    const chunk = new Uint8Array(U32_BYTES);
    new DataView(chunk.buffer).setUint32(0, value, true);
    this.push(chunk);
  }

  u8(value: number): void {
    this.push(Uint8Array.of(value));
  }

  raw(bytes: Uint8Array): void {
    this.push(bytes);
  }

  string(value: string): void {
    const bytes = this.encoder.encode(value);
    this.u32(bytes.byteLength);
    this.push(bytes);
  }

  finish(): Uint8Array {
    const out = new Uint8Array(this.total);
    let offset = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return out;
  }

  private push(chunk: Uint8Array): void {
    this.chunks.push(chunk);
    this.total += chunk.byteLength;
  }
}

/** Reads rows.bin, failing with SeedSnapshotFormatError past the end. */
class ByteReader {
  private offset = 0;
  private readonly bytes: Uint8Array;
  private readonly view: DataView;
  private readonly decoder = new TextDecoder("utf-8", { fatal: true });

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  u32(): number {
    this.need(U32_BYTES);
    const value = this.view.getUint32(this.offset, true);
    this.offset += U32_BYTES;
    return value;
  }

  u8(): number {
    this.need(1);
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  slice(length: number): Uint8Array {
    this.need(length);
    const out = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return out;
  }

  text(length: number): string {
    try {
      return this.decoder.decode(this.slice(length));
    } catch (err: unknown) {
      if (err instanceof SeedSnapshotFormatError) throw err;
      throw new SeedSnapshotFormatError(
        "rows.bin holds text that is not UTF-8",
        { cause: err },
      );
    }
  }

  string(): string {
    return this.text(this.u32());
  }

  atEnd(): boolean {
    return this.offset === this.bytes.byteLength;
  }

  remaining(): number {
    return this.bytes.byteLength - this.offset;
  }

  private need(length: number): void {
    if (this.offset + length > this.bytes.byteLength) {
      throw new SeedSnapshotFormatError("rows.bin is truncated");
    }
  }
}

function qualifiedName(schema: string, table: string): string {
  return `${schema}.${table}`;
}

/**
 * Encode tables as rows.bin, before gzip. Tables are written in the order
 * given, which must be the load order. Throws
 * {@link SeedSnapshotFormatError} when a row's width or a value's type
 * does not match its columns, or a name repeats.
 */
export function encodeSeedSnapshotRows(
  tables: readonly SeedSnapshotTable[],
): Uint8Array {
  const writer = new ByteWriter();
  writer.raw(new TextEncoder().encode(ROWS_MAGIC));
  writer.u32(ROWS_VERSION);
  writer.u32(tables.length);

  const seenTables = new Set<string>();
  for (const table of tables) {
    if (table.schema === "" || table.table === "") {
      throw new SeedSnapshotFormatError("A rows.bin table has an empty name");
    }
    const name = qualifiedName(table.schema, table.table);
    if (seenTables.has(name)) {
      throw new SeedSnapshotFormatError(`rows.bin repeats table ${name}`);
    }
    seenTables.add(name);
    const seenColumns = new Set<string>();
    for (const column of table.columns) {
      if (column.name === "" || seenColumns.has(column.name)) {
        throw new SeedSnapshotFormatError(
          `Table ${name} has an empty or repeated column name`,
        );
      }
      seenColumns.add(column.name);
    }
    for (const row of table.rows) {
      if (row.length !== table.columns.length) {
        throw new SeedSnapshotFormatError(
          `A row of ${name} has ${String(row.length)} values for ${String(table.columns.length)} columns`,
        );
      }
    }

    writer.string(table.schema);
    writer.string(table.table);
    writer.u32(table.rows.length);
    writer.u32(table.columns.length);
    for (const column of table.columns) {
      writer.string(column.name);
      writer.u8(kindCode(column.kind));
    }
    for (const [c, column] of table.columns.entries()) {
      for (const row of table.rows) {
        const value = row.at(c) ?? null;
        if (value === null) {
          writer.u32(NULL_LENGTH);
        } else if (column.kind === "text" && typeof value === "string") {
          writer.string(value);
        } else if (column.kind === "bytes" && value instanceof Uint8Array) {
          writer.u32(value.byteLength);
          writer.raw(value);
        } else {
          throw new SeedSnapshotFormatError(
            `Column ${name}.${column.name} holds a value that is not ${column.kind}`,
          );
        }
      }
    }
  }
  return writer.finish();
}

/**
 * Decode rows.bin (already gunzipped) into its tables, in file order.
 * Byte values are copies, independent of `bytes`. Throws
 * {@link SeedSnapshotFormatError} on a bad header, a truncated value, an
 * unknown column kind, a repeated name or trailing bytes.
 */
export function decodeSeedSnapshotRows(bytes: Uint8Array): SeedSnapshotTable[] {
  if (bytes.byteLength < ROWS_HEADER_BYTES) {
    throw new SeedSnapshotFormatError("rows.bin is shorter than its header");
  }
  const reader = new ByteReader(bytes);
  if (reader.text(ROWS_MAGIC.length) !== ROWS_MAGIC) {
    throw new SeedSnapshotFormatError("rows.bin has the wrong magic");
  }
  const version = reader.u32();
  if (version !== ROWS_VERSION) {
    throw new SeedSnapshotFormatError(
      `rows.bin version ${String(version)} is not ${String(ROWS_VERSION)}`,
    );
  }
  const tableCount = reader.u32();

  const tables: SeedSnapshotTable[] = [];
  const seenTables = new Set<string>();
  for (let t = 0; t < tableCount; t++) {
    const schema = reader.string();
    const table = reader.string();
    const name = qualifiedName(schema, table);
    if (schema === "" || table === "" || seenTables.has(name)) {
      throw new SeedSnapshotFormatError(
        `rows.bin has an empty or repeated table name ${name}`,
      );
    }
    seenTables.add(name);
    const rowCount = reader.u32();
    const columnCount = reader.u32();

    const columns: SeedSnapshotColumn[] = [];
    const seenColumns = new Set<string>();
    for (let c = 0; c < columnCount; c++) {
      const columnName = reader.string();
      if (columnName === "" || seenColumns.has(columnName)) {
        throw new SeedSnapshotFormatError(
          `Table ${name} has an empty or repeated column name`,
        );
      }
      seenColumns.add(columnName);
      columns.push({ name: columnName, kind: kindFromCode(reader.u8()) });
    }

    // Every value takes at least its 4-byte length, so a count the rest of
    // the file cannot hold is rejected before anything is allocated for it.
    if (rowCount * columnCount * U32_BYTES > reader.remaining()) {
      throw new SeedSnapshotFormatError("rows.bin is truncated");
    }
    // The file holds each column's values in turn; read them that way,
    // then turn the columns into rows.
    const columnValues = columns.map((column) => {
      const values: SeedSnapshotValue[] = [];
      for (let r = 0; r < rowCount; r++) {
        const length = reader.u32();
        if (length === NULL_LENGTH) {
          values.push(null);
        } else if (column.kind === "text") {
          values.push(reader.text(length));
        } else {
          values.push(reader.slice(length).slice());
        }
      }
      return values;
    });
    const rows = Array.from({ length: rowCount }, (_, r) =>
      columnValues.map((values) => values.at(r) ?? null),
    );
    tables.push({ schema, table, columns, rows });
  }
  if (!reader.atEnd()) {
    throw new SeedSnapshotFormatError("rows.bin has trailing bytes");
  }
  return tables;
}
