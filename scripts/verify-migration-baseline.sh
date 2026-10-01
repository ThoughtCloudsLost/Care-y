#!/usr/bin/env bash
# Checks that the tenant baseline migration builds exactly the schema the
# incremental tenant migrations it replaced used to build.
#
# Two fresh databases are created in the test stack. The reference database
# replays the tenant migration folder as it stood at the reference commit.
# The candidate database runs only 001_baseline.ts from the working tree,
# so migrations added after the baseline do not enter the comparison. Both
# are dumped with pg_dump --schema-only and diffed. Any difference fails.
#
# Requires the test stack to be running (pnpm test:up).
#
# Usage:
#   scripts/verify-migration-baseline.sh [reference-ref]
#
# reference-ref defaults to the parent of the commit that deleted the old
# migration files. While that deletion is still uncommitted, HEAD is the
# reference.
set -euo pipefail

# Git Bash on Windows rewrites arguments that look like POSIX paths; the
# container paths below must reach docker unchanged.
export MSYS_NO_PATHCONV=1

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TENANT_DIR="packages/server/src/db/migrations/tenant"
BASELINE_FILE="$TENANT_DIR/001_baseline.ts"
# Any file from the replaced set identifies it in history.
CHAIN_MARKER="$TENANT_DIR/001_create_users.ts"

COMPOSE=(docker compose -f docker-compose.test.yml)
SCHEMA="baseline_verify"
REFERENCE_DB="care_y_baseline_reference"
CANDIDATE_DB="care_y_baseline_candidate"
CONTAINER_DIR="/tmp/baseline-verify"

fail() {
  echo "verify-migration-baseline: $*" >&2
  exit 1
}

# ── Resolve the reference commit ─────────────────────────────────────

