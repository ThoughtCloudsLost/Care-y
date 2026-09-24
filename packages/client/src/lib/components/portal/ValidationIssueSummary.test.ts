// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
}));

import ValidationIssueSummary from "./ValidationIssueSummary.svelte";
import type { ValidationIssue } from "../../../routes/(client)/intake/intake-form-logic.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

describe("ValidationIssueSummary", () => {
  afterEach(cleanup);

  const formatRow = (issue: ValidationIssue): string =>
    `${issue.fieldLabel}: ${issue.error}`;

  it("renders nothing when issues array is empty", () => {
    render(ValidationIssueSummary, {
      props: {
        heading: "Please review:",
        issues: [],
        formatRow,
      },
    });
    expect(screen.queryByTestId("validation-issue-summary")).toBeNull();
  });

  it("renders heading and issue rows when issues are present", () => {
    const issues: ValidationIssue[] = [
      { fieldKey: "name", fieldLabel: "Name", error: "required" },
      { fieldKey: "email", fieldLabel: "Email", error: "bad format" },
    ];
    render(ValidationIssueSummary, {
      props: {
        heading: "Please review:",
        issues,
        formatRow,
      },
    });

    const summary = screen.getByTestId("validation-issue-summary");
    expect(summary).toBeTruthy();
    expect(summary.textContent).toContain("Please review:");

    const rows = screen.getAllByTestId("validation-issue-row");
    expect(rows.length).toBe(2);
    expect(rows[0]?.textContent).toContain("Name: required");
    expect(rows[1]?.textContent).toContain("Email: bad format");
  });

  it("uses role=alert for accessibility", () => {
    const issues: ValidationIssue[] = [
      { fieldKey: "f1", fieldLabel: "Field", error: "err" },
    ];
    render(ValidationIssueSummary, {
      props: {
        heading: "Review",
        issues,
        formatRow,
      },
    });

    const summary = screen.getByTestId("validation-issue-summary");
    expect(summary.getAttribute("role")).toBe("alert");
  });

  it("applies the caller-provided formatRow function", () => {
    const customFormat = (issue: ValidationIssue): string =>
      `Step ${String(issue.pageNumber ?? 0)}: ${issue.fieldLabel}`;
    const issues: ValidationIssue[] = [
      {
        fieldKey: "f1",
        fieldLabel: "Name",
        error: "required",
        pageNumber: 2,
      },
    ];
    render(ValidationIssueSummary, {
      props: {
        heading: "Review",
        issues,
        formatRow: customFormat,
      },
    });

    const row = screen.getByTestId("validation-issue-row");
    expect(row.textContent).toContain("Step 2: Name");
  });
});
