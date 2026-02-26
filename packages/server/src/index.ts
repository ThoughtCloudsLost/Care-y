import "./env.js"; // validates env vars at startup - must be first import

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { initTRPC } from "@trpc/server";
import { db } from "./db/db.js";
import { sql } from "kysely";

// --- DB startup probe ---
// Kysely pools are lazy - probe immediately so the container log is meaningful.
try {
  await db.executeQuery(sql`SELECT 1`.compile(db));
  console.log("Database connected");
} catch (err) {
  // Log only the message - the full error object may contain DATABASE_URL (credentials).
  const msg = err instanceof Error ? err.message : String(err);
  console.error("Database connection failed:", msg);
  process.exit(1);
}

// --- tRPC router ---
const t = initTRPC.create();

const appRouter = t.router({
  health: t.procedure.query(() => ({ status: "ok" as const })),
});

export type AppRouter = typeof appRouter;

// --- HTTP server ---
const server = createHTTPServer({ router: appRouter });
const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);