if [ $# -ge 1 ]; then
  REFERENCE="$1"
elif git cat-file -e "HEAD:$CHAIN_MARKER" 2>/dev/null; then
  REFERENCE="HEAD"
else
  deleting_commit="$(git log -1 --format=%H --diff-filter=D -- "$CHAIN_MARKER")"
  [ -n "$deleting_commit" ] ||
    fail "no commit removes $CHAIN_MARKER; pass the reference ref explicitly"
  REFERENCE="${deleting_commit}^"
fi

REFERENCE_SHA="$(git rev-parse --verify --quiet "${REFERENCE}^{commit}")" ||
  fail "reference '$REFERENCE' is not a commit"
git cat-file -e "$REFERENCE_SHA:$CHAIN_MARKER" 2>/dev/null ||
  fail "reference $REFERENCE_SHA does not contain the incremental migrations"
if git cat-file -e "$REFERENCE_SHA:$BASELINE_FILE" 2>/dev/null; then
  fail "reference $REFERENCE_SHA already contains $BASELINE_FILE"
fi
[ -f "$BASELINE_FILE" ] || fail "$BASELINE_FILE not found in the working tree"

echo "Reference: $REFERENCE_SHA ($REFERENCE)"
echo "Candidate: $BASELINE_FILE (working tree)"

# ── Stage both migration folders and the runner ──────────────────────

WORK="$(mktemp -d)"
keep_work=false
trap cleanup EXIT

drop_databases() {
  printf 'DROP DATABASE IF EXISTS %s;\nDROP DATABASE IF EXISTS %s;\n' \
    "$REFERENCE_DB" "$CANDIDATE_DB" | psql_admin
}

cleanup() {
  if ! drop_databases; then
    echo "verify-migration-baseline: could not drop $REFERENCE_DB and $CANDIDATE_DB; drop them by hand" >&2
  fi
  if [ "$keep_work" = false ]; then
    rm -rf "$WORK"
  fi
}

psql_admin() {
  "${COMPOSE[@]}" exec -T db sh -c \
    'psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}

mkdir -p "$WORK/reference" "$WORK/candidate"
git archive "$REFERENCE_SHA" "$TENANT_DIR" |
  tar -x -C "$WORK/reference" --strip-components=6
cp "$BASELINE_FILE" "$WORK/candidate/"

reference_count="$(find "$WORK/reference" -name '*.ts' | wc -l | tr -d ' ')"
[ "$reference_count" -gt 1 ] ||
  fail "reference folder holds $reference_count migration files"
echo "Reference migrations: $reference_count"

# Runs one migration folder into a fresh schema of the named database.
# DATABASE_URL in the app container points at the stack's own database; only
# the database name in it changes, and the runner keeps the URL out of its
# output.
cat > "$WORK/run-migrations.mts" <<'RUNNER'
import * as fs from "node:fs/promises";
import * as path from "node:path";
import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";

const [database, schema, folder] = process.argv.slice(2);
const baseUrl = process.env.DATABASE_URL;
if (!database || !schema || !folder) {
  console.error("usage: run-migrations.mts <database> <schema> <folder>");
  process.exit(2);
}
if (!baseUrl) {
  console.error("DATABASE_URL is not set in the app container");
  process.exit(2);
}

const url = new URL(baseUrl);
url.pathname = `/${database}`;
const pool = new pg.Pool({ connectionString: url.toString(), max: 1 });
const root = new Kysely<unknown>({ dialect: new PostgresDialect({ pool }) });

try {
  await sql`CREATE SCHEMA ${sql.id(schema)}`.execute(root);
  const migrator = new Migrator({
    db: root.withSchema(schema),
    provider: new FileMigrationProvider({ fs, path, migrationFolder: folder }),
    migrationTableSchema: schema,
  });
  const { error, results } = await migrator.migrateToLatest();
  for (const r of results ?? []) {
    console.log(`  ${r.status} ${r.migrationName}`);
  }
  if (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
} finally {
  await root.destroy();
}
RUNNER

# The staged files resolve kysely and pg through a node_modules link to the
# server package's installed dependencies.
tar -C "$WORK" -cf - reference candidate run-migrations.mts |
  "${COMPOSE[@]}" exec -T app sh -c \
    "rm -rf '$CONTAINER_DIR' && mkdir -p '$CONTAINER_DIR' && tar -xf - -C '$CONTAINER_DIR' && ln -s /app/packages/server/node_modules '$CONTAINER_DIR/node_modules'"

# ── Build both schemas ───────────────────────────────────────────────

drop_databases
printf 'CREATE DATABASE %s;\nCREATE DATABASE %s;\n' \
  "$REFERENCE_DB" "$CANDIDATE_DB" | psql_admin

run_migrations() {
  local database="$1" folder="$2"
  echo "Migrating $database from $folder:"
  "${COMPOSE[@]}" exec -T app sh -c \
    "cd /app/packages/server && pnpm exec tsx '$CONTAINER_DIR/run-migrations.mts' '$database' '$SCHEMA' '$CONTAINER_DIR/$folder'"
}

run_migrations "$REFERENCE_DB" reference
run_migrations "$CANDIDATE_DB" candidate

# ── Dump and compare ─────────────────────────────────────────────────

# pg_dump 16.10 and later bracket the dump with \restrict and \unrestrict
# lines carrying a random key that differs on every run. They are not
# schema, so they are removed before comparing.
dump_schema() {
  local database="$1" out="$2"
  "${COMPOSE[@]}" exec -T db sh -c \
    "pg_dump -U \"\$POSTGRES_USER\" --schema-only --schema='$SCHEMA' '$database'" |
    tr -d '\r' |
    sed -E '/^\\(un)?restrict /d' > "$out"
  [ -s "$out" ] || fail "pg_dump of $database produced no output"
}

dump_schema "$REFERENCE_DB" "$WORK/reference.sql"
dump_schema "$CANDIDATE_DB" "$WORK/candidate.sql"

"${COMPOSE[@]}" exec -T app rm -rf "$CONTAINER_DIR"

reference_tables="$(grep -c '^CREATE TABLE' "$WORK/reference.sql" || true)"
candidate_tables="$(grep -c '^CREATE TABLE' "$WORK/candidate.sql" || true)"
reference_indexes="$(grep -c '^CREATE \(UNIQUE \)\?INDEX' "$WORK/reference.sql" || true)"
candidate_indexes="$(grep -c '^CREATE \(UNIQUE \)\?INDEX' "$WORK/candidate.sql" || true)"
echo "Tables:  reference $reference_tables, candidate $candidate_tables"
echo "Indexes: reference $reference_indexes, candidate $candidate_indexes"

if diff -u "$WORK/reference.sql" "$WORK/candidate.sql"; then
  echo "Schemas are identical."
else
  keep_work=true
  echo "Schemas differ. Both dumps are kept in $WORK" >&2
  exit 1
fi
