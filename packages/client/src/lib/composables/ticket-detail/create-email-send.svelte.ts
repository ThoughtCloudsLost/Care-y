/**
 * Email send composable, mirroring create-sms-send.svelte.ts line for line.
 *
 * Flow:
 * 1. Client-side size pre-check against EMAIL_RELAY_LIMITS.
 * 2. POST /relay/email { ticketId, subject, html, text }.
 * 3. On relay success: encrypt the follow-up content, seal a portal
 *    copy when a client public key exists, then create the follow-up.
 * 4. If the follow-up mutation fails after a 200 relay, the retry
 *    toast fires but does NOT re-POST the relay (mail already left).
 * 5. Rate-limit and error toasts mirror the SMS family.
 */

import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RateLimitError, RelayError } from "$lib/errors.js";
import { followupSlot } from "@care-y/crypto";
import {
  sealPortalCopy,
  type PortalCopy,
} from "$lib/crypto/seal-portal-copy.js";
import { newFollowupId, EMAIL_RELAY_LIMITS } from "@care-y/shared";
import { ticketKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";
import type { ProseMirrorDocJSON } from "@care-y/shared";

export interface EmailSendConfig {
  readonly getTicketId: () => string;
  readonly cryptoBridge: CryptoBridge;
  readonly queryClient: QueryClient;
  /**
   * Base64 client public key from the active portal channel, or null.
   * When present, the follow-up also gets an ECIES client copy.
   */
  readonly getClientPublic: () => string | null;
  readonly createFollowUpMutate: (args: {
    id: string;
    ticketId: string;
    encryptedContent: string;
    source: "volunteer";
    type: "email_outbound";
    isPrivate: false;
    mentionedPseudonyms: never[];
    portalCopy?: PortalCopy;
  }) => Promise<unknown>;
  readonly onSuccess: () => void;
}

export interface EmailSend {
  readonly sending: boolean;
  handleEmailSend: (
    subject: string,
    html: string,
    text: string,
    doc: ProseMirrorDocJSON,
  ) => Promise<void>;
}

export function createEmailSend(config: EmailSendConfig): EmailSend {
  const {
    getTicketId,
    cryptoBridge,
    queryClient,
    getClientPublic,
    createFollowUpMutate,
    onSuccess,
  } = config;

  let sending = $state(false);

  async function handleEmailSend(
    subject: string,
    html: string,
    text: string,
    doc: ProseMirrorDocJSON,
  ): Promise<void> {
    if (sending || !subject.trim() || !text.trim()) return;

    // Client-side size pre-check so the server 400 is a backstop.
    const subjectBytes = new TextEncoder().encode(subject).byteLength;
    const htmlBytes = new TextEncoder().encode(html).byteLength;
    const textBytes = new TextEncoder().encode(text).byteLength;

    if (
      subjectBytes > EMAIL_RELAY_LIMITS.subject ||
      htmlBytes > EMAIL_RELAY_LIMITS.html ||
      textBytes > EMAIL_RELAY_LIMITS.text
    ) {
      toastStore.show(m.ticket_email_too_long(), 3000);
      return;
    }

    sending = true;
    const ticketId = getTicketId();

    try {
      // Step 1: relay the email.
      const resp = await fetch("/relay/email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          subject: subject.trim(),
          html,
          text: text.trim(),
        }),
      });

      if (resp.status === 429) {
        const retryAfter = resp.headers.get("Retry-After");
        const seconds = retryAfter !== null ? parseInt(retryAfter, 10) : 30;
        throw new RateLimitError(seconds);
      }
      if (!resp.ok) throw new RelayError("EMAIL_FAILED", resp.status);

      // Step 2: encrypt the follow-up content for the org thread.
      const followUpId = newFollowupId();
      const payload = JSON.stringify({ subject, doc });
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        payload,
      );

      // Step 3: seal the portal copy when a client public key exists.
      const portalCopy = sealPortalCopy(getClientPublic(), payload);

      // Step 4: create the follow-up record.
      try {
        await createFollowUpMutate({
          id: followUpId,
          ticketId,
          encryptedContent,
          source: "volunteer",
          type: "email_outbound",
          isPrivate: false,
          mentionedPseudonyms: [],
          portalCopy,
        });
      } catch {
        // Follow-up write failed AFTER the relay succeeded (mail already
        // left). Show the retry toast but do NOT re-POST /relay/email.
        toastStore.show(m.ticket_email_error_send(), 3000);
        return;
      }

      onSuccess();
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      invalidateReadState(queryClient);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        toastStore.show(
          m.ticket_email_rate_limited({
            seconds: String(err.retryAfterSeconds),
          }),
          5000,
        );
      } else {
        toastStore.show(m.ticket_email_error_send(), 3000);
      }
    } finally {
      sending = false;
    }
  }

  return {
    get sending() {
      return sending;
    },
    handleEmailSend,
  };
}
