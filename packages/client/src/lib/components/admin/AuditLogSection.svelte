<script lang="ts">
  import {
    auditEventLabel,
    summarizeAuditMetadata,
  } from "$lib/admin/audit-log-labels.js";
  import * as m from "$lib/paraglide/messages.js";
  import { List, ListItem, Preloader } from "konsta/svelte";
  import { ScrollText } from "@lucide/svelte";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    resolveOrgDecrypt,
    LOADING,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface AuditRow {
    readonly id: string;
    readonly eventType: string;
    readonly actorId: string;
    readonly ticketId: string | null;
    readonly metadata: Record<string, unknown>;
    readonly createdAt: string;
  }

  interface AuditLogSectionProps {
    readonly rows: readonly AuditRow[];
    /** id -> encryptedDisplayName (base64url) from tickets.listVolunteers */
    readonly actorNames: ReadonlyMap<string, string>;
    readonly isLoading?: boolean;
    readonly isError?: boolean;
    readonly error?: unknown;
    readonly hasNextPage?: boolean;
    readonly isFetchingNextPage?: boolean;
    readonly onfetchnext: () => void;
    readonly onretry: () => void;
    readonly onticketopen: (ticketId: string) => void;
  }

  let {
    rows,
    actorNames,
    isLoading = false,
    isError = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    onfetchnext,
    onretry,
    onticketopen,
  }: AuditLogSectionProps = $props();

  // ---------------------------------------------------------------------------
  // Org-tier decrypt
  // ---------------------------------------------------------------------------

  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  function actorResult(row: AuditRow): DecryptResult {
    const ciphertext = actorNames.get(row.actorId) ?? null;
    if (ciphertext === null) return LOADING;
    const raw = orgCache.decrypt(`assignee:${row.actorId}`, ciphertext);
    return resolveOrgDecrypt(
      raw,
      orgKeyManager.isLoaded,
      orgCache.isFailed(`assignee:${row.actorId}`),
    );
  }

  function actorCiphertext(row: AuditRow): string | null {
    return actorNames.get(row.actorId) ?? null;
  }

  function hasActor(row: AuditRow): boolean {
    return actorNames.has(row.actorId);
  }
</script>

<div class="audit-log-section pb-20">
  {#if isLoading}
    <List>
      {#each { length: 3 } as _, i (i)}
        <ListItem>
          {#snippet title()}
            <InlineSkeleton width="14ch" />
          {/snippet}
          {#snippet after()}
            <InlineSkeleton width="8ch" />
          {/snippet}
          {#snippet subtitle()}
            <InlineSkeleton width="20ch" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if isError}
    <QueryError {error} {onretry} />
  {:else if rows.length === 0}
    <EmptyState
      icon={ScrollText}
      title={m.logs_audit_empty_title()}
      subtitle={m.logs_audit_empty_subtitle()}
    />
  {:else}
    <List>
      {#each rows as row (row.id)}
        {@const ticketId = row.ticketId}
        {@const isActivatable = ticketId !== null}
        {@const summary = summarizeAuditMetadata(row.eventType, row.metadata)}
        <ListItem
          class={isActivatable ? "touch-feedback" : ""}
          onclick={isActivatable ? () => onticketopen(ticketId) : undefined}
          onkeydown={isActivatable
            ? onKeyActivate(() => onticketopen(ticketId))
            : undefined}
          role={isActivatable ? "button" : undefined}
          tabindex={isActivatable ? 0 : undefined}
        >
          {#snippet title()}
            <span class="event-label">{auditEventLabel(row.eventType)}</span>
          {/snippet}
          {#snippet after()}
            <span class="row-time">
              {formatRelativeTime(new Date(row.createdAt))}
            </span>
          {/snippet}
          {#snippet subtitle()}
            <span class="row-meta">
              {#if hasActor(row)}
                <DecryptPlaceholder
                  result={actorResult(row)}
                  ciphertext={actorCiphertext(row)}
                />
              {:else}
                <span class="actor-placeholder">-</span>
              {/if}
              {#if summary !== null}
                <span class="meta-sep" aria-hidden="true">·</span><span
                  class="summary-text">{summary}</span
                >
              {/if}
            </span>
          {/snippet}
        </ListItem>
      {/each}
    </List>
    {#if hasNextPage}
      <div class="load-more">
        <SoftButton onclick={onfetchnext} disabled={isFetchingNextPage}>
          {#if isFetchingNextPage}
            <Preloader class="w-4 h-4" />
          {:else}
            {m.logs_load_more()}
          {/if}
        </SoftButton>
      </div>
    {/if}
  {/if}
</div>

<style>
  .audit-log-section {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .event-label {
    font-size: var(--text-sm);
  }

  .row-time {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .row-meta {
    color: var(--muted);
    font-size: var(--text-xs);
    display: inline-flex;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
  }

  .meta-sep {
    margin: 0 0.25em;
  }

  .summary-text {
    color: var(--muted);
  }

  .actor-placeholder {
    color: var(--muted);
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }
</style>
