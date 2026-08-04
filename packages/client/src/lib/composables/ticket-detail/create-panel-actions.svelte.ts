import type { TicketAction } from "$lib/tickets/types.js";
import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

type ToastStore = typeof ToastStoreType;

export interface PanelActionsDeps {
  readonly getTicketId: () => string;
  readonly toastStore: ToastStore;
  readonly takeMutate: (ticketId: string) => Promise<unknown>;
  readonly releaseMutate: (ticketId: string) => Promise<unknown>;
  readonly updateMutate: (args: {
    ticketId: string;
    onHold: boolean;
  }) => Promise<unknown>;
  readonly reopenMutate: (args: {
    ticketId: string;
    newKeyGeneration: string;
  }) => Promise<unknown>;
  readonly watchMutate: (ticketId: string) => Promise<unknown>;
  readonly unwatchMutate: (ticketId: string) => Promise<unknown>;
  readonly onclose: () => void;
  readonly oncall: () => void;
  readonly onassign: () => void;
  readonly onphone: () => void;
  readonly oneditcontent: () => void;
  readonly onnotifications: () => void;
}

export interface PanelActions {
  dispatch(action: TicketAction): void;
}

export function createPanelActions(deps: PanelActionsDeps): PanelActions {
  function mutateWithToast<T>(promise: Promise<T>): void {
    void promise.catch(() => {
      deps.toastStore.show(m.error_generic(), 3000);
    });
  }

  function dispatch(action: TicketAction): void {
    const ticketId = deps.getTicketId();
    switch (action) {
      case "call":
        deps.oncall();
        break;
      case "phone":
        deps.onphone();
        break;
      case "take":
        mutateWithToast(deps.takeMutate(ticketId));
        break;
      case "release":
        mutateWithToast(deps.releaseMutate(ticketId));
        break;
      case "assign":
        deps.onassign();
        break;
      case "hold":
        mutateWithToast(deps.updateMutate({ ticketId, onHold: true }));
        break;
      case "unhold":
        mutateWithToast(deps.updateMutate({ ticketId, onHold: false }));
        break;
      case "close":
        deps.onclose();
        break;
      case "reopen":
        mutateWithToast(
          deps.reopenMutate({
            ticketId,
            newKeyGeneration: crypto.randomUUID(),
          }),
        );
        break;
      case "watch":
        mutateWithToast(deps.watchMutate(ticketId));
        break;
      case "unwatch":
        mutateWithToast(deps.unwatchMutate(ticketId));
        break;
      case "editContent":
        deps.oneditcontent();
        break;
      case "notifications":
        deps.onnotifications();
        break;
      case "cancel":
        break;
    }
  }

  return { dispatch };
}
