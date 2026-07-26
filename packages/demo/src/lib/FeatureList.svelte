<!--
  FeatureList: two-level clickable list of demo features displayed
  beside the phone frame. Top-level features expand to show sub-items
  (topics) when active. Clicking a top-level feature fires onselect;
  sub-items are display-only (they highlight based on the current topic).
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Search, Ticket, Check } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { DemoFeature } from "./router.svelte.js";
  import type { DemoTopic } from "./bridge.js";
  import { DEMO_TOPICS } from "./bridge.js";

  interface Props {
    feature: DemoFeature | null;
    topic: DemoTopic | null;
    seenTopics: ReadonlySet<DemoTopic>;
    onselect: (id: DemoFeature) => void;
  }

  let { feature, topic, seenTopics, onselect }: Props = $props();

  interface FeatureItem {
    readonly id: DemoFeature;
    readonly label: () => string;
    readonly icon: typeof Search;
  }

  interface SubItem {
    readonly topic: DemoTopic;
    readonly label: () => string;
  }

  const features: readonly FeatureItem[] = [
    { id: "tickets", label: () => m.demo_feature_tickets(), icon: Ticket },
    { id: "search", label: () => m.demo_feature_search(), icon: Search },
  ];

  // Sub-items under "tickets" in display order. All 11 topics nest
  // under tickets (search has no sub-items).
  const ticketSubItems: readonly SubItem[] = [
    { topic: "sort", label: () => m.demo_topic_sort() },
    { topic: "filters", label: () => m.demo_topic_filters() },
    { topic: "view-modes", label: () => m.demo_topic_view_modes() },
    { topic: "select-mode", label: () => m.demo_topic_select_mode() },
    { topic: "new-ticket", label: () => m.demo_topic_new_ticket() },
    { topic: "thread-filters", label: () => m.demo_topic_thread_filters() },
    { topic: "compose-actions", label: () => m.demo_topic_compose_actions() },
    { topic: "reply", label: () => m.demo_topic_reply() },
    { topic: "notes", label: () => m.demo_topic_notes() },
    { topic: "case-fold", label: () => m.demo_topic_case_fold() },
    { topic: "language", label: () => m.demo_topic_language() },
  ];

  const expanded = $derived(feature === "tickets");

  function handleSelect(id: DemoFeature): void {
    onselect(id);
  }
</script>

<nav class="feature-list" aria-label={m.demo_feature_list_label()}>
  <h3 class="feature-list-heading">{m.demo_feature_list_heading()}</h3>
  <p class="feature-progress">
    {m.demo_progress_explored({
      seen: String(seenTopics.size),
      total: String(DEMO_TOPICS.length),
    })}
  </p>
  <List strong inset>
    {#each features as feat (feat.id)}
      {@const Icon = feat.icon}
      <ListItem
        title={feat.label()}
        link
        onclick={() => handleSelect(feat.id)}
        class={feature === feat.id ? "feature-active" : ""}
      >
        {#snippet media()}
          <Icon size={20} />
        {/snippet}
      </ListItem>

      {#if feat.id === "tickets"}
        <div class="sub-items" class:sub-items-expanded={expanded}>
          <div class="sub-items-inner">
            {#each ticketSubItems as sub (sub.topic)}
              {@const isActive = topic === sub.topic}
              {@const isSeen = seenTopics.has(sub.topic)}
              <div
                class="sub-item"
                class:sub-item-active={isActive}
                class:sub-item-seen={isSeen && !isActive}
              >
                <span class="sub-item-label">{sub.label()}</span>
                {#if isSeen}
                  <Check size={12} class="sub-item-check" />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </List>
</nav>

<style>
  .feature-list {
    width: 100%;
  }

  .feature-list-heading {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary, #86868b);
    margin: 0 0 0.25rem;
    padding: 0 1rem;
  }

  .feature-progress {
    font-size: 0.75rem;
    color: var(--text-secondary, #86868b);
    margin: 0 0 0.5rem;
    padding: 0 1rem;
  }

  .feature-list :global(.feature-active) {
    background: rgba(0, 122, 255, 0.08);
  }

  .sub-items {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s ease;
    overflow: hidden;
  }

  .sub-items-expanded {
    grid-template-rows: 1fr;
  }

  .sub-items-inner {
    min-height: 0;
    overflow: hidden;
    padding: 0 1rem 0 2.5rem;
  }

  .sub-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.5rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    color: var(--text-secondary, #636366);
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .sub-item-active {
    background: rgba(0, 122, 255, 0.1);
    color: var(--text-primary, #007aff);
    font-weight: 500;
  }

  .sub-item-seen {
    color: var(--text-secondary, #86868b);
  }

  .sub-item-label {
    flex: 1;
    min-width: 0;
  }

  .sub-item :global(.sub-item-check) {
    flex-shrink: 0;
    color: #34c759;
    margin-left: 0.5rem;
  }

  :global(html.dark) .feature-progress {
    color: #98989d;
  }

  :global(html.dark) .sub-item {
    color: #98989d;
  }

  :global(html.dark) .sub-item-active {
    background: rgba(0, 122, 255, 0.15);
    color: #64d2ff;
  }

  :global(html.dark) .sub-item-seen {
    color: #636366;
  }
</style>
