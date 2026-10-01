/**
 * Contract tests for the org deletion request router.
 *
 * Uses the mini-router pattern with an in-memory service fake. The
 * service's own rules (slug check, unique index, cooling-off window) are
 * covered against the database in org/deletion-request-service.test.ts.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createOrgDeletionRouter } from "./org-deletion.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import {
  ErrorCode,
  RoleId,
  type DeletionRequestId,
  type IpToken,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type RoleIdValue,
  type SessionId,
  type SessionToken,
  type UaToken,
  type UserId,
} from "@care-y/shared";
import {
  mockReq,
  mockRes,
  expectTrpcError,
  stubTenantDbDefaultRoles,
} from "../test-utils.js";
import type {
  DeletionRequestService,
  DeletionRequestView,
} from "../org/deletion-request-service.js";
import { ConflictError, ValidationError } from "../errors.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";

const ORG_ID = "00000000-0000-4000-8000-0000000d0e01" as OrgId;
const ORG_SLUG = "deletion-route-org" as OrgSlug;
const ORG_SCHEMA = "org_deletion_route_test" as OrgSchema;
const ADMIN_ID = "00000000-0000-4000-8000-0000000d0e02" as UserId;
const VOLUNTEER_ID = "00000000-0000-4000-8000-0000000d0e03" as UserId;
const MANAGER_ID = "00000000-0000-4000-8000-0000000d0e05" as UserId;

// --- In-memory service fake ---

interface FakeDeletionRequestService extends DeletionRequestService {
  readonly request: Mock<DeletionRequestService["request"]>;
  readonly cancel: Mock<DeletionRequestService["cancel"]>;
  readonly status: Mock<DeletionRequestService["status"]>;
}

function createFakeService(): FakeDeletionRequestService {
  let current: DeletionRequestView | null = null;

  return {
    request: vi.fn<DeletionRequestService["request"]>(async (input) => {
      if (input.confirmSlug !== ORG_SLUG) {
        throw new ValidationError(ErrorCode.DELETION_SLUG_MISMATCH);
      }
      if (current !== null) {
        throw new ConflictError(ErrorCode.DELETION_ALREADY_REQUESTED);
      }
      current = {
        id: "00000000-0000-4000-8000-0000000d0e04" as DeletionRequestId,
        status: "pending",
        requestedAt: "2026-10-01T12:00:00.000Z",
        coolingOffUntil: "2026-10-31T12:00:00.000Z",
        cancellable: true,
      };
      return current;
    }),
    cancel: vi.fn<DeletionRequestService["cancel"]>(async () => {
      if (current?.cancellable !== true) {
        throw new ConflictError(ErrorCode.DELETION_NOT_CANCELLABLE);
      }
      const cancelled: DeletionRequestView = {
        ...current,
        status: "cancelled",
        cancellable: false,
      };
      current = null;
      return cancelled;
    }),
    status: vi.fn<DeletionRequestService["status"]>(async () => current),
  };
}

// --- Context helpers ---

function createOrgContext(): OrgContext {
  return {
    orgId: ORG_ID,
    orgSlug: ORG_SLUG,
    orgSchema: ORG_SCHEMA,
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createContext(userId: UserId, roleId: RoleIdValue): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: createOrgContext(),
    session: {
      id: "sess-deletion-1" as SessionId,
      token: "tok-deletion-1" as SessionToken,
      userId,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: userId,
      encryptedIdentifier: "user-id",
      encryptedDisplayName: "encrypted-name",
      encryptedPreferredLocale: null,
      roleId,
      isActive: true,
      hasSeenBriefing: true,
      mustChangePassword: false,
    },
  };
}

function createUnauthenticatedContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: createOrgContext(),
    session: null,
    user: null,
  };
}

// --- Router + caller builder ---

// care-y-ignore-next-line missing-return-type -- tRPC caller type is a deeply generic inferred type
function buildCaller(
  ctx: Context,
  service: DeletionRequestService,
  createSvc: (org: OrgContext) => DeletionRequestService = () => service,
) {
  const appRouter = router({
    orgDeletion: createOrgDeletionRouter({
      createDeletionRequestSvc: createSvc,
    }),
  });
  return createCallerFactory(appRouter)(ctx);
}

// --- Tests ---

describe("createOrgDeletionRouter", () => {
  let service: FakeDeletionRequestService;

  beforeEach(() => {
    invalidateRolePermissionCache(ORG_SCHEMA);
    service = createFakeService();
  });

  describe("permission gate", () => {
    it("refuses a volunteer on request, cancel and status", async () => {
      const caller = buildCaller(
        createContext(VOLUNTEER_ID, RoleId.VOLUNTEER),
        service,
      );

      await expectTrpcError(
        caller.orgDeletion.request({ confirmSlug: ORG_SLUG }),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
      await expectTrpcError(
        caller.orgDeletion.cancel(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
      await expectTrpcError(
        caller.orgDeletion.status(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
      expect(service.request).not.toHaveBeenCalled();
      expect(service.cancel).not.toHaveBeenCalled();
      expect(service.status).not.toHaveBeenCalled();
    });

    it("refuses a manager, since the default grant is admins only", async () => {
      const caller = buildCaller(
        createContext(MANAGER_ID, RoleId.MANAGER),
        service,
      );

      await expectTrpcError(
        caller.orgDeletion.status(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });

    it("refuses an unauthenticated caller", async () => {
      const caller = buildCaller(createUnauthenticatedContext(), service);

      await expectTrpcError(
        caller.orgDeletion.status(),
        "UNAUTHORIZED",
        ErrorCode.NOT_AUTHENTICATED,
      );
    });
  });

  describe("admin round trip", () => {
    it("requests, reads the pending status, cancels, and reads no request", async () => {
      const caller = buildCaller(
        createContext(ADMIN_ID, RoleId.ADMIN),
        service,
      );

      expect(await caller.orgDeletion.status()).toBeNull();

      const requested = await caller.orgDeletion.request({
        confirmSlug: ORG_SLUG,
      });
      expect(requested.status).toBe("pending");
      expect(requested.cancellable).toBe(true);

      expect(await caller.orgDeletion.status()).toEqual(requested);

      const cancelled = await caller.orgDeletion.cancel();
      expect(cancelled.status).toBe("cancelled");

      expect(await caller.orgDeletion.status()).toBeNull();
    });

    it("takes the org and the caller from the context", async () => {
      const createSvc = vi.fn((_org: OrgContext) => service);
      const caller = buildCaller(
        createContext(ADMIN_ID, RoleId.ADMIN),
        service,
        createSvc,
      );

      await caller.orgDeletion.request({ confirmSlug: ORG_SLUG });
      await caller.orgDeletion.cancel();
      await caller.orgDeletion.status();

      expect(createSvc).toHaveBeenCalledTimes(3);
      expect(createSvc.mock.calls[0]?.[0].orgId).toBe(ORG_ID);
      expect(service.request).toHaveBeenCalledWith({
        orgId: ORG_ID,
        requestedBy: ADMIN_ID,
        confirmSlug: ORG_SLUG,
      });
      expect(service.cancel).toHaveBeenCalledWith({
        orgId: ORG_ID,
        cancelledBy: ADMIN_ID,
      });
      expect(service.status).toHaveBeenCalledWith(ORG_ID);
    });
  });

  describe("error mapping", () => {
    it("maps a slug mismatch to BAD_REQUEST with its code", async () => {
      const caller = buildCaller(
        createContext(ADMIN_ID, RoleId.ADMIN),
        service,
      );

      await expectTrpcError(
        caller.orgDeletion.request({ confirmSlug: "not-the-slug" }),
        "BAD_REQUEST",
        ErrorCode.DELETION_SLUG_MISMATCH,
      );
    });

    it("maps a second request to CONFLICT with its code", async () => {
      const caller = buildCaller(
        createContext(ADMIN_ID, RoleId.ADMIN),
        service,
      );
      await caller.orgDeletion.request({ confirmSlug: ORG_SLUG });

      await expectTrpcError(
        caller.orgDeletion.request({ confirmSlug: ORG_SLUG }),
        "CONFLICT",
        ErrorCode.DELETION_ALREADY_REQUESTED,
      );
    });

    it("maps a cancel with nothing cancellable to CONFLICT with its code", async () => {
      const caller = buildCaller(
        createContext(ADMIN_ID, RoleId.ADMIN),
        service,
      );

      await expectTrpcError(
        caller.orgDeletion.cancel(),
        "CONFLICT",
        ErrorCode.DELETION_NOT_CANCELLABLE,
      );
    });
  });
});
