<script lang="ts">
  import { List, ListItem, Preloader } from "konsta/svelte";
  import {
    PhoneIncoming,
    PhoneOutgoing,
    Voicemail,
    PhoneCall,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { resolveOrgDecrypt } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatDuration } from "$lib/utils/time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface CallLogRow {
    readonly id: string;
    readonly type: string;
    readonly source: string;
    readonly callStatus: string | null;
    readonly callDurationSeconds: number | null;
    readonly createdAt: string;
    readonly ticketId: string;
    readonly clientId: string;
    readonly encryptedClientAlias: string;
  }

  interface CallLogSectionProps {
    readonly rows: readonly CallLogRow[];
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
    isLoading = false,
    isError = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    onfetchnext,
    onretry,
    onticketopen,
  }: CallLogSectionProps = $props();

  // ---------------------------------------------------------------------------
  // Org-tier decrypt
  // ---------------------------------------------------------------------------

  const orgCache = getOrgDecryptCache();

  function aliasResult(row: CallLogRow) {
    const raw = orgCache.decrypt(
      `client-alias:${row.clientId}`,
      row.encryptedClientAlias,
    );
    return resolveOrgDecrypt(
      raw,
      orgCache.isFailed(`client-alias:${row.clientId}`),
    );
  }

  // ---------------------------------------------------------------------------
  // Display helpers
  // ---------------------------------------------------------------------------

  function directionLabel(row: CallLogRow): string {
    if (row.type === "voicemail") return m.logs_type_voicemail();
    return row.source === "client"
      ? m.logs_direction_inbound()
      : m.logs_direction_outbound();
  }

  function statusLabel(status: string | null): string | null {
    if (status === null) return null;
    const map = new Map<string, () => string>([
      ["completed", m.logs_call_status_completed],
      ["no_answer", m.logs_call_status_no_answer],
      ["busy", m.logs_call_status_busy],
      ["failed", m.logs_call_status_failed],
      ["canceled", m.logs_call_status_canceled],
    ]);
    const fn = map.get(status);
    return fn !== undefined ? fn() : status;
  }
</script>

<div class="call-log-section pb-20">
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
      icon={PhoneCall}
      title={m.logs_calls_empty_title()}
      subtitle={m.logs_calls_empty_subtitle()}
    />
  {:else}
    <List>
      {#each rows as row (row.id)}
        <ListItem
          class="touch-feedback"
          onclick={() => onticketopen(row.ticketId)}
          onkeydown={onKeyActivate(() => onticketopen(row.ticketId))}
          role="button"
          tabindex={0}
        >
          {#snippet media()}
            <span class="row-glyph" aria-hidden="true">
              {#if row.type === "voicemail"}
                <Voicemail size={18} />
              {:else if row.source === "client"}
                <PhoneIncoming size={18} />
              {:else}
                <PhoneOutgoing size={18} />
              {/if}
            </span>
          {/snippet}
          {#snippet title()}
            <DecryptPlaceholder
              result={aliasResult(row)}
              ciphertext={row.encryptedClientAlias}
            />
          {/snippet}
          {#snippet after()}
            <span class="row-time">
              {formatRelativeTime(new Date(row.createdAt))}
            </span>
          {/snippet}
          {#snippet subtitle()}
            <span class="row-meta">
              {directionLabel(row)}
              {#if statusLabel(row.callStatus) !== null}
                <span class="meta-sep" aria-hidden="true">·</span>{statusLabel(
                  row.callStatus,
                )}
              {/if}
              {#if row.callDurationSeconds !== null}
                <span class="meta-sep" aria-hidden="true">·</span
                >{formatDuration(row.callDurationSeconds)}
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
  .call-log-section {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .row-glyph {
    color: var(--muted);
    display: flex;
    align-items: center;
  }

  .row-time {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .row-meta {
    color: var(--muted);
    font-size: var(--text-xs);
  }

  .meta-sep {
    margin: 0 0.25em;
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }
</style>
