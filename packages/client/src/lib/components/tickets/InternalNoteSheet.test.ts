// @vitest-environment jsdom
/**
 * InternalNoteSheet tests: the Note register around the visibility and
 * notification hints, and the type description staying outside it.
 *
 * ShellSheet is stubbed with the PassthroughShell helper; the note-types
 * query is a controllable state object.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import InternalNoteSheet from "./InternalNoteSheet.svelte";

let noteTypesState: Record<string, unknown> = { data: undefined };

vi.mock("$lib/tickets/queries.js", () => ({
  createNoteTypesQuery: () => noteTypesState,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      noteTypes: {},
      createFollowUp: { mutate: vi.fn() },
      updateInternalNote: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({}),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((key: string) => {
      if (key.endsWith(":name")) return "Comment";
      if (key.endsWith(":desc")) return "Use for general remarks.";
      return null;
    }),
  }),
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (o?: Record<string, string>) => ({ ...o }),
}));

vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  ticketId: "ticket-001",
};

function makeNoteType(overrides: Record<string, unknown> = {}) {
  return {
    id: "nt-1",
    encryptedName: { type: "Buffer", data: [1] },
    encryptedDescription: null,
    canCreate: true,
    minViewRole: "role-any",
    notificationHints: [] as string[],
    ...overrides,
  };
}

beforeEach(() => {
  noteTypesState = { data: undefined };
});

afterEach(() => {
  cleanup();
});

describe("InternalNoteSheet", () => {
  it("wraps the visibility hint in one Note register", () => {
    const { container } = render(InternalNoteSheet, { props: baseProps });
    const register = container.querySelector("[data-register='note']");
    expect(register).not.toBeNull();
    expect(register?.textContent).toContain("Note");
    expect(register?.textContent).toContain(
      "Only visible to other members of your organization.",
    );
  });

  it("renders the notification hint inside the same register", () => {
    noteTypesState = {
      data: {
        defaultNoteTypeId: "nt-1",
        types: [makeNoteType({ notificationHints: ["ticket_access"] })],
      },
    };
    const { container } = render(InternalNoteSheet, { props: baseProps });
    const register = container.querySelector("[data-register='note']");
    expect(register?.textContent).toContain("Notifies participants");
    // One register block, not one per hint.
    expect(container.querySelectorAll("[data-register]")).toHaveLength(1);
  });

  it("keeps the type description outside the register", () => {
    noteTypesState = {
      data: {
        defaultNoteTypeId: "nt-1",
        types: [
          makeNoteType({
            encryptedDescription: { type: "Buffer", data: [2] },
          }),
        ],
      },
    };
    const { container } = render(InternalNoteSheet, { props: baseProps });
    const register = container.querySelector("[data-register='note']");
    const typeDesc = container.querySelector(".note-type-desc");
    expect(typeDesc?.textContent).toContain("Use for general remarks.");
    expect(register?.contains(typeDesc)).toBe(false);
  });
});
