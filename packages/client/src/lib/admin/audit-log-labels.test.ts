import { describe, it, expect, vi } from "vitest";
import { auditEventTypeSchema } from "@care-y/shared";
import type * as WithTermsModule from "$lib/terminology/with-terms.js";
import { auditEventLabel } from "./audit-log-labels.js";

// vi.mock required: withTerms resolves org terminology through a Svelte
// context getter (createContext), which only exists during component
// initialization; these tests call auditEventLabel outside any component,
// where the real getter throws.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsModule>()),
  withTerms: (extra?: Record<string, unknown>) => ({
    client: "client",
    Client: "Client",
    ticket: "ticket",
    Ticket: "Ticket",
    ...extra,
  }),
}));

describe("auditEventLabel", () => {
  it.each(auditEventTypeSchema.options)("labels %s", (eventType) => {
    const label = auditEventLabel(eventType);
    // An unlabelled type falls through as its raw value.
    expect(label).not.toBe(eventType);
    expect(label.length).toBeGreaterThan(0);
  });

  it("returns an unknown event type unchanged", () => {
    expect(auditEventLabel("not_a_real_event")).toBe("not_a_real_event");
  });
});
