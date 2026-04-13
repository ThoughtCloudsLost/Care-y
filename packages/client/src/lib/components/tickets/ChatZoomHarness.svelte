<!-- Test harness for ChatZoom. Not rendered in production. -->
<script lang="ts">
  /* eslint-disable care-y/no-hardcoded-strings */
  import ChatZoom from "./ChatZoom.svelte";
  import type { TimelineItem, ClusterRecord } from "./chat-zoom-types.js";
  import type { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    scrollContainerEl?: HTMLDivElement;
    totalMessages?: number;
    earliestDate?: string;
    latestDate?: string;
    items?: TimelineItem[];
    decryptedContent?: Map<string, string | undefined>;
    expandedClusters?: Map<string, ClusterRecord[]>;
    onexpandcluster?: (ids: string[]) => void;
    followUpCache?: FollowUpDecryptCache;
    keyWrap?: TicketKeyWrap | null;
  }

  let {
    scrollContainerEl,
    totalMessages = 0,
    earliestDate,
    latestDate,
    items = [],
    decryptedContent = new Map(),
    expandedClusters = new Map(),
    onexpandcluster,
    followUpCache,
    keyWrap = null,
  }: Props = $props();

  // Create a default scroll container if none provided.
  let defaultContainer = $state<HTMLDivElement>();
  const resolvedContainer = $derived(scrollContainerEl ?? defaultContainer);
</script>

<div bind:this={defaultContainer} class="scroll-host">
  <ChatZoom
    scrollContainerEl={resolvedContainer}
    {totalMessages}
    {earliestDate}
    {latestDate}
    {items}
    {decryptedContent}
    {expandedClusters}
    {onexpandcluster}
    {followUpCache}
    {keyWrap}
  >
    <div class="test-children">
      <div data-fu-id="fu-1" id="fu-fu-1" class="bubble-text">Message 1</div>
      <div data-fu-id="fu-2" id="fu-fu-2" class="bubble-text">Message 2</div>
      <div data-fu-id="fu-3" id="fu-fu-3" class="bubble-time">10:32</div>
    </div>
  </ChatZoom>
</div>

<style>
  .scroll-host {
    height: 400px;
    overflow-y: auto;
  }
</style>
