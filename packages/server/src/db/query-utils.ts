/**
 * Query result helpers for Kysely/PostgreSQL.
 *
 * PostgreSQL returns COUNT(*) as a string (bigint serialization).
 * These helpers centralize the coercion so callers don't repeat
 * Number() casts throughout the codebase.
 */

/**
 * Coerce a Kysely COUNT result to a number.
 *
 * PostgreSQL's pg driver serializes bigint as string. Kysely's
 * `db.fn.countAll().as("count")` returns `{ count: string | number | bigint }`.
 * This helper handles all three forms.
 */
export function toCount(result: { count: string | number | bigint }): number {
  return Number(result.count);
}
