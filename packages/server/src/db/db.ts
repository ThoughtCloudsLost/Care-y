import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "./types.js";

// int8 (PostgreSQL bigint) is returned as string by pg by default.
// Override the parser so COUNT(*) and other int8 results come back as number.
// Must be set before creating the Pool.
pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

export const db = new Kysely<Database>({ dialect });
