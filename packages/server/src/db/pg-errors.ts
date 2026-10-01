/**
 * PostgreSQL error code helpers.
 *
 * Provides typed detection for common PG error codes without pulling in
 * a dependency. Used by services that catch Kysely query errors.
 */

const PG_UNIQUE_VIOLATION = "23505";

export function isPgUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === PG_UNIQUE_VIOLATION
  );
}

const PG_INSUFFICIENT_PRIVILEGE = "42501";

/**
 * True for SQLSTATE 42501 (insufficient_privilege): the current role lacks
 * the privilege the statement needs, such as UPDATE on an append-only table.
 */
export function isPgPermissionDenied(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === PG_INSUFFICIENT_PRIVILEGE
  );
}
