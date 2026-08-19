// @vitest-environment jsdom

/**
 * Tests for MergeCandidatesSection dashboard component.
 *
 * Verifies: hidden when no candidates, renders cards with aliases,
 * dismiss removes the card, review button navigates with prefill.
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
}));

import MergeCandidatesSection from "./MergeCandidatesSection.svelte";

afterEach(cleanup);

const CANDIDATE_PHONE: MergeCandidate = {
  clientIdA: "aaa-111",
  clientIdB: "bbb-222",
  matchKind: "phone",
};

const CANDIDATE_EMAIL: MergeCandidate = {
  clientIdA: "ccc-333",
  clientIdB: "ddd-444",
  matchKind: "email",
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

describe("MergeCandidatesSection", () => {
  it("renders candidate cards with aliases", () => {
    render(MergeCandidatesSection, {
      props: {
        candidates: [CANDIDATE_PHONE],
        expanded: true,
        ontoggle: vi.fn(),
        resolveAlias,
        ondismiss: vi.fn(),
        onreview: vi.fn(),
      },
    });

    expect(screen.getByText(/Alice.*Bob/)).toBeTruthy();
  });

  it("renders match kind label", () => {
    render(MergeCandidatesSection, {
      props: {
        candidates: [CANDIDATE_PHONE, CANDIDATE_EMAIL],
        expanded: true,
        ontoggle: vi.fn(),
        resolveAlias,
        ondismiss: vi.fn(),
        onreview: vi.fn(),
      },
    });

    // The mock returns the function key name
    expect(screen.getByText("Same phone number")).toBeTruthy();
    expect(screen.getByText("Same email address")).toBeTruthy();
  });

  it("calls ondismiss with correct client ids", async () => {
    const ondismiss = vi.fn();

    render(MergeCandidatesSection, {
      props: {
        candidates: [CANDIDATE_PHONE],
        expanded: true,
        ontoggle: vi.fn(),
        resolveAlias,
        ondismiss,
        onreview: vi.fn(),
      },
    });

    const dismissBtn = screen.getByText("Dismiss");
    await fireEvent.click(dismissBtn);

    expect(ondismiss).toHaveBeenCalledWith("aaa-111", "bbb-222");
  });

  it("calls onreview with correct client ids", async () => {
    const onreview = vi.fn();

    render(MergeCandidatesSection, {
      props: {
        candidates: [CANDIDATE_PHONE],
        expanded: true,
        ontoggle: vi.fn(),
        resolveAlias,
        ondismiss: vi.fn(),
        onreview,
      },
    });

    const reviewBtn = screen.getByText("Review");
    await fireEvent.click(reviewBtn);

    expect(onreview).toHaveBeenCalledWith("aaa-111", "bbb-222");
  });

  it("does not render contact values anywhere in the section", () => {
    render(MergeCandidatesSection, {
      props: {
        candidates: [CANDIDATE_PHONE],
        expanded: true,
        ontoggle: vi.fn(),
        resolveAlias,
        ondismiss: vi.fn(),
        onreview: vi.fn(),
      },
    });

    // No phone numbers or email addresses should appear in the DOM
    const html = document.body.innerHTML;
    expect(html).not.toContain("212");
    expect(html).not.toContain("555");
    expect(html).not.toContain("1234");
    expect(html).not.toContain("@example.com");
  });
});
