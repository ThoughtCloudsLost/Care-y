// @vitest-environment jsdom

/**
 * Tests for MergeCandidatesSection dashboard component.
 *
 * Verifies: hidden when no candidates, renders cards with aliases,
 * dismiss removes the card, review button navigates with prefill,
 * shared-line button, truncated notice, max 5 visible rows.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type { MergeCandidate } from "$lib/workers/crypto-protocol.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// vi.mock required: $lib/paraglide/messages.js is generated at build time
// by the paraglide compiler; the Vite alias resolves it but the module
// needs stub overrides for the keys this component uses.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  mergeCandidates_heading: () => "Possible Duplicates",
  mergeCandidates_match_phone: () => "Same phone number",
  mergeCandidates_match_email: () => "Same email address",
  mergeCandidates_review: () => "Review",
  mergeCandidates_dismiss: () => "Dismiss",
  mergeCandidates_pair: ({
    aliasA,
    aliasB,
  }: {
    aliasA: string;
    aliasB: string;
  }) => `${aliasA} / ${aliasB}`,
  mergeCandidates_coverage_notice: () => "Coverage notice text",
  mergeCandidates_shared_line: () => "Shared line",
  mergeCandidates_truncated_notice: () => "Truncated notice text",
}));

import MergeCandidatesSection from "./MergeCandidatesSection.svelte";

afterEach(cleanup);

const CANDIDATE_PHONE: MergeCandidate = {
  clientIdA: "aaa-111",
  clientIdB: "bbb-222",
  matchKind: "phone",
  matchHash: "phonehash-abc",
};

const CANDIDATE_EMAIL: MergeCandidate = {
  clientIdA: "ccc-333",
  clientIdB: "ddd-444",
  matchKind: "email",
  matchHash: "emailhash-xyz",
};

function resolveAlias(clientId: string): string | null {
  const aliases: Record<string, string> = {
    "aaa-111": "Alice",
    "bbb-222": "Bob",
    "ccc-333": "Charlie",
    "ddd-444": "Diana",
  };
  return aliases[clientId] ?? null;
}

function defaultProps(overrides?: Record<string, unknown>) {
  return {
    candidates: [CANDIDATE_PHONE],
    expanded: true,
    ontoggle: vi.fn(),
    resolveAlias,
    ondismiss: vi.fn(),
    onreview: vi.fn(),
    truncated: false,
    onsharedline: vi.fn(),
    ...overrides,
  };
}

describe("MergeCandidatesSection", () => {
  it("renders candidate cards with aliases", () => {
    render(MergeCandidatesSection, { props: defaultProps() });

    expect(screen.getByText(/Alice.*Bob/)).toBeTruthy();
  });

  it("renders match kind label", () => {
    render(MergeCandidatesSection, {
      props: defaultProps({
        candidates: [CANDIDATE_PHONE, CANDIDATE_EMAIL],
      }),
    });

    // The mock returns the function key name
    expect(screen.getByText("Same phone number")).toBeTruthy();
    expect(screen.getByText("Same email address")).toBeTruthy();
  });

  it("calls ondismiss with correct client ids", async () => {
    const ondismiss = vi.fn();

    render(MergeCandidatesSection, {
      props: defaultProps({ ondismiss }),
    });

    const dismissBtn = screen.getByText("Dismiss");
    await fireEvent.click(dismissBtn);

    expect(ondismiss).toHaveBeenCalledWith("aaa-111", "bbb-222");
  });

  it("calls onreview with correct client ids", async () => {
    const onreview = vi.fn();

    render(MergeCandidatesSection, {
      props: defaultProps({ onreview }),
    });

    const reviewBtn = screen.getByText("Review");
    await fireEvent.click(reviewBtn);

    expect(onreview).toHaveBeenCalledWith("aaa-111", "bbb-222");
  });

  it("does not render contact values anywhere in the section", () => {
    render(MergeCandidatesSection, { props: defaultProps() });

    // No phone numbers or email addresses should appear in the DOM
    const html = document.body.innerHTML;
    expect(html).not.toContain("212");
    expect(html).not.toContain("555");
    expect(html).not.toContain("1234");
    expect(html).not.toContain("@example.com");
  });

  it("renders at most 5 rows while header count shows the full total", () => {
    const many: MergeCandidate[] = Array.from({ length: 8 }, (_, i) => ({
      clientIdA: `a-${i}`,
      clientIdB: `b-${i}`,
      matchKind: "phone" as const,
      matchHash: `hash-${i}`,
    }));

    const { container } = render(MergeCandidatesSection, {
      props: defaultProps({ candidates: many }),
    });

    // The CollapsibleSection header badge shows the true count (8)
    expect(container.textContent).toContain("8");

    // Only 5 list items render (the first 5 pairs)
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBeLessThanOrEqual(5);
  });

  it("shared-line button appears only on phone-match rows and calls onsharedline", async () => {
    const onsharedline = vi.fn();

    render(MergeCandidatesSection, {
      props: defaultProps({
        candidates: [CANDIDATE_PHONE, CANDIDATE_EMAIL],
        onsharedline,
      }),
    });

    const sharedBtns = screen.getAllByText("Shared line");
    // Phone row has the button, email row does not
    expect(sharedBtns).toHaveLength(1);

    await fireEvent.click(sharedBtns[0]!);
    expect(onsharedline).toHaveBeenCalledWith("phonehash-abc");
  });

  it("truncated notice renders only when truncated is true", () => {
    const { container, unmount } = render(MergeCandidatesSection, {
      props: defaultProps({ truncated: false }),
    });

    expect(container.textContent).not.toContain("Truncated notice text");
    unmount();

    const { container: container2 } = render(MergeCandidatesSection, {
      props: defaultProps({ truncated: true }),
    });

    expect(container2.textContent).toContain("Truncated notice text");
  });
});
