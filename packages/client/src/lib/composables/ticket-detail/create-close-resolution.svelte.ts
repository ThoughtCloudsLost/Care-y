import { followupSlot } from "@care-y/crypto";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { QueryClient } from "@tanstack/svelte-query";
import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";
import { ticketKeys } from "$lib/query/keys";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

type ToastStore = typeof ToastStoreType;

// ── Note type shape (subset of server type) ──

export interface NoteTypeRecord {
  readonly id: string;
  readonly encryptedName: SerializedBuffer | Uint8Array | null;
  readonly encryptedIcon: SerializedBuffer | Uint8Array | null;
  readonly requiresOnClose: boolean;
}

// ── Config ──

export interface CloseResolutionConfig {
  readonly getTicketId: () => string;
  readonly cryptoBridge: CryptoBridge;
  readonly queryClient: QueryClient;
  readonly getNoteTypes: () => readonly NoteTypeRecord[] | undefined;
  readonly orgCache: OrgDecryptCache;
  readonly toastStore: ToastStore;
  readonly labels: {
    readonly error: string;
  };
  readonly closeMutate: (ticketId: string) => Promise<unknown>;
  readonly createFollowUpMutate: (args: {
    id: string;
    ticketId: string;
    type: "internal_note";
    source: "volunteer";
    isPrivate: true;
    encryptedContent: string;
    noteTypeId: string;
  }) => Promise<unknown>;
}

// ── Return type ──

export interface CloseResolutionState {
  readonly sheetOpen: boolean;
  readonly noteTypeId: string | undefined;
  readonly noteTypeName: string;
  readonly noteTypeIconName: string | null;
  readonly current: number;
  readonly total: number;
  readonly saving: boolean;
  start(): void;
  submit(text: string): Promise<void>;
  skip(): void;
}

export function createCloseResolution(
  config: CloseResolutionConfig,
): CloseResolutionState {
  let closeQueue = $state<string[]>([]);
  let closeQueueIndex = $state(0);
  let sheetOpen = $state(false);
  let saving = $state(false);

  const currentNoteTypeId = $derived(closeQueue.at(closeQueueIndex));

  const currentNoteType = $derived(
    currentNoteTypeId !== undefined
      ? config.getNoteTypes()?.find((t) => t.id === currentNoteTypeId)
      : undefined,
  );

  const noteTypeName = $derived(
    currentNoteType
      ? (config.orgCache.decrypt(
          currentNoteType.id + ":name",
          currentNoteType.encryptedName,
        ) ?? "")
      : "",
  );

  const noteTypeIconName = $derived(
    currentNoteType
      ? (config.orgCache.decrypt(
          currentNoteType.id + ":icon",
          currentNoteType.encryptedIcon,
        ) ?? null)
      : null,
  );

  function advance(): void {
    closeQueueIndex++;
    if (closeQueueIndex >= closeQueue.length) {
      sheetOpen = false;
      void config.closeMutate(config.getTicketId()).catch(() => {
        config.toastStore.show(config.labels.error, 3000);
      });
    }
  }

  function start(): void {
    const types = config.getNoteTypes() ?? [];
    const requiresOnClose = types
      .filter((nt) => nt.requiresOnClose)
      .map((nt) => nt.id);

    if (requiresOnClose.length === 0) {
      void config.closeMutate(config.getTicketId()).catch(() => {
        config.toastStore.show(config.labels.error, 3000);
      });
      return;
    }

    closeQueue = requiresOnClose;
    closeQueueIndex = 0;
    sheetOpen = true;
  }

  async function submit(text: string): Promise<void> {
    if (currentNoteTypeId === undefined) return;
    saving = true;
    try {
      const ticketId = config.getTicketId();
      const followUpId = crypto.randomUUID();
      const encryptedContent = await config.cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        text,
      );
      await config.createFollowUpMutate({
        id: followUpId,
        ticketId,
        type: "internal_note",
        source: "volunteer",
        isPrivate: true,
        encryptedContent,
        noteTypeId: currentNoteTypeId,
      });
      void config.queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      invalidateReadState(config.queryClient);
      advance();
    } catch {
      config.toastStore.show(config.labels.error, 3000);
    } finally {
      saving = false;
    }
  }

  function skip(): void {
    advance();
  }

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    get noteTypeId(): string | undefined {
      return currentNoteTypeId;
    },
    get noteTypeName(): string {
      return noteTypeName;
    },
    get noteTypeIconName(): string | null {
      return noteTypeIconName;
    },
    get current(): number {
      return closeQueueIndex + 1;
    },
    get total(): number {
      return closeQueue.length;
    },
    get saving(): boolean {
      return saving;
    },
    start,
    submit,
    skip,
  };
}
