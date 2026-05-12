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

      if (
        config?.getting_started_dismissed_at !== null &&
        config?.getting_started_dismissed_at !== undefined
      ) {
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
        db
          .selectFrom("users")
          .select(db.fn.countAll<string>().as("count"))
          .where("is_active", "=", true)
          .executeTakeFirstOrThrow()
          .then(toCount),
        db
          .selectFrom("phone_greetings")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow()
          .then(toCount),
        db
          .selectFrom("sms_responses")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow()
          .then(toCount),
        db
          .selectFrom("preset_replies")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow()
          .then(toCount),
        db
          .selectFrom("kb_items")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow()
          .then(toCount),
        db
          .selectFrom("queues")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow()
          .then(toCount),
      ]);

      const hasLogo =
        config?.encrypted_logo !== null && config?.encrypted_logo !== undefined;
      const hasRetention =
        config?.pii_retention_days !== null &&
        config?.pii_retention_days !== undefined;

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
