<!--
  Case header for the ticket detail: the Fraunces case title, judgment
  stamps, and a field list (description first, then queue/assignee and
  opened time), pinned between the chrome and the scrolling thread.

  This is a CONTENT component: no shell imports. It is self-contained
  like TicketPanelContent: reads the ticket from TanStack Query cache
  (same key as the orchestrator, deduplicated) and decrypts through the
  context caches. The dl is the future per-org custom-fields socket.

  The header owns the scroll-under-glass offset (negative navbar and
  subnavbar margin) that the chat container used to carry; in the
  desktop split pane the chrome vars fall back to 0px and the offset
  degrades to nothing.

  Fold state is per ticket and session-only (in-memory module map,
  never persisted, never transmitted).
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
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

  interface Props {
    ticketId: string;
  }

  let { ticketId }: Props = $props();

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

  const folded = $derived(isCaseFolded(ticketId));

  function toggleFold(): void {
    setCaseFolded(ticketId, !folded);
  }

  const fieldsId = $derived(`case-fields-${ticketId}`);
</script>

{#if !ticketQuery.isError}
  <header class="case-header">
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
          <!-- Shared judgment-stamp anatomy in its quiet-ink default:
               closed is a records fact, so it stamps without a semantic
               hue. Ink, not red. -->
          <span class="stamp-chip stamp-closed">{m.ticket_closed_stamp()}</span>
        {/if}
      </span>
    </div>

    {#if !folded}
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
    {/if}

    <div class="foldup">
      <button
        type="button"
        aria-expanded={!folded}
        aria-controls={fieldsId}
        onclick={toggleFold}
      >
        {folded ? m.ticket_case_details() : m.ticket_fold_case_details()}
      </button>
    </div>
  </header>
{/if}

<style>
  /* The header owns the scroll-under-glass offset: it tucks under the
     translucent navbar and pads its content back below the chrome. */
  .case-header {
    flex-shrink: 0;
    padding: 14px 16px 4px;
    padding-left: calc(16px + env(safe-area-inset-left, 0px));
    padding-right: calc(16px + env(safe-area-inset-right, 0px));
    margin-top: calc(-1 * (var(--navbar-h, 0px) + var(--subnavbar-h, 0px)));
    padding-top: calc(14px + var(--navbar-h, 0px) + var(--subnavbar-h, 0px));
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
    text-wrap: balance;
    color: var(--ink);
  }

  .title-stamps {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
    padding-top: 0.1875rem;
  }

  .fields {
    margin: 10px 0 0;
    border-top: 1px solid var(--hair);
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
  }

  .meta-you {
    font-weight: 600;
  }

  .foldup {
    display: flex;
    justify-content: center;
    padding: 7px 0 0;
  }

  .foldup button {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
</style>
