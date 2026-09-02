/**
 * Shared relay-then-record sequence consumed by both the SMS and email
 * send composables. Tracks whether the relay POST has already succeeded
 * so a retry after a follow-up mutation failure never re-POSTs the relay.
 */

import type { QueryClient } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RateLimitError, RelayError } from "$lib/errors.js";
import { followupSlot } from "@care-y/crypto";
import {
  sealPortalCopy,
  type PortalCopy,
} from "$lib/crypto/seal-portal-copy.js";
import { newFollowupId } from "@care-y/shared";
import { ticketKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import { toastStore } from "$lib/stores/toast.svelte.js";

// ── Types ──────────────────────────────────────────────────────────

export type OutboundRelayType = "sms_outbound" | "email_outbound";

export interface FollowUpArgs<T extends OutboundRelayType = OutboundRelayType> {
  readonly id: string;
  readonly ticketId: string;
  readonly encryptedContent: string;
  readonly source: "volunteer";
  readonly type: T;
  readonly isPrivate: false;
  readonly mentionedPseudonyms: never[];
  readonly portalCopy?: PortalCopy;
}

export interface RelayThenRecordConfig<
  T extends OutboundRelayType = OutboundRelayType,
> {
  readonly ticketId: string;
  readonly cryptoBridge: CryptoBridge;
  readonly queryClient: QueryClient;
  readonly getClientPublic: () => string | null;
  readonly createFollowUpMutate: (args: FollowUpArgs<T>) => Promise<unknown>;
  readonly onSuccess: () => void;

  /** "/relay/sms" or "/relay/email". */
  readonly relayUrl: string;
  /** JSON body sent to the relay endpoint. */
  readonly relayBody: Record<string, unknown>;
  /** Follow-up type written to the encrypted thread. */
  readonly followUpType: T;
  /** Plaintext to encrypt for the org thread and portal copy. */
  readonly plaintext: string;

  /** i18n string shown when the relay succeeded but saving the follow-up failed. */
  readonly errorRecordMessage: string;
}

/**
 * Pending follow-up state from a relay that succeeded but whose
 * mutation has not yet landed. Stored by the composable so retries
 * skip the relay entirely.
 */
export interface PendingRecord<
  T extends OutboundRelayType = OutboundRelayType,
> {
  readonly followUpId: string;
  readonly ticketId: string;
  readonly encryptedContent: string;
  readonly portalCopy: PortalCopy | undefined;
  readonly followUpType: T;
}

/** Outcome discriminant returned to the composable. */
export type RelayThenRecordResult<T extends OutboundRelayType> =
  | { readonly status: "ok" }
  | { readonly status: "record_pending"; readonly pending: PendingRecord<T> };

// ── Core sequence ──────────────────────────────────────────────────

/**
 * Runs the relay POST, encrypts, creates the follow-up, then
 * invalidates caches. Shows appropriate toasts on failure.
 *
 * Returns a discriminated result so the composable can store the
 * pending record and skip the relay on retry.
 */
export async function relayThenRecord<T extends OutboundRelayType>(
  config: RelayThenRecordConfig<T>,
): Promise<RelayThenRecordResult<T>> {
  const {
    ticketId,
    cryptoBridge,
    queryClient,
    getClientPublic,
    createFollowUpMutate,
    onSuccess,
    relayUrl,
    relayBody,
    followUpType,
    plaintext,
    errorRecordMessage,
  } = config;

  // Step 1: POST the relay.
  const resp = await fetch(relayUrl, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(relayBody),
  });

  if (resp.status === 429) {
    const retryAfter = resp.headers.get("Retry-After");
    const seconds = retryAfter !== null ? parseInt(retryAfter, 10) : 30;
    throw new RateLimitError(seconds);
  }
  if (!resp.ok) {
    throw new RelayError(
      followUpType === "sms_outbound" ? "SMS_FAILED" : "EMAIL_FAILED",
      resp.status,
    );
  }

  // Step 2: encrypt the follow-up content.
  const followUpId = newFollowupId();
  const encryptedContent = await cryptoBridge.encrypt(
    ticketId,
    followupSlot(followUpId),
    plaintext,
  );

  // Step 3: seal the portal copy when a client public key exists.
  const portalCopy = sealPortalCopy(getClientPublic(), plaintext);

  // Step 4: create the follow-up record.
  try {
    await createFollowUpMutate({
      id: followUpId,
      ticketId,
      encryptedContent,
      source: "volunteer",
      type: followUpType,
      isPrivate: false,
      mentionedPseudonyms: [],
      portalCopy,
    });
  } catch {
    toastStore.show(errorRecordMessage, 3000);
    return {
      status: "record_pending",
      pending: {
        followUpId,
        ticketId,
        encryptedContent,
        portalCopy,
        followUpType,
      },
    };
  }

  onSuccess();
  void queryClient.invalidateQueries({
    queryKey: ticketKeys.followUps(ticketId),
  });
  invalidateReadState(queryClient);

  return { status: "ok" };
}

// ── Retry-only path ────────────────────────────────────────────────

export interface RetryRecordConfig<
  T extends OutboundRelayType = OutboundRelayType,
> {
  readonly queryClient: QueryClient;
  readonly createFollowUpMutate: (args: FollowUpArgs<T>) => Promise<unknown>;
  readonly onSuccess: () => void;
  readonly errorRecordMessage: string;
}

/**
 * Re-attempts only the follow-up mutation for a relay that already
 * succeeded. Returns true when the mutation lands, false when it
 * fails again (toast shown internally).
 */
export async function retryRecord<T extends OutboundRelayType>(
  pending: PendingRecord<T>,
  config: RetryRecordConfig<T>,
): Promise<boolean> {
  const { queryClient, createFollowUpMutate, onSuccess, errorRecordMessage } =
    config;

  try {
    await createFollowUpMutate({
      id: pending.followUpId,
      ticketId: pending.ticketId,
      encryptedContent: pending.encryptedContent,
      source: "volunteer",
      type: pending.followUpType,
      isPrivate: false,
      mentionedPseudonyms: [],
      portalCopy: pending.portalCopy,
    });
  } catch {
    toastStore.show(errorRecordMessage, 3000);
    return false;
  }

  onSuccess();
  void queryClient.invalidateQueries({
    queryKey: ticketKeys.followUps(pending.ticketId),
  });
  invalidateReadState(queryClient);
  return true;
}
