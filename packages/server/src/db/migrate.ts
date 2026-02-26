import * as path from "node:path";
import * as fs from "node:fs/promises";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "./db.js";

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(import.meta.dirname, "migrations"),
  }),
});

const direction = process.argv[2]; // 'up' | 'down'

if (direction === "down") {
  const { error, results } = await migrator.migrateDown();
  if (!results || results.length === 0) {
    console.log("No migrations to roll back");
  }
  results?.forEach((r) => {
    console.log(r.status, r.migrationName);
  });
  if (error) {
    console.error(error);
    process.exit(1);
  }
} else {
  const { error, results } = await migrator.migrateToLatest();
  if (!results || results.length === 0) {
    console.log("No migrations to apply");
  }
  results?.forEach((r) => {
    console.log(r.status, r.migrationName);
  });
  if (error) {
    console.error(error);
    process.exit(1);
  }
}

await db.destroy();
