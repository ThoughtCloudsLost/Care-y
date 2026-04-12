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
  import { SvelteSet } from "svelte/reactivity";
  import { List, ListGroup, ListItem, Messages, Message } from "konsta/svelte";
  import {
    MessagesSquare,
    MessageSquare,
    Lock,
    Play,
    Image as ImageIcon,
    Paperclip,
    Dot,
    ChevronDown,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { needsDateSeparator, formatDateSeparator } from "$lib/utils/time.js";
  import type { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { TimelineItem, ClusterRecord } from "./chat-zoom-types.js";

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

  interface ChatZoomProps {
    scrollContainerEl: HTMLDivElement | undefined;
    totalMessages: number;
    earliestDate: string | undefined;
    latestDate: string | undefined;
    items?: TimelineItem[];
    decryptedContent?: Map<string, string | undefined>;
    expandedClusters?: Map<string, ClusterRecord[]>;
    onexpandcluster?: (followUpIds: string[]) => void;
    followUpCache?: FollowUpDecryptCache;
    keyWrap?: TicketKeyWrap | null;
    timelineActive?: boolean;
    children: Snippet;
  }

  let {
    scrollContainerEl,
    totalMessages,
    earliestDate,
    latestDate,
    items = [],
    decryptedContent = new Map(),
    expandedClusters = new Map(),
    onexpandcluster,
    followUpCache,
    keyWrap = null,
    timelineActive = $bindable(false),
    children,
  }: ChatZoomProps = $props();

  // Track which clusters are visually open (separate from data loading).
  const openClusters = new SvelteSet<string>();

  // Track which date groups are collapsed. Empty = all expanded (default).
  const collapsedGroups = new SvelteSet<number>();

  const summaryText = $derived.by((): string => {
    if (
      totalMessages === 0 ||
      earliestDate === undefined ||
      latestDate === undefined
    ) {
      return "";
    }

    const earliest = new Date(earliestDate);
    const latest = new Date(latestDate);
    const diffMs = latest.getTime() - earliest.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const recency = formatRelativeTime(latest);

    return m.ticket_zoom_summary({
      count: String(totalMessages),
      days: String(diffDays),
      recency,
    });
  });

  function isLandmark(item: TimelineItem): boolean {
    if (item.source === "system") return true;
    if (item.type === "internal_note") return true;
    if (item.hasRecording || item.hasImage || item.hasFile) return true;
    return false;
  }

  function landmarkIcon(item: TimelineItem): Component {
    if (item.source === "system") return Dot;
    if (item.type === "internal_note") return Lock;
    if (item.hasRecording) return Play;
    if (item.hasImage) return ImageIcon;
    if (item.hasFile) return Paperclip;
    return MessageSquare;
  }

  function landmarkLabel(item: TimelineItem): string {
    if (item.source === "system") {
      const decrypted = decryptedContent.get(item.id);
      if (decrypted !== undefined && decrypted !== "") return decrypted;
      if (item.type === "assignment_change") return "Assigned";
      if (item.type === "status_change") return "Status changed";
      if (item.type === "hold_change") return "Hold changed";
      if (item.type === "priority_change") return "Priority changed";
      return "Event";
    }

    if (item.type === "internal_note") {
      const decrypted = decryptedContent.get(item.id);
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

  function decrypt(rec: ClusterRecord): string | undefined {
    if (!followUpCache || !keyWrap || rec.encryptedContent === null) {
      return undefined;
    }
    const result = followUpCache.decryptContent(
      rec.id,
      keyWrap,
      rec.encryptedContent,
    );
    return isDecryptError(result) ? undefined : result;
  }

  // Scroll to bottom when timeline first appears.
  // tick() flushes Svelte DOM updates, then two rAFs ensure the browser
  // has laid out and painted the Konsta List content before we measure
  // scrollHeight. A single rAF can fire before layout is complete.
  $effect(() => {
    if (timelineActive && scrollContainerEl) {
      const el = scrollContainerEl;
      void tick().then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
          });
        });
      });
    }
  });
</script>

<div class="view-pane" class:view-hidden={timelineActive}>
  {@render children()}
</div>

<nav
  class="timeline-view"
  class:view-hidden={!timelineActive}
  aria-label={m.ticket_timeline_nav_label()}
