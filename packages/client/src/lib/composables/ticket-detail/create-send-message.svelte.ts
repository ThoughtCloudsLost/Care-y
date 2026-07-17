import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { AsyncDecryptCache } from "$lib/crypto/async-decrypt-cache.js";
import { CryptoWorkerError } from "$lib/workers/crypto-bridge-errors.js";
import { followupSlot } from "@care-y/crypto";
import { ticketKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { extractMentions } from "$lib/utils/mentions.js";
import * as m from "$lib/paraglide/messages.js";

export interface PendingEntryOpts {
  readonly pendingId: string;
  readonly ticketId: string;
  readonly mentionedPseudonyms: string[];
  readonly currentUserId: string | null;
}

export interface SendMessageConfig<TFollowUp> {
  readonly getTicketId: () => string;
  readonly getCurrentUserId: () => string | null;
  readonly getDraftText: () => string;
  readonly setDraftText: (v: string) => void;
  readonly cryptoBridge: CryptoBridge;
  readonly followUpCache: AsyncDecryptCache;
  readonly queryClient: QueryClient;
  readonly buildPendingEntry: (opts: PendingEntryOpts) => TFollowUp;
  readonly createFollowUpMutate: (args: {
    id: string;
    ticketId: string;
    encryptedContent: string;
    source: "volunteer";
    type: "message";
    isPrivate: false;
    mentionedPseudonyms: string[];
  }) => Promise<unknown>;
}

export interface SendMessage {
  readonly sending: boolean;
  handleSend: () => Promise<void>;
}

export function createSendMessage<TFollowUp extends { id: string }>(
  config: SendMessageConfig<TFollowUp>,
): SendMessage {
  const {
    getTicketId,
    getCurrentUserId,
    getDraftText,
    setDraftText,
    cryptoBridge,
    followUpCache,
    queryClient,
    buildPendingEntry,
    createFollowUpMutate,
  } = config;

  let sending = $state(false);

  async function handleSend(): Promise<void> {
    const text = getDraftText().trim();
    if (!text || sending) return;

    sending = true;
    const ticketId = getTicketId();
    const followUpsKey = ticketKeys.followUpsInitial(ticketId);
    const pendingId = `pending-${crypto.randomUUID()}`;

    const followUpId = crypto.randomUUID();

    try {
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        text,
      );

      setDraftText("");

      const mentions = extractMentions(text);

      const pendingFollowUp = buildPendingEntry({
        pendingId,
        ticketId,
        mentionedPseudonyms: mentions,
        currentUserId: getCurrentUserId(),
      });

      queryClient.setQueryData<TFollowUp[]>(followUpsKey, (old) =>
        old ? [...old, pendingFollowUp] : [pendingFollowUp],
      );

      followUpCache.seed(pendingId, text);

      await createFollowUpMutate({
        id: followUpId,
        ticketId,
        encryptedContent,
        source: "volunteer" as const,
        type: "message" as const,
        isPrivate: false,
        mentionedPseudonyms: mentions,
      });

      await queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      invalidateReadState(queryClient);
    } catch (err: unknown) {
      followUpCache.deleteByPrefix(pendingId);
      queryClient.setQueryData<TFollowUp[]>(followUpsKey, (old) =>
        old?.filter((fu) => !fu.id.startsWith("pending-")),
      );
      if (!getDraftText()) setDraftText(text);
      const msg =
        err instanceof CryptoWorkerError &&
        (err.code === "TK_NOT_CACHED" || err.code === "ENCRYPT_FAILED")
          ? m.ticket_reply_error_encrypt()
          : m.ticket_reply_error_send();
      toastStore.show(msg, 3000);
    } finally {
      sending = false;
    }
  }

  return {
    get sending() {
      return sending;
    },
    handleSend,
  };
}
