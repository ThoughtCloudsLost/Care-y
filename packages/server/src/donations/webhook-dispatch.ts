/**
 * What the donation webhook endpoint does once the transport checks pass.
 *
 * Kept out of the raw HTTP handler, as telephony/webhook-dispatch.ts is,
 * so the handler only parses, limits and compares. A delivery is an
 * invalidation ping: the payload is never read, the connection's cached
 * fund totals are dropped, and every active VIEW_FUNDS holder in the org
 * is told to refetch.
 */

import type { Kysely } from "kysely";
import {
  Permission,
  type DonationConnectionId,
  type OrgId,
  type OrgSchema,
} from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import type { OrgService } from "../org/service.js";
import type { SseService } from "../notifications/sse.js";
import { listActiveUserIdsWithPermission } from "../auth/roles.js";
import type { DonationConnectionService } from "./config-service.js";
import type { ProviderFundCache } from "./fund-cache.js";

export interface DonationWebhookDispatchDeps {
  readonly orgService: Pick<OrgService, "findById">;
  readonly tenantDb: (schema: OrgSchema) => Kysely<TenantDatabase>;
  readonly sseService: Pick<SseService, "broadcast">;
  readonly connectionService: Pick<
    DonationConnectionService,
    "lookupWebhookSecret"
  >;
  readonly fundCache: Pick<ProviderFundCache, "invalidate">;
  /** Clock for the event timestamp; tests pass a fixed one. */
  readonly now?: () => Date;
}

/** An active org's connection and the secret its deliveries must carry. */
export interface DonationWebhookTarget {
  readonly orgSchema: OrgSchema;
  readonly secret: string;
}

export interface DonationWebhookDispatch {
  /**
   * The org schema and signing secret for a connection, or null when the
   * org is unknown or inactive, the connection is not the org's, or the
   * connection has no secret.
   */
  resolveTarget(
    orgId: OrgId,
    connectionId: DonationConnectionId,
  ): Promise<DonationWebhookTarget | null>;

  /** Drop the connection's cached totals and tell VIEW_FUNDS holders. */
  onDonation(
    orgSchema: OrgSchema,
    connectionId: DonationConnectionId,
  ): Promise<void>;
}

export function createDonationWebhookDispatch(
  deps: DonationWebhookDispatchDeps,
): DonationWebhookDispatch {
  const now = deps.now ?? ((): Date => new Date());

  return {
    async resolveTarget(
      orgId: OrgId,
      connectionId: DonationConnectionId,
    ): Promise<DonationWebhookTarget | null> {
      const org = await deps.orgService.findById(orgId);
      if (org?.isActive !== true) return null;

      const secret = await deps.connectionService.lookupWebhookSecret(
        orgId,
        connectionId,
      );
      if (secret === null) return null;

      return { orgSchema: org.schemaName, secret };
    },

    async onDonation(
      orgSchema: OrgSchema,
      connectionId: DonationConnectionId,
    ): Promise<void> {
      deps.fundCache.invalidate(connectionId);

      const recipients = await listActiveUserIdsWithPermission(
        deps.tenantDb(orgSchema),
        orgSchema,
        Permission.VIEW_FUNDS,
      );
      if (recipients.length === 0) return;

      deps.sseService.broadcast(orgSchema, recipients, {
        type: "funds_inflow_changed",
        timestamp: now().toISOString(),
      });
    },
  };
}
