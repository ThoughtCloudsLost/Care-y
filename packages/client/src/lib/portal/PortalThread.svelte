<!--
  Shared portal message thread.
  Renders messages using Konsta Messages/Message display components.
  Konsta display components (Messages, Message, MessagesTitle) are allowed
  in content components per code-standards Konsta Import Discipline.

  Decryption: each message is ECIES-decrypted in the main thread.
  DecryptPlaceholder with locally built DecryptResult provides the
  loading/error/ready states.
-->
<script lang="ts">
  import { Messages, Message } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { LOADING, ERROR } from "$lib/crypto/decrypt-result.js";
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

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }
</script>

<div
  role="log"
  aria-label={m.portal_title()}
  class="portal-thread"
  data-testid="portal-thread"
>
  {#if loading}
    <Messages>
      {#each [1, 2, 3] as i (i)}
        <Message type="received">
          {#snippet text()}
            <DecryptPlaceholder result={LOADING} length={40} />
          {/snippet}
        </Message>
      {/each}
    </Messages>
  {:else if decryptedMessages.length === 0}
    <div class="empty-state" data-testid="portal-empty-state">
      <p>{m.portal_empty_thread()}</p>
    </div>
  {:else}
    <p class="expiry-note">{m.portal_expiry_note()}</p>
    <Messages>
      {#each decryptedMessages as msg, idx (idx)}
        {@const isSent = msg.direction === "from_client"}
        {@const label = isSent ? m.portal_you() : m.portal_support_team()}
        {@const time = formatTime(msg.createdAt)}
        <Message
          type={isSent ? "sent" : "received"}
          aria-label={`${label}, ${time}`}
        >
          {#snippet text()}
            {#if msg.result.status === "ready"}
              {msg.result.value}
            {:else}
              <DecryptPlaceholder result={msg.result} length={30} />
            {/if}
          {/snippet}
          {#snippet footer()}
            {#if msg.editedAt}
              <span class="edited-marker">{m.portal_message_edited()}</span>
            {/if}
            <span class="msg-time">{time}</span>
          {/snippet}
        </Message>
      {/each}
    </Messages>
  {/if}
</div>

<style>
  .portal-thread {
    flex: 1;
    overflow-y: auto;
    padding-bottom: calc(var(--messagebar-height, 60px) + 16px);
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

  .edited-marker {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
  }

  .msg-time {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
  }
</style>
