import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // An account an administrator creates directly starts on a temporary
  // password the administrator chose. The holder's keys derive from their
  // password, so they replace it before reaching anything past onboarding.
  // Invited accounts and the first owner choose their own password and
  // keep the default.
  await db.schema
    .alterTable("users")
    .addColumn("must_change_password", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("users")
    .dropColumn("must_change_password")
    .execute();
}
