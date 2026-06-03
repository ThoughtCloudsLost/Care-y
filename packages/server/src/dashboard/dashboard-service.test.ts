import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createDashboardService,
  type DashboardService,
} from "./dashboard-service.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

describe.skipIf(!HAS_DB)("DashboardService (DB)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let svc: DashboardService;

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;

    await tenantDb
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();
    await seedOrgPublicKey(tenantDb);

    svc = createDashboardService(tenantDb);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns dismissed checklist when getting_started_dismissed_at is set", async () => {
    await tenantDb
      .updateTable("org_config")
      .set({ getting_started_dismissed_at: new Date() })
      .execute();

    const result = await svc.getSetupChecklist();
    expect(result.dismissed).toBe(true);
    expect(result.items).toHaveLength(0);

    // Reset for subsequent tests
    await tenantDb
      .updateTable("org_config")
      .set({ getting_started_dismissed_at: null })
      .execute();
  });

  it("returns 8 checklist items with completion status", async () => {
    // Seed: 1 user (the baseline admin), 1 queue (from createTestQueue)
    await createTestUser(tenantDb);
    await createTestQueue(tenantDb);

    const result = await svc.getSetupChecklist();

    expect(result.dismissed).toBe(false);
    expect(result.items).toHaveLength(8);

    const ids = result.items.map((i) => i.id);
    expect(ids).toEqual([
      "invite",
      "branding",
      "greetings",
      "sms",
      "presets",
      "kb",
      "queues",
      "retention",
    ]);

    // Only 1 active user, so "invite" (userCount > 1) is incomplete
    const invite = result.items.find((i) => i.id === "invite");
    expect(invite?.complete).toBe(false);

    // No logo, greetings, sms, presets, kb, or retention set
    expect(result.items.find((i) => i.id === "branding")?.complete).toBe(false);
    expect(result.items.find((i) => i.id === "greetings")?.complete).toBe(
      false,
    );
    expect(result.items.find((i) => i.id === "retention")?.complete).toBe(
      false,
    );

    // 1 queue exists, but "queues" requires > 1
    expect(result.items.find((i) => i.id === "queues")?.complete).toBe(false);
  });

  it("dismissSetupChecklist sets timestamp and subsequent get returns dismissed", async () => {
    await svc.dismissSetupChecklist();

    const result = await svc.getSetupChecklist();
    expect(result.dismissed).toBe(true);
    expect(result.items).toHaveLength(0);

    // Verify timestamp was set in DB
    const config = await tenantDb
      .selectFrom("org_config")
      .select("getting_started_dismissed_at")
      .executeTakeFirstOrThrow();
    expect(config.getting_started_dismissed_at).toBeInstanceOf(Date);

    // Reset for next test
    await tenantDb
      .updateTable("org_config")
      .set({ getting_started_dismissed_at: null })
      .execute();
  });

  it("returns all items incomplete when org_config fields are null", async () => {
    // Clear any seeded data that might make items complete
    await tenantDb.deleteFrom("users").execute();
    await tenantDb.deleteFrom("queues").execute();

    // Ensure logo and retention are null
    await tenantDb
      .updateTable("org_config")
      .set({
        encrypted_logo: null,
        pii_retention_days: null,
      })
      .execute();

    const result = await svc.getSetupChecklist();
    expect(result.dismissed).toBe(false);
    expect(result.items.every((i) => !i.complete)).toBe(true);
  });
});
