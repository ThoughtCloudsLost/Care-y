<!--
  Shared ticket compose bar.

  One home for the compose apparatus that TicketDetailOrchestrator and
  ReplySheet used to duplicate. Owns the compose mode, the mode-keyed
  draft (draft-store), the SMS character budget, send gating, the mode
  indicator header, the @mention autocomplete, and the ShellMessagebar
  render. The `inline` prop is the entire embedding difference between
  the two hosts; ShellMessagebar absorbs it.

  Hosts keep their send pipelines, ComposeActions, and exposure-hint
  gating. They drive mode changes through the exported activateReply,
  activateSms, and reset methods (bind:this), so SMS activation always
  passes through the host's exposure hint.

  Dismiss (the X in the header) is cancel. It clears the active mode's
  stored draft on both surfaces. reset() collapses without touching the
  store, for sheet close and sent-mode cleanup.

  Shell import precedent: ReplySheet already rendered ShellMessagebar
  from components/tickets; this component inherits that exception.
-->
<script lang="ts">
  import { X, UserPen } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import {
    getDraftForMode,
    setDraftForMode,
    clearDraftForMode,
  } from "$lib/tickets/draft-store.svelte.js";
  import { insertMentionAtCursor } from "$lib/tickets/ticket-detail-utils.js";

  // The bind:this surface (activateReply, activateSms, reset) is typed
  // for hosts by TicketComposeHandle in ticket-compose-types.ts.

  interface TicketComposeProps {
    ticketId: string;
    /** Render in-flow instead of viewport-fixed (sheets, split view). */
    inline?: boolean;
    /** Host send pipeline in flight. Disables the send button. */
    sending?: boolean;
    /** Render nothing while keeping mode and draft state alive (the
     *  orchestrator hides the bar during select mode). */
    hidden?: boolean;
    /** When true, a contact correction is pending and the SMS compose
     *  header shows a warning. */
    hasUnacknowledgedCorrection?: boolean;
    onsendreply: (text: string) => void;
    onsendsms: (text: string) => void;
    onplus: (anchorEl: HTMLElement) => void;
  }

  let {
    ticketId,
    inline = false,
    sending = false,
    hidden = false,
    hasUnacknowledgedCorrection: correctionPending = false,
    onsendreply,
    onsendsms,
    onplus,
  }: TicketComposeProps = $props();

  // Compose mode: null = collapsed (no messagebar), "reply" or "sms" = expanded.
  let activeComposeMode = $state<"reply" | "sms" | null>(null);

  // Draft compose state keyed by ticketId + mode. Survives SPA navigations
  // in-memory. No disk persistence to avoid plaintext PII on disk.
  let draftText = $derived(
    activeComposeMode !== null
      ? getDraftForMode(ticketId, activeComposeMode)
      : "",
  );
  let cursorPosition = $state(0);

  // Sync edits back to the per-mode store.
  $effect(() => {
    if (activeComposeMode !== null) {
      setDraftForMode(ticketId, activeComposeMode, draftText);
    }
  });

  // Warn before page refresh/tab close when any draft exists.
  $effect(() => {
    const hasReply = getDraftForMode(ticketId, "reply").trim();
    const hasSms = getDraftForMode(ticketId, "sms").trim();
    if (!hasReply && !hasSms) return;
    function onBeforeUnload(e: BeforeUnloadEvent): void {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });

  const SMS_CHAR_LIMIT = 1600;
  const smsCharCount = $derived(
    activeComposeMode === "sms" ? draftText.length : 0,
  );
  const smsOverLimit = $derived(smsCharCount > SMS_CHAR_LIMIT);

  const sendDisabled = $derived(
    !draftText.trim() ||
      sending ||
      (activeComposeMode === "sms" && smsOverLimit),
  );

  function handleSend(): void {
    if (activeComposeMode === "reply") {
      onsendreply(draftText);
    } else if (activeComposeMode === "sms") {
      if (smsOverLimit) return;
      onsendsms(draftText);
    }
  }

  function handleInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      cursorPosition = target.selectionStart;
    }
  }

  function handleMentionSelect(_userId: string, displayName: string): void {
    const result = insertMentionAtCursor(
      draftText,
      cursorPosition,
      displayName,
    );
    if (result === null) return;
    draftText = result.text;
    cursorPosition = result.cursor;
  }

  /** Expand into encrypted-reply mode. */
  export function activateReply(): void {
    activeComposeMode = "reply";
  }

  /** Expand into SMS mode. Hosts gate this behind their exposure hint. */
  export function activateSms(): void {
    activeComposeMode = "sms";
  }

  /** Collapse without touching the stored draft. */
  export function reset(): void {
    activeComposeMode = null;
    cursorPosition = 0;
  }

  // Dismiss is cancel on both surfaces (unified 2026-07-16): drop the
  // active mode's stored draft, then collapse.
  function dismissCompose(): void {
    if (activeComposeMode !== null) {
      clearDraftForMode(ticketId, activeComposeMode);
    }
    activeComposeMode = null;
    cursorPosition = 0;
  }
