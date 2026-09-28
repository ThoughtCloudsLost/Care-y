import { describe, it, expect } from "vitest";
import {
  SeedSnapshotFormatError,
  decodeSeedSnapshotBlobs,
  encodeSeedSnapshotBlobs,
  parseSeedSnapshotManifest,
} from "./seed-snapshot.js";

const UUID_A = "0190a0b0-c0d0-7e00-8000-000000000001";
const UUID_B = "0190a0b0-c0d0-7e00-8000-000000000002";
const KEY_B64 = "A".repeat(43);

function manifest(): Record<string, unknown> {
  return {
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
