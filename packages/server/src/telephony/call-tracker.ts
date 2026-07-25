import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface TrackedCall {
  readonly ticketId: string;
  readonly userId: string | null;
  readonly direction: "inbound" | "outbound";
  readonly orgSchema: string;
  readonly clientId: string | null;
  readonly createdAt: number;
}

export interface CallTracker {
  track(orgSchema: string, callSid: string, call: TrackedCall): Promise<void>;
  get(orgSchema: string, callSid: string): Promise<TrackedCall | undefined>;
  remove(orgSchema: string, callSid: string): Promise<void>;
  stop(): void;
}

export const TTL_MS = 60 * 60 * 1000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const IN_MEMORY_SWEEP_MS = 60 * 1000;

export function createCallTracker(): CallTracker {
  const calls = new Map<string, TrackedCall>();

  const timer = setInterval(() => {
    const cutoff = Date.now() - TTL_MS;
    for (const [key, call] of calls) {
      if (call.createdAt < cutoff) calls.delete(key);
    }
  }, IN_MEMORY_SWEEP_MS);

  timer.unref();

  function compositeKey(orgSchema: string, callSid: string): string {
    return orgSchema + " " + callSid;
  }

  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- in-memory: no real I/O to await
    async track(
      orgSchema: string,
      callSid: string,
      call: TrackedCall,
    ): Promise<void> {
      calls.set(compositeKey(orgSchema, callSid), call);
    },
    // eslint-disable-next-line @typescript-eslint/require-await -- in-memory: no real I/O to await
    async get(
      orgSchema: string,
      callSid: string,
    ): Promise<TrackedCall | undefined> {
      return calls.get(compositeKey(orgSchema, callSid));
    },
    // eslint-disable-next-line @typescript-eslint/require-await -- in-memory: no real I/O to await
    async remove(orgSchema: string, callSid: string): Promise<void> {
      calls.delete(compositeKey(orgSchema, callSid));
    },
    stop(): void {
      clearInterval(timer);
    },
  };
}

export function createDbCallTracker(
  getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>,
  listOrgSchemas: () => Promise<string[]>,
): CallTracker {
  const timer = setInterval(() => {
    void sweepExpired();
  }, SWEEP_INTERVAL_MS);
  timer.unref();

  async function sweepExpired(): Promise<void> {
    let schemas: string[];
    try {
      schemas = await listOrgSchemas();
    } catch (err: unknown) {
      console.error(
        "call-tracker sweep: failed to list org schemas",
        err instanceof Error ? err.message : String(err),
      );
      return;
    }

    const cutoff = new Date(Date.now() - TTL_MS);

    for (const schema of schemas) {
      try {
        const db = getTenantDb(schema);
        await db
          .deleteFrom("tracked_calls")
          .where("created_at", "<", cutoff)
          .execute();
      } catch (err: unknown) {
        console.error(
          `call-tracker sweep: failed for schema ${schema}`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  }

  return {
    async track(
      orgSchema: string,
      callSid: string,
      call: TrackedCall,
    ): Promise<void> {
      const db = getTenantDb(orgSchema);
      await db
        .insertInto("tracked_calls")
        .values({
          call_sid: callSid,
          ticket_id: call.ticketId === "" ? null : call.ticketId,
          user_id: call.userId,
          direction: call.direction,
          client_id: call.clientId,
        })
        .onConflict((oc) =>
          oc.column("call_sid").doUpdateSet({
            ticket_id: call.ticketId === "" ? null : call.ticketId,
            user_id: call.userId,
            direction: call.direction,
            client_id: call.clientId,
          }),
        )
        .execute();
    },

    async get(
      orgSchema: string,
      callSid: string,
    ): Promise<TrackedCall | undefined> {
      const db = getTenantDb(orgSchema);
      const cutoff = new Date(Date.now() - TTL_MS);
      const row = await db
        .selectFrom("tracked_calls")
        .selectAll()
        .where("call_sid", "=", callSid)
        .where("created_at", ">", cutoff)
        .executeTakeFirst();

      if (!row) return undefined;

      return {
        ticketId: row.ticket_id ?? "",
        userId: row.user_id,
        direction: row.direction === "outbound" ? "outbound" : "inbound",
        orgSchema,
        clientId: row.client_id,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at.getTime()
            : Date.now(),
      };
    },

    async remove(orgSchema: string, callSid: string): Promise<void> {
      const db = getTenantDb(orgSchema);
      await db
        .deleteFrom("tracked_calls")
        .where("call_sid", "=", callSid)
        .execute();
    },

    stop(): void {
      clearInterval(timer);
    },
  };
}
