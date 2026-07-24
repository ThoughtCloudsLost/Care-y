// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import NewPill from "./NewPill.svelte";

afterEach(cleanup);

describe("NewPill", () => {
  it("renders the singular form for one unread reply", () => {
    render(NewPill, { props: { count: 1 } });
    expect(screen.getByText("1 new")).toBeTruthy();
  });

  it("renders the plural form for several unread replies", () => {
    render(NewPill, { props: { count: 2 } });
    expect(screen.getByText("2 new")).toBeTruthy();
  });

  it("renders nothing when there is nothing unread", () => {
    const { container } = render(NewPill, { props: { count: 0 } });
    expect(container.querySelector(".new-pill")).toBeNull();
  });

  it("renders nothing for a negative count", () => {
    const { container } = render(NewPill, { props: { count: -3 } });
    expect(container.querySelector(".new-pill")).toBeNull();
  });

  it("updates when the count changes", async () => {
    const { rerender, container } = render(NewPill, { props: { count: 2 } });
    await rerender({ count: 0 });
    expect(container.querySelector(".new-pill")).toBeNull();
    await rerender({ count: 5 });
    expect(screen.getByText("5 new")).toBeTruthy();
  });
});
