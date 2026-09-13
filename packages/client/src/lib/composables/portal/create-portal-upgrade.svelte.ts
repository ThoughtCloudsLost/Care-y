/**
 * Composable: account-upgrade card state machine for the portal page.
 *
 * Manages the card visibility, expansion, and the upgrade submit flow
 * (build registration, re-encrypt messages, submit mutation).
 */

import { encode } from "@care-y/crypto";
import { ErrorCode } from "@care-y/shared";
import {
  buildAccountRegistration,
  rewrapMessages,
} from "$lib/portal/account-crypto.js";
import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
import type { PortalSessionHandle } from "$lib/composables/portal/create-portal-session.svelte.js";
import type { QueryClient } from "@tanstack/svelte-query";
import type { AccountUpgradeWireInput } from "@care-y/shared";

/** Wire shape of a portal message returned by the messages query. */
interface PortalMessageWire {
  readonly id: string;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

export interface PortalUpgradeState {
  readonly dismissed: boolean;
  readonly expanded: boolean;
  readonly pending: boolean;
  readonly error: string;
  readonly success: boolean;
  readonly username: string;
  dismiss(): void;
  expand(): void;
  collapse(): void;
  submit(
    username: string,
    password: string,
    session: PortalSessionHandle,
    fragmentChannelId: string,
    fragmentAuth: Uint8Array,
    serverMessages: readonly PortalMessageWire[],
    trpcPortal: {
      accountUpgrade: {
        mutate: (input: AccountUpgradeWireInput) => Promise<unknown>;
      };
    },
    queryClient: QueryClient,
    messagesQueryKey: readonly unknown[],
    staleThreadLabel: string,
    loginFailedLabel: string,
    usernameTakenLabel: string,
  ): void;
}

/**
 * Extract the tRPC error code (from the error shape's data) and the
 * error message from an unknown thrown value. Both empty when the value
 * is not a tRPC error.
 */
function readTrpcError(err: unknown): { code: string; message: string } {
  if (typeof err !== "object" || err === null) {
    return { code: "", message: "" };
  }
  const message =
    "message" in err && typeof err.message === "string" ? err.message : "";
  if (!("data" in err) || typeof err.data !== "object" || err.data === null) {
    return { code: "", message };
  }
  const code =
    "code" in err.data && typeof err.data.code === "string"
      ? err.data.code
      : "";
  return { code, message };
}

export interface UpgradeErrorLabels {
  readonly staleThread: string;
  readonly loginFailed: string;
  readonly usernameTaken: string;
}

/**
 * Map an upgrade-submit failure to the message to render and whether
 * the messages query should be refetched. Only a CONFLICT is the
 * stale-thread race worth an invalidate-and-retry; anything else (a
 * 403, a rate limit, a network failure) rendered as "the conversation
 * changed, try again" sends the client into a retry loop that can
 * never succeed.
 */
export function mapUpgradeError(
  err: unknown,
  labels: UpgradeErrorLabels,
): { message: string; invalidate: boolean } {
  const { code, message } = readTrpcError(err);
  if (code === "CONFLICT") {
    if (message === ErrorCode.ACCOUNT_USERNAME_TAKEN) {
      return { message: labels.usernameTaken, invalidate: false };
    }
    return { message: labels.staleThread, invalidate: true };
  }
  return { message: labels.loginFailed, invalidate: false };
}

export function createPortalUpgrade(): PortalUpgradeState {
  let dismissed = $state(false);
  let expanded = $state(false);
  let pending = $state(false);
  let error = $state("");
  let success = $state(false);
  let savedUsername = $state("");

  function dismiss(): void {
    dismissed = true;
  }

  function expand(): void {
    // Clears dismissal too: the drawer offers this flow permanently, so
    // reaching it there has to work after the in-thread card was dismissed.
    dismissed = false;
    expanded = true;
  }

  function collapse(): void {
    // Closes the create-account sheet without marking the flow dismissed:
    // the drawer entry reopens it at any time.
    expanded = false;
  }

  function submit(
    username: string,
    password: string,
    session: PortalSessionHandle,
    fragmentChannelId: string,
    fragmentAuth: Uint8Array,
    serverMessages: readonly PortalMessageWire[],
    trpcPortal: {
      accountUpgrade: {
        mutate: (input: AccountUpgradeWireInput) => Promise<unknown>;
      };
    },
    queryClient: QueryClient,
    messagesQueryKey: readonly unknown[],
    staleThreadLabel: string,
    loginFailedLabel: string,
    usernameTakenLabel: string,
  ): void {
    if (pending) return;
    pending = true;
    error = "";

    const callbacks = buildLoginCallbacks(() => undefined);

    void (async () => {
      try {
        const { payload, keypair: newKeypair } = await buildAccountRegistration(
          username,
          password,
          null,
          callbacks,
        );

        // Re-encrypt already-decrypted thread messages to the new key
        const decryptedMsgs = await collectDecrypted(serverMessages, session);
        const rewrapped = rewrapMessages(
          decryptedMsgs,
          newKeypair.clientPublic,
        );

        await trpcPortal.accountUpgrade.mutate({
          channelId: fragmentChannelId,
          auth: encode(fragmentAuth),
          account: payload,
          rewrappedMessages: rewrapped,
        });

        // Clean up new keypair
        const { requireSodium } = await import("@care-y/crypto");
        requireSodium().memzero(newKeypair.clientPrivate);

        // Destroy the old session (channel is revoked server-side)
        session.destroy();

        savedUsername = username;
        success = true;
      } catch (err: unknown) {
        const mapped = mapUpgradeError(err, {
          staleThread: staleThreadLabel,
          loginFailed: loginFailedLabel,
          usernameTaken: usernameTakenLabel,
        });
        error = mapped.message;
        if (mapped.invalidate) {
          void queryClient.invalidateQueries({
            queryKey: messagesQueryKey,
          });
        }
      } finally {
        pending = false;
      }
    })();
  }

  return {
    get dismissed(): boolean {
      return dismissed;
    },
    get expanded(): boolean {
      return expanded;
    },
    get pending(): boolean {
      return pending;
    },
    get error(): string {
      return error;
    },
    get success(): boolean {
      return success;
    },
    get username(): string {
      return savedUsername;
    },
    dismiss,
    expand,
    collapse,
    submit,
  };
}

async function collectDecrypted(
  serverMessages: readonly PortalMessageWire[],
  session: PortalSessionHandle,
): Promise<readonly { id: string; text: string }[]> {
  const result: { id: string; text: string }[] = [];
  for (const msg of serverMessages) {
    try {
      const text = await session.decryptMessage(
        msg.ephemeralPoint,
        msg.nonce,
        msg.ciphertext,
      );
      result.push({ id: msg.id, text });
    } catch {
      // Skip messages that fail to decrypt
    }
  }
  return result;
}
