<script lang="ts">
  import {
    resolveOptionalStoryMessage,
    resolveStoryMessage,
  } from "./story-messages.js";
  import {
    getAggPage,
    type AggregationPageId,
    type AggSection,
  } from "./aggregation-pages.js";
  import { getCorpusEntry, type CorpusEntry } from "./handbook-corpus.js";
  import { getSection, getSub } from "./scroll-sections.js";
  import PermissionMatrix from "./PermissionMatrix.svelte";
  import HandbookSearch from "./HandbookSearch.svelte";
  import type { SectionId } from "./bridge.js";

  interface Props {
    pageId: AggregationPageId;
    locale: string;
    onNavigate: (sectionId: SectionId, subSlug: string) => void;
  }

  let { pageId, locale, onNavigate }: Props = $props();

  const page = $derived(getAggPage(pageId));

  const title: string = $derived(
    page !== undefined
      ? (resolveOptionalStoryMessage(page.titleKey, locale) ??
          (import.meta.env.DEV ? page.titleKey : ""))
      : "",
  );

  const intro: string | null = $derived(
    page !== undefined
      ? resolveOptionalStoryMessage(page.introKey, locale)
      : null,
  );

  /** Resolve a ref string ("key#lineIdx") into a corpus entry. */
  function resolveRef(ref: string): CorpusEntry | null {
    const hashIdx = ref.indexOf("#");
    if (hashIdx === -1) return null;
    const key = ref.slice(0, hashIdx);
    const lineIdx = Number(ref.slice(hashIdx + 1));
    if (Number.isNaN(lineIdx)) return null;
    return getCorpusEntry(locale, key, lineIdx);
  }

  /**
   * Build a breadcrumb for a corpus entry: "Section title > sub heading".
   * Falls back to sectionId/subSlug when message resolution fails.
   */
  function breadcrumb(entry: CorpusEntry): string {
    const section = getSection(entry.sectionId);
    const sectionTitle =
      section !== undefined
        ? resolveStoryMessage(section.titleKey, locale)
        : entry.sectionId;

    if (entry.subSlug === null) return sectionTitle;

    const subLookup = getSub(entry.sectionId, entry.subSlug);
    const subHeading =
      subLookup !== undefined
        ? resolveStoryMessage(subLookup.sub.headingKey, locale)
        : entry.subSlug;

    return `${sectionTitle} › ${subHeading}`;
  }

  function handleCardClick(entry: CorpusEntry): void {
    if (entry.subSlug !== null) {
      onNavigate(entry.sectionId as SectionId, entry.subSlug);
    }
  }

  function handleCardKeydown(e: KeyboardEvent, entry: CorpusEntry): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(entry);
    }
  }

  /** Whether a prose section resolves. Hidden in prod when missing. */
  function proseResolved(section: AggSection): string | null {
    if (section.kind !== "prose") return null;
    return resolveOptionalStoryMessage(section.key, locale);
  }
</script>

{#if page !== undefined}
  <div class="agg-view">
    {#if title !== ""}
      <h2 class="agg-title">{title}</h2>
    {/if}

    {#if intro !== null}
      <p class="agg-intro">{intro}</p>
    {/if}

    {#each page.sections as section, sIdx (sIdx)}
      {#if section.kind === "stretches"}
        <div class="agg-stretches">
          {#each section.refs as ref (ref)}
            {@const entry = resolveRef(ref)}
            {#if entry !== null}
              <button
                class="agg-card"
                type="button"
                disabled={entry.subSlug === null}
                onclick={() => handleCardClick(entry)}
                onkeydown={(e) => handleCardKeydown(e, entry)}
              >
                {#if entry.label !== null}
                  <span class="agg-card-label">
                    <strong>{entry.label}</strong>
                  </span>
                {/if}
                <span class="agg-card-body">{entry.plainText}</span>
                <span class="agg-card-breadcrumb">{breadcrumb(entry)}</span>
              </button>
            {/if}
          {/each}
        </div>
      {:else if section.kind === "prose"}
        {@const text = proseResolved(section)}
        {#if text !== null}
          <p class="agg-prose">{text}</p>
        {/if}
      {:else if section.kind === "matrix"}
        <PermissionMatrix />
      {:else if section.kind === "search"}
        <HandbookSearch {locale} {onNavigate} />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .agg-view {
    padding: 12px 16px 24px;
  }

  .agg-title {
    margin: 0 0 8px;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--ink, #1a1a1a);
  }

  .agg-intro {
    margin: 0 0 16px;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink-2, #444);
  }

  .agg-stretches {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .agg-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--hair, #ddd);
    border-radius: 8px;
    background: var(--raised, #fafafa);
    text-align: left;
    cursor: pointer;
    color: var(--ink, #1a1a1a);
    font-size: 0.8125rem;
    line-height: 1.5;
    transition: background 0.12s ease;
  }

  .agg-card:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink, #1a1a1a) 4%, transparent);
  }

  .agg-card:focus-visible {
    outline: 2px solid var(--demo-accent, #0066cc);
    outline-offset: -2px;
  }

  .agg-card:disabled {
    cursor: default;
    opacity: 0.8;
  }

  .agg-card-label {
    font-size: 0.8125rem;
    color: var(--ink, #1a1a1a);
  }

  .agg-card-body {
    font-size: 0.8125rem;
    color: var(--ink-2, #444);
  }

  .agg-card-breadcrumb {
    font-size: 0.6875rem;
    color: var(--muted, #888);
    margin-top: 2px;
  }

  .agg-prose {
    margin: 0 0 12px;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink, #1a1a1a);
  }
</style>
