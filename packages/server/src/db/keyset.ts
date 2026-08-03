/**
 * Keyset ("seek") pagination predicate builder.
 *
 * Every paginated list compares the current row against the cursor row
 * across an ordered list of sort keys, falling back to the row id when
 * every key ties. Written out by hand that is an OR of ANDs which grows
 * quadratically with the number of keys and is easy to get subtly wrong.
 *
 * IMPORTANT: cursor operands must be SQL expressions, normally a subquery
 * selecting the cursor row's value, never a value read into JavaScript
 * first. PostgreSQL stores timestamptz at microsecond precision and a JS
 * Date holds milliseconds, so a round-trip truncates: the cursor row's own
 * timestamp then compares as strictly greater than the truncated cursor and
 * the row repeats at the head of the next page, together with every other
 * row sharing its millisecond. Keeping the value in SQL avoids the whole
 * class of problem.
 */

import type {
  Expression,
  ExpressionBuilder,
  ReferenceExpression,
  SqlBool,
} from "kysely";

/** Comparison direction for the sort keys: ">" ascending, "<" descending. */
export type KeysetDirection = ">" | "<";

/**
 * One sort key: the current row's value and the cursor row's value.
 * Both may be a column reference or any expression (case, subquery, aggregate).
 */
export type KeysetKey<DB, TB extends keyof DB> = readonly [
  row: ReferenceExpression<DB, TB>,
  cursor: Expression<unknown>,
];

/**
 * Builds the predicate selecting rows strictly after the cursor row.
 *
 * `keys` are ordered major to minor and compared with `direction`. The id
 * tiebreak is always compared with ">", not with `direction`, because every
 * ORDER BY in this codebase pins id ASC: the cursor filter has to walk ids
 * ascending inside equal-key groups, and flipping it with the sort direction
 * makes descending pages skip and repeat rows on ties.
 *
 * With keys [a, b] and tie id, this produces:
 *
 *   a > cursorA
 *   OR (a = cursorA AND b > cursorB)
 *   OR (a = cursorA AND b = cursorB AND id > cursorId)
 */
export function keysetAfter<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  direction: KeysetDirection,
  keys: readonly KeysetKey<DB, TB>[],
  tie: {
    readonly column: ReferenceExpression<DB, TB>;
    readonly cursorId: string;
  },
): Expression<SqlBool> {
  const branches: Expression<SqlBool>[] = [];

  // Equality conditions for every key already passed, accumulated as the
  // loop descends from major key to minor.
  const ties: Expression<SqlBool>[] = [];

  // One branch per key: all earlier keys tie and this key advances.
  for (const [row, cursor] of keys) {
    branches.push(eb.and([...ties, eb(row, direction, cursor)]));
    ties.push(eb(row, "=", cursor));
  }

  // Final branch: every key ties, so the id decides.
  branches.push(eb.and([...ties, eb(tie.column, ">", tie.cursorId)]));

  return eb.or(branches);
}
