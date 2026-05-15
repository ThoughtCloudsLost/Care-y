import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { toCount } from "../db/query-utils.js";

export interface ChecklistItem {
  readonly id: string;
  readonly complete: boolean;
}

export interface SetupChecklistResult {
  readonly dismissed: boolean;
  readonly items: ChecklistItem[];
}

export interface DashboardService {
  getSetupChecklist(): Promise<SetupChecklistResult>;
  dismissSetupChecklist(): Promise<void>;
}

async function countRows(
  db: Kysely<TenantDatabase>,
  table: keyof TenantDatabase,
): Promise<number> {
  const row = await db
    .selectFrom(table)
    .select(db.fn.countAll<string>().as("count"))
    .executeTakeFirstOrThrow();
  return toCount(row);
}

async function countActiveUsers(db: Kysely<TenantDatabase>): Promise<number> {
  const row = await db
    .selectFrom("users")
    .select(db.fn.countAll<string>().as("count"))
    .where("is_active", "=", true)
    .executeTakeFirstOrThrow();
  return toCount(row);
}

export function createDashboardService(
  db: Kysely<TenantDatabase>,
): DashboardService {
  return {
    async getSetupChecklist(): Promise<SetupChecklistResult> {
      const config = await db
        .selectFrom("org_config")
        .select([
          "getting_started_dismissed_at",
          "encrypted_logo",
          "pii_retention_days",
        ])
        .executeTakeFirst();

      if (config?.getting_started_dismissed_at != null) {
        return { dismissed: true, items: [] };
      }

      const [
        userCount,
        greetingCount,
        smsCount,
        presetCount,
        kbCount,
        queueCount,
      ] = await Promise.all([
        countActiveUsers(db),
        countRows(db, "phone_greetings"),
        countRows(db, "sms_responses"),
        countRows(db, "preset_replies"),
        countRows(db, "kb_items"),
        countRows(db, "queues"),
      ]);

      const hasLogo = config?.encrypted_logo != null;
      const hasRetention = config?.pii_retention_days != null;

      return {
        dismissed: false,
        items: [
          { id: "invite", complete: userCount > 1 },
          { id: "branding", complete: hasLogo },
          { id: "greetings", complete: greetingCount > 0 },
          { id: "sms", complete: smsCount > 0 },
          { id: "presets", complete: presetCount > 0 },
          { id: "kb", complete: kbCount > 0 },
          { id: "queues", complete: queueCount > 1 },
          { id: "retention", complete: hasRetention },
        ],
      };
    },

    async dismissSetupChecklist(): Promise<void> {
      await db
        .updateTable("org_config")
        .set({ getting_started_dismissed_at: new Date() })
        .execute();
    },
  };
}
