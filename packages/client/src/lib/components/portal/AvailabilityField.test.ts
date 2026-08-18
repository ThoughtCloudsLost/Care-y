// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { availabilityDataSchema } from "@care-y/shared";
import type { AvailabilityData } from "@care-y/shared";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";

// vi.mock required: pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_avail_timezone_label: ({ timezone }: { timezone: string }) =>
    `Timezone: ${timezone}`,
  intake_avail_timezone_change: () => "Change",
  intake_avail_timezone_search: () => "Search timezones...",
  intake_avail_recurring_title: () => "Weekly times",
  intake_avail_recurring_count: ({
    count,
    max,
  }: {
    count: number;
    max: number;
  }) => `${String(count)} of ${String(max)}`,
  intake_avail_specific_title: () => "Specific dates",
  intake_avail_specific_count: ({
    count,
    max,
  }: {
    count: number;
    max: number;
  }) => `${String(count)} of ${String(max)}`,
  intake_avail_add_recurring: () => "Add weekly time",
  intake_avail_add_specific: () => "Add specific date",
  intake_avail_remove: () => "Remove",
  intake_avail_empty: () => "No times added yet.",
  intake_avail_max_reached: () => "Maximum reached.",
  intake_avail_time_to: () => "to",
  intake_avail_start_time: () => "Start time",
  intake_avail_end_time: () => "End time",
  intake_avail_error_end_before_start: () =>
    "End time must be after start time.",
  intake_avail_error_past_date: () => "Date cannot be in the past.",
  intake_avail_day_monday: () => "Monday",
  intake_avail_day_tuesday: () => "Tuesday",
  intake_avail_day_wednesday: () => "Wednesday",
  intake_avail_day_thursday: () => "Thursday",
  intake_avail_day_friday: () => "Friday",
  intake_avail_day_saturday: () => "Saturday",
  intake_avail_day_sunday: () => "Sunday",
}));

// vi.mock required: ShellSheet depends on portal, focus-trap, and
// deferred-unmount internals that fail in jsdom. Replaced with
// PassthroughShell that conditionally renders children based on `opened`.
vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

const { default: AvailabilityField } =
  await import("./AvailabilityField.svelte");

afterEach(cleanup);

interface AvailFieldProps {
  allowRecurring: boolean;
  allowSpecific: boolean;
  value: AvailabilityData | undefined;
  error?: string;
  onchange: (data: AvailabilityData) => void;
}

function makeProps(overrides: Partial<AvailFieldProps> = {}): AvailFieldProps {
  return {
    allowRecurring: true,
    allowSpecific: true,
    value: undefined,
    onchange: vi.fn(),
    ...overrides,
  };
}

