import { describe, it, expect, vi } from "vitest";
import {
  createCardPropsMapper,
  mapTicketDisplayFields,
  type CardPropsMapperDeps,
  type TicketDisplayFieldDeps,
  type TicketLikeRecord,
} from "./ticket-card-props.js";
import type { RawFollowUpPreview } from "./preview-loader.svelte.js";
import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";
import * as m from "$lib/paraglide/messages.js";
import type { ReactionSummary } from "@care-y/shared";

function makeRecord(
  overrides: Partial<TicketLikeRecord> & { id: string },
): TicketLikeRecord {
  return {
    queueId: "q1",
    encryptedQueueName: "enc-queue",
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "enc-title",
    keyWrap: { wrapped: true },
    clientId: "c1",
    encryptedClientAlias: "enc-alias",
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-01-01T00:00:00Z",
    lastActivityAt: null,
    followUpCount: 0,
    queueSortOrder: 1,
    ...overrides,
  };
}

function makeFieldDeps(
  overrides?: Partial<TicketDisplayFieldDeps>,
): TicketDisplayFieldDeps {
  return {
    orgDecrypt: (cacheKey: string) => {
      if (cacheKey.startsWith("queue:")) return "Housing";
      if (cacheKey.startsWith("client-alias:")) return "Anonymous";
      return "Sam Volunteer";
    },
    decryptTitle: () => "Shelter referral",
    currentUserId: "viewer-1",
    ...overrides,
  };
}

function makePreview(id: string): RawFollowUpPreview {
  return {
    id,
    source: "volunteer",
    type: "internal_note",
    encryptedContent: "enc-content",
    keyWrap: null,
    createdAt: "2026-01-02T00:00:00Z",
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
    eventParams: null,
  };
}

