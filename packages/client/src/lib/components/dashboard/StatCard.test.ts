// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import StatCard from "./StatCard.svelte";

afterEach(cleanup);

describe("StatCard", () => {
  const defaults = {
    label: "My Open",
    count: 5,
    filterParam: "my-open",
    ontap: vi.fn(),
  };

  it("renders count and label", () => {
    render(StatCard, { props: defaults });
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("My Open")).toBeTruthy();
  });

  it("sets aria-label combining count and label", () => {
    render(StatCard, { props: defaults });
    expect(screen.getByLabelText("5 My Open")).toBeTruthy();
  });

  it("fires ontap with filterParam on click", async () => {
    const ontap = vi.fn();
    render(StatCard, { props: { ...defaults, ontap } });
    const button = screen.getByLabelText("5 My Open");
    await fireEvent.click(button);
    expect(ontap).toHaveBeenCalledWith("my-open");
  });

  it("renders accent color dot when accentColor is provided", () => {
    const { container } = render(StatCard, {
      props: { ...defaults, accentColor: "var(--brand-text)" },
    });
    const dot = container.querySelector(".stat-dot");
    expect(dot).toBeTruthy();
  });

  it("does not render dot when accentColor is omitted", () => {
    const { container } = render(StatCard, {
      props: { ...defaults, accentColor: undefined },
    });
    const dot = container.querySelector(".stat-dot");
    expect(dot).toBeNull();
  });

  it("renders zero count", () => {
    render(StatCard, { props: { ...defaults, count: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });
});
