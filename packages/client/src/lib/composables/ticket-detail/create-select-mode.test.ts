import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSelectMode,
  type SelectModeConfig,
  type SelectableFollowUp,
} from "./create-select-mode.svelte.js";

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

function makeConfig(overrides?: Partial<SelectModeConfig>): SelectModeConfig {
  return {
    getClientAlias: () => "Alice",
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
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });
});
