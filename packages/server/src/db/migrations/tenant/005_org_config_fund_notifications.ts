import type { Kysely } from "kysely";

// Whether holders of MANAGE_FUNDS hear about every ledger entry. On by
// default; an org turns it off from fund settings.
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("notify_fund_managers", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("notify_fund_managers")
    .execute();
}
