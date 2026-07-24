<!--
  Shared reaction pill tray for internal notes.

  Two sizes: "normal" (detail view) and "mini" (ticket list preview).
  When ontogglereaction is provided, pills are interactive buttons that
  open the parent's picker. Otherwise pills are display-only.
-->
<script lang="ts">
  import { Plus } from "@lucide/svelte";
  import { reactionIcon } from "$lib/utils/reaction-icons.js";
  import * as m from "$lib/paraglide/messages.js";
  import type { ReactionSummary } from "@care-y/shared";

  interface Props {
    reactions: ReactionSummary[];
    size?: "normal" | "mini";
    currentUserId?: string;
    resolveUserName?: (userId: string) => string | undefined;
    onopenpicker?: () => void;
  }

  let {
    reactions,
    size = "normal",
    currentUserId,
    resolveUserName,
    onopenpicker,
  }: Props = $props();

  const mini = $derived(size === "mini");
  const interactive = $derived(onopenpicker !== undefined);

  function userReacted(reaction: ReactionSummary): boolean {
    if (currentUserId === undefined) return false;
    return reaction.userIds.includes(currentUserId);
  }

  function whoReacted(reaction: ReactionSummary): string {
    if (!resolveUserName) return "";
    return reaction.userIds
      .map((uid) =>
        uid === currentUserId ? m.reaction_you() : (resolveUserName(uid) ?? ""),
      )
      .filter((n) => n.length > 0)
      .join(", ");
  }
</script>

{#if reactions.length > 0 || interactive}
  <div
    class="reaction-tray"
    class:reaction-tray--mini={mini}
    aria-label={m.reaction_summary()}
  >
    {#each reactions as r (r.reaction)}
      {@const Icon = reactionIcon(r.reaction)}
      {@const mine = userReacted(r)}
      {@const names = whoReacted(r)}
      {#if interactive}
        <button
          type="button"
          class="reaction-pill"
          class:reaction-pill--mini={mini}
          class:reaction-mine={mine}
          onclick={onopenpicker}
          title={names}
        >
          <Icon size={mini ? 8 : 11} aria-hidden="true" />
          <span class="reaction-count">{r.userIds.length}</span>
        </button>
      {:else}
        <span
          class="reaction-pill reaction-mine"
          class:reaction-pill--mini={mini}
          aria-hidden="true"
        >
          <Icon size={mini ? 8 : 11} aria-hidden="true" />
          <span class="reaction-count">{r.userIds.length}</span>
        </span>
      {/if}
    {/each}
    {#if interactive}
      <button
        type="button"
        class="reaction-add-btn"
        onclick={onopenpicker}
        aria-label={m.reaction_add()}
      >
        <Plus size={10} />
      </button>
    {/if}
  </div>
{/if}

<style>
  .reaction-tray {
    position: absolute;
    bottom: -0.5rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.1875rem;
  }

  .reaction-tray--mini {
    bottom: -0.5625rem;
    right: 0.375rem;
    gap: 2px;
  }

  .reaction-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.1875rem;
    padding: 0.125rem 0.375rem;
    font-size: 0.6875rem;
    border-radius: 999px;
    border: 1px solid var(--hair, var(--surface-2));
    background: var(--paper);
    color: var(--muted);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    min-height: 1.375rem;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  }

  .reaction-pill--mini {
    gap: 1px;
    padding: 0 0.1875rem;
    font-size: 0.5rem;
    min-height: 0.75rem;
    cursor: default;
  }

  .reaction-mine {
    border-color: var(--brand-accent, var(--brand-primary));
    color: var(--brand-accent, var(--brand-primary));
    background: color-mix(
      in srgb,
      var(--brand-accent, var(--brand-primary)) 8%,
      var(--paper)
    );
  }

  .reaction-count {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .reaction-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 999px;
    border: 1px solid var(--hair, var(--surface-2));
    background: var(--paper);
    color: var(--muted);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  }
</style>
