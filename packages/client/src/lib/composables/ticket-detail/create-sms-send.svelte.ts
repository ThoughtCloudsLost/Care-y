import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RateLimitError, RelayError } from "$lib/errors.js";
import { followupSlot } from "@care-y/crypto";
import { ticketKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

export interface SmsSendConfig {
  readonly getTicketId: () => string;
  readonly cryptoBridge: CryptoBridge;
  readonly queryClient: QueryClient;
  readonly createFollowUpMutate: (args: {
    id: string;
    ticketId: string;
    encryptedContent: string;
    source: "volunteer";
    type: "sms_outbound";
    isPrivate: false;
    mentionedPseudonyms: never[];
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
    createFollowUpMutate,
    onSuccess,
  } = config;

  let sending = $state(false);

  async function handleSmsSend(body: string): Promise<void> {
    if (sending || !body.trim()) return;

    sending = true;
    const ticketId = getTicketId();

    try {
      const resp = await fetch("/relay/sms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, body: body.trim() }),
      });

      if (resp.status === 429) {
        const retryAfter = resp.headers.get("Retry-After");
        const seconds = retryAfter !== null ? parseInt(retryAfter, 10) : 30;
        throw new RateLimitError(seconds);
      }
      if (!resp.ok) throw new RelayError("SMS_FAILED", resp.status);

      const followUpId = crypto.randomUUID();
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        body.trim(),
      );
      await createFollowUpMutate({
        id: followUpId,
        ticketId,
        encryptedContent,
        source: "volunteer",
        type: "sms_outbound",
        isPrivate: false,
        mentionedPseudonyms: [],
      });

      onSuccess();
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      invalidateReadState(queryClient);
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
