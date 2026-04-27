import { describe, it, expect, vi } from "vitest";
import {
  createContextMenu,
  type ContextMenuCallbacks,
} from "./create-context-menu.svelte.js";
import type { ContextMenuEvent } from "$lib/components/tickets/context-menu-actions.js";

function makeCallbacks(
  overrides?: Partial<ContextMenuCallbacks>,
): ContextMenuCallbacks {
  return {
    oncopy: vi
      .fn<(plaintext: string | undefined) => Promise<void>>()
      .mockResolvedValue(undefined),
    onedit: vi.fn(),
    ondelete: vi.fn(),
    ...overrides,
  };
}

function makeEvent(overrides?: Partial<ContextMenuEvent>): ContextMenuEvent {
  return {
    followUpId: "fu-1",
    actions: [{ id: "copy", label: "Copy" }],
    plaintext: "Hello world",
    noteTypeId: null,
    ...overrides,
  };
}

describe("createContextMenu", () => {
  it("starts closed with null data", () => {
    const menu = createContextMenu(makeCallbacks());

    expect(menu.open).toBe(false);
    expect(menu.data).toBeNull();
  });

  it("show sets open and data", () => {
    const menu = createContextMenu(makeCallbacks());
    const event = makeEvent();

    menu.show(event);

    expect(menu.open).toBe(true);
    expect(menu.data).toBe(event);
  });

  it("dismiss resets state", () => {
    const menu = createContextMenu(makeCallbacks());
    menu.show(makeEvent());

    menu.dismiss();

    expect(menu.open).toBe(false);
    expect(menu.data).toBeNull();
  });

  describe("dispatch", () => {
    it("copy calls oncopy with plaintext and closes", () => {
      const cb = makeCallbacks();
      const menu = createContextMenu(cb);
      menu.show(makeEvent({ plaintext: "test content" }));

      menu.dispatch("copy");

      expect(cb.oncopy).toHaveBeenCalledWith("test content");
      expect(menu.open).toBe(false);
    });

    it("edit calls onedit with followUpId, plaintext, and noteTypeId", () => {
      const cb = makeCallbacks();
      const menu = createContextMenu(cb);
      menu.show(
        makeEvent({
          followUpId: "fu-42",
          plaintext: "note text",
          noteTypeId: "nt-1",
        }),
      );

      menu.dispatch("edit");

      expect(cb.onedit).toHaveBeenCalledWith("fu-42", "note text", "nt-1");
    });

    it("edit passes empty string when plaintext is undefined", () => {
      const cb = makeCallbacks();
      const menu = createContextMenu(cb);
      menu.show(makeEvent({ plaintext: undefined }));

      menu.dispatch("edit");

      expect(cb.onedit).toHaveBeenCalledWith("fu-1", "", null);
    });

    it("delete calls ondelete with followUpId", () => {
      const cb = makeCallbacks();
      const menu = createContextMenu(cb);
      menu.show(makeEvent({ followUpId: "fu-99" }));

      menu.dispatch("delete");

      expect(cb.ondelete).toHaveBeenCalledWith("fu-99");
    });

    it("does nothing when dispatched with no active data", () => {
      const cb = makeCallbacks();
      const menu = createContextMenu(cb);

      menu.dispatch("copy");

      expect(cb.oncopy).not.toHaveBeenCalled();
      expect(cb.onedit).not.toHaveBeenCalled();
      expect(cb.ondelete).not.toHaveBeenCalled();
    });
  });
});
