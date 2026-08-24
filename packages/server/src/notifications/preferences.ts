// Notification preferences service with scope cascade.
//
// Resolves per-user notification channel preferences through a three-tier
// cascade: ticket override > queue override > global preference > default
// (enabled). SSE is never stored or resolved here; it is always delivered.
//
// The `set()` upsert targets the named unique constraint
// `notification_preferences_scope_unique` because column-list inference
// does not resolve NULLS NOT DISTINCT constraints in all Kysely versions.

import type { ExpressionBuilder, Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  NotificationChannel,
  NotificationEventType,
  PreferenceRow,
  UserId,
  NotificationScopeId,
  TicketId,
  QueueId,
} from "@care-y/shared";
import {
  preferenceRowSchema,
  queueIdSchema,
  ticketIdSchema,
} from "@care-y/shared";
import { NotFoundError } from "../errors.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface PreferenceScope {
  readonly scopeType: "global" | "queue" | "ticket";
  readonly scopeId: NotificationScopeId | null;
}

/** Per-channel allow lists for one dispatch. SSE is intentionally absent. */
export interface DispatchAllowLists {
  readonly pushAllowed: readonly UserId[];
  readonly emailAllowed: readonly UserId[];
  readonly smsAllowed: readonly UserId[];
}

export interface NotificationPreferencesService {
  /** Resolve one user+event+channel through the cascade. No row = true. */
  getEffective(
    tDb: Kysely<TenantDatabase>,
    userId: UserId,
    eventType: NotificationEventType,
    channel: NotificationChannel,
    ticketId?: TicketId,
    queueId?: QueueId,
  ): Promise<boolean>;

  /** Batched resolution for dispatch: one query, per-channel allow lists. */
  resolveForDispatch(
    tDb: Kysely<TenantDatabase>,
    userIds: readonly UserId[],
    eventType: NotificationEventType,
    ticketId?: TicketId,
    queueId?: QueueId,
  ): Promise<DispatchAllowLists>;

