<!--
  Conversation detail view for the demo.

  Renders a slim header (EncryptedTitle + StatusMark + PriorityStamp +
  QueueGlyph) and the ticket's follow-ups as chat bubbles using real
  client components. Follow-up content resolves from the stub ticket
  cache (key: fu:<ticketId>:<followupId>) via the shared reveal
  controller.

  NOT CaseHeader (non-optional trpc usage). Page orchestration is
  demo-reimplemented.
-->
<script lang="ts">
  import type { DemoTicket, DemoFollowUp } from "$demo/fixtures/types.js";
  import * as m from "$lib/paraglide/messages.js";
  import {
    resolveAsyncDecrypt,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { getTicketDecryptCache } from "$lib/crypto/context.js";
  import { resolveQueueAppearance } from "$lib/utils/queue-appearance.js";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";

  interface Props {
    ticket: DemoTicket;
    /** Extra follow-ups appended by the scripted reply. */
    appendedFollowUps: DemoFollowUp[];
  }

  let { ticket, appendedFollowUps }: Props = $props();

  const ticketCache = getTicketDecryptCache();

  const queueAppearance = resolveQueueAppearance(null, null);

  const titleResult: DecryptResult = $derived(
    resolveAsyncDecrypt(ticketCache.get(ticket.id), ticket.keyWrap !== null),
  );

  const allFollowUps: readonly DemoFollowUp[] = $derived([
    ...ticket.followUps,
    ...appendedFollowUps,
  ]);

  function resolveFollowUpContent(fu: DemoFollowUp): DecryptResult {
    if (fu.source === "system") {
      return { status: "ready", value: fu.content };
    }
    const cacheKey = `fu:${fu.ticketId}:${fu.id}`;
    const raw = ticketCache.get(cacheKey);
    return resolveAsyncDecrypt(raw, ticket.keyWrap !== null);
  }
</script>

<div class="conversation-demo">
  <header class="conv-header">
    <StatusMark status={ticket.displayStatus} />
    <div class="conv-header-main">
      <span class="conv-title">
        {#if titleResult.status === "denied" || titleResult.status === "error"}
          <EncryptedTitle />
        {:else}
          <DecryptPlaceholder
            result={titleResult}
            ciphertext={ticket.encryptedTitle}
            length={25}
          />
        {/if}
      </span>
      <span class="conv-meta">
        <QueueGlyph appearance={queueAppearance} size={12} />
        <span class="conv-queue">{ticket.queueName}</span>
        <span class="conv-alias">{ticket.clientAlias}</span>
        {#if ticket.priority !== "normal"}
          <PriorityStamp priority={ticket.priority} />
        {/if}
      </span>
    </div>
  </header>

  <div class="conv-thread">
    {#each allFollowUps as fu (fu.id)}
      {@const kind = followUpKind(fu)}
      {@const result = resolveFollowUpContent(fu)}
      {#if kind === "system"}
        <SystemEvent
          type={fu.type}
          timestamp={fu.createdAt.toISOString()}
          eventParams={fu.eventParams}
        />
      {:else if kind === "note"}
        <ConversationBubble
          direction="sent"
          source="volunteer"
          timestamp={fu.createdAt.toISOString()}
        >
          <span class="note-label">{m.demo_conversation_note_label()}</span>
          <span class="bubble-text">
            <DecryptPlaceholder
              {result}
              ciphertext={fu.encryptedContent}
              length={30}
              block
            />
          </span>
        </ConversationBubble>
      {:else}
        <ConversationBubble
          direction={fu.source === "client" ? "received" : "sent"}
          speaker={fu.source === "client" ? ticket.clientAlias : undefined}
          source={fu.source === "client" ? "client" : "volunteer"}
          timestamp={fu.createdAt.toISOString()}
        >
          <span class="bubble-text">
            <DecryptPlaceholder
              {result}
              ciphertext={fu.encryptedContent}
              length={30}
              block
            />
          </span>
        </ConversationBubble>
      {/if}
    {/each}
  </div>
</div>

<style>
  .conversation-demo {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .conv-header {
    display: grid;
    grid-template-columns: 22px 1fr;
    column-gap: 10px;
    align-items: start;
    padding: 12px 16px;
    border-bottom: 1px solid var(--hair);
    background: var(--raised);
    flex-shrink: 0;
  }

  .conv-header-main {
    min-width: 0;
  }

  .conv-title {
    display: block;
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conv-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: 2px;
  }

  .conv-queue {
    white-space: nowrap;
  }

  .conv-alias {
    white-space: nowrap;
  }

  .conv-alias::before {
    content: "\00B7";
    margin-right: 6px;
  }

  .conv-thread {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .bubble-text {
    overflow-wrap: break-word;
  }

  .note-label {
    display: block;
    font-size: 0.65625rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: var(--muted);
    margin-bottom: 2px;
    font-style: italic;
  }
</style>