</script>

{#snippet composeHeader()}
  {#if activeComposeMode === "sms" && correctionPending}
    <div
      class="correction-warning"
      role="status"
      aria-live="polite"
      data-testid="compose-correction-warning"
    >
      <UserPen size={14} aria-hidden="true" />
      <span>{m.contact_correction_pending_warning()}</span>
    </div>
  {/if}
  <div class="compose-mode-indicator">
    <span class="compose-mode-label">
      {activeComposeMode === "sms"
        ? m.ticket_mode_indicator_sms(withTerms())
        : m.ticket_mode_indicator_reply()}
    </span>
    {#if activeComposeMode === "sms"}
      <span class="sms-char-counter" class:sms-over-limit={smsOverLimit}>
        {m.ticket_sms_char_count({ count: String(smsCharCount) })}
      </span>
    {/if}
    <button
      type="button"
      class="compose-mode-dismiss"
      onclick={dismissCompose}
      aria-label={m.ticket_compose_dismiss_mode()}
    >
      <X size={16} aria-hidden="true" />
    </button>
  </div>
{/snippet}

{#if !hidden}
  {#if activeComposeMode === "reply"}
    <div class="mention-anchor" class:mention-anchor-fixed={!inline}>
      <MentionAutocomplete
        {draftText}
        {cursorPosition}
        onselect={handleMentionSelect}
      />
    </div>
  {/if}
  <ShellMessagebar
    bind:value={draftText}
    mode={activeComposeMode === "sms" ? "sms" : "reply"}
    collapsed={activeComposeMode === null}
    {inline}
    header={activeComposeMode !== null ? composeHeader : undefined}
    onsend={handleSend}
    {onplus}
    oninput={handleInput}
    {sendDisabled}
  />
{/if}

<style>
  /* Inline hosts anchor the dropdown in flow, directly above the bar. */
  .mention-anchor {
    position: relative;
  }

  /* Fixed-bar hosts pin it above the live messagebar height that
     ShellMessagebar publishes. The fallback covers the frame before
     the first ResizeObserver measurement. Positioned the same way the
     bar itself is (visual-viewport bottom edge, not bottom:0, which on
     iOS anchors to the layout viewport behind the software keyboard),
     with the matching transition so it rides the bar's glide. */
  .mention-anchor-fixed {
    position: fixed;
    top: calc(
      var(--vv-offset-top, 0px) + var(--app-height, 100dvh) -
        var(--messagebar-height, 3.5rem)
    );
    transform: translateY(-100%);
    transition: top 0.25s ease-out;
    left: 0;
    right: 0;
    z-index: 25;
  }

  @media (prefers-reduced-motion: reduce) {
    .mention-anchor-fixed {
      transition: none;
    }
  }

  .correction-warning {
    position: absolute;
    bottom: calc(100% + 1.5rem);
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 6px 16px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--care);
    background: var(--care-soft);
    border-radius: 8px 8px 0 0;
  }

  .compose-mode-indicator {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .compose-mode-label {
    flex: 1;
    min-width: 0;
  }

  .compose-mode-dismiss {
    appearance: none;
    border: none;
    background: none;
    padding: 4px;
    margin: -4px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sms-char-counter {
    font-size: var(--text-xs);
    color: var(--muted);
    margin-left: auto;
    flex-shrink: 0;
  }

  .sms-char-counter.sms-over-limit {
    color: var(--danger);
    font-weight: 600;
  }
</style>
