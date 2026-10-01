/**
 * Tests for the database connection config.
 *
 * db.ts reads DATABASE_URL through getEnv() at import time, so in
 * production the value comes from the secrets file via initEnv(source) and
 * never from process.env (ADR-129). Each case resets the module registry
 * and imports fresh copies of env.ts and db.ts, so the import-time read
 * sees the config the case sets up. No connection is opened.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SOURCE_DB_URL =
  "postgresql://carey:test-source-db-password@db:5432/carey";

describe("pgConnectionConfig", () => {
  let savedDatabaseUrl: string | undefined;

  beforeEach(() => {
    savedDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    vi.resetModules();
  });

  afterEach(() => {
    if (savedDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = savedDatabaseUrl;
    }
    vi.resetModules();
  });

  it("takes DATABASE_URL from the initEnv source when process.env has none", async () => {
    const envModule = await import("../env.js");
    envModule.initEnv({
      NODE_ENV: "test",
      SESSION_SECRET: "a".repeat(64),
      DATABASE_URL: SOURCE_DB_URL,
      OPS_SECRETS_KEY: "ab".repeat(32),
    });

    const dbModule = await import("./db.js");
    try {
      expect(process.env.DATABASE_URL).toBeUndefined();
      expect(dbModule.pgConnectionConfig.connectionString).toBe(SOURCE_DB_URL);
    } finally {
      // The pool never connected; end() releases it without a round trip.
      await dbModule.pool.end();
    }
  });
});
