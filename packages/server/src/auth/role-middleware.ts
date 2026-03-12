// requireRole lives in trpc.ts (needs access to the `middleware` singleton).
// Re-exported here so callers that import from auth/role-middleware keep working.
export { requireRole } from "../trpc/trpc.js";