>
  {#if summaryText}
    <div class="timeline-summary" aria-live="polite" role="status">
      {summaryText}
    </div>
  {/if}

  <List strongIos outlineIos>
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
            {#if entry.kind === "cluster"}
              {@const key = clusterKey(entry.ids)}
              {@const isOpen = openClusters.has(key)}
              {@const expanded = expandedClusters.get(key)}
              {@const summary = clusterLabel(entry.incoming, entry.outgoing)}
              {@const clusterTime = formatTime(entry.firstCreatedAt)}

              <ListItem
                link
                chevron={false}
                title={summary}
                onclick={() => handleClusterClick(entry)}
                linkProps={{
                  role: "button",
                  "aria-expanded": isOpen,
                  "aria-label": m.ticket_timeline_expand_cluster({ summary }),
                }}
              >
                {#snippet media()}
                  <MessagesSquare
                    size={20}
                    class="toc-icon"
                    aria-hidden="true"
                  />
                {/snippet}
                {#snippet after()}
                  <span class="toc-after">
                    <span class="toc-time">{clusterTime}</span>
                    <ChevronDown
                      size={14}
                      class="toc-chevron {isOpen ? 'toc-chevron-open' : ''}"
                      aria-hidden="true"
                    />
                  </span>
                {/snippet}

                {#if isOpen}
                  <div class="cluster-bubbles">
                    <Messages>
                      {#if expanded !== undefined}
                        {#each expanded as rec (rec.id)}
                          {@const plaintext = decrypt(rec)}
                          {@const preview =
                            plaintext !== undefined
                              ? plaintext.length > 60
                                ? plaintext.slice(0, 60) + "\u2026"
                                : plaintext
                              : undefined}
                          <Message
                            type={rec.source === "client" ? "received" : "sent"}
                            role="button"
                            tabindex={0}
                            aria-label={m.ticket_timeline_jump_to({
                              label: preview ?? m.ticket_timeline_decrypting(),
                              time: formatTime(rec.createdAt),
                            })}
                            onclick={() => zoomBackTo(rec.id)}
                            onkeydown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                zoomBackTo(rec.id);
                              }
                            }}
                            class="cluster-bubble-tap"
                          >
                            {#snippet text()}
                              <DecryptPlaceholder
                                content={preview}
                                ciphertext={rec.encryptedContent}
                                length={30}
                                block
                                charsPerLine={35}
                              />
                            {/snippet}
                            {#snippet footer()}
                              <time
                                class="bubble-time"
                                datetime={rec.createdAt}
                              >
                                {formatTime(rec.createdAt)}
                              </time>
                            {/snippet}
                          </Message>
                        {/each}
                      {/if}
                    </Messages>
                  </div>
                {/if}
              </ListItem>
            {:else if entry.kind === "landmark"}
              {@const EntryIcon = entry.icon}
              <ListItem
                link
                chevron={false}
                title={entry.label}
                onclick={() => zoomBackTo(entry.item.id)}
                class={entry.item.source === "system" ? "toc-row-system" : ""}
                linkProps={{
                  "aria-label": m.ticket_timeline_jump_to({
                    label: entry.label,
                    time: entry.time,
                  }),
                }}
              >
                {#snippet media()}
                  <EntryIcon size={20} class="toc-icon" aria-hidden="true" />
                {/snippet}
                {#snippet after()}
                  <span class="toc-after">
                    <span class="toc-time">{entry.time}</span>
                    <span class="toc-chevron-spacer"></span>
                  </span>
                {/snippet}
              </ListItem>
            {/if}
          {/each}
        {/if}
      </ListGroup>
    {/each}
  </List>
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

  .timeline-summary {
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted, #666);
    padding: 0.25rem 1rem 0.5rem;
  }

  /* Icon styling for Lucide icons in ListItem media slots */
  :global(.toc-icon) {
    opacity: 0.5;
    color: var(--muted, #666);
  }

  :global(.toc-icon-sm) {
    opacity: 0.4;
    color: var(--muted, #666);
  }

  /* Timestamp in the after slot: secondary color */
  .toc-time {
    font-size: 0.75rem;
    color: var(--muted, #666);
    font-variant-numeric: tabular-nums;
  }

  /* After slot layout for cluster rows (time + chevron) */
  .toc-after {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Group title styled to match Konsta groupTitle but tappable */
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

  /* Invisible spacer matching chevron width so timestamps align across rows */
  .toc-chevron-spacer {
    display: inline-block;
    width: 14px;
    flex-shrink: 0;
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

  /* Expanded cluster: message bubbles */
  .cluster-bubbles {
    padding: 0.25rem 0;
  }

  :global(.cluster-bubble-tap) {
    cursor: pointer;
  }

  :global(.cluster-bubble-tap:focus-visible) {
    outline: 2px solid var(--brand-primary, #7c3aed);
    outline-offset: -2px;
    border-radius: 0.5rem;
  }

  .bubble-time {
    font-size: 0.625rem;
    color: var(--muted, #666);
  }
</style>
