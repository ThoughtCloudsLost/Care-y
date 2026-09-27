import { describe, it, expect } from "vitest";
import { joinFilterSummary } from "./filter-summary.js";

describe("joinFilterSummary", () => {
  it("joins the parts in order", () => {
    expect(joinFilterSummary(["New", "2 queues", "Date"])).toBe(
      "New, 2 queues, Date",
    );
  });

  it("says there are no filters when there are no parts", () => {
    expect(joinFilterSummary([])).toBe("No filters");
  });
});
