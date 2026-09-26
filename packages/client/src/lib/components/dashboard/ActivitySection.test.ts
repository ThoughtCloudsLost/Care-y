// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
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

let seq = 0;

function nextId(): string {
  seq += 1;
  return `activity-${String(seq)}`;
}

function makeActivity(
  overrides: Partial<{
    eventType: string;
    ticketId: string;
    clientAlias: string | null;
    queueName: string | null;
    createdAt: Date | string;
  }> = {},
) {
  return {
    kind: "ticket" as const,
    id: nextId(),
    eventType: "followup_added",
    ticketId: "ticket-1",
    clientAlias: "Sparrow" as string | null,
    queueName: "Intake" as string | null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeOutsideActivity(
  overrides: Partial<{ eventType: string; queueName: string | null }> = {},
) {
  return {
    kind: "ticket_outside_queues" as const,
    id: nextId(),
    eventType: "ticket_created",
    queueName: "Legal" as string | null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeOrgActivity(overrides: Partial<{ eventType: string }> = {}) {
  return {
    kind: "org" as const,
    id: nextId(),
    eventType: "queue_created",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

type AnyActivity =
  | ReturnType<typeof makeActivity>
  | ReturnType<typeof makeOutsideActivity>
  | ReturnType<typeof makeOrgActivity>;

function renderActivity(
  activity: AnyActivity[],
  extra: Record<string, unknown> = {},
) {
  return render(ActivitySection, {
    props: {
      activity,
      lastHourCount: activity.length,
      loading: false,
      expanded: true,
      ontoggle: vi.fn(),
      ontap: vi.fn(),
      ...extra,
    },
  });
}

/** Asserts a row exposes no button semantics, tap feedback or handlers. */
async function expectNonInteractive(
  row: Element | null,
  ontap: Mock,
): Promise<void> {
  expect(row).not.toBeNull();
  expect(row!.getAttribute("role")).toBeNull();
  expect(row!.getAttribute("tabindex")).toBeNull();
  expect(row!.classList.contains("touch-feedback")).toBe(false);
  expect(row!.classList.contains("activity-row-link")).toBe(false);
  await fireEvent.click(row!);
  await fireEvent.keyDown(row!, { key: "Enter" });
  expect(ontap).not.toHaveBeenCalled();
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

  it("labels other audit event types with their audit log label", () => {
    renderActivity([makeOrgActivity({ eventType: "queue_created" })]);
    expect(screen.getByText("Queue created")).toBeTruthy();
  });

  it("falls back to the generic label for an unknown event type", () => {
    const { container } = renderActivity([
      makeOrgActivity({ eventType: "not_a_real_event" }),
    ]);
    expect(container.querySelector(".activity-event")?.textContent).toBe(
      "Activity",
    );
  });

  it("caps the list at the five most recent items", () => {
    const items = Array.from({ length: 7 }, () => makeActivity());
    const { container } = renderActivity(items);
    expect(container.querySelectorAll(".activity-row").length).toBe(5);
  });

  it("summarises the server's last-hour count, not the rows shown", () => {
    const items = Array.from({ length: 5 }, () => makeActivity());
    const { container } = renderActivity(items, { lastHourCount: 23 });
    expect(container.querySelector(".activity-summary span")?.textContent).toBe(
      "23 events in the last hour",
    );
  });

  it("uses the singular summary for one event", () => {
    const items = Array.from({ length: 3 }, () => makeActivity());
    const { container } = renderActivity(items, { lastHourCount: 1 });
    expect(container.querySelector(".activity-summary span")?.textContent).toBe(
      "1 event in the last hour",
    );
  });

  it("renders a ticket row as a button that opens the ticket", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity(
      [makeActivity({ ticketId: "ticket-42" })],
      { ontap },
    );
    const row = container.querySelector(".activity-row");
    expect(row).not.toBeNull();
    expect(row!.getAttribute("role")).toBe("button");
    expect(row!.getAttribute("tabindex")).toBe("0");
    expect(row!.hasAttribute("aria-disabled")).toBe(false);
    expect(row!.classList.contains("touch-feedback")).toBe(true);
    await fireEvent.click(row!);
    expect(ontap).toHaveBeenCalledWith("ticket-42");
  });

  it("opens the ticket from the keyboard", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity(
      [makeActivity({ ticketId: "ticket-7" })],
      { ontap },
    );
    await fireEvent.keyDown(container.querySelector(".activity-row")!, {
      key: "Enter",
    });
    expect(ontap).toHaveBeenCalledWith("ticket-7");
  });

  it("shows the decrypt-pending placeholder while alias and queue decrypt", () => {
    const { container } = renderActivity([
      makeActivity({ clientAlias: null, queueName: null }),
    ]);
    expect(container.querySelector(".activity-alias")?.textContent).toBe("...");
    expect(container.querySelector(".activity-queue")?.textContent).toBe(
      "in ...",
    );
  });

  it("renders an outside-queue row with its queue, no alias, and no tap", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity(
      [makeOutsideActivity({ queueName: "Legal" })],
      { ontap },
    );
    const row = container.querySelector(".activity-row");
    expect(row?.querySelector(".activity-queue")?.textContent).toBe("in Legal");
    expect(row?.querySelector(".activity-alias")).toBeNull();
    expect(row?.querySelector(".activity-time")).not.toBeNull();
    await expectNonInteractive(row, ontap);
  });

  it("renders an org row with its label and time only, and no tap", async () => {
    const ontap = vi.fn();
    const { container } = renderActivity([makeOrgActivity()], { ontap });
    const row = container.querySelector(".activity-row");
    expect(row?.querySelector(".activity-event")?.textContent).toBe(
      "Queue created",
    );
    expect(row?.querySelector(".activity-alias")).toBeNull();
    expect(row?.querySelector(".activity-queue")).toBeNull();
    expect(row?.querySelector(".activity-time")).not.toBeNull();
    expect(row?.textContent).not.toContain("...");
    await expectNonInteractive(row, ontap);
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
