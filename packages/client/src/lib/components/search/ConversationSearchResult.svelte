<!--
  Search result item for the conversation search provider.
  Reuses FollowUpBubble for visual consistency with the chat UI.
  Shows gap indicators between non-adjacent results.
-->
<script lang="ts">
  import type { ConversationSearchData } from "$lib/search/providers/conversation.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import GapIndicator from "$lib/components/GapIndicator.svelte";

  interface Props {
    result: ConversationSearchData;
    ontap: (id: string) => void;
  }

  let { result, ontap }: Props = $props();

  const followUp = $derived({
    id: result.followUpId,
    source: result.source,
    type: result.type,
    encryptedContent: null,
    createdAt: result.createdAt,
    eventParams: null as Record<string, unknown> | null,
  });

  const decryptResult: DecryptResult = $derived({
    status: "ready" as const,
    value: result.plaintext,
  });
</script>

<GapIndicator count={result.gapBefore} />

<button
  type="button"
  class="conversation-result"
  onclick={() => ontap(result.followUpId)}
>
  <FollowUpBubble
    {followUp}
    result={decryptResult}
    clientAlias={result.source === "client" ? result.authorName : undefined}
    searchTerm={result.searchTerm}
  />
</button>

<style>
  /* flex-column so the bubble's align-self: flex-end works for sent bubbles */
  .conversation-result {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }
</style>