describe("AvailabilityField", () => {
  describe("timezone display", () => {
    it("shows detected timezone on mount", () => {
      render(AvailabilityField, { props: makeProps() });
      // Intl.DateTimeFormat().resolvedOptions().timeZone in jsdom is "UTC"
      expect(screen.getByText(/Timezone:/)).toBeTruthy();
    });

    it("renders a Change button", () => {
      render(AvailabilityField, { props: makeProps() });
      expect(screen.getByText("Change")).toBeTruthy();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no windows are added", () => {
      render(AvailabilityField, { props: makeProps() });
      expect(screen.getByText("No times added yet.")).toBeTruthy();
    });
  });

  describe("recurring windows", () => {
    it("shows Add weekly time button when allowRecurring is true", () => {
      render(AvailabilityField, { props: makeProps() });
      expect(screen.getByText("Add weekly time")).toBeTruthy();
    });

    it("hides Add weekly time button when allowRecurring is false", () => {
      render(AvailabilityField, {
        props: makeProps({ allowRecurring: false }),
      });
      expect(screen.queryByText("Add weekly time")).toBeNull();
    });

    it("adds a recurring window on button click and calls onchange", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      const addBtn = screen.getByText("Add weekly time");
      await fireEvent.click(addBtn);
      // A remove button should appear
      expect(screen.getByText("Remove")).toBeTruthy();
      // onchange should have been called
      expect(onchange).toHaveBeenCalled();
    });

    it("removes a recurring window on Remove click", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      await fireEvent.click(screen.getByText("Add weekly time"));
      const removeBtn = screen.getByText("Remove");
      await fireEvent.click(removeBtn);
      // Should be back to empty state
      expect(screen.getByText("No times added yet.")).toBeTruthy();
    });

    it("renders the section title with count after adding a window", async () => {
      render(AvailabilityField, { props: makeProps() });
      await fireEvent.click(screen.getByText("Add weekly time"));
      expect(screen.getByText("Weekly times")).toBeTruthy();
      expect(screen.getByText("1 of 21")).toBeTruthy();
    });
  });

  describe("specific windows", () => {
    it("shows Add specific date button when allowSpecific is true", () => {
      render(AvailabilityField, { props: makeProps() });
      expect(screen.getByText("Add specific date")).toBeTruthy();
    });

    it("hides Add specific date button when allowSpecific is false", () => {
      render(AvailabilityField, {
        props: makeProps({ allowSpecific: false }),
      });
      expect(screen.queryByText("Add specific date")).toBeNull();
    });

    it("adds a specific window on button click", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      await fireEvent.click(screen.getByText("Add specific date"));
      expect(screen.getByText("Remove")).toBeTruthy();
      expect(onchange).toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("shows end-before-start error when end time is before start", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      await fireEvent.click(screen.getByText("Add weekly time"));

      // Find the time inputs: start and end for the first recurring window
      const timeInputs = document.querySelectorAll("input[type='time']");
      expect(timeInputs.length).toBeGreaterThanOrEqual(2);

      // Set start to 14:00 and end to 10:00 (invalid)
      await fireEvent.input(timeInputs[0]!, { target: { value: "14:00" } });
      await fireEvent.input(timeInputs[1]!, { target: { value: "10:00" } });

      const alerts = screen.queryAllByRole("alert");
      const endBeforeStartError = alerts.find(
        (el) => el.textContent === "End time must be after start time.",
      );
      expect(endBeforeStartError).toBeTruthy();
    });
  });

  describe("emitted shape", () => {
    it("emits AvailabilityData that parses against the schema", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      await fireEvent.click(screen.getByText("Add weekly time"));

      // Fill in the recurring window times
      const timeInputs = document.querySelectorAll("input[type='time']");
      await fireEvent.input(timeInputs[0]!, { target: { value: "09:00" } });
      await fireEvent.input(timeInputs[1]!, { target: { value: "12:00" } });

      // Get the last emitted value
      const lastCall = onchange.mock.calls[onchange.mock.calls.length - 1] as
        [AvailabilityData] | undefined;
      expect(lastCall).toBeDefined();

      const emitted = lastCall![0];
      const result = availabilityDataSchema.safeParse(emitted);
      expect(result.success).toBe(true);
    });

    it("includes timezone in the emitted value", async () => {
      const onchange = vi.fn();
      render(AvailabilityField, { props: makeProps({ onchange }) });
      await fireEvent.click(screen.getByText("Add weekly time"));

      const lastCall = onchange.mock.calls[onchange.mock.calls.length - 1] as
        [AvailabilityData] | undefined;
      expect(lastCall).toBeDefined();
      expect(lastCall![0].timezone).toBeTruthy();
    });
  });

  describe("gated sections", () => {
    it("renders only recurring section when allowSpecific is false", () => {
      render(AvailabilityField, {
        props: makeProps({ allowSpecific: false }),
      });
      expect(screen.getByText("Add weekly time")).toBeTruthy();
      expect(screen.queryByText("Add specific date")).toBeNull();
    });

    it("renders only specific section when allowRecurring is false", () => {
      render(AvailabilityField, {
        props: makeProps({ allowRecurring: false }),
      });
      expect(screen.queryByText("Add weekly time")).toBeNull();
      expect(screen.getByText("Add specific date")).toBeTruthy();
    });
  });

  describe("error prop", () => {
    it("renders FieldError when error prop is set", () => {
      render(AvailabilityField, {
        props: makeProps({ error: "At least one window required." }),
      });
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe("At least one window required.");
    });
  });
});
