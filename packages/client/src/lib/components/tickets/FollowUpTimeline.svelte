<!--
  Timeline table-of-contents view for the ticket detail chat.

  Two rendering modes controlled by the `timelineActive` bindable:
  - Normal (timelineActive=false): renders children (full chat bubbles).
  - Timeline (timelineActive=true): renders a compact TOC using Konsta List/ListGroup/
    ListItem with date headers, landmark rows, and expandable message clusters.

  Toggled via "View timeline" / "View messages" in the ticket actions menu.
-->
<script lang="ts">
  import type { Snippet, Component } from "svelte";
  import { tick } from "svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { ListGroup, ListItem } from "konsta/svelte";
  import {
    MessageSquare,
    MessagesSquare,
    ChevronDown,
    type LucideIcon,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { resolveFollowUpTypeIcon } from "$lib/utils/note-type-icons.js";
  import { needsDateSeparator, formatDateSeparator } from "$lib/utils/time.js";
  import { computeGaps } from "$lib/tickets/gap-indicators.js";
  import { systemEventLabel } from "$lib/tickets/system-event-label.js";
  import { formatCallLabel } from "$lib/tickets/call-label.js";
  import type {
    TimelineItem,
    ClusterRecord,
  } from "./follow-up-timeline-types.js";

  interface ClusterEntry {
    kind: "cluster";
    ids: string[];
    incoming: number;
    outgoing: number;
    firstCreatedAt: string;
  }

  interface LandmarkEntry {
    kind: "landmark";
    item: TimelineItem;
    icon: Component;
    label: string;
    time: string;
  }

  type TocEntry = ClusterEntry | LandmarkEntry;

  interface TocGroup {
    dateLabel: string;
    entries: TocEntry[];
  }

  interface FollowUpTimelineProps {
    scrollContainerEl: HTMLDivElement | undefined;
    items?: TimelineItem[];
    resolveDecrypted?: (id: string) => string | undefined;
    expandedClusters?: Map<string, ClusterRecord[]>;
    onexpandcluster?: (followUpIds: string[]) => void;
    /** Render a single expanded follow-up. Parent provides this so expanded items
     *  use the same components as the main message view. */
    renderExpanded?: Snippet<[{ record: ClusterRecord; onzoom: () => void }]>;
    timelineActive?: boolean;
    /** Follow-up ID to highlight in timeline (search overlay). */
    searchActiveMatchId?: string | null;
    /** When true, scroll to the active match and auto-expand its cluster. Reset after scrolling. */
    searchScrollRequested?: boolean;
    /** Called after scroll request is processed. Parent should set searchScrollRequested=false. */
    onsearchscrollcomplete?: () => void;
    /** Resolve a note type's icon by noteTypeId (null = use default). Returns the LucideIcon component or undefined. */
    resolveNoteIcon?: (noteTypeId: string | null) => LucideIcon | undefined;
    resolveUserName?: (userId: string) => string;
    children: Snippet;
  }

  let {
    scrollContainerEl,
    items = [],
    resolveDecrypted = () => undefined,
    expandedClusters = new Map(),
    onexpandcluster,
    renderExpanded,
    timelineActive = $bindable(false),
    searchActiveMatchId = null,
    searchScrollRequested = false,
    onsearchscrollcomplete,
    resolveNoteIcon,
    resolveUserName,
    children,
  }: FollowUpTimelineProps = $props();

  // Track which entries are visually open (separate from data loading).
  const openClusters = new SvelteSet<string>();
  const openLandmarks = new SvelteSet<string>();

  // Track which date groups are collapsed. Empty = all expanded (default).
  const collapsedGroups = new SvelteSet<number>();

  function isLandmark(item: TimelineItem): boolean {
    if (item.source === "system") return true;
    if (item.type === "internal_note") return true;
    if (item.type === "phone_call") return true;
    if (item.hasRecording || item.hasImage || item.hasFile) return true;
    return false;
  }

  function landmarkIcon(item: TimelineItem): Component {
    if (item.hasRecording)
      return resolveFollowUpTypeIcon(item.type, "recording");
    if (item.hasImage) return resolveFollowUpTypeIcon(item.type, "image");
    if (item.hasFile) return resolveFollowUpTypeIcon(item.type, "file");
    if (item.type === "internal_note" && resolveNoteIcon !== undefined) {
      const icon = resolveNoteIcon(item.noteTypeId);
      if (icon !== undefined) return icon;
    }
    return resolveFollowUpTypeIcon(item.type);
  }

  function landmarkLabel(item: TimelineItem): string {
    if (item.source === "system") {
      return systemEventLabel(item.type, item.eventParams, resolveUserName);
    }

    if (item.type === "internal_note") {
      const decrypted = resolveDecrypted(item.id);
      if (decrypted !== undefined && decrypted !== "") {
        return decrypted.length > 40
          ? decrypted.slice(0, 40) + "\u2026"
          : decrypted;
      }
      return "Note";
    }

    if (item.hasRecording) {
      const dur = item.recordingDurationSeconds;
      if (dur !== null) {
        const mins = Math.floor(dur / 60);
        const secs = String(dur % 60).padStart(2, "0");
        return `Voicemail (${String(mins)}:${secs})`;
      }
      return "Voicemail";
    }
    if (item.hasImage) return "Photo";
    if (item.hasFile) return "File";

    if (item.type === "phone_call") {
      return formatCallLabel(item);
    }

    return "";
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function clusterKey(ids: string[]): string {
    return ids.join(",");
  }

  function clusterLabel(incoming: number, outgoing: number): string {
    const parts: string[] = [];
    if (incoming > 0) {
      parts.push(m.ticket_timeline_incoming({ count: String(incoming) }));
    }
    if (outgoing > 0) {
      parts.push(m.ticket_timeline_outgoing({ count: String(outgoing) }));
    }
    return parts.join(", ");
  }

  const tocGroups = $derived.by((): TocGroup[] => {
    const groups: TocGroup[] = [];
    let currentGroup: TocGroup | null = null;
    let clusterIds: string[] = [];
    let clusterIncoming = 0;
    let clusterOutgoing = 0;

    function flushCluster(): void {
      if (clusterIds.length > 0 && currentGroup) {
        currentGroup.entries.push({
          kind: "cluster",
          ids: [...clusterIds],
          incoming: clusterIncoming,
          outgoing: clusterOutgoing,
          firstCreatedAt:
            items.find((it) => it.id === clusterIds[0])?.createdAt ?? "",
        });
        clusterIds = [];
        clusterIncoming = 0;
        clusterOutgoing = 0;
      }
    }

    function ensureGroup(dateLabel: string): void {
      flushCluster();
      currentGroup = { dateLabel, entries: [] };
      groups.push(currentGroup);
    }

    for (const [i, item] of items.entries()) {
      const prevTimestamp = i > 0 ? items[i - 1]?.createdAt : undefined;

      if (needsDateSeparator(item.createdAt, prevTimestamp)) {
        ensureGroup(formatDateSeparator(item.createdAt));
      }

      if (!currentGroup) {
        currentGroup = {
          dateLabel: formatDateSeparator(item.createdAt),
          entries: [],
        };
        groups.push(currentGroup);
      }

      if (isLandmark(item)) {
        flushCluster();
        currentGroup.entries.push({
          kind: "landmark",
          item,
          icon: landmarkIcon(item),
          label: landmarkLabel(item),
          time: formatTime(item.createdAt),
        });
      } else {
        clusterIds.push(item.id);
        if (item.source === "client") {
          clusterIncoming++;
        } else {
          clusterOutgoing++;
        }
      }
    }
    flushCluster();

    return groups;
  });

  const timelineGaps = $derived.by((): Map<string, number> => {
    if (items.length === 0 || items[0]?.fullPosition === undefined)
      return new Map<string, number>();

    const positionOf = new SvelteMap<string, number>();
    for (const it of items) {
      if (it.fullPosition !== undefined) positionOf.set(it.id, it.fullPosition);
    }

    const flatEntries: {
      key: string;
      firstPosition: number;
      lastPosition: number;
    }[] = [];
    for (const group of tocGroups) {
      for (const entry of group.entries) {
        if (entry.kind === "cluster") {
          const first = positionOf.get(entry.ids[0] ?? "");
          const last = positionOf.get(entry.ids[entry.ids.length - 1] ?? "");
          if (first !== undefined && last !== undefined)
            flatEntries.push({
              key: clusterKey(entry.ids),
              firstPosition: first,
              lastPosition: last,
            });
        } else {
          const pos = positionOf.get(entry.item.id);
          if (pos !== undefined)
            flatEntries.push({
              key: entry.item.id,
              firstPosition: pos,
              lastPosition: pos,
            });
        }
      }
    }

    return computeGaps(flatEntries, items[0].totalCount);
  });

  function zoomBackTo(fuId: string): void {
    timelineActive = false;
    requestAnimationFrame(() => {
      const el = document.getElementById(`fu-${fuId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleClusterClick(entry: ClusterEntry): void {
    const key = clusterKey(entry.ids);
    if (openClusters.has(key)) {
      openClusters.delete(key);
      return;
    }
    openClusters.add(key);
    if (!expandedClusters.has(key)) {
      onexpandcluster?.(entry.ids);
    }
  }

  function handleLandmarkClick(item: TimelineItem): void {
    if (openLandmarks.has(item.id)) {
      openLandmarks.delete(item.id);
      return;
    }
    openLandmarks.add(item.id);
    if (!expandedClusters.has(item.id)) {
      onexpandcluster?.([item.id]);
    }
  }

  // Auto-expand cluster and scroll to the match, but only on explicit request
  // (button navigation, entering overlay, view switch). Passive scroll tracking
  // updates searchActiveMatchId without setting searchScrollRequested, so this
  // effect doesn't fire and create a feedback loop.
  $effect(() => {
    if (
      !timelineActive ||
      !searchScrollRequested ||
      searchActiveMatchId == null
    )
      return;
    const targetId = searchActiveMatchId;

    for (const group of tocGroups) {
      for (const entry of group.entries) {
        if (entry.kind === "cluster" && entry.ids.includes(targetId)) {
          const key = clusterKey(entry.ids);
          if (!openClusters.has(key)) openClusters.add(key);
          if (!expandedClusters.has(key)) onexpandcluster?.(entry.ids);
          scrollToExpandedRecord(targetId);
          onsearchscrollcomplete?.();
          return;
        }
        if (entry.kind === "landmark" && entry.item.id === targetId) {
          if (!openLandmarks.has(targetId)) openLandmarks.add(targetId);
          if (!expandedClusters.has(targetId)) onexpandcluster?.([targetId]);
          scrollToExpandedRecord(targetId);
          onsearchscrollcomplete?.();
          return;
        }
      }
    }
  });

  function scrollToExpandedRecord(id: string): void {
    void tick().then(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`tl-fu-${id}`);
        if (el != null) {
          // firstElementChild has a layout box (fu-wrapper is display:contents)
          const target = el.firstElementChild ?? el;
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  // Scroll to bottom when timeline appears or its content changes
  // (e.g., summary query resolves after initial fallback render).
  // Skip when search overlay is active (search scroll takes priority).
  $effect(() => {
    if (!timelineActive || !scrollContainerEl) return;
    if (searchActiveMatchId != null) return;
    void items;
    const el = scrollContainerEl;
    void tick().then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      });
    });
  });
</script>

{#snippet expandedBubbles(records: ClusterRecord[] | undefined)}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="cluster-bubbles" onclick={(e) => e.stopPropagation()}>
    {#if records !== undefined}
      {#each records as rec (rec.id)}
        {#if renderExpanded}
          {@render renderExpanded({
            record: rec,
            onzoom: () => zoomBackTo(rec.id),
          })}
        {/if}
      {/each}
    {/if}
  </div>
{/snippet}

<div
  class="view-pane"
  class:view-hidden={timelineActive}
  data-view="messages"
  aria-hidden={timelineActive}
>
  {@render children()}
</div>

<nav
  class="timeline-view"
  class:view-hidden={!timelineActive}
  data-view="timeline"
  aria-hidden={!timelineActive}
  aria-label={m.ticket_timeline_nav_label()}
>
  <ul class="timeline-groups">
    {#each tocGroups as group, gi (gi)}
      {@const groupCollapsed = collapsedGroups.has(gi)}
      <ListGroup>
        <ListItem
          link
          chevron={false}
          title={group.dateLabel}
          class="toc-group-title"
          onclick={() => {
            if (collapsedGroups.has(gi)) {
              collapsedGroups.delete(gi);
            } else {
              collapsedGroups.add(gi);
            }
          }}
          linkProps={{
            role: "button",
            "aria-expanded": !groupCollapsed,
          }}
        >
          {#snippet after()}
            <ChevronDown
              size={14}
              class="toc-chevron {groupCollapsed ? '' : 'toc-chevron-open'}"
              aria-hidden="true"
            />
          {/snippet}
        </ListItem>

        {#if !groupCollapsed}
          {#each group.entries as entry, ei (ei)}
            {@const gapKey =
              entry.kind === "cluster" ? clusterKey(entry.ids) : entry.item.id}
            {@const gapBefore = timelineGaps.get(gapKey) ?? 0}
            {#if gapBefore > 0}
              <div class="tl-row tl-gap-row">
                <span></span>
                <span class="tl-gap-dot" aria-hidden="true"></span>
                <span class="tl-gap-label" role="separator">
                  {gapBefore === 1
                    ? m.ticket_filter_hidden_one()
                    : m.ticket_filter_hidden({ count: String(gapBefore) })}
                </span>
              </div>
            {/if}
            {#if entry.kind === "cluster"}
              {@const key = clusterKey(entry.ids)}
              {@const isOpen = openClusters.has(key)}
              {@const expanded = expandedClusters.get(key)}
              {@const summary = clusterLabel(entry.incoming, entry.outgoing)}
              {@const clusterTime = formatTime(entry.firstCreatedAt)}

              {@const isMixed = entry.incoming > 0 && entry.outgoing > 0}
              {@const isOutgoing = !isMixed && entry.outgoing > 0}
              <div class="tl-row" data-tl-ids={entry.ids.join(" ")}>
                <span class="tl-time">{clusterTime}</span>
                <span class="tl-marker" aria-hidden="true">
                  {#if isMixed}
                    <MessagesSquare size={16} />
                  {:else}
                    <MessageSquare
                      size={16}
                      class={isOutgoing ? "tl-icon-mirror" : ""}
                    />
                  {/if}
                </span>
                <ListItem
                  link
                  chevron={false}
                  title={summary}
                  onclick={() => handleClusterClick(entry)}
                  linkProps={{
                    role: "button",
                    "aria-expanded": isOpen,
                    "aria-label": m.ticket_timeline_expand_cluster({
                      summary,
                    }),
                  }}
                >
                  {#snippet after()}
                    <ChevronDown
                      size={14}
                      class="toc-chevron {isOpen ? 'toc-chevron-open' : ''}"
                      aria-hidden="true"
                    />
                  {/snippet}

                  {#if isOpen}
                    {@render expandedBubbles(expanded)}
                  {/if}
                </ListItem>
              </div>
            {:else if entry.kind === "landmark"}
              {@const EntryIcon = entry.icon}
              {@const isLandmarkOpen = openLandmarks.has(entry.item.id)}
              {@const landmarkExpanded = expandedClusters.get(entry.item.id)}
              <div class="tl-row" data-tl-id={entry.item.id}>
                <span class="tl-time">{entry.time}</span>
                <span class="tl-marker" aria-hidden="true">
                  <EntryIcon size={16} />
                </span>
                <ListItem
                  link
                  chevron={false}
                  title={entry.label}
                  onclick={() => handleLandmarkClick(entry.item)}
                  class={entry.item.source === "system" ? "toc-row-system" : ""}
                  linkProps={{
                    role: "button",
                    "aria-expanded": isLandmarkOpen,
                    "aria-label": m.ticket_timeline_jump_to({
                      label: entry.label,
                      time: entry.time,
                    }),
                  }}
                >
                  {#snippet after()}
                    <ChevronDown
                      size={14}
                      class="toc-chevron {isLandmarkOpen
                        ? 'toc-chevron-open'
                        : ''}"
                      aria-hidden="true"
                    />
                  {/snippet}

                  {#if isLandmarkOpen}
                    {@render expandedBubbles(landmarkExpanded)}
                  {/if}
                </ListItem>
              </div>
            {/if}
          {/each}
        {/if}
      </ListGroup>
    {/each}
  </ul>
</nav>

<style>
  /* display:contents preserves the parent flex-column layout for
     Messages/VirtualList. When hidden, display:none overrides it. */
  .view-pane {
    display: contents;
  }

  .view-hidden {
    display: none !important;
  }

  .timeline-view {
    padding-bottom: 5rem;
  }

  .timeline-groups {
    --tl-time-w: 3.5rem;
    --tl-marker-size: 28px;
    --tl-line-color: rgba(128, 128, 128, 0.25);

    list-style: none;
    padding: 0;
    margin: 0;
  }

  .timeline-groups > :global(li + li) {
    margin-top: 0.5rem;
  }

  /* Strip card styling from nested List inside ListGroup */
  .timeline-groups > :global(li > div) {
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
  }

  /* Each entry row: [time] [marker on line] [content] */
  .tl-row {
    position: relative;
    display: grid;
    grid-template-columns: var(--tl-time-w) var(--tl-marker-size) 1fr;
    align-items: center;
    gap: 0 0.25rem;
  }

  /* Vertical line segment through the marker column */
  .tl-row::before {
    content: "";
    position: absolute;
    left: calc(var(--tl-time-w) + var(--tl-marker-size) / 2 - 1px + 0.25rem);
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--tl-line-color);
    z-index: 0;
  }

  .tl-time {
    font-size: 0.7rem;
    color: var(--muted, #888);
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  .tl-marker {
    width: var(--tl-marker-size);
    height: var(--tl-marker-size);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--k-page-bg, #fff);
    color: var(--brand-accent, #007aff);
    z-index: 1;
  }

  :global(.dark) .tl-marker {
    background: var(--k-page-bg, #1c1c1e);
  }

  :global(.tl-icon-mirror) {
    transform: scaleX(-1);
  }

  /* Group title (date header) */
  :global(.toc-group-title) {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted, #666);
  }

  /* Chevron rotation for expand/collapse */
  :global(.toc-chevron) {
    transition: transform 0.2s ease;
    color: var(--muted, #666);
  }

  :global(.toc-chevron-open) {
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.toc-chevron) {
      transition: none;
    }
  }

  /* System event rows: muted text */
  :global(.toc-row-system) {
    opacity: 0.7;
  }

  /* Gap indicator row */
  .tl-gap-row {
    opacity: 0.5;
    font-size: 0.7rem;
  }

  .tl-gap-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--tl-line-color);
    margin: 0 auto;
    z-index: 1;
  }

  .tl-gap-label {
    color: var(--muted, #888);
    font-style: italic;
  }

  /* Expanded cluster: message bubbles.
     flex-column lets Konsta Message self-end (sent) alignment work. */
  .cluster-bubbles {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0;
  }

  :global(.cluster-bubble-tap) {
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }

  :global(.cluster-bubble-tap:focus-visible) {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: 0.5rem;
  }
</style>
