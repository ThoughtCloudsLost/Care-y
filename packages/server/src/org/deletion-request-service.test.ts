/**
 * DB integration tests for the org deletion request service.
 *
 * Requests live in public.deletion_requests (applied by the platform
 * migrations in test-global-setup.ts). Each case uses a fresh org id and
 * slug so the partial unique index never couples two cases, and afterAll
 * removes every platform row this file inserted.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import {
  ErrorCode,
  RoleId,
  newOrgId,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type UserId,
} from "@care-y/shared";
import type { Selectable } from "kysely";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import type { DeletionRequestsTable } from "../db/types.js";
import type { NotificationService } from "../notifications/service.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";
import { ConflictError, ValidationError } from "../errors.js";
import {
  createDeletionRequestService,
  ORG_DELETION_COOLING_OFF_MS,
  type DeletionRequestService,
} from "./deletion-request-service.js";

function createMockNotificationService(): NotificationService {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
    dispatchTicketless: vi.fn().mockResolvedValue(undefined),
  };
}

/** Resolves to the rejection reason, or undefined when the promise resolves. */
async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    return undefined;
  } catch (err: unknown) {
    return err;
  }
}

describe.skipIf(!process.env.DATABASE_URL)("deletion request service", () => {
  let testDb: TestDb;
  let orgSchema: OrgSchema;
  let adminId: UserId;
  let volunteerId: UserId;
  const suiteOrgIds: OrgId[] = [];

  let notificationService: NotificationService;
  let clock: Date;

  /**
   * Inserts an orgs row with a unique slug and returns both. schema_name is
   * unique on orgs, so each row names its own placeholder schema; the
   * service is still pointed at the test schema for the recipient lookup.
   */
  async function insertOrg(): Promise<{ orgId: OrgId; slug: OrgSlug }> {
    const orgId = newOrgId();
    const slug = `del-req-${orgId.slice(0, 8)}` as OrgSlug;
    await testDb.platformDb
      .insertInto("orgs")
      .values({
        id: orgId,
        slug,
        schema_name: `test_del_${orgId.slice(0, 8)}` as OrgSchema,
      })
      .execute();
    suiteOrgIds.push(orgId);
    return { orgId, slug };
  }

  function serviceFor(slug: OrgSlug): DeletionRequestService {
    return createDeletionRequestService({
      platformDb: testDb.platformDb,
      tenantDb: testDb.db,
      orgSchema,
      orgSlug: slug,
      notificationService,
      now: () => clock,
    });
  }

  async function requestRow(
    orgId: OrgId,
  ): Promise<Selectable<DeletionRequestsTable> | undefined> {
    return testDb.platformDb
      .selectFrom("deletion_requests")
      .selectAll()
      .where("org_id", "=", orgId)
      .orderBy("requested_at", "desc")
      .executeTakeFirst();
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    orgSchema = testDb.schemaName as OrgSchema;
    invalidateRolePermissionCache(orgSchema);
    const admin = await createTestUser(testDb.db, {
      overrides: { role_id: RoleId.ADMIN },
    });
    const volunteer = await createTestUser(testDb.db);
    adminId = admin.id;
    volunteerId = volunteer.id;
  });

  afterAll(async () => {
    if (suiteOrgIds.length > 0) {
      await testDb.platformDb
        .deleteFrom("deletion_requests")
        .where("org_id", "in", suiteOrgIds)
        .execute();
      await testDb.platformDb
        .deleteFrom("orgs")
        .where("id", "in", suiteOrgIds)
        .execute();
    }
    await testDb.cleanup();
  });

  beforeEach(() => {
    notificationService = createMockNotificationService();
    clock = new Date("2026-10-01T12:00:00.000Z");
  });

  describe("request", () => {
    it("refuses a slug mismatch and writes no row", async () => {
      const { orgId, slug } = await insertOrg();

      const err = await rejectionOf(
        serviceFor(slug).request({
          orgId,
          requestedBy: adminId,
          confirmSlug: `${slug}-typo`,
        }),
      );

      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).message).toBe(
        ErrorCode.DELETION_SLUG_MISMATCH,
      );
      expect(await requestRow(orgId)).toBeUndefined();
      expect(notificationService.dispatchTicketless).not.toHaveBeenCalled();
    });

    it("stores a pending row with the cooling-off deadline set server-side", async () => {
      const { orgId, slug } = await insertOrg();

      const view = await serviceFor(slug).request({
        orgId,
        requestedBy: adminId,
        confirmSlug: slug,
      });

      const expectedDeadline = new Date(
        clock.getTime() + ORG_DELETION_COOLING_OFF_MS,
      );
      expect(view.status).toBe("pending");
      expect(view.cancellable).toBe(true);
      expect(view.requestedAt).toBe(clock.toISOString());
      expect(view.coolingOffUntil).toBe(expectedDeadline.toISOString());

      const row = await requestRow(orgId);
      expect(row?.id).toBe(view.id);
      expect(row?.status).toBe("pending");
      expect(row?.requested_by).toBe(adminId);
      expect(row?.cooling_off_until.getTime()).toBe(expectedDeadline.getTime());
    });

    it("notifies active holders of the permission, not every member", async () => {
      const { orgId, slug } = await insertOrg();

      await serviceFor(slug).request({
        orgId,
        requestedBy: adminId,
        confirmSlug: slug,
      });

      expect(notificationService.dispatchTicketless).toHaveBeenCalledOnce();
      const call = vi.mocked(notificationService.dispatchTicketless).mock
        .calls[0];
      expect(call?.[1]).toBe(orgId);
      expect(call?.[3]).toBe(slug);
      expect(call?.[4]).toBe("org_deletion_requested");
      expect(call?.[5]).toContain(adminId);
      expect(call?.[5]).not.toContain(volunteerId);
    });

    it("refuses a second live request through the unique index", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });

      const err = await rejectionOf(
        service.request({ orgId, requestedBy: adminId, confirmSlug: slug }),
      );

      expect(err).toBeInstanceOf(ConflictError);
      expect((err as ConflictError).message).toBe(
        ErrorCode.DELETION_ALREADY_REQUESTED,
      );
      const rows = await testDb.platformDb
        .selectFrom("deletion_requests")
        .select("id")
        .where("org_id", "=", orgId)
        .execute();
      expect(rows).toHaveLength(1);
    });

    it("keeps the request when the notification dispatch fails", async () => {
      const { orgId, slug } = await insertOrg();
      vi.mocked(notificationService.dispatchTicketless).mockRejectedValueOnce(
        new Error("dispatch failed"),
      );
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      const view = await serviceFor(slug).request({
        orgId,
        requestedBy: adminId,
        confirmSlug: slug,
      });

      expect(view.status).toBe("pending");
      expect((await requestRow(orgId))?.status).toBe("pending");
      expect(consoleSpy).toHaveBeenCalledOnce();
      consoleSpy.mockRestore();
    });
  });

  describe("cancel", () => {
    it("cancels inside the window and records who cancelled", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });
      clock = new Date(clock.getTime() + 24 * 60 * 60 * 1000);

      const view = await service.cancel({ orgId, cancelledBy: adminId });

      expect(view.status).toBe("cancelled");
      expect(view.cancellable).toBe(false);
      const row = await requestRow(orgId);
      expect(row?.status).toBe("cancelled");
      expect(row?.cancelled_by).toBe(adminId);
      expect(row?.cancelled_at?.getTime()).toBe(clock.getTime());
      expect(notificationService.dispatchTicketless).toHaveBeenLastCalledWith(
        testDb.db,
        orgId,
        orgSchema,
        slug,
        "org_deletion_cancelled",
        expect.arrayContaining([adminId]),
      );
    });

    it("refuses a cancel after the cooling-off deadline", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });
      clock = new Date(clock.getTime() + ORG_DELETION_COOLING_OFF_MS + 1);

      const err = await rejectionOf(
        service.cancel({ orgId, cancelledBy: adminId }),
      );

      expect(err).toBeInstanceOf(ConflictError);
      expect((err as ConflictError).message).toBe(
        ErrorCode.DELETION_NOT_CANCELLABLE,
      );
      expect((await requestRow(orgId))?.status).toBe("pending");
    });

    it("refuses a cancel once the CLI has claimed the row", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });
      await testDb.platformDb
        .updateTable("deletion_requests")
        .set({ status: "processing" })
        .where("org_id", "=", orgId)
        .execute();

      const err = await rejectionOf(
        service.cancel({ orgId, cancelledBy: adminId }),
      );

      expect(err).toBeInstanceOf(ConflictError);
      expect((err as ConflictError).message).toBe(
        ErrorCode.DELETION_NOT_CANCELLABLE,
      );
      const row = await requestRow(orgId);
      expect(row?.status).toBe("processing");
      expect(row?.cancelled_by).toBeNull();
    });

    it("refuses a cancel when no request exists", async () => {
      const { orgId, slug } = await insertOrg();

      const err = await rejectionOf(
        serviceFor(slug).cancel({ orgId, cancelledBy: adminId }),
      );

      expect(err).toBeInstanceOf(ConflictError);
      expect((err as ConflictError).message).toBe(
        ErrorCode.DELETION_NOT_CANCELLABLE,
      );
    });
  });

  describe("status", () => {
    it("returns null when the org has no request", async () => {
      const { orgId, slug } = await insertOrg();

      expect(await serviceFor(slug).status(orgId)).toBeNull();
    });

    it("returns the pending request with its deadline", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      const requested = await service.request({
        orgId,
        requestedBy: adminId,
        confirmSlug: slug,
      });

      expect(await service.status(orgId)).toEqual(requested);
    });

    it("reports a pending request past its deadline as not cancellable", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });
      clock = new Date(clock.getTime() + ORG_DELETION_COOLING_OFF_MS);

      const view = await service.status(orgId);

      expect(view?.status).toBe("pending");
      expect(view?.cancellable).toBe(false);
    });

    it("returns null again after the request is cancelled", async () => {
      const { orgId, slug } = await insertOrg();
      const service = serviceFor(slug);
      await service.request({ orgId, requestedBy: adminId, confirmSlug: slug });
      await service.cancel({ orgId, cancelledBy: adminId });

      expect(await service.status(orgId)).toBeNull();
    });
  });
});
