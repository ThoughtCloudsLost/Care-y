import type { QueryClient } from "@tanstack/svelte-query";
import { ticketKeys } from "$lib/query/keys.js";
import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";
import type { DisbursementEdit } from "$lib/components/tickets/disbursement-types.js";

type ToastStore = typeof ToastStoreType;

// ── Delete confirmation ──

export interface DeleteConfirmDeps {
  readonly getTicketId: () => string;
  readonly queryClient: QueryClient;
  readonly toastStore: ToastStore;
  readonly deleteNoteMutate: (followUpId: string) => Promise<unknown>;
  readonly labels: {
    readonly deleteError: string;
  };
}

interface FollowUpEntry {
  readonly id: string;
}

export interface DeleteConfirmState {
  readonly open: boolean;
  readonly targetId: string | null;
  openConfirm(followUpId: string): void;
  close(): void;
  confirm(): Promise<void>;
}

export function createDeleteConfirm(
  deps: DeleteConfirmDeps,
): DeleteConfirmState {
  const { getTicketId, queryClient, toastStore, deleteNoteMutate, labels } =
    deps;

  let confirmOpen = $state(false);
  let targetId = $state<string | null>(null);

  function close(): void {
    confirmOpen = false;
    targetId = null;
  }

  async function confirm(): Promise<void> {
    const id = targetId;
    close();
    if (id === null) return;

    const ticketId = getTicketId();
    const followUpsKey = ticketKeys.followUpsInitial(ticketId);

    const previousData =
      queryClient.getQueryData<FollowUpEntry[]>(followUpsKey);

    queryClient.setQueryData<FollowUpEntry[]>(followUpsKey, (old) =>
      old?.filter((fu) => fu.id !== id),
    );

    try {
      await deleteNoteMutate(id);
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
    } catch {
      queryClient.setQueryData<FollowUpEntry[]>(followUpsKey, previousData);
      toastStore.show(labels.deleteError);
    }
  }

  return {
    get open(): boolean {
      return confirmOpen;
    },
    get targetId(): string | null {
      return targetId;
    },
    openConfirm(followUpId: string): void {
      targetId = followUpId;
      confirmOpen = true;
    },
    close,
    confirm,
  };
}

// ── Note edit sheet ──

export interface NoteEditState {
  readonly sheetOpen: boolean;
  readonly followUpId: string | undefined;
  readonly content: string | undefined;
  readonly noteTypeId: string | undefined;
  open(followUpId: string, content: string, noteTypeId: string | null): void;
  dismiss(): void;
}

export function createNoteEdit(): NoteEditState {
  let sheetOpen = $state(false);
  let editFollowUpId = $state<string | undefined>(undefined);
  let editContent = $state<string | undefined>(undefined);
  let editNoteTypeId = $state<string | undefined>(undefined);

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    get followUpId(): string | undefined {
      return editFollowUpId;
    },
    get content(): string | undefined {
      return editContent;
    },
    get noteTypeId(): string | undefined {
      return editNoteTypeId;
    },
    open(followUpId: string, content: string, noteTypeId: string | null): void {
      editFollowUpId = followUpId;
      editContent = content;
      editNoteTypeId = noteTypeId ?? undefined;
      sheetOpen = true;
    },
    dismiss(): void {
      sheetOpen = false;
      editFollowUpId = undefined;
      editContent = undefined;
      editNoteTypeId = undefined;
    },
  };
}

// ── Disbursement edit sheet ──

export interface DisbursementEditState {
  readonly sheetOpen: boolean;
  /**
   * The disbursement being corrected. Kept after dismiss so the sheet
   * keeps its content while it slides away; the next open replaces it.
   */
  readonly edit: DisbursementEdit | undefined;
  open(edit: DisbursementEdit): void;
  dismiss(): void;
}

export function createDisbursementEdit(): DisbursementEditState {
  let sheetOpen = $state(false);
  let current = $state<DisbursementEdit | undefined>(undefined);

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    get edit(): DisbursementEdit | undefined {
      return current;
    },
    open(edit: DisbursementEdit): void {
      current = edit;
      sheetOpen = true;
    },
    dismiss(): void {
      sheetOpen = false;
    },
  };
}

// ── Generic boolean sheet state ──

/** Reactive open/dismiss toggle for a sheet overlay. */
export interface SheetState {
  readonly sheetOpen: boolean;
  open(): void;
  dismiss(): void;
}

/**
 * One boolean sheet-state factory. Replaces the three verbatim copies
 * (ContentEdit, NotificationSheet, ShareSheet) that differed only in
 * type name.
 */
export function createSheetState(): SheetState {
  let sheetOpen = $state(false);

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    open(): void {
      sheetOpen = true;
    },
    dismiss(): void {
      sheetOpen = false;
    },
  };
}

// ── Backwards-compatible aliases ──

export type ContentEditState = SheetState;
export type NotificationSheetState = SheetState;
export type ShareSheetState = SheetState;

export const createContentEdit: () => SheetState = createSheetState;
export const createNotificationSheet: () => SheetState = createSheetState;
export const createShareSheet: () => SheetState = createSheetState;
