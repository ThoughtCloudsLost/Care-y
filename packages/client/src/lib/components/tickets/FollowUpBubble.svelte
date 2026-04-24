<!--
  Renders a single follow-up as a chat bubble, system event, or private note.
  Used by TicketDetail (preview block) and ReplySheet for consistent rendering
  of follow-up records without the full detail-page features (long-press, media, editing).
-->
<script lang="ts">
  import { Message } from "konsta/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";

  interface FollowUpBubbleProps {
    followUp: {
      readonly id: string;
      readonly source: string;
      readonly type: string;
      readonly encryptedContent: unknown;
      readonly createdAt: string;
    };
    result: DecryptResult;
    clientAlias?: string;
    isOwnNote?: boolean;
    onnoteedit?: (followUpId: string, text: string) => void;
    searchTerm?: string | null;
  }

  let {
    followUp,
    result,
    clientAlias,
    isOwnNote = false,
    onnoteedit,
    searchTerm = null,
  }: FollowUpBubbleProps = $props();

  const kind = $derived(followUpKind(followUp));
</script>

{#if kind === "system"}
  <SystemEvent
    {result}
    encryptedContent={followUp.encryptedContent}
    timestamp={followUp.createdAt}
  />
{:else if kind === "note"}
  <PrivateNote
    {result}
    encryptedContent={followUp.encryptedContent}
    authorName={undefined}
    timestamp={followUp.createdAt}
    isOwn={isOwnNote}
    {searchTerm}
    onedit={onnoteedit
      ? (newText: string) => onnoteedit(followUp.id, newText)
      : undefined}
  />
{:else}
  <Message
    type={followUp.source === "client" ? "received" : "sent"}
    name={followUp.source === "client" ? clientAlias : undefined}
  >
    {#snippet text()}
      <span class="bubble-text">
        <DecryptPlaceholder
          {result}
          ciphertext={followUp.encryptedContent}
          length={30}
          block
          {searchTerm}
        />
      </span>
    {/snippet}
    {#snippet footer()}
      <span class="bubble-time">
        {formatRelativeTime(new Date(followUp.createdAt))}
      </span>
    {/snippet}
  </Message>
{/if}
