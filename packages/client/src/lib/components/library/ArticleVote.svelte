<script lang="ts">
  import { Button } from "konsta/svelte";
  import { ThumbsUp, ThumbsDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  type VoteDirection = "up" | "down";

  interface ArticleVoteProps {
    voteUpCount: number;
    voteDownCount: number;
    userDirection: VoteDirection | null;
    onvote: (direction: VoteDirection) => void;
    onremove: () => void;
    disabled?: boolean;
  }

  let {
    voteUpCount,
    voteDownCount,
    userDirection,
    onvote,
    onremove,
    disabled = false,
  }: ArticleVoteProps = $props();

  const totalCount = $derived(voteUpCount + voteDownCount);

  // Design doc State 7: when voted, show BOTH personalized text AND count.
  const personalText = $derived.by(() => {
    if (userDirection === "up") return m.library_your_vote_up();
    if (userDirection === "down") return m.library_your_vote_down();
    return null;
  });

  const countText = $derived(
    totalCount > 0
      ? m.library_vote_count({
          up: String(voteUpCount),
          total: String(totalCount),
        })
      : null,
  );

  function handleUp(): void {
    if (disabled) return;
    if (userDirection === "up") {
      onremove();
    } else {
      onvote("up");
    }
  }

  function handleDown(): void {
    if (disabled) return;
    if (userDirection === "down") {
      onremove();
    } else {
      onvote("down");
    }
  }
</script>

<div class="article-vote" role="group" aria-label={m.library_was_helpful()}>
  <p class="vote-prompt">{m.library_was_helpful()}</p>

  <div class="vote-buttons">
    <Button
      outline={userDirection === "up"}
      clear={userDirection !== "up"}
      small
      rounded
      onclick={handleUp}
      {disabled}
      aria-pressed={userDirection === "up"}
      class="vote-btn vote-btn--up"
    >
      <ThumbsUp
        size={16}
        aria-hidden="true"
        class={userDirection === "up" ? "vote-icon--active" : ""}
      />
      <span>{m.library_vote_up()}</span>
    </Button>

    <Button
      outline={userDirection === "down"}
      clear={userDirection !== "down"}
      small
      rounded
      onclick={handleDown}
      {disabled}
      aria-pressed={userDirection === "down"}
      class="vote-btn vote-btn--down"
    >
      <ThumbsDown
        size={16}
        aria-hidden="true"
        class={userDirection === "down" ? "vote-icon--active" : ""}
      />
      <span>{m.library_vote_down()}</span>
    </Button>
  </div>

  <div class="vote-summary-block">
    {#if personalText}
      <p class="vote-summary vote-summary--personal">{personalText}</p>
    {/if}
    {#if countText}
      <p class="vote-summary">{countText}</p>
    {/if}
  </div>
</div>

<style>
  .article-vote {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-md);
    border-top: 1px solid var(--divider);
  }

  .vote-prompt {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0;
  }

  .vote-buttons {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  :global(.vote-btn) {
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.375rem !important;
  }

  :global(.vote-btn--up.k-button-outline) {
    border-color: var(--brand-accent) !important;
    color: var(--brand-accent) !important;
  }

  :global(.vote-btn--down.k-button-outline) {
    border-color: var(--muted) !important;
    color: var(--muted) !important;
  }

  :global(.vote-icon--active) {
    color: inherit;
  }

  .vote-summary-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    min-height: 1.5rem;
  }

  .vote-summary {
    font-size: var(--text-xs);
    color: var(--muted);
    margin: 0;
  }

  .vote-summary--personal {
    font-weight: 500;
  }
</style>
