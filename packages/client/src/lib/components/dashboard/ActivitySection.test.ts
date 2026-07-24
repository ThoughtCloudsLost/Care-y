// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import ActivitySection from "./ActivitySection.svelte";

// DecryptPlaceholder observes the viewport; CollapsibleSection uses a slide
// transition. jsdom has neither the observer nor the Web Animations API.
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

interface ActivityOverrides {
  id?: string;
  eventType?: string;
  ticketId?: string | null;
  clientAlias?: string;
  queueName?: string | null;
  createdAt?: Date | string;
}

let seq = 0;

function makeActivity(overrides: ActivityOverrides = {}) {
  seq += 1;
  return {
    id: `activity-${String(seq)}`,
    eventType: "followup_added",
    ticketId: "ticket-1",
    clientAlias: "Sparrow",
    queueName: "Intake",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderActivity(
  activity: ReturnType<typeof makeActivity>[],
  extra: Record<string, unknown> = {},
) {
  return render(ActivitySection, {
    props: {
      activity,
      loading: false,
      expanded: true,
      ontoggle: vi.fn(),
      ontap: vi.fn(),
      ...extra,
    },
  });
}

describe("ActivitySection", () => {
  it("renders one row per activity item with its client alias", () => {
    const { container } = renderActivity([
      makeActivity({ clientAlias: "Sparrow" }),
      makeActivity({ clientAlias: "Heron" }),
    ]);
    expect(container.querySelectorAll(".activity-row").length).toBe(2);
    expect(screen.getByText("Sparrow")).toBeTruthy();
    expect(screen.getByText("Heron")).toBeTruthy();
  });

  it("labels a follow-up event as a new message", () => {
    renderActivity([makeActivity({ eventType: "followup_added" })]);
    expect(screen.getByText("New message")).toBeTruthy();
  });

  it("caps the list at the five most recent items", () => {
    const items = Array.from({ length: 7 }, () => makeActivity());
    const { container } = renderActivity(items);
    expect(container.querySelectorAll(".activity-row").length).toBe(5);
  });

  it("fires ontap with the ticket id when a row is tapped", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity(
      [makeActivity({ ticketId: "ticket-42" })],
      { ontap },
    );
    const row = container.querySelector(".activity-row");
    expect(row).not.toBeNull();
    await fireEvent.click(row!);
    expect(ontap).toHaveBeenCalledWith("ticket-42");
  });

  it("marks rows without a ticket id disabled and swallows the tap", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity([makeActivity({ ticketId: null })], {
      ontap,
    });
    const row = container.querySelector(".activity-row");
    expect(row?.getAttribute("aria-disabled")).toBe("true");
    await fireEvent.click(row!);
    expect(ontap).not.toHaveBeenCalled();
  });

  it("shows skeleton rows while loading", () => {
    const { container } = renderActivity([], { loading: true });
    expect(container.querySelector(".skeleton-pulse")).toBeTruthy();
    expect(container.querySelectorAll(".activity-row").length).toBe(3);
  });

  it("shows the empty message when there is no activity", () => {
    const { container } = renderActivity([]);
    expect(container.querySelector(".no-activity")?.textContent).toContain(
      "No recent activity",
    );
    expect(container.querySelector(".activity-row")).toBeNull();
  });
});
