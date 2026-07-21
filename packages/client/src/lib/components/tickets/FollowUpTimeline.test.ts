// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import FollowUpTimelineHarness from "./FollowUpTimelineHarness.svelte";
import type {
  TimelineItem,
  ClusterRecord,
} from "./follow-up-timeline-types.js";

// Mock i18n (FollowUpTimeline uses several message functions).
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_zoom_summary: ({
    count,
    days,
    recency,
  }: {
    count: string;
    days: string;
    recency: string;
  }) => `${count} messages over ${days} days, most recent ${recency}`,
  ticket_conversation_with: ({ alias }: { alias: string }) =>
    `Conversation with ${alias}`,
  ticket_message_received_from: ({
    name,
    time,
  }: {
    name: string;
    time: string;
  }) => `Message from ${name} at ${time}`,
  ticket_message_sent_by: ({ name, time }: { name: string; time: string }) =>
    `Message by ${name} at ${time}`,
  ticket_private_note_label: () => "Private note",
  ticket_date_today: () => "Today",
  ticket_date_yesterday: () => "Yesterday",
  ticket_timeline_messages_count: ({ count }: { count: string }) =>
    `${count} messages`,
  ticket_timeline_incoming: ({ count }: { count: string }) =>
    `${count} incoming`,
  ticket_timeline_outgoing: ({ count }: { count: string }) =>
    `${count} outgoing`,
  ticket_timeline_nav_label: () => "Conversation timeline",
  ticket_timeline_expand_cluster: ({ summary }: { summary: string }) =>
    `Expand ${summary}`,
  ticket_timeline_jump_to: ({ label, time }: { label: string; time: string }) =>
    `Jump to: ${label}, ${time}`,
  ticket_timeline_decrypting: () => "Decrypting message",
  ticket_system_hold_placed: () => "Placed on hold",
  ticket_system_hold_removed: () => "Removed from hold",
  ticket_system_volunteer_assigned: ({ name }: { name: string }) =>
    `${name} assigned`,
  ticket_system_volunteer_unassigned: ({ name }: { name: string }) =>
    `${name} unassigned`,
  ticket_system_status_opened: () => "Reopened",
  ticket_system_status_closed: () => "Closed",
  ticket_system_priority_changed: ({ priority }: { priority: string }) =>
    `Priority changed to ${priority}`,
  ticket_system_volunteer_fallback: () => "A volunteer",
  ticket_new_priority_low: () => "Low",
  ticket_new_priority_normal: () => "Normal",
  ticket_new_priority_high: () => "High",
  ticket_new_priority_urgent: () => "Urgent",
  ticket_system_merge_note: () => "Tickets merged",
  ticket_system_event: () => "Event",
  dashboard_time_just_now: () => "just now",
  dashboard_time_minutes_ago: ({ count }: { count: number }) =>
    `${String(count)}m ago`,
  dashboard_time_hours_ago: ({ count }: { count: number }) =>
    `${String(count)}h ago`,
  dashboard_time_days_ago: ({ count }: { count: number }) =>
    `${String(count)}d ago`,
}));

afterEach(() => {
  cleanup();
});

