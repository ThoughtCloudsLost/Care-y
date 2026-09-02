/**
 * Email send composable, mirroring create-sms-send.svelte.ts line for line.
 *
 * Flow:
 * 1. Client-side size pre-check against EMAIL_RELAY_LIMITS.
 * 2. POST /relay/email { ticketId, subject, html, text }.
 * 3. On relay success: encrypt the follow-up content, seal a portal
 *    copy when a client public key exists, then create the follow-up.
 * 4. If the follow-up mutation fails after a 200 relay, the composable
 *    stores the pending record. Retrying skips the relay entirely and
 *    re-attempts only the mutation.
 * 5. Rate-limit and error toasts mirror the SMS family.
 */

import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RateLimitError } from "$lib/errors.js";
import type { PortalCopy } from "$lib/crypto/seal-portal-copy.js";
import { EMAIL_RELAY_LIMITS } from "@care-y/shared";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";
import type { ProseMirrorDocJSON } from "@care-y/shared";
import {
  relayThenRecord,
  retryRecord,
  type PendingRecord,
} from "./relay-then-record.js";

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
  let pendingRecord = $state<PendingRecord<"email_outbound"> | null>(null);

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
      // When a previous relay succeeded but the follow-up write failed,
      // retry only the mutation. The email already left.
      if (pendingRecord !== null) {
        const landed = await retryRecord(pendingRecord, {
          queryClient,
          createFollowUpMutate,
          onSuccess,
          errorRecordMessage: m.ticket_email_error_record(),
        });
        if (landed) {
          pendingRecord = null;
        }
        return;
      }

      const payload = JSON.stringify({ subject, doc });

      const result = await relayThenRecord({
        ticketId,
        cryptoBridge,
        queryClient,
        getClientPublic,
        createFollowUpMutate,
        onSuccess,
        relayUrl: "/relay/email",
        relayBody: {
          ticketId,
          subject: subject.trim(),
          html,
          text: text.trim(),
        },
        followUpType: "email_outbound",
        plaintext: payload,
        errorRecordMessage: m.ticket_email_error_record(),
      });

      if (result.status === "record_pending") {
        pendingRecord = result.pending;
      }
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
