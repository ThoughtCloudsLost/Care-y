import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createSelectMode,
  type SelectModeConfig,
  type SelectableFollowUp,
} from "./create-select-mode.svelte.js";
import type { VolunteerRecord } from "$lib/tickets/resolve-volunteer.js";

const mockToastStore = {
  current: null as { id: number; message: string; duration: number } | null,
  show: vi.fn(),
  dismiss: vi.fn(),
};

const defaultLabels = {
  oneCopied: "1 message copied",
  manyCopied: (count: string) => `${count} messages copied`,
  copyFailed: "Copy failed",
};

const fakeKeyWrap = {
  ephemeralPoint: "ep-fake",
  nonce: "nonce-fake",
  wrappedKey: "wk-fake",
} as const;

function makeConfig(overrides?: Partial<SelectModeConfig>): SelectModeConfig {
  return {
    getClientAlias: () => "calm-pebble-7",
    getVolunteerMap: () => new Map(),
    orgCache: {
      decrypt: vi.fn(() => null),
    } as unknown as SelectModeConfig["orgCache"],
    followUpCache: {
      decryptContent: vi.fn(() => undefined),
    } as unknown as SelectModeConfig["followUpCache"],
    getTicketId: () => "ticket-select-1",
    getTicketKeyWrap: () => null,
    toastStore: mockToastStore,
    labels: defaultLabels,
    ...overrides,
  };
}

function makeFollowUp(
  overrides?: Partial<SelectableFollowUp>,
): SelectableFollowUp {
  return {
    id: "fu-1",
    source: "client",
    type: "message",
    createdBy: null,
    createdAt: new Date().toISOString(),
    encryptedContent: "encrypted-blob",
    ...overrides,
  };
}

