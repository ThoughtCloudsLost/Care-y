<script lang="ts">
  import { Pencil } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { formatShortDate } from "$lib/utils/time.js";

  interface ClientCardProps {
    /**
     * Present for symmetry with UserCard so the two cards share a signature.
     * Only "list" is implemented; grid can be added without changing callers.
     */
    readonly viewMode: "list" | "grid";
    readonly clientId: string;
    readonly alias: string;
    /** Already formatted by the server, full for admins and masked otherwise. */
    readonly phone: string;
    readonly ticketCount: number;
    /** ISO timestamp. */
    readonly createdAt: string;
    /** Non-null when this record was merged into another one. */
    readonly mergedInto: string | null;
    readonly onedit: (clientId: string) => void;
  }

  let {
    viewMode,
    clientId,
    alias,
    phone,
    ticketCount,
    createdAt,
    mergedInto,
    onedit,
  }: ClientCardProps = $props();

  const isList = $derived(viewMode === "list");
  const isMerged = $derived(mergedInto !== null);

  const createdLabel = $derived(formatShortDate(createdAt));

  // The message compiler has no plural support, so the caller picks the key.
  const ticketCountLabel = $derived(
    ticketCount === 1
      ? m.clients_ticket_count_one(withTerms({ count: ticketCount }))
      : m.clients_ticket_count_other(withTerms({ count: ticketCount })),
  );

  function handleEdit(): void {
    onedit(clientId);
  }
</script>

<!-- Pinned-anatomy exemption (see inkwell-design-language.md, "Pinned-anatomy
     exemptions"): ruled-row anatomy is pinned by the spec; Konsta ListItem
     fights the grid layout and token wiring. -->
<div class="client-card-wrap">
  <div class="client-card card-elevated">
    <div class="card-inner" class:card-inner--list={isList}>
      <!-- Alias + record-state row. Clients hold no account, so there is no
           identity seal and no role stamp here. -->
      <div class="content-group">
        <div class="alias-row">
          <span class="alias font-semibold">{alias}</span>
          {#if isMerged}
            <span class="merged-badge">{m.clients_merged_label()}</span>
          {/if}
        </div>
        <span class="meta">
          {ticketCountLabel}
          <span class="meta-dot" aria-hidden="true">·</span>
          {createdLabel}
        </span>
      </div>

      <!-- Phone sits in the right slot UserCard gives the role stamp, but a
           phone number is a records fact rather than identity, so it stays
           quiet ink instead of brand ink. -->
      <div class="phone-area">
        <span class="phone">{phone}</span>
      </div>

      <!-- The row itself is inert, matching UserCard. This button is the only
           way into the client, so it never shrinks with the content. -->
      <button
        class="edit-btn"
        onclick={handleEdit}
        onkeydown={onKeyActivate(handleEdit)}
        aria-label={m.client_edit_title(withTerms())}
        type="button"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
    </div>
  </div>
</div>

<style>
  .client-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* The card anatomy lives on .card-elevated (shared.css). */
  .client-card {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ── Card inner (base) ── */
  .card-inner {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
    text-align: left;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
  }

  /* ── Content ── */
  .content-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .alias-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 0;
  }

  .alias {
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* A merged record is a records fact, so it reads quiet like UserCard's
     inactive badge rather than carrying an alarm hue. */
  .merged-badge {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  .meta {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .meta-dot {
    margin: 0 0.25rem;
  }

  /* ── Phone ── */
  .phone-area {
    flex-shrink: 0;
  }

  .phone {
    font-size: var(--text-sm);
    color: var(--ink-2);
    white-space: nowrap;
  }

  /* ── Edit button (shares UserCard's anatomy) ── */
  .edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border-radius: 50%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--muted);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-reduced-motion: no-preference) {
    .edit-btn {
      transition: background-color 150ms linear;
    }
  }

  .edit-btn:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .edit-btn:active {
    background: color-mix(in srgb, var(--ink) 14%, transparent);
  }

  .edit-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  /* ══════════════════════════════════════════
     LIST MODE: horizontal row
     ══════════════════════════════════════════ */
  .card-inner--list {
    flex-direction: row;
    align-items: center;
  }
</style>
