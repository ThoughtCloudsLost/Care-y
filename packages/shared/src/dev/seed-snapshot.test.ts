import { describe, it, expect } from "vitest";
import {
  SEED_SNAPSHOT_FILES,
  SEED_SNAPSHOT_FORMAT_VERSION,
  SeedSnapshotFormatError,
  decodeSeedSnapshotBlobs,
  decodeSeedSnapshotRows,
  encodeSeedSnapshotBlobs,
  encodeSeedSnapshotRows,
  parseSeedSnapshotManifest,
  type SeedSnapshotTable,
} from "./seed-snapshot.js";

const UUID_A = "0190a0b0-c0d0-7e00-8000-000000000001";
const UUID_B = "0190a0b0-c0d0-7e00-8000-000000000002";
const KEY_B64 = "A".repeat(43);

function manifest(): Record<string, unknown> {
  return {
    formatVersion: SEED_SNAPSHOT_FORMAT_VERSION,
    rows: {
      file: SEED_SNAPSHOT_FILES.rows,
      tables: [
        { schema: "public", table: "orgs", rowCount: 1 },
        { schema: "demo_org", table: "tickets", rowCount: 2 },
      ],
    },
    buildNow: 1_790_000_000_000,
    schemaHash: "ab".repeat(32),
    adminUserId: UUID_A,
    orgId: UUID_B,
    orgPublicKey: KEY_B64,
    orgSecretKey: KEY_B64,
    ticketIds: [UUID_A, UUID_B],
    articleIds: [UUID_A],
    deniedTicketId: UUID_B,
    portal: {
      portalChannelId: "channel",
      portalFragment: "fragment",
      shareId: UUID_A,
      shareFragment: "fragment",
      accountId: UUID_A,
      accountUsername: "user",
      accountPassword: "pass",
      customFormId: UUID_A,
      customFormSlug: "custom",
      closedFormId: UUID_B,
      closedFormSlug: "closed",
      responseTicketIds: [UUID_A],
      keyNotHeldTicketId: UUID_B,
    },
    readCursorTicketIds: [UUID_A],
  };
}

describe("seed snapshot blobs.bin", () => {
  it("round-trips keys and bytes in order", () => {
    const entries: [string, Uint8Array][] = [
      ["demo_org/greeting/one", new Uint8Array([1, 2, 3])],
      ["demo_org/attachments/two", new Uint8Array(0)],
      ["demo_org/recordings/trés", new Uint8Array([255, 0, 7])],
    ];
    const decoded = decodeSeedSnapshotBlobs(encodeSeedSnapshotBlobs(entries));
    expect([...decoded.keys()]).toEqual(entries.map(([k]) => k));
    for (const [key, value] of entries) {
      expect(decoded.get(key)).toEqual(value);
    }
  });

  it("rejects a truncated file", () => {
    const bytes = encodeSeedSnapshotBlobs([["k", new Uint8Array([1, 2, 3])]]);
    expect(() => decodeSeedSnapshotBlobs(bytes.subarray(0, -1))).toThrow(
      SeedSnapshotFormatError,
    );
  });

  it("rejects trailing bytes and the wrong magic", () => {
    const bytes = encodeSeedSnapshotBlobs([["k", new Uint8Array([1])]]);
    const trailing = new Uint8Array(bytes.byteLength + 1);
    trailing.set(bytes);
    expect(() => decodeSeedSnapshotBlobs(trailing)).toThrow(
      SeedSnapshotFormatError,
    );
    const wrongMagic = bytes.slice();
    wrongMagic[0] = 0;
    expect(() => decodeSeedSnapshotBlobs(wrongMagic)).toThrow(
      SeedSnapshotFormatError,
    );
  });

  it("rejects a repeated key", () => {
    const bytes = encodeSeedSnapshotBlobs([
      ["k", new Uint8Array([1])],
      ["k", new Uint8Array([2])],
    ]);
    expect(() => decodeSeedSnapshotBlobs(bytes)).toThrow(
      SeedSnapshotFormatError,
    );
  });
});

