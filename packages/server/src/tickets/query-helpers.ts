import type { AliasedExpression, ExpressionBuilder, SqlBool } from "kysely";
import type { TenantDatabase } from "../db/types.js";

/**
 * Produces three EXISTS-based boolean select expressions:
 * has_recording, has_image, has_file.
 *
 * Callers spread the result into `.select((eb) => [...])`:
 * ```ts
 * .select((eb) => [...mediaExistsSelects(eb), ...otherSelects])
 * ```
 *
 * Hardcodes "followups.id" as the foreign key reference. For queries
 * that alias the followups table (e.g., "followups as f"), inline the
 * EXISTS subqueries directly.
 */
export function mediaExistsSelects(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Kysely ExpressionBuilder variance: callers have different table sets (with/without leftJoin), but exists() and selectFrom() work identically across them
  eb: ExpressionBuilder<TenantDatabase, any>,
): AliasedExpression<SqlBool, string>[] {
  return [
    eb
      .exists(
        eb
          .selectFrom("recordings as r")
          .whereRef("r.followup_id", "=", "followups.id")
          .where("r.deleted_at", "is", null)
          .select(eb.lit(1).as("one")),
      )
      .as("has_recording"),
    eb
      .exists(
        eb
          .selectFrom("attachments as a")
          .whereRef("a.followup_id", "=", "followups.id")
          .where("a.deleted_at", "is", null)
          .where("a.content_type", "like", "image/%")
          .select(eb.lit(1).as("one")),
      )
      .as("has_image"),
    eb
      .exists(
        eb
          .selectFrom("attachments as a2")
          .whereRef("a2.followup_id", "=", "followups.id")
          .where("a2.deleted_at", "is", null)
          .where((w) =>
            w.or([
              w("a2.content_type", "is", null),
              w("a2.content_type", "not like", "image/%"),
            ]),
          )
          .select(eb.lit(1).as("one")),
      )
      .as("has_file"),
  ];
}
