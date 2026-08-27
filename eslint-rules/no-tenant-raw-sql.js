/**
 * ESLint rule: no-tenant-raw-sql
 *
 * Flags raw `sql` tagged templates that name a database object without
 * qualifying it.
 *
 * Kysely's WithSchemaPlugin is an AST transformer: it rewrites unqualified
 * table references in queries built through the query builder. A raw `sql`
 * tagged template is passed through verbatim, so it never gets the tenant
 * schema prefix (Kysely #761). Nothing in this codebase sets `search_path`,
 * so an unqualified object name in raw SQL resolves against the connection
 * default (`public`) rather than the tenant schema.
 *
 * The result is silent cross-tenant behavior: one shared object standing in
 * for what the surrounding code believes is a per-tenant object.
 *
 * What counts as naming an object: DDL on a table, sequence, index, view,
 * trigger, type, or schema; INSERT INTO, UPDATE, DELETE FROM, TRUNCATE; a
 * FROM or JOIN clause; and the sequence functions nextval, currval, setval.
 *
 * What does not, and is deliberately allowed: column type names (`bytea`,
 * `uuid[]`), default expressions (`now()`, `false`), CHECK constraints that
 * reference columns only, savepoints, advisory locks, and scalar function
 * calls over columns (`to_char(created_at, ...)`).
 *
 * A template that interpolates `sql.id(...)` is treated as deliberately
 * qualified and is not flagged, which is the established pattern for
 * schema-scoped DDL (see db/schema-create.ts and test-utils.ts).
 *
 * Platform-only files legitimately reference unqualified platform tables and
 * are turned off in eslint.config.js rather than carrying inline disables.
 */

/**
 * Statement forms that name a database object.
 *
 * Each requires an identifier character after the keyword so that a bare
 * keyword inside a larger expression does not trip the rule.
 */
const OBJECT_REFERENCE_PATTERNS = [
  // CREATE/DROP/ALTER on a named object, with optional modifiers between.
  /\b(?:CREATE|DROP|ALTER)\s+(?:(?:UNLOGGED|TEMP|TEMPORARY|MATERIALIZED|UNIQUE)\s+)*(?:TABLE|SEQUENCE|INDEX|VIEW|TRIGGER|TYPE|SCHEMA)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?([\w".@]+)/gi,
  /\bINSERT\s+INTO\s+([\w".@]+)/gi,
  /\bDELETE\s+FROM\s+([\w".@]+)/gi,
  /\bTRUNCATE\s+(?:TABLE\s+)?([\w".@]+)/gi,
  /\bUPDATE\s+([\w".@]+)\s+SET\b/gi,
  /\b(?:FROM|JOIN)\s+([\w".@]+)/gi,
  // Sequence functions take the object name as a quoted string argument.
  /\b(?:nextval|currval|setval)\s*\(\s*'([^']*)'/gi,
];

/**
 * SQL functions that take a FROM keyword as an argument separator rather
 * than as a table clause. Their arguments are stripped before matching so
 * `EXTRACT(MONTH FROM created_at)` does not read as a FROM clause.
 */
const FROM_TAKING_FUNCTIONS =
  /\b(?:EXTRACT|SUBSTRING|TRIM|POSITION|OVERLAY)\s*\(([^()]|\([^()]*\))*\)/gi;

/**
 * Placeholder substituted for each `${...}` interpolation. Contains no
 * identifier characters, so a pattern cannot match across the boundary
 * between a static chunk and an interpolated value.
 */
const INTERPOLATION_PLACEHOLDER = " @@ ";

/** Returns true when the tag is `sql`, `sql<...>`, or `sql.raw`. */
function isSqlTag(tag) {
  if (!tag) return false;
  if (tag.type === "Identifier") return tag.name === "sql";
  // sql<{ nextval: string }>`...` parses as a type instantiation.
  if (tag.type === "TSInstantiationExpression") return isSqlTag(tag.expression);
  // sql.raw`...` bypasses even more than sql`...` does.
  if (tag.type === "MemberExpression") {
    return tag.object.type === "Identifier" && tag.object.name === "sql";
  }
  return false;
}

/** Returns true when the template interpolates a `sql.id(...)` call. */
function hasIdentifierQualification(expressions) {
  return expressions.some((expr) => {
    if (expr.type !== "CallExpression") return false;
    const callee = expr.callee;
    return (
      callee.type === "MemberExpression" &&
      callee.object.type === "Identifier" &&
      callee.object.name === "sql" &&
      callee.property.type === "Identifier" &&
      callee.property.name === "id"
    );
  });
}

/**
 * Returns true when a captured object name is already qualified, or when it
 * cannot be judged statically.
 *
 * A dotted name carries its own schema, which is the outcome this rule exists
 * to encourage, so `information_schema.tables` and `public.pending_jobs` pass.
 * A name that landed on an interpolation is unknowable at lint time; those are
 * left alone rather than guessed at, since `sql.id()` is the supported way to
 * make the intent explicit and is already recognized above.
 */
function isQualifiedOrOpaque(name) {
  if (name.includes(".")) return true;
  if (name.includes("@")) return true;
  return isSystemCatalog(name);
}

/**
 * Returns true for system catalog relations.
 *
 * Postgres resolves `pg_catalog` and `information_schema` through an implicit
 * search path entry that is always present and is never a tenant schema, so a
 * bare `pg_indexes` or `information_schema.tables` cannot be the cross-tenant
 * mistake this rule looks for. Introspection in migration tests reads these.
 */
function isSystemCatalog(name) {
  const bare = name.replace(/"/g, "").toLowerCase();
  return bare.startsWith("pg_") || bare.startsWith("information_schema");
}

/** Joins the static chunks of a template, masking interpolated values. */
function staticText(quasi) {
  return quasi.quasis
    .map((element) => element.value.cooked ?? element.value.raw)
    .join(INTERPOLATION_PLACEHOLDER);
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw sql tagged templates that name a database object without schema qualification",
    },
    schema: [],
    messages: {
      unqualified:
        "Raw sql`` names a database object but is not schema-qualified. Kysely's withSchema does not rewrite raw templates (Kysely #761) and nothing sets search_path, so this resolves against public rather than the tenant schema. Use the query builder, or qualify the name with sql.id(schemaName).",
    },
  },

  create(context) {
    return {
      TaggedTemplateExpression(node) {
        if (!isSqlTag(node.tag)) return;
        if (hasIdentifierQualification(node.quasi.expressions)) return;

        const text = staticText(node.quasi).replace(FROM_TAKING_FUNCTIONS, "");

        const namesUnqualifiedObject = OBJECT_REFERENCE_PATTERNS.some(
          (pattern) => {
            // Patterns carry the global flag, so reset before reuse.
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(text)) !== null) {
              if (!isQualifiedOrOpaque(match[1])) return true;
            }
            return false;
          },
        );
        if (!namesUnqualifiedObject) return;

        context.report({ node, messageId: "unqualified" });
      },
    };
  },
};

export default rule;