function rowsFixture(): SeedSnapshotTable[] {
  return [
    {
      schema: "public",
      table: "orgs",
      columns: [
        { name: "id", kind: "text" },
        { name: "settings", kind: "text" },
      ],
      rows: [[UUID_A, '{"b": 1,  "a": [1, 2]}']],
    },
    {
      schema: "demo_org",
      table: "tickets",
      columns: [
        { name: "id", kind: "text" },
        { name: "created_at", kind: "text" },
        { name: "encrypted_title", kind: "bytes" },
        { name: "routing_queue_ids", kind: "text" },
        { name: "closed_at", kind: "text" },
      ],
      rows: [
        [
          UUID_A,
          "2026-09-28 10:11:12.345678+00",
          new Uint8Array([0, 255, 7, 128]),
          `{${UUID_A},${UUID_B}}`,
          null,
        ],
        [UUID_B, "2026-09-27 00:00:00+00", new Uint8Array(0), null, "é"],
      ],
    },
    {
      schema: "demo_org",
      table: "empty_table",
      columns: [{ name: "id", kind: "text" }],
      rows: [],
    },
  ];
}

describe("seed snapshot rows.bin", () => {
  it("round-trips tables, columns and every value kind in order", () => {
    const tables = rowsFixture();
    const decoded = decodeSeedSnapshotRows(encodeSeedSnapshotRows(tables));
    expect(decoded).toEqual(tables);
  });

  it("keeps an empty string distinct from NULL", () => {
    const decoded = decodeSeedSnapshotRows(
      encodeSeedSnapshotRows([
        {
          schema: "s",
          table: "t",
          columns: [{ name: "c", kind: "text" }],
          rows: [[""], [null]],
        },
      ]),
    );
    expect(decoded[0]?.rows).toEqual([[""], [null]]);
  });

  it("rejects a value that does not match its column kind", () => {
    expect(() =>
      encodeSeedSnapshotRows([
        {
          schema: "s",
          table: "t",
          columns: [{ name: "c", kind: "bytes" }],
          rows: [["not bytes"]],
        },
      ]),
    ).toThrow(SeedSnapshotFormatError);
  });

  it("rejects a row of the wrong width and a repeated table", () => {
    expect(() =>
      encodeSeedSnapshotRows([
        {
          schema: "s",
          table: "t",
          columns: [{ name: "c", kind: "text" }],
          rows: [["a", "b"]],
        },
      ]),
    ).toThrow(SeedSnapshotFormatError);
    const table: SeedSnapshotTable = {
      schema: "s",
      table: "t",
      columns: [],
      rows: [],
    };
    expect(() => encodeSeedSnapshotRows([table, table])).toThrow(
      SeedSnapshotFormatError,
    );
  });

  it("rejects a truncated file, trailing bytes and the wrong magic", () => {
    const bytes = encodeSeedSnapshotRows(rowsFixture());
    expect(() => decodeSeedSnapshotRows(bytes.subarray(0, -1))).toThrow(
      SeedSnapshotFormatError,
    );
    const trailing = new Uint8Array(bytes.byteLength + 1);
    trailing.set(bytes);
    expect(() => decodeSeedSnapshotRows(trailing)).toThrow(
      SeedSnapshotFormatError,
    );
    const wrongMagic = bytes.slice();
    wrongMagic[0] = 0;
    expect(() => decodeSeedSnapshotRows(wrongMagic)).toThrow(
      SeedSnapshotFormatError,
    );
  });
});

describe("seed snapshot manifest", () => {
  it("parses a well-formed manifest", () => {
    const parsed = parseSeedSnapshotManifest(JSON.stringify(manifest()));
    expect(parsed.ticketIds[0]).toBe(UUID_A);
    expect(parsed.portal.closedFormSlug).toBe("closed");
  });

  it("rejects text that is not JSON", () => {
    expect(() => parseSeedSnapshotManifest("{")).toThrow(
      SeedSnapshotFormatError,
    );
  });

  it("rejects another format version or rows file", () => {
    expect(() =>
      parseSeedSnapshotManifest(
        JSON.stringify({ ...manifest(), formatVersion: 1 }),
      ),
    ).toThrow(SeedSnapshotFormatError);
    expect(() =>
      parseSeedSnapshotManifest(
        JSON.stringify({
          ...manifest(),
          rows: { file: "db.tar.gz", tables: [] },
        }),
      ),
    ).toThrow(SeedSnapshotFormatError);
  });

  it("rejects a manifest with no tickets or a short key", () => {
    expect(() =>
      parseSeedSnapshotManifest(
        JSON.stringify({ ...manifest(), ticketIds: [] }),
      ),
    ).toThrow(SeedSnapshotFormatError);
    expect(() =>
      parseSeedSnapshotManifest(
        JSON.stringify({ ...manifest(), orgSecretKey: "AAAA" }),
      ),
    ).toThrow(SeedSnapshotFormatError);
  });
});
