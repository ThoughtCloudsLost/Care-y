<!--
  NarrativePanel: displays contextual explanation copy beside the phone
  frame. Content resolves by topic first, then feature, then welcome
  fallback.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import type { DemoFeature, DemoDetail } from "./router.svelte.js";
  import type { DemoTopic } from "./bridge.js";

  interface Props {
    feature: DemoFeature | null;
    detail: DemoDetail;
    searchOpen: boolean;
    topic: DemoTopic | null;
  }

  let { feature, detail, searchOpen, topic }: Props = $props();

  interface NarrativeCopy {
    readonly heading: string;
    readonly body: string;
    readonly body2?: string;
  }

  /** Map topic to its narrative copy. Uses a switch for exhaustiveness. */
  function topicNarrative(t: DemoTopic): NarrativeCopy {
    switch (t) {
      case "sort":
        return {
          heading: m.demo_narrative_topic_sort_heading(),
          body: m.demo_narrative_topic_sort_body(),
        };
      case "filters":
        return {
          heading: m.demo_narrative_topic_filters_heading(),
          body: m.demo_narrative_topic_filters_body(),
        };
      case "view-modes":
        return {
          heading: m.demo_narrative_topic_view_modes_heading(),
          body: m.demo_narrative_topic_view_modes_body(),
        };
      case "select-mode":
        return {
          heading: m.demo_narrative_topic_select_mode_heading(),
          body: m.demo_narrative_topic_select_mode_body(),
        };
      case "new-ticket":
        return {
          heading: m.demo_narrative_topic_new_ticket_heading(),
          body: m.demo_narrative_topic_new_ticket_body(),
        };
      case "thread-filters":
        return {
          heading: m.demo_narrative_topic_thread_filters_heading(),
          body: m.demo_narrative_topic_thread_filters_body(),
        };
      case "compose-actions":
        return {
          heading: m.demo_narrative_topic_compose_actions_heading(),
          body: m.demo_narrative_topic_compose_actions_body(),
        };
      case "reply":
        return {
          heading: m.demo_narrative_topic_reply_heading(),
          body: m.demo_narrative_topic_reply_body(),
        };
      case "notes":
        return {
          heading: m.demo_narrative_topic_notes_heading(),
          body: m.demo_narrative_topic_notes_body(),
        };
      case "case-fold":
        return {
          heading: m.demo_narrative_topic_case_fold_heading(),
          body: m.demo_narrative_topic_case_fold_body(),
        };
      case "language":
        return {
          heading: m.demo_narrative_topic_language_heading(),
          body: m.demo_narrative_topic_language_body(),
        };
    }
  }

  const copy: NarrativeCopy = $derived.by(() => {
    // Topic takes priority when set
    if (topic !== null) {
      return topicNarrative(topic);
    }

    if (searchOpen || feature === "search") {
      return {
        heading: m.demo_narrative_search_heading(),
        body: m.demo_narrative_search_body(),
        body2: m.demo_narrative_search_body2(),
      };
    }

    if (feature === "tickets" && detail !== null) {
      return {
        heading: m.demo_narrative_conversation_heading(),
        body: m.demo_narrative_conversation_body(),
        body2: m.demo_narrative_conversation_body2(),
      };
    }

    if (feature === "tickets") {
      return {
        heading: m.demo_narrative_tickets_heading(),
        body: m.demo_narrative_tickets_body(),
        body2: m.demo_narrative_tickets_body2(),
      };
    }

    return {
      heading: m.demo_narrative_welcome_heading(),
      body: m.demo_narrative_welcome_body(),
    };
  });
</script>

<aside class="narrative-panel" aria-live="polite">
  <div class="narrative-content">
    <h2 class="narrative-heading">{copy.heading}</h2>
    <p class="narrative-body">{copy.body}</p>
    {#if copy.body2}
      <p class="narrative-body">{copy.body2}</p>
    {/if}
  </div>
</aside>

<style>
  .narrative-panel {
    flex: 1;
    min-width: 0;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .narrative-content {
    max-width: 28rem;
  }

  .narrative-heading {
    font-size: 1.375rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: var(--text-primary, #1d1d1f);
    line-height: 1.3;
  }

  .narrative-body {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-secondary, #424245);
    margin: 0 0 0.75rem;
  }

  .narrative-body:last-child {
    margin-bottom: 0;
  }

  /* The Inkwell text vars are scoped to the app shell, not the page
     root, so the outer page needs its own dark values. */
  :global(html.dark) .narrative-heading {
    color: #f5f5f7;
  }

  :global(html.dark) .narrative-body {
    color: #a1a1a6;
  }
</style>