function makeItems(): TimelineItem[] {
  return [
    {
      id: "fu-1",
      source: "client",
      type: "message",
      createdBy: null,
      createdAt: "2026-04-01T10:00:00Z",
      encryptedContent: null,
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
    {
      id: "fu-2",
      source: "system",
      type: "volunteer_assigned",
      createdBy: null,
      createdAt: "2026-04-01T10:05:00Z",
      encryptedContent: "encrypted-data",
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
    {
      id: "fu-3",
      source: "volunteer",
      type: "message",
      createdBy: null,
      createdAt: "2026-04-01T10:10:00Z",
      encryptedContent: null,
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
    {
      id: "fu-4",
      source: "volunteer",
      type: "internal_note",
      createdBy: null,
      createdAt: "2026-04-01T10:15:00Z",
      encryptedContent: "encrypted-note",
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
    {
      id: "fu-5",
      source: "client",
      type: "message",
      createdBy: null,
      createdAt: "2026-04-01T11:00:00Z",
      encryptedContent: null,
      hasRecording: true,
      recordingDurationSeconds: 47,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
    {
      id: "fu-6",
      source: "client",
      type: "message",
      createdBy: null,
      createdAt: "2026-04-02T09:00:00Z",
      encryptedContent: null,
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: true,
      hasFile: false,
      noteTypeId: null,
      eventParams: null,
      callStatus: null,
      callDurationSeconds: null,
      keyGeneration: null,
    },
  ];
}

describe("FollowUpTimeline component (normal mode)", () => {
  it("renders children when not zoomed", () => {
    const { container } = render(FollowUpTimelineHarness, {
      props: {},
    });
    // Harness injects test bubbles with data-fu-id.
    const bubbles = container.querySelectorAll("[data-fu-id]");
    expect(bubbles.length).toBeGreaterThan(0);
  });

  it("hides timeline view when timeline is inactive", () => {
    const { container } = render(FollowUpTimelineHarness, {
      props: {
        items: makeItems(),
      },
    });
    const timeline = container.querySelector("[data-view='timeline']");
    expect(timeline).not.toBeNull();
    expect(timeline!.getAttribute("aria-hidden")).toBe("true");
  });
});

/**
 * ISO timestamp anchored to the local calendar so date grouping is
 * deterministic in any timezone ("Today"/"Yesterday" labels come from the
 * mocked messages).
 */
function isoAt(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function makeItem(
  id: string,
  overrides: Partial<TimelineItem> = {},
): TimelineItem {
  return {
    id,
    source: "client",
    type: "message",
    createdBy: null,
    createdAt: isoAt(0, 9),
    encryptedContent: null,
    hasRecording: false,
    recordingDurationSeconds: null,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
    eventParams: null,
    callStatus: null,
    callDurationSeconds: null,
    keyGeneration: null,
    ...overrides,
  };
}

function makeRecord(
  id: string,
  overrides: Partial<ClusterRecord> = {},
): ClusterRecord {
  return {
    id,
    source: "client",
    type: "message",
    encryptedContent: null,
    createdBy: null,
    createdAt: isoAt(0, 9),
    isPrivate: false,
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
    eventParams: null,
    keyGeneration: null,
    keyWrap: null,
    ...overrides,
  };
}

describe("FollowUpTimeline component (timeline mode)", () => {
  describe("reply grouping", () => {
    it("groups consecutive messages into one cluster row with direction counts", () => {
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          items: [
            makeItem("c-1", { source: "client", createdAt: isoAt(0, 9, 0) }),
            makeItem("c-2", { source: "client", createdAt: isoAt(0, 9, 5) }),
            makeItem("v-1", {
              source: "volunteer",
              createdAt: isoAt(0, 9, 10),
            }),
          ],
        },
      });

      expect(
        screen.getByRole("button", { name: "Expand 2 incoming, 1 outgoing" }),
      ).toBeTruthy();
      // One run of plain messages produces exactly one cluster row.
      expect(screen.getAllByRole("button", { name: /^Expand / })).toHaveLength(
        1,
      );
    });

    it("starts a new cluster when a landmark interrupts the run", () => {
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          items: [
            makeItem("c-1", { createdAt: isoAt(0, 9, 0) }),
            makeItem("n-1", {
              source: "volunteer",
              type: "internal_note",
              createdAt: isoAt(0, 9, 5),
            }),
            makeItem("c-2", { createdAt: isoAt(0, 9, 10) }),
          ],
        },
      });

      // Two separate single-message clusters around the note landmark.
      expect(
        screen.getAllByRole("button", { name: "Expand 1 incoming" }),
      ).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: /^Jump to: Note,/ }),
      ).toBeTruthy();
    });

    it("expands a cluster on tap and requests its records", async () => {
      const onexpandcluster = vi.fn();
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          onexpandcluster,
          items: [
            makeItem("c-1", { source: "client", createdAt: isoAt(0, 9, 0) }),
            makeItem("v-1", {
              source: "volunteer",
              createdAt: isoAt(0, 9, 5),
            }),
          ],
        },
      });

      const row = screen.getByRole("button", {
        name: "Expand 1 incoming, 1 outgoing",
      });
      expect(row.getAttribute("aria-expanded")).toBe("false");

      await fireEvent.click(row);
      expect(onexpandcluster).toHaveBeenCalledWith(["c-1", "v-1"]);
      expect(row.getAttribute("aria-expanded")).toBe("true");

      await fireEvent.click(row);
      expect(row.getAttribute("aria-expanded")).toBe("false");
    });

    it("renders cached records without refetching when the cluster opens", async () => {
      const onexpandcluster = vi.fn();
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          onexpandcluster,
          items: [
            makeItem("c-1", { createdAt: isoAt(0, 9, 0) }),
            makeItem("c-2", { createdAt: isoAt(0, 9, 5) }),
          ],
          expandedClusters: new Map([
            ["c-1,c-2", [makeRecord("c-1"), makeRecord("c-2")]],
          ]),
        },
      });

      await fireEvent.click(
        screen.getByRole("button", { name: "Expand 2 incoming" }),
      );

      expect(onexpandcluster).not.toHaveBeenCalled();
      const records = screen.getAllByTestId("expanded-record");
      expect(records.map((el) => el.getAttribute("data-record-id"))).toEqual([
        "c-1",
        "c-2",
      ]);
    });

    it("returns to the message view when an expanded record is zoomed", async () => {
      const { container } = render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          items: [makeItem("c-1", { createdAt: isoAt(0, 9, 0) })],
          expandedClusters: new Map([["c-1", [makeRecord("c-1")]]]),
        },
      });

      await fireEvent.click(
        screen.getByRole("button", { name: "Expand 1 incoming" }),
      );
      await fireEvent.click(screen.getByTestId("expanded-record"));

      const timeline = container.querySelector("[data-view='timeline']");
      const messages = container.querySelector("[data-view='messages']");
      expect(timeline?.getAttribute("aria-hidden")).toBe("true");
      expect(messages?.getAttribute("aria-hidden")).toBe("false");
    });
  });

  describe("media landmarks", () => {
    it("labels voicemail, photo, and file rows", () => {
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          items: [
            makeItem("vm-1", {
              hasRecording: true,
              recordingDurationSeconds: 47,
              createdAt: isoAt(0, 9, 0),
            }),
            makeItem("vm-2", {
              hasRecording: true,
              createdAt: isoAt(0, 9, 5),
            }),
            makeItem("img-1", { hasImage: true, createdAt: isoAt(0, 9, 10) }),
            makeItem("file-1", { hasFile: true, createdAt: isoAt(0, 9, 15) }),
          ],
        },
      });

      expect(
        screen.getByRole("button", { name: /^Jump to: Voicemail \(0:47\),/ }),
      ).toBeTruthy();
      // No duration known: plain label.
      expect(
        screen.getByRole("button", { name: /^Jump to: Voicemail,/ }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /^Jump to: Photo,/ }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /^Jump to: File,/ }),
      ).toBeTruthy();
    });

    it("previews decrypted note text in the landmark label, truncated to 40 chars", () => {
      const longNote = "N".repeat(50);
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          resolveDecrypted: () => longNote,
          items: [
            makeItem("n-1", {
              source: "volunteer",
              type: "internal_note",
              createdAt: isoAt(0, 9, 0),
            }),
          ],
        },
      });

      const expected = `${"N".repeat(40)}…`;
      expect(
        screen.getByRole("button", {
          name: (accessibleName) =>
            accessibleName.startsWith(`Jump to: ${expected},`),
        }),
      ).toBeTruthy();
    });
  });

  describe("system events", () => {
    it("labels system rows and resolves volunteer names from eventParams", () => {
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          resolveUserName: (userId: string) =>
            userId === "user-7" ? "Casey Q" : "someone",
          items: [
            makeItem("sys-1", {
              source: "system",
              type: "volunteer_assigned",
              eventParams: { userId: "user-7" },
              createdAt: isoAt(0, 9, 0),
            }),
            makeItem("sys-2", {
              source: "system",
              type: "priority_changed",
              eventParams: { to: "high" },
              createdAt: isoAt(0, 9, 5),
            }),
            makeItem("sys-3", {
              source: "system",
              type: "status_closed",
              createdAt: isoAt(0, 9, 10),
            }),
            // No userId in params: falls back to the generic label.
            makeItem("sys-4", {
              source: "system",
              type: "volunteer_assigned",
              createdAt: isoAt(0, 9, 15),
            }),
          ],
        },
      });

      expect(
        screen.getByRole("button", { name: /^Jump to: Casey Q assigned,/ }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", {
          name: /^Jump to: Priority changed to High,/,
        }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /^Jump to: Closed,/ }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /^Jump to: A volunteer assigned,/ }),
      ).toBeTruthy();
    });
  });

  describe("date grouping", () => {
    it("splits entries into date groups and collapses a group on tap", async () => {
      render(FollowUpTimelineHarness, {
        props: {
          timelineActive: true,
          items: [
            makeItem("c-1", { createdAt: isoAt(1, 10) }),
            makeItem("img-1", { hasImage: true, createdAt: isoAt(0, 9) }),
          ],
        },
      });

      const yesterdayHeader = screen.getByRole("button", {
        name: "Yesterday",
      });
      expect(screen.getByRole("button", { name: "Today" })).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Expand 1 incoming" }),
      ).toBeTruthy();
      expect(yesterdayHeader.getAttribute("aria-expanded")).toBe("true");

      await fireEvent.click(yesterdayHeader);

      // Yesterday's cluster is hidden; today's landmark stays visible.
      expect(yesterdayHeader.getAttribute("aria-expanded")).toBe("false");
      expect(
        screen.queryByRole("button", { name: "Expand 1 incoming" }),
      ).toBeNull();
      expect(
        screen.getByRole("button", { name: /^Jump to: Photo,/ }),
      ).toBeTruthy();
    });
  });
});