  set(
    tDb: Kysely<TenantDatabase>,
    userId: UserId,
    scope: PreferenceScope,
    eventType: NotificationEventType,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<void>;

  listForUser(
    tDb: Kysely<TenantDatabase>,
    userId: UserId,
  ): Promise<PreferenceRow[]>;

  /** Delete override rows. Scope omitted = every row for the user. */
  reset(
    tDb: Kysely<TenantDatabase>,
    userId: UserId,
    scope?: PreferenceScope,
  ): Promise<void>;

  /**
   * Validates that the caller can write a preference at the given scope.
   * Queue scope: queue must exist. Ticket scope: caller must hold a
   * ticket_key_wraps row for (ticket, user). Global scope: always valid.
   * Throws NotFoundError on failure (same shape for missing and inaccessible
   * to avoid existence oracles).
   */
  assertScopeAccessible(
    tDb: Kysely<TenantDatabase>,
    userId: UserId,
    scope: PreferenceScope,
  ): Promise<void>;
}

// -----------------------------------------------------------------------
// Cascade resolution (pure, shared by getEffective and resolveForDispatch)
// -----------------------------------------------------------------------

interface RawPrefRow {
  readonly user_id: string;
  readonly scope_type: string;
  readonly enabled: boolean;
}

const SCOPE_PRIORITY: Record<string, number> = {
  ticket: 3,
  queue: 2,
  global: 1,
};

/**
 * Given all matching rows for a (user, channel) pair, pick the most specific
 * scope's `enabled` value. Absent = default true.
 */
function resolveFromRows(rows: readonly RawPrefRow[]): boolean {
  if (rows.length === 0) return true;
  let best: RawPrefRow | undefined;
  let bestPriority = 0;
  for (const row of rows) {
    const p = SCOPE_PRIORITY[row.scope_type] ?? 0;
    if (p > bestPriority) {
      bestPriority = p;
      best = row;
    }
  }
  return best?.enabled ?? true;
}

// -----------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------

const CHANNELS: readonly NotificationChannel[] = ["push", "email", "sms"];

export function createNotificationPreferencesService(): NotificationPreferencesService {
  return {
    async getEffective(
      tDb,
      userId,
      eventType,
      channel,
      ticketId,
      queueId,
    ): Promise<boolean> {
      const rows = await tDb
        .selectFrom("notification_preferences")
        .select(["user_id", "scope_type", "enabled"])
        .where("user_id", "=", userId)
        .where("event_type", "=", eventType)
        .where("channel", "=", channel)
        .where(scopeFilter(ticketId, queueId))
        .execute();

      return resolveFromRows(rows);
    },

    async resolveForDispatch(
      tDb,
      userIds,
      eventType,
      ticketId,
      queueId,
    ): Promise<DispatchAllowLists> {
      if (userIds.length === 0) {
        return { pushAllowed: [], emailAllowed: [], smsAllowed: [] };
      }

      const rows = await tDb
        .selectFrom("notification_preferences")
        .select(["user_id", "scope_type", "channel", "enabled"])
        .where("user_id", "in", [...userIds])
        .where("event_type", "=", eventType)
        .where(scopeFilter(ticketId, queueId))
        .execute();

      // Group by (user_id, channel), then resolve each pair.
      const grouped = new Map<string, RawPrefRow[]>();
      for (const row of rows) {
        const key = `${row.user_id}::${row.channel}`;
        let list = grouped.get(key);
        if (!list) {
          list = [];
          grouped.set(key, list);
        }
        list.push(row);
      }

      const pushAllowed: UserId[] = [];
      const emailAllowed: UserId[] = [];
      const smsAllowed: UserId[] = [];

      for (const uid of userIds) {
        for (const ch of CHANNELS) {
          const key = `${uid}::${ch}`;
          const chRows = grouped.get(key);
          const allowed = chRows ? resolveFromRows(chRows) : true;
          if (allowed) {
            if (ch === "push") pushAllowed.push(uid);
            else if (ch === "email") emailAllowed.push(uid);
            else smsAllowed.push(uid);
          }
        }
      }

      return { pushAllowed, emailAllowed, smsAllowed };
    },

    async set(tDb, userId, scope, eventType, channel, enabled): Promise<void> {
      await tDb
        .insertInto("notification_preferences")
        .values({
          user_id: userId,
          scope_type: scope.scopeType,
          scope_id: scope.scopeId,
          event_type: eventType,
          channel,
          enabled,
        })
        .onConflict((oc) =>
          oc
            .constraint("notification_preferences_scope_unique")
            .doUpdateSet({ enabled }),
        )
        .execute();
    },

    async listForUser(tDb, userId): Promise<PreferenceRow[]> {
      const rows = await tDb
        .selectFrom("notification_preferences")
        .select(["scope_type", "scope_id", "event_type", "channel", "enabled"])
        .where("user_id", "=", userId)
        .execute();

      // DB CHECK constraints guarantee the enum columns; the Zod parse
      // narrows the string columns without unsafe assertions.
      return rows.map((r) =>
        preferenceRowSchema.parse({
          scopeType: r.scope_type,
          scopeId: r.scope_id,
          eventType: r.event_type,
          channel: r.channel,
          enabled: r.enabled,
        }),
      );
    },

    async reset(tDb, userId, scope): Promise<void> {
      let query = tDb
        .deleteFrom("notification_preferences")
        .where("user_id", "=", userId);

      if (scope) {
        query = query.where("scope_type", "=", scope.scopeType);
        if (scope.scopeId !== null) {
          query = query.where("scope_id", "=", scope.scopeId);
        } else {
          query = query.where("scope_id", "is", null);
        }
      }

      await query.execute();
    },

    async assertScopeAccessible(tDb, userId, scope): Promise<void> {
      if (scope.scopeType === "global") {
        // Global scope is always accessible.
        return;
      }

      if (scope.scopeId === null) {
        // Non-global scope requires a referent. The CHECK constraint
        // enforces this at the DB level too, but we fail early here.
        throw new NotFoundError("Scope referent not found");
      }

      if (scope.scopeType === "queue") {
        // Narrow the union: scopeType === "queue" guarantees QueueId at
        // runtime, but TypeScript cannot narrow NotificationScopeId from
        // a sibling-property check. Use queueIdSchema.parse which
        // validates and brands in one step.
        const queueId = queueIdSchema.parse(scope.scopeId);
        const queue = await tDb
          .selectFrom("queues")
          .select("id")
          .where("id", "=", queueId)
          .executeTakeFirst();

        if (!queue) {
          throw new NotFoundError("Scope referent not found");
        }
        return;
      }

      // Ticket scope (the only remaining scope type). The caller must
      // hold a key wrap for this ticket. This check doubles as an
      // existence check: a missing ticket also yields no wrap row. Both
      // failures produce the same NotFoundError so the endpoint is not
      // an existence oracle.
      // Same narrowing: ticketIdSchema.parse validates and brands.
      const ticketId = ticketIdSchema.parse(scope.scopeId);
      const wrap = await tDb
        .selectFrom("ticket_key_wraps")
        .select("id")
        .where("ticket_id", "=", ticketId)
        .where("volunteer_id", "=", userId)
        .executeTakeFirst();

      if (!wrap) {
        throw new NotFoundError("Scope referent not found");
      }
    },
  };
}

// -----------------------------------------------------------------------
// Query helpers
// -----------------------------------------------------------------------

type PrefEB = ExpressionBuilder<TenantDatabase, "notification_preferences">;

/**
 * Returns an expression callback for Kysely `.where()` that filters
 * preference rows to the relevant scopes. Always includes global rows.
 * If ticketId or queueId are provided, includes matching rows too.
 */
function scopeFilter(
  ticketId: TicketId | undefined,
  queueId: QueueId | undefined,
): (eb: PrefEB) => ReturnType<PrefEB["or"]> {
  return (eb: PrefEB) => {
    const conditions = [eb("scope_type", "=", "global")];
    if (queueId !== undefined) {
      conditions.push(
        eb.and([eb("scope_type", "=", "queue"), eb("scope_id", "=", queueId)]),
      );
    }
    if (ticketId !== undefined) {
      conditions.push(
        eb.and([
          eb("scope_type", "=", "ticket"),
          eb("scope_id", "=", ticketId),
        ]),
      );
    }
    return eb.or(conditions);
  };
}
