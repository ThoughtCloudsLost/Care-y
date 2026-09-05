// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import KBSection from "./KBSection.svelte";

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

interface KBOverrides {
  id?: string;
  updatedAt?: Date | string;
  voteUpCount?: number;
  voteDownCount?: number;
  decryptedTitle?: string;
}

let seq = 0;

function makeKBItem(overrides: KBOverrides = {}) {
  seq += 1;
  return {
    id: `kb-${String(seq)}`,
    encryptedTitle: "AQID",
    updatedAt: new Date().toISOString(),
    voteUpCount: 0,
    voteDownCount: 0,
    decryptedTitle: "Escalation protocol",
    ...overrides,
  };
}

function renderKB(
  kbItems: ReturnType<typeof makeKBItem>[],
  extra: Record<string, unknown> = {},
) {
  return render(KBSection, {
    props: {
      kbItems,
      loading: false,
      expanded: true,
      ontoggle: vi.fn(),
      ontap: vi.fn(),
      ...extra,
    },
  });
}

describe("KBSection", () => {
  it("renders one row per article with its decrypted title", () => {
    const { container } = renderKB([
      makeKBItem({ decryptedTitle: "Escalation protocol" }),
      makeKBItem({ decryptedTitle: "Housing referrals" }),
    ]);
    expect(container.querySelectorAll(".kb-row").length).toBe(2);
    expect(screen.getByText("Escalation protocol")).toBeTruthy();
    expect(screen.getByText("Housing referrals")).toBeTruthy();
  });

  it("falls back to the updated-article label while the title is undecrypted", () => {
    renderKB([makeKBItem({ decryptedTitle: undefined })]);
    expect(screen.getByText("Updated article")).toBeTruthy();
  });

  it("shows the total vote count as an integer", () => {
    const { container } = renderKB([
      makeKBItem({ voteUpCount: 2, voteDownCount: 1 }),
    ]);
    const rating = container.querySelector(".kb-rating");
    expect(rating?.getAttribute("aria-label")).toBe("3 votes");
    expect(rating?.textContent).toContain("3");
  });

  it("shows singular label for exactly one vote", () => {
    const { container } = renderKB([
      makeKBItem({ voteUpCount: 1, voteDownCount: 0 }),
    ]);
    const rating = container.querySelector(".kb-rating");
    expect(rating?.getAttribute("aria-label")).toBe("1 vote");
    expect(rating?.textContent).toContain("1");
  });

  it("shows zero-vote label when no votes exist", () => {
    const { container } = renderKB([
      makeKBItem({ voteUpCount: 0, voteDownCount: 0 }),
    ]);
    const rating = container.querySelector(".kb-rating");
    expect(rating?.getAttribute("aria-label")).toBe("no votes");
    expect(rating?.textContent).toContain("0");
  });

  it("fires ontap with the article id when a row is tapped", async () => {
    const ontap = vi.fn();
    const { container } = renderKB([makeKBItem({ id: "kb-42" })], { ontap });
    const row = container.querySelector(".kb-row");
    expect(row).not.toBeNull();
    await fireEvent.click(row!);
    expect(ontap).toHaveBeenCalledWith("kb-42");
  });

  it("shows skeleton rows while loading", () => {
    const { container } = renderKB([], { loading: true });
    expect(container.querySelector(".skeleton-pulse")).toBeTruthy();
    expect(container.querySelectorAll(".kb-row").length).toBe(2);
  });

  it("shows the empty message when there are no articles", () => {
    const { container } = renderKB([]);
    expect(container.querySelector(".no-kb")?.textContent).toContain(
      "No recent articles",
    );
    expect(container.querySelector(".kb-row")).toBeNull();
  });
});
