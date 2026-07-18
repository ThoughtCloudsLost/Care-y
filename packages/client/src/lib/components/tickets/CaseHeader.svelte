<!--
  Case header for the ticket detail: the Fraunces case title, judgment
  stamps, and a field list (description first, then queue/assignee and
  opened time).

  Rendered inside the subnavbar snippet by TicketDetailOrchestrator,
  so it lives in the chrome layer (glass blur, collapse-on-scroll)
  rather than the content scroll area. The dl is the future per-org
  custom-fields socket.

  Fold state is per ticket and session-only (in-memory module map,
  never persisted, never transmitted). The drag handle at the bottom
  edge supports finger-tracked drag with threshold + snap (matching
  ShellSheet/panel feel) and tap-to-toggle. Keyboard toggle preserved.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketKeys, queueKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import { decryptQueueAppearance } from "$lib/utils/queue-appearance.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import {
    getTicketDecryptCache,
    getFollowUpDecryptCache,
    getOrgDecryptCache,
    getOrgKeyManager,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { createTicketDecryptScope } from "$lib/crypto/ticket-decrypt-scope.js";
  import { isDecryptReady } from "$lib/crypto/decrypt-result.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    isCaseFolded,
    setCaseFolded,
  } from "$lib/tickets/case-fold-store.svelte.js";
  import { useFoldDrag } from "$lib/shell/use-fold-drag.svelte.js";
  import { requestOpaqueChrome } from "$lib/shell/chrome-glass.svelte.js";
  import type { Snippet } from "svelte";

  interface Props {
    ticketId: string;
    headerActions?: Snippet;
    alwaysExpanded?: boolean;
  }

  let { ticketId, headerActions, alwaysExpanded = false }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const currentUserIdGetter = getCurrentUserId();

  const ticketQuery = createQuery(() => ({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const ticket = $derived(ticketQuery.data);

  const decrypt = $derived(
    ticket != null
      ? createTicketDecryptScope({
          ticketCache,
          followUpCache,
          orgCache,
          orgKeyManager,
          ticketId: ticket.id,
          keyWrap: ticket.keyWrap,
        })
      : null,
  );

  const titleResult = $derived(
    ticket != null && decrypt != null
      ? decrypt.title(ticket.encryptedTitle)
      : undefined,
  );

  const descriptionResult = $derived(
    ticket != null && decrypt != null
      ? decrypt.description(ticket.encryptedDescription)
      : undefined,
  );

  // Empty descriptions decrypt to "" and omit the row entirely.
  const decryptedDescription = $derived(
    descriptionResult != null && isDecryptReady(descriptionResult)
      ? descriptionResult.value
      : undefined,
  );

  const queueName = $derived(
    ticket != null
      ? orgCache.decrypt(`queue:${ticket.queueId}`, ticket.encryptedQueueName)
      : null,
  );

  // Queue color/icon come from the shared queues list (the ticket payload
  // only embeds the encrypted name). The query key is shared with the
  // admin list and pickers, so this is a cache read in practice.
  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  const queueAppearance = $derived.by(() => {
    const q = (queuesQuery.data ?? []).find((x) => x.id === ticket?.queueId);
    return q ? decryptQueueAppearance(orgCache, q) : undefined;
  });

  const assignedIsSelf = $derived(
    ticket?.assignedTo != null && ticket.assignedTo === currentUserIdGetter(),
  );

  const assignedName = $derived.by((): string | null => {
    if (ticket?.assignedTo == null || assignedIsSelf) return null;
    return (
      orgCache.decrypt(
        `assignee:${ticket.assignedTo}`,
        ticket.assignedDisplayName,
      ) ?? null
    );
  });

  const folded = $derived(alwaysExpanded ? false : isCaseFolded(ticketId));

  $effect(() => {
    if (!folded && !alwaysExpanded) {
      return requestOpaqueChrome();
    }
  });

  let fieldsWrapEl = $state<HTMLElement>();

  const foldDrag = useFoldDrag({
    get folded() {
      return folded;
    },
    onsnap(shouldFold: boolean) {
      setCaseFolded(ticketId, shouldFold);
    },
    get wrapEl() {
      return fieldsWrapEl;
    },
  });

  function toggleFold(): void {
    if (foldDrag.consumeClick()) return;
    setCaseFolded(ticketId, !folded);
  }

  const fieldsId = $derived(`case-fields-${ticketId}`);
</script>

{#if !ticketQuery.isError}
  <header
    class="case-header"
    class:case-header--expanded={!folded}
    class:case-header--inline={alwaysExpanded}
  >
    <div class="title-row">
      <h2 class="case-title heading-display">
        {#if titleResult}
          <DecryptPlaceholder
            result={titleResult}
            ciphertext={ticket?.encryptedTitle}
            length={24}
          />
        {:else}
          <DecryptPlaceholder length={24} />
        {/if}
      </h2>
      <span class="title-stamps">
        {#if ticket?.priority}
          <PriorityStamp priority={ticket.priority} />
        {/if}
        {#if ticket?.status === "closed"}
          <span class="stamp-chip stamp-closed">{m.ticket_closed_stamp()}</span>
        {/if}
      </span>
      {#if headerActions}
        <span class="title-actions">
          {@render headerActions()}
        </span>
      {/if}
    </div>

    <div
      class="case-fields-wrap"
      class:case-fields-wrap--folded={folded}
      bind:this={fieldsWrapEl}
    >
      <dl class="fields" id={fieldsId}>
        {#if decryptedDescription}
          <div class="fld fld-desc">
            <dt>{m.ticket_field_description()}</dt>
            <dd>{decryptedDescription}</dd>
          </div>
        {/if}
        <div class="fld">
          <dt>{m.ticket_panel_queue(withTerms())}</dt>
          <dd>
            {#if !ticket}
              <InlineSkeleton width="12ch" />
            {:else}
              {#if queueAppearance}
                <QueueGlyph appearance={queueAppearance} size={13} />
              {/if}
              {queueName ?? "…"} ·
              {#if assignedIsSelf}<b class="meta-you">{m.ticket_meta_you()}</b
                >{:else}{assignedName ?? m.tickets_unassigned()}{/if}
            {/if}
          </dd>
        </div>
        <div class="fld">
          <dt>{m.ticket_panel_opened()}</dt>
          <dd>
            {#if !ticket}
              <InlineSkeleton width="6ch" />
            {:else}
              {formatRelativeTime(new Date(ticket.createdAt))}
            {/if}
          </dd>
        </div>
      </dl>
    </div>

    {#if !alwaysExpanded}
      <div
        class="case-handle"
        role="button"
        tabindex="0"
        aria-expanded={!folded}
        aria-controls={fieldsId}
        aria-label={folded
          ? m.ticket_case_details()
          : m.ticket_fold_case_details()}
        use:foldDrag.action
        onclick={toggleFold}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFold();
          }
        }}
      >
        <span class="case-handle-label">
          {folded ? m.ticket_case_details() : m.ticket_fold_case_details()}
        </span>
        <div class="case-handle-indicator" aria-hidden="true"></div>
      </div>
    {/if}
  </header>
{/if}

<style>
  /* No own backdrop-filter: the navbar chrome (enhanced or not) extends
     over the subnavbar area and provides the glass surface. Any
     backdrop-filter on this element creates a compositing layer whose
     top edge is visible as a seam. Downward-only shadow (negative spread)
     avoids upward bleed. */
  .case-header {
    padding: 10px 16px 0;
    padding-left: calc(16px + env(safe-area-inset-left, 0px));
    padding-right: calc(16px + env(safe-area-inset-right, 0px));
    border-radius: 0 0 1rem 1rem;
    border-top: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    border-left: 1px solid rgba(0, 0, 0, 0.08);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    background: transparent;
    box-shadow: 0 20px 36px -14px rgba(0, 0, 0, 0.08);
    transition: box-shadow 300ms ease;
  }

  :global(.dark) .case-header {
    border-bottom-color: rgba(255, 255, 255, 0.15);
    border-left-color: rgba(255, 255, 255, 0.1);
    border-right-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 36px -14px rgba(0, 0, 0, 0.4);
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
  }

  .case-title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.25;
    color: var(--ink);
  }

  .case-header:not(.case-header--expanded) .case-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .title-stamps {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
    padding-top: 0.1875rem;
  }

  .title-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .case-fields-wrap {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 10px;
    border-top: 1px solid var(--hair);
  }

  .case-fields-wrap--folded {
    grid-template-rows: 0fr;
    margin-top: 0;
    border-top-color: transparent;
  }

  .fields {
    overflow: hidden;
    min-height: 0;
  }

  .fld {
    display: grid;
    grid-template-columns: 118px 1fr;
    gap: 0.625rem;
    padding: 8px 0;
    border-bottom: 1px solid var(--hair);
    font-size: var(--text-base);
  }

  .fld dt {
    color: var(--muted);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding-top: 2px;
  }

  .fld dd {
    margin: 0;
    color: var(--ink-2);
    word-break: break-word;
  }

  .fld-desc dd {
    color: var(--ink);
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 30vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .meta-you {
    font-weight: 600;
  }

  .case-handle {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0 10px;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Tops the ~39px handle up to a 44px touch hit area. */
  .case-handle::after {
    content: "";
    position: absolute;
    inset: -3px 0;
  }

  .case-handle:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .case-handle-label {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .case-handle-indicator {
    width: 36px;
    height: 5px;
    border-radius: 2.5px;
    background: var(--muted, rgba(128, 128, 128, 0.4));
    opacity: 0.5;
  }

  .case-header--inline {
    border-radius: 0;
    border-top: none;
    border-bottom: none;
    border-left: none;
    border-right: none;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    padding: 20px 24px 0;
  }

  .case-header--inline .case-title {
    font-size: 1.5rem;
  }

  .case-header--inline .case-fields-wrap {
    border-top: 1px solid var(--hair);
    margin-top: 14px;
  }

  .case-header--inline .fld {
    grid-template-columns: 140px 1fr;
  }

  @media (prefers-reduced-motion: reduce) {
    .case-fields-wrap {
      transition: none;
    }

    .case-header {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    .case-header,
    .case-header--expanded {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: Canvas !important;
    }
  }
</style>
