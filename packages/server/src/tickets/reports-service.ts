import { type Kysely, sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface QueueStat {
  readonly queueId: string;
  readonly encryptedQueueName: Buffer;
  readonly open: number;
  readonly closed: number;
}

export interface MonthlyVolume {
  readonly month: string;
  readonly created: number;
  readonly closed: number;
}

export interface MonthlyResolution {
  readonly month: string;
  readonly avgDays: number;
}

export interface PriorityStat {
  readonly priority: number;
  readonly count: number;
}

const PRIORITY_ORDER = new Map<string, number>([
  ["low", 0],
  ["normal", 1],
  ["high", 2],
  ["urgent", 3],
]);

/**
 * Maps a ticket priority string to its numeric chart order
 * (low 0, normal 1, high 2, urgent 3). Unknown values fall back
 * to 0 so a malformed row never breaks report queries.
 */
export function priorityToNumeric(priority: string): number {
  return PRIORITY_ORDER.get(priority) ?? 0;
}

export interface ReportsService {
  queueStats(): Promise<readonly QueueStat[]>;
  volumeTrends(): Promise<readonly MonthlyVolume[]>;
  resolutionTrends(): Promise<readonly MonthlyResolution[]>;
  priorityBreakdown(): Promise<readonly PriorityStat[]>;
  activeCount(): Promise<number>;
}

function twelveMonthCutoff(): Date {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 11);
  cutoff.setDate(1);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

function buildMonthlyGrid<T>(fill: (key: string) => T): T[] {
  const months: T[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(fill(key));
  }
  return months;
}

export function createReportsService(
  tenantDb: Kysely<TenantDatabase>,
): ReportsService {
  return {
    async queueStats(): Promise<readonly QueueStat[]> {
      const rows = await tenantDb
        .selectFrom("tickets")
        .innerJoin("queues", "queues.id", "tickets.queue_id")
        .select([
          "queues.id as queueId",
          "queues.encrypted_name as encryptedQueueName",
        ])
        .select((eb) => [
          eb.fn
            .count<number>(
              eb
                .case()
                .when("tickets.status", "=", "open")
                .then(eb.lit(1))
                .end(),
            )
            .as("open"),
          eb.fn
            .count<number>(
              eb
                .case()
                .when("tickets.status", "=", "closed")
                .then(eb.lit(1))
                .end(),
            )
            .as("closed"),
        ])
        .groupBy(["queues.id", "queues.encrypted_name"])
        .orderBy("queues.sort_order", "asc")
        .execute();

      return rows.map((r) => ({
        queueId: r.queueId,
        encryptedQueueName: r.encryptedQueueName,
        open: r.open,
        closed: r.closed,
      }));
    },

    async volumeTrends(): Promise<readonly MonthlyVolume[]> {
      const cutoff = twelveMonthCutoff();

      const created = await tenantDb
        .selectFrom("tickets")
        .select((eb) => [
          // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only aggregation; table refs go through Kysely's selectFrom, only the to_char call is raw
          sql<string>`to_char(${eb.ref("created_at")}, 'YYYY-MM')`.as("month"),
          eb.fn.count<number>("id").as("cnt"),
        ])
        .where("created_at", ">=", cutoff)
        // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only groupBy; no table ref in the sql fragment
        .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
        .execute();

      const closed = await tenantDb
        .selectFrom("followups")
        .innerJoin("tickets", "tickets.id", "followups.ticket_id")
        .select((eb) => [
          // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only aggregation; column refs via eb.ref, no table routing in the sql fragment
          sql<string>`to_char(${eb.ref("followups.created_at")}, 'YYYY-MM')`.as(
            "month",
          ),
          eb.fn.count<number>("followups.id").as("cnt"),
        ])
        .where("followups.type", "=", "status_closed")
        .where("followups.source", "=", "system")
        .where("tickets.status", "=", "closed")
        .where("followups.created_at", ">=", cutoff)
        // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only groupBy; no table ref in the sql fragment
        .groupBy(sql`to_char(followups.created_at, 'YYYY-MM')`)
        .execute();

      const createdMap = new Map(created.map((r) => [r.month, r.cnt]));
      const closedMap = new Map(closed.map((r) => [r.month, r.cnt]));

      return buildMonthlyGrid((key) => ({
        month: key,
        created: createdMap.get(key) ?? 0,
        closed: closedMap.get(key) ?? 0,
      }));
    },

    async resolutionTrends(): Promise<readonly MonthlyResolution[]> {
      const cutoff = twelveMonthCutoff();

      // For each closed ticket, find the closing follow-up's created_at.
      // Resolution time = closing follow-up created_at - ticket created_at.
      const rows = await tenantDb
        .selectFrom("followups")
        .innerJoin("tickets", "tickets.id", "followups.ticket_id")
        .select((eb) => [
          // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only aggregation; column refs via eb.ref, no table routing in the sql fragment
          sql<string>`to_char(${eb.ref("followups.created_at")}, 'YYYY-MM')`.as(
            "month",
          ),
          // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only aggregation; column refs via eb.ref, no table routing in the sql fragment
          sql<string>`avg(extract(epoch from (${eb.ref("followups.created_at")} - ${eb.ref("tickets.created_at")})) / 86400)`.as(
            "avgDays",
          ),
        ])
        .where("followups.type", "=", "status_closed")
        .where("followups.source", "=", "system")
        .where("tickets.status", "=", "closed")
        .where("followups.created_at", ">=", cutoff)
        // care-y-ignore-next-line no-raw-sql-tenant-tables -- read-only groupBy; no table ref in the sql fragment
        .groupBy(sql`to_char(followups.created_at, 'YYYY-MM')`)
        .execute();

      const resMap = new Map(
        rows.map((r) => [r.month, Math.round(Number(r.avgDays) * 10) / 10]),
      );

      return buildMonthlyGrid((key) => ({
        month: key,
        avgDays: resMap.get(key) ?? 0,
      }));
    },

    async priorityBreakdown(): Promise<readonly PriorityStat[]> {
      const rows = await tenantDb
        .selectFrom("tickets")
        .select(["priority"])
        .select((eb) => [eb.fn.count<number>("id").as("count")])
        .where("status", "=", "open")
        .groupBy("priority")
        .execute();

      return rows
        .map((r) => ({
          priority: priorityToNumeric(r.priority),
          count: r.count,
        }))
        .sort((a, b) => a.priority - b.priority);
    },

    async activeCount(): Promise<number> {
      const result = await tenantDb
        .selectFrom("tickets")
        .select((eb) => [eb.fn.count<number>("id").as("count")])
        .where("status", "=", "open")
        .executeTakeFirstOrThrow();

      return result.count;
    },
  };
}
