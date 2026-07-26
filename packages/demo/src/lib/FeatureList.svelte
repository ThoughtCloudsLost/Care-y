<!--
  FeatureList: clickable list of built demo features displayed
  beside the phone frame. Clicking a feature fires onselect,
  and the outer page decides whether to navigate or trigger search.
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Search, Ticket } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { DemoFeature } from "./router.svelte.js";

  interface Props {
    feature: DemoFeature | null;
    onselect: (id: DemoFeature) => void;
  }

  let { feature, onselect }: Props = $props();

  interface FeatureItem {
    readonly id: DemoFeature;
    readonly label: () => string;
    readonly icon: typeof Search;
  }

  const features: readonly FeatureItem[] = [
    { id: "tickets", label: () => m.demo_feature_tickets(), icon: Ticket },
    { id: "search", label: () => m.demo_feature_search(), icon: Search },
  ];

  function handleSelect(id: DemoFeature): void {
    onselect(id);
  }
</script>

<nav class="feature-list" aria-label={m.demo_feature_list_label()}>
  <h3 class="feature-list-heading">{m.demo_feature_list_heading()}</h3>
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

  .feature-list :global(.feature-active) {
    background: rgba(0, 122, 255, 0.08);
  }
</style>