describe("mapTicketDisplayFields", () => {
  it("decrypts the queue name under the queue cache key", () => {
    const orgDecrypt = vi.fn((key: string) =>
      key === "queue:q1" ? "Housing" : null,
    );
    const fields = mapTicketDisplayFields(
      makeRecord({ id: "t1" }),
      makeFieldDeps({ orgDecrypt }),
    );
    expect(fields.queueName).toBe("Housing");
    expect(orgDecrypt).toHaveBeenCalledWith("queue:q1", "enc-queue");
  });

  it("labels self-assigned tickets with the You copy, skipping the assignee decrypt", () => {
    const orgDecrypt = vi.fn(() => null);
    const fields = mapTicketDisplayFields(
      makeRecord({
        id: "t1",
        assignedTo: "viewer-1",
        assignedDisplayName: "enc-name",
      }),
      makeFieldDeps({ orgDecrypt }),
    );
    expect(fields.assignedIsSelf).toBe(true);
    expect(fields.assignedName).toBe(m.dashboard_assigned_you());
    expect(orgDecrypt).not.toHaveBeenCalledWith(
      "assignee:viewer-1",
      "enc-name",
    );
  });

  it("decrypts other assignees under the assignee cache key", () => {
    const orgDecrypt = vi.fn((key: string) =>
      key === "assignee:u9" ? "Sam Volunteer" : null,
    );
    const fields = mapTicketDisplayFields(
      makeRecord({
        id: "t1",
        assignedTo: "u9",
        assignedDisplayName: "enc-name",
      }),
      makeFieldDeps({ orgDecrypt }),
    );
    expect(fields.assignedIsSelf).toBe(false);
    expect(fields.assignedName).toBe("Sam Volunteer");
    expect(orgDecrypt).toHaveBeenCalledWith("assignee:u9", "enc-name");
  });

  it("leaves unassigned tickets with a null assignee name", () => {
    const fields = mapTicketDisplayFields(
      makeRecord({ id: "t1", assignedTo: null }),
      makeFieldDeps(),
    );
    expect(fields.assignedName).toBeNull();
    expect(fields.assignedIsSelf).toBe(false);
  });

  it("decrypts the client alias under the client-alias cache key", () => {
    const orgDecrypt = vi.fn((key: string) =>
      key === "client-alias:c1" ? "Jane" : null,
    );
    const fields = mapTicketDisplayFields(
      makeRecord({ id: "t1", clientId: "c1", encryptedClientAlias: "enc-a" }),
      makeFieldDeps({ orgDecrypt }),
    );
    expect(fields.clientAlias).toBe("Jane");
    expect(orgDecrypt).toHaveBeenCalledWith("client-alias:c1", "enc-a");
  });

  it("returns null when the client alias has not been decrypted yet", () => {
    const fields = mapTicketDisplayFields(
      makeRecord({ id: "t1" }),
      makeFieldDeps({ orgDecrypt: () => null }),
    );
    expect(fields.clientAlias).toBeNull();
  });

  it("derives display status from the raw status fields", () => {
    const deps = makeFieldDeps();
    expect(
      mapTicketDisplayFields(makeRecord({ id: "a" }), deps).displayStatus,
    ).toBe("new");
    expect(
      mapTicketDisplayFields(makeRecord({ id: "b", followUpCount: 2 }), deps)
        .displayStatus,
    ).toBe("active");
    expect(
      mapTicketDisplayFields(makeRecord({ id: "c", onHold: true }), deps)
        .displayStatus,
    ).toBe("hold");
    expect(
      mapTicketDisplayFields(makeRecord({ id: "d", status: "closed" }), deps)
        .displayStatus,
    ).toBe("closed");
  });

  it("resolves every title decrypt state", () => {
    const record = makeRecord({ id: "t1" });
    expect(
      mapTicketDisplayFields(
        makeRecord({ id: "t1", keyWrap: null }),
        makeFieldDeps(),
      ).titleResult,
    ).toEqual({ status: "denied" });
    expect(
      mapTicketDisplayFields(
        record,
        makeFieldDeps({ decryptTitle: () => undefined }),
      ).titleResult,
    ).toEqual({ status: "loading" });
    expect(
      mapTicketDisplayFields(
        record,
        makeFieldDeps({ decryptTitle: () => DECRYPT_ERROR_SENTINEL }),
      ).titleResult,
    ).toEqual({ status: "error" });
    expect(
      mapTicketDisplayFields(
        record,
        makeFieldDeps({ decryptTitle: () => "Shelter referral" }),
      ).titleResult,
    ).toEqual({ status: "ready", value: "Shelter referral" });
  });

  it("treats intake-wrap tickets as having access (not denied)", () => {
    const record = makeRecord({
      id: "t-intake",
      keyWrap: null,
      intakeWrap: "sealed-wrap-base64",
    });
    const result = mapTicketDisplayFields(
      record,
      makeFieldDeps({ decryptTitle: () => undefined }),
    );
    expect(result.titleResult).toEqual({ status: "loading" });
  });

  it("resolves intake-wrap ticket to ready when cache returns plaintext", () => {
    const record = makeRecord({
      id: "t-intake",
      keyWrap: null,
      intakeWrap: "sealed-wrap-base64",
    });
    const result = mapTicketDisplayFields(
      record,
      makeFieldDeps({ decryptTitle: () => "Web intake - Jane" }),
    );
    expect(result.titleResult).toEqual({
      status: "ready",
      value: "Web intake - Jane",
    });
  });

  it("stays denied when both keyWrap and intakeWrap are absent", () => {
    const record = makeRecord({
      id: "t-no-key",
      keyWrap: null,
      intakeWrap: null,
    });
    const result = mapTicketDisplayFields(record, makeFieldDeps());
    expect(result.titleResult).toEqual({ status: "denied" });
  });

  it("parses timestamp strings into Dates and keeps a null last activity", () => {
    const fields = mapTicketDisplayFields(
      makeRecord({ id: "t1", lastActivityAt: "2026-02-03T04:05:06Z" }),
      makeFieldDeps(),
    );
    expect(fields.createdAt).toBeInstanceOf(Date);
    expect(fields.createdAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(fields.lastActivityAt?.toISOString()).toBe(
      "2026-02-03T04:05:06.000Z",
    );
    const noActivity = mapTicketDisplayFields(
      makeRecord({ id: "t2" }),
      makeFieldDeps(),
    );
    expect(noActivity.lastActivityAt).toBeNull();
  });
});

describe("createCardPropsMapper", () => {
  function makeMapperDeps(
    overrides?: Partial<CardPropsMapperDeps>,
  ): CardPropsMapperDeps {
    return {
      ...makeFieldDeps(),
      unreadCount: () => 3,
      getPreview: () => undefined,
      previewReactionsMap: new Map<string, ReactionSummary[]>(),
      ontap: vi.fn(),
      onaction: vi.fn(),
      onencryptedhelp: vi.fn(),
      ...overrides,
    };
  }

  it("composes the display-field core with the per-row extras", () => {
    const previews = [makePreview("n1")];
    const deps = makeMapperDeps({ getPreview: () => previews });
    const props = createCardPropsMapper(deps)(makeRecord({ id: "t1" }));
    expect(props.ticketId).toBe("t1");
    expect(props.queueName).toBe("Housing");
    expect(props.unreadCount).toBe(3);
    expect(props.previewFollowUps).toBe(previews);
    expect(props.ontap).toBe(deps.ontap);
    expect(props.onaction).toBe(deps.onaction);
  });

  it("passes onfullopen through when provided and leaves it unset otherwise", () => {
    const onfullopen = vi.fn();
    const withHandler = createCardPropsMapper(makeMapperDeps({ onfullopen }))(
      makeRecord({ id: "t1" }),
    );
    expect(withHandler.onfullopen).toBe(onfullopen);

    const without = createCardPropsMapper(makeMapperDeps())(
      makeRecord({ id: "t1" }),
    );
    expect(without.onfullopen).toBeUndefined();
  });

  it("collects preview reactions for the row's follow-ups", () => {
    const summaries: ReactionSummary[] = [
      { reaction: "acknowledge", userIds: ["u1"] },
    ];
    const props = createCardPropsMapper(
      makeMapperDeps({
        getPreview: () => [makePreview("n1"), makePreview("n2")],
        previewReactionsMap: new Map([["n1", summaries]]),
      }),
    )(makeRecord({ id: "t1" }));
    expect(props.previewReactions).toEqual({ n1: summaries });
  });

  it("wraps onselect so the callback receives the ticket id", () => {
    const onselect = vi.fn();
    const props = createCardPropsMapper(makeMapperDeps({ onselect }))(
      makeRecord({ id: "t1" }),
    );
    props.onselect?.("t1");
    expect(onselect).toHaveBeenCalledWith("t1");

    const without = createCardPropsMapper(makeMapperDeps())(
      makeRecord({ id: "t1" }),
    );
    expect(without.onselect).toBeUndefined();
  });
});
