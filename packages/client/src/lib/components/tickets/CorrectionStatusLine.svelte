<!--
  Status line rendered inside/above a contact_correction bubble.
  Shows a flagged label with icon, plus an acknowledge toggle button.
  Uses the Careful register tokens (tinted block, glyph + word).

  Modeled on ShareStatusLine.svelte.
-->
<script lang="ts">
  import { UserPen, Check } from "@lucide/svelte";
  import { Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ReactionSummary } from "@care-y/shared";

  interface CorrectionStatusLineProps {
    /** Reaction summaries for this follow-up. */
    reactions: readonly ReactionSummary[];
    /** Called when the acknowledge toggle is clicked. */
    ontoggleacknowledge: () => void;
    /** Resolve a user ID to a display name. */
    resolveUserName?: (userId: string) => string | undefined;
  }

  let {
    reactions,
    ontoggleacknowledge,
    resolveUserName,
  }: CorrectionStatusLineProps = $props();

  const acknowledgeReaction = $derived(
    reactions.find((r) => r.reaction === "acknowledge"),
  );
  const isAcknowledged = $derived(
    acknowledgeReaction !== undefined && acknowledgeReaction.userIds.length > 0,
  );

  const acknowledgedLabel = $derived.by((): string => {
    if (!isAcknowledged || !acknowledgeReaction) {
      return "";
    }
    const firstUserId = acknowledgeReaction.userIds[0];
    if (firstUserId === undefined) return m.contact_correction_handled();
    const name = resolveUserName?.(firstUserId);
    if (name !== undefined && name !== "") {
      return m.contact_correction_handled_by({ name });
    }
    return m.contact_correction_handled();
  });
</script>

<div
  class="correction-status"
  class:correction-handled={isAcknowledged}
  data-testid="correction-status-line"
>
  <div class="correction-flag">
    <UserPen size={14} aria-hidden="true" />
    <span class="correction-flag-label">
      {m.contact_correction_flag_label()}
    </span>
  </div>
  <div class="correction-action">
    {#if isAcknowledged}
      <span class="correction-ack-label" data-testid="correction-ack-label">
        <Check size={12} aria-hidden="true" />
        {acknowledgedLabel}
      </span>
    {/if}
    <Button
      small
      outline
      onclick={ontoggleacknowledge}
      data-testid="correction-ack-btn"
    >
      {isAcknowledged
        ? m.contact_correction_handled()
        : m.contact_correction_mark_handled()}
    </Button>
  </div>
</div>

<style>
  .correction-status {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--care-soft);
    margin-top: 4px;
  }

  .correction-handled {
    background: var(--paper-deep);
  }

  .correction-flag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--care);
  }

  .correction-handled .correction-flag {
    color: var(--muted);
  }

  .correction-flag-label {
    line-height: 1.3;
  }

  .correction-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .correction-ack-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: var(--muted);
  }
</style>
