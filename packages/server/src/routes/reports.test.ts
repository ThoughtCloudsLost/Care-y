/**
 * Unit tests for the reports tRPC router.
 *
 * Tests router structure and procedure wiring.
 * Full DB integration tests run inside Docker via pnpm test:server:db.
 */

import { describe, it, expect } from "vitest";
import { createReportsRouter } from "./reports.js";

describe("createReportsRouter", () => {
  it("creates a router without errors", () => {
    const routerInstance = createReportsRouter();
    expect(routerInstance).toBeDefined();
  });

  it("router exposes all expected procedures", () => {
    const routerInstance = createReportsRouter();
    const keys = Object.keys(routerInstance._def.procedures);
    expect(keys).toContain("queueStats");
    expect(keys).toContain("volumeTrends");
    expect(keys).toContain("resolutionTrends");
    expect(keys).toContain("priorityBreakdown");
    expect(keys).toContain("activeCount");
  });

  it("exposes exactly 5 procedures", () => {
    const routerInstance = createReportsRouter();
    const keys = Object.keys(routerInstance._def.procedures);
    expect(keys).toHaveLength(5);
  });
});
