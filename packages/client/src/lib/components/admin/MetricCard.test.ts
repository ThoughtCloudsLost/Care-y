// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

import MetricCard from "./MetricCard.svelte";

describe("MetricCard", () => {
  it("renders label and numeric value", () => {
    render(MetricCard, {
      props: {
        label: "Open tickets",
        value: 12,
      },
    });

    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("Open tickets")).toBeDefined();
  });

  it("renders string value", () => {
    render(MetricCard, {
      props: {
        label: "Avg. resolution",
        value: "3.2d",
      },
    });

    expect(screen.getByText("3.2d")).toBeDefined();
  });

  it("renders optional subtitle", () => {
    render(MetricCard, {
      props: {
        label: "Open tickets",
        value: 12,
        subtitle: "+2 from last week",
      },
    });

    expect(screen.getByText("+2 from last week")).toBeDefined();
  });

  it("calls ontap with filterParam when tapped", async () => {
    const mockTap = vi.fn();

    render(MetricCard, {
      props: {
        label: "Open tickets",
        value: 12,
        filterParam: "status=open",
        ontap: mockTap,
      },
    });

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(mockTap).toHaveBeenCalledWith("status=open");
  });

  it("renders without touch-feedback class when no ontap provided", () => {
    const { container } = render(MetricCard, {
      props: {
        label: "Avg. resolution",
        value: "3.2d",
      },
    });

    expect(container.querySelector(".metric-inner")).not.toBeNull();
    expect(container.querySelector(".touch-feedback")).toBeNull();
  });

  it("applies aria-label on tappable cards", () => {
    const { container } = render(MetricCard, {
      props: {
        label: "Open tickets",
        value: 12,
        filterParam: "status=open",
        ariaLabel: "12 open tickets, view filtered list",
        ontap: vi.fn(),
      },
    });

    const card = container.querySelector("[aria-label]");
    expect(card?.getAttribute("aria-label")).toBe(
      "12 open tickets, view filtered list",
    );
  });
});
