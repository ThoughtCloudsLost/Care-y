/**
 * Tests for the merge candidate dismissal service.
 *
 * DB integration tests: require Docker (pnpm test:server:db).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, type TestDb } from "../test-utils.js";
import { createDismissalService } from "./dismissal-service.js";
import type { DismissalService } from "./dismissal-service.js";

describe.skipIf(!process.env.DATABASE_URL)("DismissalService", () => {
  let testDb: TestDb;
  let svc: DismissalService;

  beforeAll(async () => {
    testDb = await createTestDb();
    svc = createDismissalService(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns null when no dismissals have been stored", async () => {
    const result = await svc.get();
    expect(result).toBe(null);
  });

  it("stores and retrieves a dismissal blob", async () => {
    const blob = Buffer.from("encrypted-dismissal-blob-content");
    await svc.put(blob);

    const result = await svc.get();
    expect(result).not.toBe(null);
    expect(result!.encryptedDismissals).toBeTruthy();
    expect(result!.updatedAt).toBeInstanceOf(Date);

    // Round-trip: decode the base64url back to verify content
    const decoded = Buffer.from(result!.encryptedDismissals, "base64url");
    expect(decoded.toString()).toBe("encrypted-dismissal-blob-content");
  });

  it("overwrites the existing blob on subsequent put (last-write-wins)", async () => {
    const blob1 = Buffer.from("first-version");
    await svc.put(blob1);

    const blob2 = Buffer.from("second-version");
    await svc.put(blob2);

    const result = await svc.get();
    expect(result).not.toBe(null);
    const decoded = Buffer.from(result!.encryptedDismissals, "base64url");
    expect(decoded.toString()).toBe("second-version");
  });

  it("maintains only one row (singleton table)", async () => {
    const blob = Buffer.from("singleton-test");
    await svc.put(blob);

    // Verify only one row exists
    const rows = await testDb.db
      .selectFrom("merge_candidate_dismissals")
      .selectAll()
      .execute();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(1);
  });
});
