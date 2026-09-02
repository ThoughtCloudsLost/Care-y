import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RateLimitError } from "$lib/errors.js";
import type { PortalCopy } from "$lib/crypto/seal-portal-copy.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";
import {
  relayThenRecord,
  retryRecord,
  type PendingRecord,
} from "./relay-then-record.js";

export interface SmsSendConfig {
  readonly getTicketId: () => string;
  readonly cryptoBridge: CryptoBridge;
  readonly queryClient: QueryClient;
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
    type: "sms_outbound";
    isPrivate: false;
    mentionedPseudonyms: never[];
    portalCopy?: PortalCopy;
  }) => Promise<unknown>;
  readonly onSuccess: () => void;
}

export interface SmsSend {
  readonly sending: boolean;
  handleSmsSend: (body: string) => Promise<void>;
}

export function createSmsSend(config: SmsSendConfig): SmsSend {
  const {
    getTicketId,
    cryptoBridge,
    queryClient,
    getClientPublic,
    createFollowUpMutate,
    onSuccess,
  } = config;

  let sending = $state(false);
  let pendingRecord = $state<PendingRecord<"sms_outbound"> | null>(null);

  async function handleSmsSend(body: string): Promise<void> {
    if (sending || !body.trim()) return;

    sending = true;
    const ticketId = getTicketId();
    const trimmed = body.trim();

    try {
      // When a previous relay succeeded but the follow-up write failed,
      // retry only the mutation. The message already reached the client.
      if (pendingRecord !== null) {
        const landed = await retryRecord(pendingRecord, {
          queryClient,
          createFollowUpMutate,
          onSuccess,
          errorRecordMessage: m.ticket_sms_error_record(),
        });
        if (landed) {
          pendingRecord = null;
        }
        return;
      }

      const result = await relayThenRecord({
        ticketId,
        cryptoBridge,
        queryClient,
        getClientPublic,
        createFollowUpMutate,
        onSuccess,
        relayUrl: "/relay/sms",
        relayBody: { ticketId, body: trimmed },
        followUpType: "sms_outbound",
        plaintext: trimmed,
        errorRecordMessage: m.ticket_sms_error_record(),
      });

      if (result.status === "record_pending") {
        pendingRecord = result.pending;
      }
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        toastStore.show(
          m.ticket_sms_rate_limited({ seconds: String(err.retryAfterSeconds) }),
          5000,
        );
      } else {
        toastStore.show(m.ticket_sms_error_send(), 3000);
      }
    } finally {
      sending = false;
    }
  }

  return {
    get sending() {
      return sending;
    },
    handleSmsSend,
  };
}
