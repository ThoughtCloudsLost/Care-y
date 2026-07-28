<!--
  Renders a single follow-up as a chat bubble, system event, or private note.
  Used by TicketDetail (preview block) and ReplySheet for consistent rendering
  of follow-up records without the full detail-page features (long-press, media, editing).
-->
<script lang="ts">
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { ReactionSummary, ReactionType } from "@care-y/shared";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";

  interface FollowUpBubbleProps {
    followUp: {
      readonly id: string;
      readonly source: string;
      readonly type: string;
      readonly encryptedContent: unknown;
      readonly createdAt: string;
      readonly eventParams?: Record<string, unknown> | null;
    };
    result: DecryptResult;
    clientAlias?: string | null;
    isOwnNote?: boolean;
    searchTerm?: string | null;
    noteTypeName?: string;
    noteTypeIcon?: string;
    reactions?: ReactionSummary[];
    currentUserId?: string;
    ontogglereaction?: (reaction: ReactionType) => void;
    resolveUserName?: (userId: string) => string;
  }

  let {
    followUp,
    result,
    clientAlias,
    isOwnNote = false,
    searchTerm = null,
    noteTypeName,
    noteTypeIcon,
    reactions,
    currentUserId,
    ontogglereaction,
    resolveUserName,
  }: FollowUpBubbleProps = $props();

  const kind = $derived(followUpKind(followUp));
</script>

{#if kind === "system"}
  <SystemEvent
    type={followUp.type}
    timestamp={followUp.createdAt}
    eventParams={followUp.eventParams}
    {resolveUserName}
  />
{:else if kind === "note"}
  <PrivateNote
    {result}
    encryptedContent={followUp.encryptedContent}
    authorName={undefined}
    timestamp={followUp.createdAt}
    isOwn={isOwnNote}
    {searchTerm}
    {noteTypeName}
    {noteTypeIcon}
    {reactions}
    {currentUserId}
    {ontogglereaction}
  />
{:else}
  <ConversationBubble
    direction={followUp.source === "client" ? "received" : "sent"}
    speaker={followUp.source === "client"
      ? (clientAlias ?? undefined)
      : undefined}
    source={followUp.source === "client" ? "client" : "volunteer"}
    timestamp={followUp.createdAt}
  >
    <span class="bubble-text">
      <DecryptPlaceholder
        {result}
        ciphertext={followUp.encryptedContent}
        length={30}
        block
        {searchTerm}
      />
    </span>
  </ConversationBubble>
{/if}
