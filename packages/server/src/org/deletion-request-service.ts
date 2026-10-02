/**
 * Org deletion requests: submit, cancel during the cooling-off period, and
 * read the org's current request.
 *
 * Requests live in the platform table `public.deletion_requests`. Nothing
 * here erases data: the org:erase CLI processes pending requests past their
 * cooling-off deadline on the admin pool, and from the moment it claims a
 * row (status `processing`) the row is no longer cancellable.
 *
 * Every holder of REQUEST_ORG_DELETION is notified on submit and on cancel,
 * so a request made from a compromised account is seen by the other admins
 * while it can still be cancelled. The notification names no requester.
 */

import type { Kysely, Selectable } from "kysely";
import {
  ErrorCode,
  ORG_DELETION_COOLING_OFF_DAYS,
  Permission,
  type DeletionRequestId,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type SystemNotificationEventType,
  type UserId,
} from "@care-y/shared";
import type {
  DeletionRequestStatus,
  DeletionRequestsTable,
  PlatformDatabase,
  TenantDatabase,
} from "../db/types.js";
import type { NotificationService } from "../notifications/service.js";
import { listActiveUserIdsWithPermission } from "../auth/roles.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Time between a request and the earliest moment the CLI may process it. */
export const ORG_DELETION_COOLING_OFF_MS =
  ORG_DELETION_COOLING_OFF_DAYS * DAY_MS;

export interface DeletionRequestView {
  readonly id: DeletionRequestId;
  readonly status: DeletionRequestStatus;
  /** ISO 8601. */
  readonly requestedAt: string;
  /** ISO 8601. */
  readonly coolingOffUntil: string;
  /** True while the status is pending and the cooling-off deadline is ahead. */
  readonly cancellable: boolean;
}

export interface DeletionRequestService {
  /**
   * Records a pending request with the cooling-off deadline set server-side.
   * Throws ValidationError(DELETION_SLUG_MISMATCH) when the confirmation is
   * not the org's slug, and ConflictError(DELETION_ALREADY_REQUESTED) when a
   * pending or processing request already exists.
   */
  request(input: {
    orgId: OrgId;
    requestedBy: UserId;
    confirmSlug: string;
  }): Promise<DeletionRequestView>;
  /**
   * Cancels the org's pending request while its deadline is ahead. Throws
   * ConflictError(DELETION_NOT_CANCELLABLE) otherwise. A row the CLI has
   * already claimed is not cancellable.
   */
  cancel(input: {
    orgId: OrgId;
    cancelledBy: UserId;
  }): Promise<DeletionRequestView>;
  /** The org's newest request that was not cancelled, or null. */
  status(orgId: OrgId): Promise<DeletionRequestView | null>;
}

export interface DeletionRequestServiceDeps {
  /** Runtime pool: the request table needs no owner privileges. */
  readonly platformDb: Kysely<PlatformDatabase>;
  /** The requesting org's tenant DB, for the recipient lookup. */
  readonly tenantDb: Kysely<TenantDatabase>;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
  readonly notificationService: NotificationService;
  /** Injectable clock for tests. Defaults to the wall clock. */
  readonly now?: () => Date;
}

type DeletionRequestRow = Selectable<DeletionRequestsTable>;

function toView(row: DeletionRequestRow, at: Date): DeletionRequestView {
  return {
    id: row.id,
    status: row.status,
    requestedAt: row.requested_at.toISOString(),
    coolingOffUntil: row.cooling_off_until.toISOString(),
    cancellable:
      row.status === "pending" &&
      at.getTime() < row.cooling_off_until.getTime(),
  };
}

/** Creates the deletion request service for one org's request context. */
export function createDeletionRequestService(
  deps: DeletionRequestServiceDeps,
): DeletionRequestService {
  const now = deps.now ?? ((): Date => new Date());

  /**
   * Tells every active holder of REQUEST_ORG_DELETION about the change.
   *
   * A failure here is logged and not rethrown, as the voicemail quarantine
   * notice does: the request row is already committed and the section on
   * the Organization page shows it, so failing the mutation would report a
   * request as not made when it was. The log line carries the event name
   * only.
   */
  async function notifyHolders(
    orgId: OrgId,
    eventType: SystemNotificationEventType,
  ): Promise<void> {
    try {
      const recipients = await listActiveUserIdsWithPermission(
        deps.tenantDb,
        deps.orgSchema,
        Permission.REQUEST_ORG_DELETION,
      );
      if (recipients.length === 0) return;
      await deps.notificationService.dispatchTicketless(
        deps.tenantDb,
        orgId,
        deps.orgSchema,
        deps.orgSlug,
        eventType,
        recipients,
      );
    } catch (_notifyErr: unknown) {
      console.error(`Failed to dispatch ${eventType} notification`);
    }
  }

  return {
    async request({ orgId, requestedBy, confirmSlug }) {
      const org = await deps.platformDb
        .selectFrom("orgs")
        .select("slug")
        .where("id", "=", orgId)
        .executeTakeFirst();
      if (org === undefined) {
        throw new NotFoundError("Organization not found");
      }
      if (confirmSlug !== org.slug) {
        throw new ValidationError(ErrorCode.DELETION_SLUG_MISMATCH);
      }

      const requestedAt = now();
      let row: DeletionRequestRow;
      try {
        row = await deps.platformDb
          .insertInto("deletion_requests")
          .values({
            org_id: orgId,
            requested_by: requestedBy,
            requested_at: requestedAt,
            cooling_off_until: new Date(
              requestedAt.getTime() + ORG_DELETION_COOLING_OFF_MS,
            ),
            status: "pending",
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err: unknown) {
        // The partial unique index allows one pending or processing row
        // per org; a second live request lands here.
        if (isPgUniqueViolation(err)) {
          throw new ConflictError(ErrorCode.DELETION_ALREADY_REQUESTED);
        }
        throw err;
      }

      await notifyHolders(orgId, "org_deletion_requested");
      return toView(row, requestedAt);
    },

    async cancel({ orgId, cancelledBy }) {
      const cancelledAt = now();
      // One conditional UPDATE, so a CLI claim that flips the row to
      // processing between a read and a write cannot be overwritten.
      const row = await deps.platformDb
        .updateTable("deletion_requests")
        .set({
          status: "cancelled",
          cancelled_by: cancelledBy,
          cancelled_at: cancelledAt,
        })
        .where("org_id", "=", orgId)
        .where("status", "=", "pending")
        .where("cooling_off_until", ">", cancelledAt)
        .returningAll()
        .executeTakeFirst();
      if (row === undefined) {
        throw new ConflictError(ErrorCode.DELETION_NOT_CANCELLABLE);
      }

      await notifyHolders(orgId, "org_deletion_cancelled");
      return toView(row, cancelledAt);
    },

    async status(orgId) {
      // Cancelled rows are history; they say nothing about the org's
      // current state, so a cancel returns the section to "no request".
      const row = await deps.platformDb
        .selectFrom("deletion_requests")
        .selectAll()
        .where("org_id", "=", orgId)
        .where("status", "!=", "cancelled")
        .orderBy("requested_at", "desc")
        .limit(1)
        .executeTakeFirst();
      return row === undefined ? null : toView(row, now());
    },
  };
}
