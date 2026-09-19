<script lang="ts">
  import {
    auditEventLabel,
    summarizeAuditMetadata,
  } from "$lib/admin/audit-log-labels.js";
  import * as m from "$lib/paraglide/messages.js";
  import { List, ListItem } from "konsta/svelte";
  import { ScrollText } from "@lucide/svelte";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import {
    resolveOrgDecrypt,
    LOADING,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import LogListSection from "./LogListSection.svelte";

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

  function actorResult(row: AuditRow): DecryptResult {
    const ciphertext = actorNames.get(row.actorId) ?? null;
    if (ciphertext === null) return LOADING;
    const raw = orgCache.decrypt(`assignee:${row.actorId}`, ciphertext, {
      table: "users",
      id: row.actorId,
    });
    return resolveOrgDecrypt(raw, orgCache.isFailed(`assignee:${row.actorId}`));
  }

  function actorCiphertext(row: AuditRow): string | null {
    return actorNames.get(row.actorId) ?? null;
  }

  function hasActor(row: AuditRow): boolean {
    return actorNames.has(row.actorId);
  }
</script>

<LogListSection
  {isLoading}
  {isError}
  {error}
  hasData={rows.length > 0}
  {hasNextPage}
  {isFetchingNextPage}
  {onfetchnext}
  {onretry}
  emptyIcon={ScrollText}
  emptyTitle={m.logs_audit_empty_title()}
  emptySubtitle={m.logs_audit_empty_subtitle()}
  wrapperClass="audit-log-section"
>
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
</LogListSection>

<style>
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
</style>
