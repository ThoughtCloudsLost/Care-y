// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/svelte";

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

import SvgChart from "./SvgChart.svelte";

const SAMPLE_DATA = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 25 },
  { label: "Mar", value: 15 },
];

describe("SvgChart", () => {
  describe("bar chart", () => {
    it("renders correct number of bars from data", () => {
      const { container } = render(SvgChart, {
        props: {
          data: SAMPLE_DATA,
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Test bar chart",
        },
      });

      const bars = container.querySelectorAll("rect.bar");
      expect(bars).toHaveLength(3);
    });

    it("renders x-axis labels for each data point", () => {
      const { container } = render(SvgChart, {
        props: {
          data: SAMPLE_DATA,
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Test bar chart",
        },
      });

      const xLabels = container.querySelectorAll("text.axis-x");
      expect(xLabels).toHaveLength(3);
      expect(xLabels[0]?.textContent).toBe("Jan");
      expect(xLabels[1]?.textContent).toBe("Feb");
      expect(xLabels[2]?.textContent).toBe("Mar");
    });

    it("sets aria-hidden on svg element", () => {
      const { container } = render(SvgChart, {
        props: {
          data: SAMPLE_DATA,
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Test bar chart",
        },
      });

      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("line chart", () => {
    it("renders polyline and dots for each data point", () => {
      const { container } = render(SvgChart, {
        props: {
          data: SAMPLE_DATA,
          type: "line",
          xLabel: "Month",
          yLabel: "Days",
          ariaLabel: "Test line chart",
        },
      });

      const polyline = container.querySelector("polyline.line-path");
      expect(polyline).not.toBeNull();

      const dots = container.querySelectorAll("circle.line-dot");
      expect(dots).toHaveLength(3);
    });
  });

  describe("ChartDataTable (accessible companion)", () => {
    it("renders hidden data table with caption and all rows", () => {
      const { container } = render(SvgChart, {
        props: {
          data: SAMPLE_DATA,
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Monthly data table",
        },
      });

      const table = container.querySelector("table.chart-data-table");
      expect(table).not.toBeNull();

      const caption = table!.querySelector("caption");
      expect(caption?.textContent).toBe("Monthly data table");

      const headerCells = table!.querySelectorAll("th");
      expect(headerCells[0]?.textContent).toBe("Month");
      expect(headerCells[1]?.textContent).toBe("Count");

      const rows = table!.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(3);

      const firstRowCells = rows[0]?.querySelectorAll("td");
      expect(firstRowCells?.[0]?.textContent).toBe("Jan");
      expect(firstRowCells?.[1]?.textContent).toBe("10");
    });
  });

  describe("edge cases", () => {
    it("handles empty data without crashing", () => {
      const { container } = render(SvgChart, {
        props: {
          data: [],
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Empty chart",
        },
      });

      const bars = container.querySelectorAll("rect.bar");
      expect(bars).toHaveLength(0);
    });

    it("handles all-zero values gracefully", () => {
      const zeroData = [
        { label: "Jan", value: 0 },
        { label: "Feb", value: 0 },
      ];

      const { container } = render(SvgChart, {
        props: {
          data: zeroData,
          type: "bar",
          xLabel: "Month",
          yLabel: "Count",
          ariaLabel: "Zero chart",
        },
      });

      const bars = container.querySelectorAll("rect.bar");
      expect(bars).toHaveLength(2);
      bars.forEach((bar) => {
        expect(Number(bar.getAttribute("height"))).toBe(0);
      });
    });
  });
});
