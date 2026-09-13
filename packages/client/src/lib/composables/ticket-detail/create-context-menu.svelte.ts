import type {
  ContextActionId,
  ContextMenuEvent,
} from "$lib/components/tickets/context-menu-actions.js";

// ── Callback contract ──

export interface ContextMenuCallbacks {
  readonly oncopy: (plaintext: string | undefined) => Promise<void>;
  readonly onedit: (
    followUpId: string,
    plaintext: string,
    noteTypeId: string | null,
  ) => void;
  readonly oneditmessage?: (followUpId: string, plaintext: string) => void;
  readonly ondelete: (followUpId: string) => void;
}

// ── Return type ──

export interface ContextMenuState {
  readonly open: boolean;
  readonly data: ContextMenuEvent | null;
  show(event: ContextMenuEvent): void;
  dismiss(): void;
  dispatch(actionId: ContextActionId): void;
}

export function createContextMenu(
  callbacks: ContextMenuCallbacks,
): ContextMenuState {
  let open = $state(false);
  let data = $state<ContextMenuEvent | null>(null);

  function dismiss(): void {
    open = false;
    data = null;
  }

  function dispatch(actionId: ContextActionId): void {
    const snapshot = data;
    dismiss();
    if (snapshot === null) return;

    switch (actionId) {
      case "copy":
        void callbacks.oncopy(snapshot.plaintext);
        break;
      case "edit":
        callbacks.onedit(
          snapshot.followUpId,
          snapshot.plaintext ?? "",
          snapshot.noteTypeId ?? null,
        );
        break;
      case "editMessage":
        callbacks.oneditmessage?.(
          snapshot.followUpId,
          snapshot.plaintext ?? "",
        );
        break;
      case "delete":
        callbacks.ondelete(snapshot.followUpId);
        break;
    }
  }

  return {
    get open(): boolean {
      return open;
    },
    get data(): ContextMenuEvent | null {
      return data;
    },
    show(event: ContextMenuEvent): void {
      data = event;
      open = true;
    },
    dismiss,
    dispatch,
  };
}
