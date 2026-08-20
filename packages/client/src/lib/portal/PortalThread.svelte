<!--
  Shared portal message thread.
  Renders messages using the pinned ConversationBubble anatomy (the same
  bubble the volunteer ticket thread uses). Direction mapping:
  from_client = sent (right, brand-soft), to_client = received (left, raised).

  Decryption: each message is ECIES-decrypted in the main thread.
  DecryptPlaceholder with locally built DecryptResult provides the
  loading/error/ready states.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { LOADING, ERROR } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import {
    decryptPortalMessage,
    decodeEciesTriple,
  } from "$lib/portal/portal-crypto.js";
  import type { Scalar } from "@care-y/crypto";

  interface PortalMessageWire {
    readonly direction: string;
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }

  interface PortalThreadProps {
    /** Messages from the bootstrap/polling response. */
    messages: readonly PortalMessageWire[];
    /** Client private key for ECIES decryption. */
    clientPrivate: Scalar;
    /** Whether messages are still loading from the server. */
    loading?: boolean;
  }

  let {
    messages,
    clientPrivate,
    loading = false,
  }: PortalThreadProps = $props();

  interface DecryptedMessage {
    readonly direction: string;
    readonly result: DecryptResult;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }

  const decryptedMessages = $derived.by((): readonly DecryptedMessage[] => {
    if (loading) return [];
    return messages.map((msg): DecryptedMessage => {
      try {
        const triple = decodeEciesTriple(msg);
        const text = decryptPortalMessage(triple, clientPrivate);
        return {
          direction: msg.direction,
          result: { status: "ready" as const, value: text },
          createdAt: msg.createdAt,
          editedAt: msg.editedAt,
        };
      } catch {
        return {
          direction: msg.direction,
          result: ERROR,
          createdAt: msg.createdAt,
          editedAt: msg.editedAt,
        };
      }
    });
  });

  function bubbleDirection(dir: string): "sent" | "received" {
    return dir === "from_client" ? "sent" : "received";
  }

  function bubbleAriaLabel(msg: DecryptedMessage): string {
    const isSent = msg.direction === "from_client";
    const label = isSent ? m.portal_you() : m.portal_support_team();
    const time = formatRelativeTime(new Date(msg.createdAt));
    return `${label}, ${time}`;
  }
</script>

<div
  role="log"
  aria-label={m.portal_title()}
  class="portal-thread"
  data-testid="portal-thread"
>
  {#if loading}
    <div class="portal-messages" data-testid="portal-loading">
      {#each [1, 2, 3] as i (i)}
        <ConversationBubble
          direction="received"
          timestamp={new Date().toISOString()}
        >
          <DecryptPlaceholder result={LOADING} length={40} />
        </ConversationBubble>
      {/each}
    </div>
  {:else if decryptedMessages.length === 0}
    <div class="empty-state" data-testid="portal-empty-state">
      <p>{m.portal_empty_thread()}</p>
    </div>
  {:else}
    <p class="expiry-note">{m.portal_expiry_note()}</p>
    <div class="portal-messages">
      {#each decryptedMessages as msg, idx (idx)}
        {@const isSent = msg.direction === "from_client"}
        <div
          class="portal-bubble-wrapper"
          role="article"
          aria-label={bubbleAriaLabel(msg)}
        >
          <ConversationBubble
            direction={bubbleDirection(msg.direction)}
            speaker={isSent ? undefined : m.portal_support_team()}
            timestamp={msg.createdAt}
            editedAt={msg.editedAt}
          >
            {#if msg.result.status === "ready"}
              {msg.result.value}
            {:else}
              <DecryptPlaceholder result={msg.result} length={30} />
            {/if}
          </ConversationBubble>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .portal-thread {
    flex: 1;
    overflow-y: auto;
    padding-bottom: calc(var(--messagebar-height, 60px) + 16px);
  }

  .portal-messages {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 16px;
    padding-left: calc(16px + env(safe-area-inset-left, 0px));
    padding-right: calc(16px + env(safe-area-inset-right, 0px));
  }

  .portal-bubble-wrapper {
    display: contents;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: var(--space-xl);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .expiry-note {
    text-align: center;
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    padding: var(--space-md) var(--space-lg);
    margin: 0;
  }
</style>
