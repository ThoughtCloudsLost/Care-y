import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCloseResolution,
  type CloseResolutionConfig,
  type NoteTypeRecord,
} from "./create-close-resolution.svelte.js";

const mockToastStore = {
  current: null as { id: number; message: string; duration: number } | null,
  show: vi.fn(),
  dismiss: vi.fn(),
};

function makeNoteType(overrides?: Partial<NoteTypeRecord>): NoteTypeRecord {
  return {
    id: "nt-1",
    encryptedName: null,
    encryptedIcon: null,
    requiresOnClose: true,
    ...overrides,
  };
}

function makeConfig(
  overrides?: Partial<CloseResolutionConfig>,
): CloseResolutionConfig {
  return {
    getTicketId: () => "ticket-1",
    cryptoBridge: {
      encrypt: vi.fn<() => Promise<string>>().mockResolvedValue("encrypted"),
    } as unknown as CloseResolutionConfig["cryptoBridge"],
    queryClient: {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as CloseResolutionConfig["queryClient"],
    getNoteTypes: () => [],
    orgCache: {
      decrypt: vi.fn(() => "Decrypted Name"),
    } as unknown as CloseResolutionConfig["orgCache"],
    toastStore: mockToastStore,
    labels: { error: "Something went wrong" },
    closeMutate: vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
    createFollowUpMutate: vi
      .fn<() => Promise<unknown>>()
      .mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createCloseResolution", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with sheet closed", () => {
    const cr = createCloseResolution(makeConfig());

    expect(cr.sheetOpen).toBe(false);
    expect(cr.saving).toBe(false);
    expect(cr.total).toBe(0);
  });

  describe("start", () => {
    it("closes immediately when no note types require on-close", () => {
      const closeMutate = vi
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(undefined);
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [makeNoteType({ requiresOnClose: false })],
          closeMutate,
        }),
      );

      cr.start();

      expect(cr.sheetOpen).toBe(false);
      expect(closeMutate).toHaveBeenCalledOnce();
    });

    it("opens sheet when note types require on-close entries", () => {
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [
            makeNoteType({ id: "nt-1", requiresOnClose: true }),
            makeNoteType({ id: "nt-2", requiresOnClose: true }),
          ],
        }),
      );

      cr.start();

      expect(cr.sheetOpen).toBe(true);
      expect(cr.current).toBe(1);
      expect(cr.total).toBe(2);
      expect(cr.noteTypeId).toBe("nt-1");
    });
  });

  describe("submit", () => {
    it("encrypts content and creates follow-up", async () => {
      const encrypt = vi
        .fn<() => Promise<string>>()
        .mockResolvedValue("encrypted-text");
      const createFollowUpMutate = vi
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(undefined);

      const cr = createCloseResolution(
        makeConfig({
          cryptoBridge: {
            encrypt,
          } as unknown as CloseResolutionConfig["cryptoBridge"],
          getNoteTypes: () => [makeNoteType({ id: "nt-1" })],
          createFollowUpMutate,
        }),
      );

      cr.start();
      await cr.submit("My note text");

      expect(encrypt).toHaveBeenCalledWith("ticket-1", "My note text");
      expect(createFollowUpMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketId: "ticket-1",
          type: "internal_note",
          source: "volunteer",
          isPrivate: true,
          encryptedContent: "encrypted-text",
          noteTypeId: "nt-1",
        }),
      );
    });

    it("advances to next note type after submit", async () => {
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [
            makeNoteType({ id: "nt-1" }),
            makeNoteType({ id: "nt-2" }),
          ],
        }),
      );

      cr.start();
      expect(cr.noteTypeId).toBe("nt-1");

      await cr.submit("First note");
      expect(cr.noteTypeId).toBe("nt-2");
      expect(cr.current).toBe(2);
      expect(cr.sheetOpen).toBe(true);
    });

    it("closes sheet and calls closeMutate after last submit", async () => {
      const closeMutate = vi
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(undefined);
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [makeNoteType({ id: "nt-1" })],
          closeMutate,
        }),
      );

      cr.start();
      await cr.submit("Final note");

      expect(cr.sheetOpen).toBe(false);
      expect(closeMutate).toHaveBeenCalledOnce();
    });

    it("shows error toast on submit failure", async () => {
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [makeNoteType()],
          createFollowUpMutate: vi.fn().mockRejectedValue(new Error("fail")),
        }),
      );

      cr.start();
      await cr.submit("text");

      expect(mockToastStore.show).toHaveBeenCalledWith(
        "Something went wrong",
        3000,
      );
      expect(cr.saving).toBe(false);
    });
  });

  describe("skip", () => {
    it("advances without creating a follow-up", () => {
      const createFollowUpMutate = vi.fn();
      const cr = createCloseResolution(
        makeConfig({
          getNoteTypes: () => [
            makeNoteType({ id: "nt-1" }),
            makeNoteType({ id: "nt-2" }),
          ],
          createFollowUpMutate,
        }),
      );

      cr.start();
      cr.skip();

      expect(createFollowUpMutate).not.toHaveBeenCalled();
      expect(cr.noteTypeId).toBe("nt-2");
    });
  });
});
