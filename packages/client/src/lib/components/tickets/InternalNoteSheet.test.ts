// @vitest-environment jsdom
/**
 * InternalNoteSheet tests: the Note register around the visibility and
 * notification hints, and the type description staying outside it.
 *
 * ShellSheet is stubbed with the PassthroughShell helper; the note-types
 * query is a controllable state object.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import { followupSlot } from "@care-y/crypto";
import * as m from "$lib/paraglide/messages.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import InternalNoteSheet from "./InternalNoteSheet.svelte";

let noteTypesState: Record<string, unknown> = { data: undefined };

interface CreateFollowUpPayload {
  id: string;
  ticketId: string;
  type: string;
  source: string;
  isPrivate: boolean;
  encryptedContent: string;
  noteTypeId?: string;
}

interface UpdateNotePayload {
  followUpId: string;
  encryptedContent: string;
  noteTypeId?: string;
}

const { mockEncrypt, mockCreateFollowUp, mockUpdateInternalNote } = vi.hoisted(
  () => ({
    mockEncrypt: vi
      .fn<(ticketId: string, slot: string, text: string) => Promise<string>>()
      .mockResolvedValue("sealed-note-b64"),
    mockCreateFollowUp: vi
      .fn<(input: CreateFollowUpPayload) => Promise<unknown>>()
      .mockResolvedValue({}),
    mockUpdateInternalNote: vi
      .fn<(input: UpdateNotePayload) => Promise<unknown>>()
      .mockResolvedValue({}),
  }),
);

// The toast module imports cleanly (no side effects), so a spy is enough.
const toastShowSpy = vi
  .spyOn(toastStore, "show")
  .mockImplementation(() => undefined);

vi.mock("$lib/tickets/queries.js", () => ({
  createNoteTypesQuery: () => noteTypesState,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      noteTypes: {},
      createFollowUp: { mutate: mockCreateFollowUp },
      updateInternalNote: { mutate: mockUpdateInternalNote },
    },
  },
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    encrypt: mockEncrypt,
  }),
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
  mockEncrypt.mockClear();
  mockCreateFollowUp.mockClear();
  mockUpdateInternalNote.mockClear();
  toastShowSpy.mockClear();
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

  describe("submit flow (create mode)", () => {
    function noteTextarea(): HTMLElement {
      return screen.getByPlaceholderText(m.ticket_compose_note_placeholder());
    }

    function saveButton(): HTMLElement {
      return screen.getByRole("button", { name: m.ticket_save_note() });
    }

    it("disables save until the note has non-whitespace text", async () => {
      render(InternalNoteSheet, {
        props: { ...baseProps, ondismiss: vi.fn() },
      });

      expect(saveButton().hasAttribute("disabled")).toBe(true);
      // The delete action belongs to edit mode only.
      expect(
        screen.queryByRole("button", { name: m.ticket_delete_note() }),
      ).toBeNull();

      await fireEvent.input(noteTextarea(), { target: { value: "   " } });
      expect(saveButton().hasAttribute("disabled")).toBe(true);

      await fireEvent.input(noteTextarea(), {
        target: { value: "A real note" },
      });
      expect(saveButton().hasAttribute("disabled")).toBe(false);
    });

    it("encrypts the trimmed note and creates a private internal-note follow-up", async () => {
      const ondismiss = vi.fn();
      render(InternalNoteSheet, { props: { ...baseProps, ondismiss } });

      await fireEvent.input(noteTextarea(), {
        target: { value: "  Client called back  " },
      });
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockCreateFollowUp).toHaveBeenCalledTimes(1);
      });
      const payload = mockCreateFollowUp.mock.calls.at(0)?.[0];
      // Wire payload contract for tickets.createFollowUp.
      expect(payload).toMatchObject({
        ticketId: "ticket-001",
        type: "internal_note",
        source: "volunteer",
        isPrivate: true,
        encryptedContent: "sealed-note-b64",
      });
      // The ciphertext slot must be bound to the same follow-up id that is
      // sent to the server, or the note can never be decrypted again.
      expect(mockEncrypt).toHaveBeenCalledWith(
        "ticket-001",
        followupSlot(payload?.id ?? ""),
        "Client called back",
      );
      // Security contract: plaintext never crosses the tRPC wire.
      expect(JSON.stringify(payload)).not.toContain("Client called back");

      await waitFor(() => {
        expect(ondismiss).toHaveBeenCalled();
      });
      expect(toastShowSpy).toHaveBeenCalledWith(m.ticket_note_saved());
    });

    it("sends the selected note type with the follow-up", async () => {
      noteTypesState = {
        data: {
          defaultNoteTypeId: "nt-1",
          types: [makeNoteType(), makeNoteType({ id: "nt-2" })],
        },
      };
      render(InternalNoteSheet, {
        props: { ...baseProps, ondismiss: vi.fn() },
      });

      await fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "nt-2" },
      });
      await fireEvent.input(noteTextarea(), {
        target: { value: "Typed note" },
      });
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockCreateFollowUp).toHaveBeenCalledTimes(1);
      });
      expect(mockCreateFollowUp.mock.calls.at(0)?.[0]).toMatchObject({
        noteTypeId: "nt-2",
      });
    });

    it("keeps the sheet open and shows an error toast when the save fails", async () => {
      mockCreateFollowUp.mockRejectedValueOnce(new Error("network down"));
      const ondismiss = vi.fn();
      render(InternalNoteSheet, { props: { ...baseProps, ondismiss } });

      await fireEvent.input(noteTextarea(), {
        target: { value: "Doomed note" },
      });
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(toastShowSpy).toHaveBeenCalledWith(
          m.error_generic(),
          expect.any(Number),
        );
      });
      expect(ondismiss).not.toHaveBeenCalled();
      // saving reset: the still-dirty note can be retried
      expect(saveButton().hasAttribute("disabled")).toBe(false);
    });

    it("resets the draft each time the sheet reopens", async () => {
      const { rerender } = render(InternalNoteSheet, {
        props: { ...baseProps, ondismiss: vi.fn() },
      });

      await fireEvent.input(noteTextarea(), {
        target: { value: "Draft in progress" },
      });
      expect(screen.getByDisplayValue("Draft in progress")).toBeTruthy();

      await rerender({ opened: false });
      await rerender({ opened: true });

      expect(screen.queryByDisplayValue("Draft in progress")).toBeNull();
    });
  });

  describe("submit flow (edit mode)", () => {
    const editProps = {
      ...baseProps,
      editFollowUpId: "fu-9",
      editInitialContent: "Original note",
    };

    function updateButton(): HTMLElement {
      return screen.getByRole("button", { name: m.common_update() });
    }

    it("prefills the existing note and disables update until it changes", async () => {
      render(InternalNoteSheet, {
        props: { ...editProps, ondismiss: vi.fn() },
      });

      // findBy: the prefill happens in an effect after first render.
      expect(await screen.findByDisplayValue("Original note")).toBeTruthy();
      expect(updateButton().hasAttribute("disabled")).toBe(true);
    });

    it("re-encrypts into the same follow-up slot and saves through updateInternalNote", async () => {
      const ondismiss = vi.fn();
      render(InternalNoteSheet, { props: { ...editProps, ondismiss } });

      const textarea = await screen.findByDisplayValue("Original note");
      await fireEvent.input(textarea, {
        target: { value: "Original note, corrected" },
      });
      expect(updateButton().hasAttribute("disabled")).toBe(false);

      await fireEvent.click(updateButton());

      await waitFor(() => {
        expect(mockUpdateInternalNote).toHaveBeenCalledTimes(1);
      });
      // Wire payload contract for tickets.updateInternalNote.
      expect(mockUpdateInternalNote.mock.calls.at(0)?.[0]).toMatchObject({
        followUpId: "fu-9",
        encryptedContent: "sealed-note-b64",
      });
      // Edited content must be sealed into the existing follow-up's slot.
      expect(mockEncrypt).toHaveBeenCalledWith(
        "ticket-001",
        followupSlot("fu-9"),
        "Original note, corrected",
      );
      expect(mockCreateFollowUp).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(ondismiss).toHaveBeenCalled();
      });
    });

    it("invokes ondelete with the follow-up id", async () => {
      const ondelete = vi.fn();
      render(InternalNoteSheet, {
        props: { ...editProps, ondismiss: vi.fn(), ondelete },
      });

      await fireEvent.click(
        screen.getByRole("button", { name: m.ticket_delete_note() }),
      );

      expect(ondelete).toHaveBeenCalledWith("fu-9");
      expect(mockUpdateInternalNote).not.toHaveBeenCalled();
    });
  });
});
