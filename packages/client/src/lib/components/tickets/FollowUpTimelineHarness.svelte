<!-- Test harness for FollowUpTimeline. Not rendered in production. -->
<script lang="ts">
  /* eslint-disable care-y/no-hardcoded-strings */
  import FollowUpTimeline from "./FollowUpTimeline.svelte";
  import type {
    TimelineItem,
    ClusterRecord,
  } from "./follow-up-timeline-types.js";

  interface Props {
    scrollContainerEl?: HTMLDivElement;
    items?: TimelineItem[];
    resolveDecrypted?: (id: string) => string | undefined;
    expandedClusters?: Map<string, ClusterRecord[]>;
    onexpandcluster?: (ids: string[]) => void;
  }

  let {
    scrollContainerEl,
    items = [],
    resolveDecrypted = () => undefined,
    expandedClusters = new Map(),
    onexpandcluster,
  }: Props = $props();

  // Create a default scroll container if none provided.
  let defaultContainer = $state<HTMLDivElement>();
  const resolvedContainer = $derived(scrollContainerEl ?? defaultContainer);
</script>

<div bind:this={defaultContainer} class="scroll-host">
  <FollowUpTimeline
    scrollContainerEl={resolvedContainer}
    {items}
    {resolveDecrypted}
    {expandedClusters}
    {onexpandcluster}
  >
    <div class="test-children">
      <div data-fu-id="fu-1" id="fu-fu-1" class="bubble-text">Message 1</div>
      <div data-fu-id="fu-2" id="fu-fu-2" class="bubble-text">Message 2</div>
      <div data-fu-id="fu-3" id="fu-fu-3" class="bubble-time">10:32</div>
    </div>
  </FollowUpTimeline>
</div>

<style>
  .scroll-host {
    height: 400px;
    overflow-y: auto;
  }
</style>
