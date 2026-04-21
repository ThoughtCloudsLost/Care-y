// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
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

// ── Mock data (vi.hoisted so vi.mock factories can reference them) ──

const { VOLUME_DATA, RESOLUTION_DATA, QUEUE_STATS } = vi.hoisted(() => ({
  VOLUME_DATA: [
    { month: "2025-11", created: 5, closed: 3 },
    { month: "2025-12", created: 8, closed: 6 },
    { month: "2026-01", created: 12, closed: 10 },
  ],
  RESOLUTION_DATA: [
    { month: "2025-11", avgDays: 2.5 },
    { month: "2025-12", avgDays: 3.1 },
    { month: "2026-01", avgDays: 1.8 },
  ],
  QUEUE_STATS: [
    { queueId: "q1", encryptedQueueName: "ZW5jcnlwdGVk", open: 5, closed: 12 },
    {
      queueId: "q2",
      encryptedQueueName: "ZW5jcnlwdGVkMg==",
      open: 3,
      closed: 7,
    },
  ],
}));

interface MockQueryState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: unknown;
}

let activeCountState: MockQueryState;
let volumeState: MockQueryState;
let resolutionState: MockQueryState;
let queueStatsState: MockQueryState;

function loadedState(data: unknown): MockQueryState {
  return { isPending: false, isError: false, error: null, data };
}

function pendingState(): MockQueryState {
  return { isPending: true, isError: false, error: null, data: undefined };
}

// ── Mocks ──

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_reports_open_tickets: () => "Open tickets",
  admin_reports_this_month: () => "This month",
  admin_reports_avg_resolution: () => "Avg. resolution",
  admin_reports_days_unit: ({ days }: { days: string }) => `${days}d`,
  admin_reports_volume_title: () => "Volume trends",
  admin_reports_volume_aria: () =>
    "Monthly ticket volume over the last 12 months",
  admin_reports_resolution_title: () => "Resolution time",
  admin_reports_resolution_aria: () =>
    "Average resolution time in days over the last 12 months",
  admin_reports_by_queue: () => "By queue",
  admin_reports_open: () => "open",
  admin_reports_closed: () => "closed",
  admin_reports_month_label: () => "Month",
  admin_reports_tickets_label: () => "Tickets",
  admin_reports_days_label: () => "Days",
  admin_reports_no_data: () => "No report data yet",
  admin_reports_view_open: ({ count }: { count: string }) =>
    `${count} open tickets, view filtered list`,
  admin_reports_view_month: ({ count }: { count: string }) =>
    `${count} tickets this month, view filtered list`,
  decrypt_loading: () => "Loading...",
  decrypt_error: () => "Error",
  decrypt_denied: () => "Denied",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    reports: {
      activeCount: { query: vi.fn().mockResolvedValue(12) },
      volumeTrends: { query: vi.fn().mockResolvedValue(VOLUME_DATA) },
      resolutionTrends: { query: vi.fn().mockResolvedValue(RESOLUTION_DATA) },
      queueStats: { query: vi.fn().mockResolvedValue(QUEUE_STATS) },
      priorityBreakdown: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = (opts.queryKey as string[])[2] as string | undefined;
    if (key === "activeCount") return activeCountState;
    if (key === "volumeTrends") return volumeState;
    if (key === "resolutionTrends") return resolutionState;
    if (key === "queueStats") return queueStatsState;
    return loadedState(null);
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, _data: unknown) => "General Intake",
  }),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: (s: string) => new TextEncoder().encode(s),
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {
    constructor(name: string) {
      super(`${name} router unavailable`);
    }
  },
}));

vi.mock("$lib/components/QueryError.svelte", () => ({
  default: {
    $$: {},
    render: () => ({ html: "<div>Query error</div>" }),
  },
}));

vi.mock("$lib/components/DecryptPlaceholder.svelte", () => ({
  default: {
    $$: {},
    render: () => ({ html: "<span>...</span>" }),
  },
}));

import ReportsSection from "./ReportsSection.svelte";

describe("ReportsSection", () => {
  beforeEach(() => {
    activeCountState = loadedState(12);
    volumeState = loadedState(VOLUME_DATA);
    resolutionState = loadedState(RESOLUTION_DATA);
    queueStatsState = loadedState(QUEUE_STATS);
  });

  describe("loaded state", () => {
    it("renders metric cards with labels", () => {
      const { container } = render(ReportsSection);

      const metricValues = container.querySelectorAll(".metric-value");
      expect(metricValues.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText("Open tickets")).toBeDefined();
      expect(screen.getByText("This month")).toBeDefined();
      expect(screen.getByText("Avg. resolution")).toBeDefined();
    });

    it("renders volume trends bar chart", () => {
      const { container } = render(ReportsSection);

      const volumeLabels = screen.getAllByText("Volume trends");
      expect(volumeLabels.length).toBeGreaterThanOrEqual(1);

      const bars = container.querySelectorAll("rect.bar");
      expect(bars.length).toBe(3);
    });

    it("renders resolution time line chart", () => {
      const { container } = render(ReportsSection);

      const resLabels = screen.getAllByText("Resolution time");
      expect(resLabels.length).toBeGreaterThanOrEqual(1);

      const polyline = container.querySelector("polyline.line-path");
      expect(polyline).not.toBeNull();
    });

    it("renders by-queue stats with decrypted names", () => {
      render(ReportsSection);

      const queueLabels = screen.getAllByText("By queue");
      expect(queueLabels.length).toBeGreaterThanOrEqual(1);

      const queueItems = screen.getAllByText("General Intake");
      expect(queueItems.length).toBeGreaterThanOrEqual(1);
    });

    it("renders queue open/closed counts", () => {
      const { container } = render(ReportsSection);

      const queueCounts = container.querySelectorAll(".queue-count");
      expect(queueCounts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("loading state", () => {
    it("does not render charts while queries are pending", () => {
      activeCountState = pendingState();
      volumeState = pendingState();
      resolutionState = pendingState();
      queueStatsState = pendingState();

      const { container } = render(ReportsSection);

      expect(container.querySelector(".metric-row")).toBeNull();
      expect(container.querySelectorAll("rect.bar").length).toBe(0);
    });
  });

  describe("metric card interaction", () => {
    it("calls ontap when tappable metric card is clicked", async () => {
      const mockTap = vi.fn();
      render(ReportsSection, { props: { ontap: mockTap } });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(1);

      await fireEvent.click(buttons[0]!);
      expect(mockTap).toHaveBeenCalledWith("status=open");
    });
  });

  describe("chart accessibility", () => {
    it("renders hidden data tables for each chart", () => {
      render(ReportsSection);

      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThanOrEqual(2);

      const captions = tables.map(
        (t) => t.querySelector("caption")?.textContent,
      );
      expect(captions).toContain(
        "Monthly ticket volume over the last 12 months",
      );
      expect(captions).toContain(
        "Average resolution time in days over the last 12 months",
      );
    });
  });

  describe("conditional rendering", () => {
    it("hides resolution chart when all values are zero", () => {
      resolutionState = loadedState([
        { month: "2025-11", avgDays: 0 },
        { month: "2025-12", avgDays: 0 },
      ]);

      const { container } = render(ReportsSection);

      const lineChart = container.querySelector("polyline.line-path");
      expect(lineChart).toBeNull();
    });
  });
});
