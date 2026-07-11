// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import QueueCards from "./QueueCards.svelte";

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

interface QueueOverrides {
  id?: string;
  name?: string | null;
  openCount?: number;
  urgentCount?: number;
}

function makeQueue(overrides: QueueOverrides = {}) {
  return {
    id: "q1",
    name: "Intake",
    openCount: 5,
    urgentCount: 0,
    ...overrides,
  };
}

function renderQueues(
  queues: ReturnType<typeof makeQueue>[],
  extra: Record<string, unknown> = {},
) {
  return render(QueueCards, {
    props: {
      queues,
      loading: false,
      expanded: true,
      ontoggle: vi.fn(),
      ontap: vi.fn(),
      ...extra,
    },
  });
}

describe("QueueCards", () => {
  it("renders one tile per queue with its name", () => {
    const { container } = renderQueues([
      makeQueue({ id: "q1", name: "Intake" }),
      makeQueue({ id: "q2", name: "Crisis" }),
    ]);
    const tiles = container.querySelectorAll(".queue-tile");
    expect(tiles.length).toBe(2);
    expect(screen.getByText("Intake")).toBeTruthy();
    expect(screen.getByText("Crisis")).toBeTruthy();
  });

  it("shows the open count on each tile", () => {
    const { container } = renderQueues([makeQueue({ openCount: 5 })]);
    expect(container.querySelector(".queue-meta")?.textContent).toContain(
      "5 open",
    );
  });

  it("surfaces the urgent segment with its word when urgent is nonzero", () => {
    const { container } = renderQueues([makeQueue({ urgentCount: 2 })]);
    const urgent = container.querySelector(".queue-urgent");
    expect(urgent).toBeTruthy();
    expect(urgent?.textContent).toContain("2 urgent");
  });

  it("uses the singular urgent label at a count of one", () => {
    const { container } = renderQueues([makeQueue({ urgentCount: 1 })]);
    expect(container.querySelector(".queue-urgent")?.textContent).toContain(
      "1 urgent",
    );
  });

  it("omits the urgent segment entirely at zero", () => {
    const { container } = renderQueues([makeQueue({ urgentCount: 0 })]);
    expect(container.querySelector(".queue-urgent")).toBeNull();
    expect(container.querySelector(".queue-meta")?.textContent).not.toContain(
      "urgent",
    );
  });

  it("spells the urgent count into the tile aria-label (never color alone)", () => {
    renderQueues([makeQueue({ name: "Intake", urgentCount: 3 })]);
    const tile = screen.getByRole("button", { name: /Intake/ });
    expect(tile.getAttribute("aria-label")).toContain("3 urgent");
  });

  it("fires ontap with the queue id when a tile is tapped", async () => {
    const ontap = vi.fn();
    const { container } = renderQueues([makeQueue({ id: "q-42" })], { ontap });
    const tile = container.querySelector(".queue-tile");
    expect(tile).not.toBeNull();
    await fireEvent.click(tile!);
    expect(ontap).toHaveBeenCalledWith("q-42");
  });

  it("shows placeholder tiles while loading", () => {
    const { container } = renderQueues([], { loading: true });
    expect(container.querySelectorAll(".queue-tile-placeholder").length).toBe(
      3,
    );
  });

  it("shows the empty message when no queues are assigned", () => {
    const { container } = renderQueues([]);
    expect(container.querySelector(".no-queues")).toBeTruthy();
    expect(container.querySelector(".queue-tile")).toBeNull();
  });
});
