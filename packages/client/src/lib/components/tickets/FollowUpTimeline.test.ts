// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import FollowUpTimelineHarness from "./FollowUpTimelineHarness.svelte";
import type { TimelineItem } from "./follow-up-timeline-types.js";

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
    },
    {
      id: "fu-2",
      source: "system",
      type: "assignment_change",
      createdBy: null,
      createdAt: "2026-04-01T10:05:00Z",
      encryptedContent: "encrypted-data",
      hasRecording: false,
      recordingDurationSeconds: null,
      hasImage: false,
      hasFile: false,
      noteTypeId: null,
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
