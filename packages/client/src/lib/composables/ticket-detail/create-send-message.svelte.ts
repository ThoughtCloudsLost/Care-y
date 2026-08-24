import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { AsyncDecryptCache } from "$lib/crypto/async-decrypt-cache.js";
import { CryptoWorkerError } from "$lib/workers/crypto-bridge-errors.js";
import {
  followupSlot,
  eciesEncrypt,
  toRistrettoPoint,
  decode,
  encode,
} from "@care-y/crypto";
import { newFollowupId, newPendingFollowupId } from "@care-y/shared";
import type { FollowupId } from "@care-y/shared";
import { ticketKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { extractMentions } from "$lib/utils/mentions.js";
import * as m from "$lib/paraglide/messages.js";

export interface PendingEntryOpts {
  /** Optimistic placeholder id (`pending-<uuid>`), never persisted. */
  readonly pendingId: FollowupId;
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
  /**
   * Base64 client public key from the active portal channel, or null.
   * When present, the message also gets an ECIES client copy so the
   * client can read the reply in the portal (dual-copy write).
   */
  readonly getClientPublic: () => string | null;
  readonly createFollowUpMutate: (args: {
    id: string;
    ticketId: string;
    encryptedContent: string;
    source: "volunteer";
    type: "message";
    isPrivate: false;
    mentionedPseudonyms: string[];
    portalCopy?: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    };
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
    getClientPublic,
    createFollowUpMutate,
  } = config;

  let sending = $state(false);

  async function handleSend(): Promise<void> {
    const text = getDraftText().trim();
    if (!text || sending) return;

    sending = true;
    const ticketId = getTicketId();
    const followUpsKey = ticketKeys.followUpsInitial(ticketId);
    const pendingId = newPendingFollowupId();

    const followUpId = newFollowupId();

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

      // Dual-copy write: when the client has an active portal channel,
      // the same text is also sealed to the client's public key so the
      // reply is readable in the portal. Without it the server writes
      // only the org copy and the client never sees the message.
      const clientPublic = getClientPublic();
      let portalCopy:
        | { ephemeralPoint: string; nonce: string; ciphertext: string }
        | undefined;
      if (clientPublic != null && clientPublic !== "") {
        const pubBytes = toRistrettoPoint(decode(clientPublic));
        const textBytes = new TextEncoder().encode(text);
        const ecies = eciesEncrypt(textBytes, pubBytes);
        portalCopy = {
          ephemeralPoint: encode(ecies.ephemeralPoint),
          nonce: encode(ecies.nonce),
          ciphertext: encode(ecies.ciphertext),
        };
      }

      await createFollowUpMutate({
        id: followUpId,
        ticketId,
        encryptedContent,
        source: "volunteer" as const,
        type: "message" as const,
        isPrivate: false,
        mentionedPseudonyms: mentions,
        portalCopy,
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