describe("createSelectMode", () => {
  let savedClipboard: Clipboard;

  beforeEach(() => {
    vi.restoreAllMocks();
    savedClipboard = navigator.clipboard;
  });

  afterEach(() => {
    Object.assign(navigator, { clipboard: savedClipboard });
  });

  it("starts inactive with empty selection", () => {
    const sm = createSelectMode(makeConfig());

    expect(sm.active).toBe(false);
    expect(sm.selectedIds.size).toBe(0);
  });

  it("enter activates and clears any prior selection", () => {
    const sm = createSelectMode(makeConfig());
    sm.toggle("fu-1");

    sm.enter();

    expect(sm.active).toBe(true);
    expect(sm.selectedIds.size).toBe(0);
  });

  it("exit deactivates and clears selection", () => {
    const sm = createSelectMode(makeConfig());
    sm.enter();
    sm.toggle("fu-1");

    sm.exit();

    expect(sm.active).toBe(false);
    expect(sm.selectedIds.size).toBe(0);
  });

  it("toggle adds and removes IDs", () => {
    const sm = createSelectMode(makeConfig());

    sm.toggle("fu-1");
    expect(sm.selectedIds.has("fu-1")).toBe(true);

    sm.toggle("fu-1");
    expect(sm.selectedIds.has("fu-1")).toBe(false);
  });

  describe("copySelected", () => {
    it("does nothing when no IDs are selected", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());

      await sm.copySelected([makeFollowUp()]);

      expect(writeText).not.toHaveBeenCalled();
    });

    it("copies selected follow-ups to clipboard and shows toast", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());
      sm.toggle("fu-1");
      sm.toggle("fu-2");

      await sm.copySelected([
        makeFollowUp({ id: "fu-1" }),
        makeFollowUp({ id: "fu-2" }),
        makeFollowUp({ id: "fu-3" }),
      ]);

      expect(writeText).toHaveBeenCalledOnce();
      expect(mockToastStore.show).toHaveBeenCalledWith("2 messages copied");
      expect(sm.active).toBe(false);
    });

    it("shows failure toast on clipboard error", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockRejectedValue(new Error("denied"));
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());
      sm.toggle("fu-1");

      await sm.copySelected([makeFollowUp({ id: "fu-1" })]);

      expect(mockToastStore.show).toHaveBeenCalledWith("Copy failed");
    });

    it("uses single-message label for one selected", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());
      sm.toggle("fu-1");

      await sm.copySelected([makeFollowUp({ id: "fu-1" })]);

      expect(mockToastStore.show).toHaveBeenCalledWith("1 message copied");
    });

    it("formats client source with client alias", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(
        makeConfig({
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => "hello from client"),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-client");

      await sm.copySelected([
        makeFollowUp({
          id: "fu-client",
          source: "client",
          type: "message",
          createdBy: null,
        }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("calm-pebble-7:");
      expect(clipboardText).toContain("hello from client");
    });

    it("labels system events with [System]", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(
        makeConfig({
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => "ticket reopened"),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-sys");

      await sm.copySelected([
        makeFollowUp({
          id: "fu-sys",
          source: "system",
          type: "status_change",
          createdBy: null,
        }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("[System]:");
      expect(clipboardText).toContain("ticket reopened");
    });

    it("resolves volunteer name from volunteerMap and orgCache", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const volId = crypto.randomUUID();
      const volunteerMap = new Map<string, VolunteerRecord>([
        [volId, { id: volId, encryptedDisplayName: "AQID" }],
      ]);

      const sm = createSelectMode(
        makeConfig({
          getVolunteerMap: () => volunteerMap,
          orgCache: {
            decrypt: vi.fn(() => "Dr. Stone"),
          } as unknown as SelectModeConfig["orgCache"],
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => "volunteer reply"),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-vol");

      await sm.copySelected([
        makeFollowUp({
          id: "fu-vol",
          source: "volunteer",
          type: "message",
          createdBy: volId,
        }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("Dr. Stone:");
      expect(clipboardText).toContain("volunteer reply");
    });

    it("appends (internal note) suffix for volunteer internal notes", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const volId = crypto.randomUUID();
      const volunteerMap = new Map<string, VolunteerRecord>([
        [volId, { id: volId, encryptedDisplayName: "AQID" }],
      ]);

      const sm = createSelectMode(
        makeConfig({
          getVolunteerMap: () => volunteerMap,
          orgCache: {
            decrypt: vi.fn(() => "Mx. Reyes"),
          } as unknown as SelectModeConfig["orgCache"],
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => "private note"),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-note");

      await sm.copySelected([
        makeFollowUp({
          id: "fu-note",
          source: "volunteer",
          type: "internal_note",
          createdBy: volId,
        }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("Mx. Reyes (internal note):");
    });

    it("falls back to Volunteer when volunteer not found in map", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(
        makeConfig({
          getVolunteerMap: () => new Map(),
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => "some text"),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-unknown-vol");

      await sm.copySelected([
        makeFollowUp({
          id: "fu-unknown-vol",
          source: "volunteer",
          type: "message",
          createdBy: crypto.randomUUID(),
        }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("Volunteer:");
    });

    it("formats multiple messages with newline separators", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      let callCount = 0;
      const contentMap: Record<string, string> = {
        "fu-a": "first message",
        "fu-b": "second message",
        "fu-c": "third message",
      };

      const sm = createSelectMode(
        makeConfig({
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn((cacheKey: string) => {
              callCount++;
              return contentMap[cacheKey] ?? "unknown";
            }),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-a");
      sm.toggle("fu-b");
      sm.toggle("fu-c");

      await sm.copySelected([
        makeFollowUp({ id: "fu-a", source: "client" }),
        makeFollowUp({ id: "fu-b", source: "system" }),
        makeFollowUp({ id: "fu-c", source: "client" }),
      ]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      const lines = clipboardText.split("\n");
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain("first message");
      expect(lines[1]).toContain("[System]:");
      expect(lines[2]).toContain("third message");
      expect(callCount).toBe(3);
    });

    it("uses [encrypted] when keyWrap present but cache returns undefined", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(
        makeConfig({
          getTicketKeyWrap: () => fakeKeyWrap,
          followUpCache: {
            decryptContent: vi.fn(() => undefined),
          } as unknown as SelectModeConfig["followUpCache"],
        }),
      );
      sm.toggle("fu-loading");

      await sm.copySelected([makeFollowUp({ id: "fu-loading" })]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      expect(clipboardText).toContain("[encrypted]");
    });

    it("skips clipboard when selected IDs do not match any follow-ups", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());
      sm.toggle("fu-nonexistent");

      await sm.copySelected([makeFollowUp({ id: "fu-other" })]);

      expect(writeText).not.toHaveBeenCalled();
    });

    it("exits select mode after clipboard failure", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockRejectedValue(new Error("denied"));
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig());
      sm.enter();
      sm.toggle("fu-1");

      await sm.copySelected([makeFollowUp({ id: "fu-1" })]);

      expect(sm.active).toBe(false);
      expect(sm.selectedIds.size).toBe(0);
    });

    it("uses empty content string when keyWrap is null", async () => {
      const writeText = vi
        .fn<(text: string) => Promise<void>>()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const sm = createSelectMode(makeConfig({ getTicketKeyWrap: () => null }));
      sm.toggle("fu-no-key");

      await sm.copySelected([makeFollowUp({ id: "fu-no-key" })]);

      const clipboardText = writeText.mock.calls[0]![0] as string;
      // When keyWrap is null, content block is skipped, so content is empty ""
      expect(clipboardText).toMatch(/: $/);
    });
  });
});
