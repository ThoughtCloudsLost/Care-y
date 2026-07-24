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
    timelineActive?: boolean;
    resolveUserName?: (userId: string) => string;
  }

  let {
    scrollContainerEl,
    items = [],
    resolveDecrypted = () => undefined,
    expandedClusters = new Map(),
    onexpandcluster,
    timelineActive = $bindable(false),
    resolveUserName,
  }: Props = $props();

  // Create a default scroll container if none provided.
  let defaultContainer = $state<HTMLDivElement>();
  const resolvedContainer = $derived(scrollContainerEl ?? defaultContainer);
</script>

{#snippet expandedRecord(args: { record: ClusterRecord; onzoom: () => void })}
  <button
    type="button"
    data-testid="expanded-record"
    data-record-id={args.record.id}
    onclick={args.onzoom}
  >
    {args.record.id}
  </button>
{/snippet}

<div bind:this={defaultContainer} class="scroll-host">
  <FollowUpTimeline
    scrollContainerEl={resolvedContainer}
    {items}
    {resolveDecrypted}
    {expandedClusters}
    {onexpandcluster}
    bind:timelineActive
    {resolveUserName}
    renderExpanded={expandedRecord}
  >
    <div class="test-children">
      <!-- care-y-ignore-next-line no-hardcoded-user-strings -- test-only harness fixture, never rendered in production -->
      <div data-fu-id="fu-1" id="fu-fu-1" class="bubble-text">Message 1</div>
      <!-- care-y-ignore-next-line no-hardcoded-user-strings -- test-only harness fixture, never rendered in production -->
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
