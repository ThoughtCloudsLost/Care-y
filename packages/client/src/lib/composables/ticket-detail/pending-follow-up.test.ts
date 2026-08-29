import { describe, it, expect } from "vitest";
import { newPendingFollowupId } from "@care-y/shared";
import { buildPendingFollowUpEntry } from "./pending-follow-up.js";
import type { PendingEntryOpts } from "./create-send-message.svelte.js";

function makeOpts(overrides?: Partial<PendingEntryOpts>): PendingEntryOpts {
  return {
    pendingId: newPendingFollowupId(),
    ticketId: crypto.randomUUID(),
    mentionedPseudonyms: [],
    currentUserId: crypto.randomUUID(),
    text: "hello",
    ...overrides,
  };
}

describe("buildPendingFollowUpEntry", () => {
  it("builds a volunteer message entry carrying the pending id and ids", () => {
    const opts = makeOpts({ mentionedPseudonyms: ["Alice"] });
    const entry = buildPendingFollowUpEntry(opts);

    expect(entry.id).toBe(opts.pendingId);
    expect(entry.ticketId).toBe(opts.ticketId);
    expect(entry.createdBy).toBe(opts.currentUserId);
    expect(entry.source).toBe("volunteer");
    expect(entry.type).toBe("message");
    expect(entry.isPrivate).toBe(false);
    expect(entry.mentionedPseudonyms).toEqual(["Alice"]);
    // No key material on a pending entry: the seeded decrypt cache
    // supplies the text, not a decryptable wrap.
    expect(entry.keyWrap).toBeNull();
    expect(entry.portalWrap).toBeNull();
    expect(entry.encryptedContent).toBe("");
  });

  it("sets createdBy to null when no current user id is available", () => {
    const entry = buildPendingFollowUpEntry(makeOpts({ currentUserId: null }));
    expect(entry.createdBy).toBeNull();
  });

  it("rejects a non-UUID ticket id with ZodError", () => {
    // zod is not a direct client dependency, so assert on the error
    // name rather than importing the class.
    try {
      buildPendingFollowUpEntry(makeOpts({ ticketId: "not-a-uuid" }));
      expect.fail("Should have thrown");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).name).toBe("ZodError");
    }
  });
});
