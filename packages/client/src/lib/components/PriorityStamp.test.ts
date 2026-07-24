// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import PriorityStamp from "./PriorityStamp.svelte";

afterEach(cleanup);

describe("PriorityStamp", () => {
  it("renders the urgent stamp with its word", () => {
    const { container } = render(PriorityStamp, {
      props: { priority: "urgent" },
    });
    expect(screen.getByText("Urgent")).toBeTruthy();
    const stamp = container.querySelector(".stamp");
    expect(stamp?.classList.contains("stamp-urgent")).toBe(true);
    expect(stamp?.getAttribute("data-priority")).toBe("urgent");
  });

  it("renders the high stamp with its word", () => {
    const { container } = render(PriorityStamp, {
      props: { priority: "high" },
    });
    expect(screen.getByText("High")).toBeTruthy();
    expect(
      container.querySelector(".stamp")?.classList.contains("stamp-high"),
    ).toBe(true);
  });

  it("renders the low stamp with its word", () => {
    const { container } = render(PriorityStamp, { props: { priority: "low" } });
    expect(screen.getByText("Low")).toBeTruthy();
    expect(
      container.querySelector(".stamp")?.classList.contains("stamp-low"),
    ).toBe(true);
  });

  it("renders nothing at all for normal priority", () => {
    const { container } = render(PriorityStamp, {
      props: { priority: "normal" },
    });
    expect(container.querySelector(".stamp")).toBeNull();
    expect(container.textContent.trim()).toBe("");
  });

  it("always carries the priority word (hue never travels alone)", () => {
    for (const priority of ["urgent", "high", "low"] as const) {
      const { container } = render(PriorityStamp, { props: { priority } });
      const stamp = container.querySelector(".stamp");
      expect(stamp?.textContent.length).toBeGreaterThan(0);
      cleanup();
    }
  });
});
