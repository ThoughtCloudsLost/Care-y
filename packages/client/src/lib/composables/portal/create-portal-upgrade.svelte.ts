/**
 * Composable: account-upgrade card state machine for the portal page.
 *
 * Manages the card visibility, expansion, and the upgrade submit flow
 * (build registration, re-encrypt messages, submit mutation).
 */

import { encode } from "@care-y/crypto";
import {
  buildAccountRegistration,
  rewrapMessages,
} from "$lib/portal/account-crypto.js";
import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
import {
  decodeEciesTriple,
  decryptPortalMessage,
  type PortalSession,
} from "$lib/portal/portal-crypto.js";
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
  submit(
    username: string,
    password: string,
    session: PortalSession,
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
  ): void;
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
    expanded = true;
  }

  function submit(
    username: string,
    password: string,
    session: PortalSession,
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
        const decryptedMsgs = collectDecrypted(serverMessages, session);
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
        if (
          typeof err === "object" &&
          err !== null &&
          "data" in err &&
          typeof (err as Record<string, unknown>).data === "object"
        ) {
          error = staleThreadLabel;
          void queryClient.invalidateQueries({
            queryKey: messagesQueryKey,
          });
        } else {
          error = loginFailedLabel;
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
    submit,
  };
}

function collectDecrypted(
  serverMessages: readonly PortalMessageWire[],
  session: PortalSession,
): readonly { id: string; text: string }[] {
  const result: { id: string; text: string }[] = [];
  for (const msg of serverMessages) {
    try {
      const triple = decodeEciesTriple(msg);
      const text = decryptPortalMessage(triple, session.keypair.clientPrivate);
      result.push({ id: msg.id, text });
    } catch {
      // Skip messages that fail to decrypt
    }
  }
  return result;
}
