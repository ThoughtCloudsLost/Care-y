<script lang="ts">
  import { Card, Preloader } from "konsta/svelte";
  import { Link2, X, Copy } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  interface InvitePendingCardProps {
    readonly id: string;
    readonly roleLabel: string;
    readonly inviterName: string | null;
    readonly expiresAt: string;
    readonly encryptedToken: string | null;
    readonly revoking?: boolean;
    readonly onrevoke: (tokenId: string) => void;
    readonly oncopy?: (url: string) => void;
  }

  let {
    id,
    roleLabel,
    inviterName,
    expiresAt,
    encryptedToken,
    revoking = false,
    onrevoke,
    oncopy,
  }: InvitePendingCardProps = $props();

  const orgCache = getOrgDecryptCache();

  const decryptedToken = $derived(
    encryptedToken !== null
      ? orgCache.decrypt(`invite:${id}`, encryptedToken)
      : null,
  );

  const inviteUrl = $derived(
    decryptedToken !== null ? `/first-login/${decryptedToken}` : null,
  );

  function handleCopy(e: MouseEvent): void {
    e.stopPropagation();
    if (inviteUrl !== null && oncopy) {
      oncopy(`${window.location.origin}${inviteUrl}`);
    }
  }

  const inviterLabel = $derived(
    inviterName !== null && inviterName.length > 0
      ? m.admin_invite_pending_invited_by({ name: inviterName })
      : m.admin_invite_pending_invited_by_unknown(),
  );

  const expiryLabel = $derived.by(() => {
    const expiresMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    const diffMs = expiresMs - nowMs;

    if (diffMs <= 0) return m.admin_invite_pending_expired();

    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffHours / 24);

    let relative: string;
    if (diffDays > 0) {
      relative = `${String(diffDays)}d`;
    } else if (diffHours > 0) {
      relative = `${String(diffHours)}h`;
    } else {
      const diffMins = Math.max(1, Math.floor(diffMs / 60_000));
      relative = `${String(diffMins)}m`;
    }

    return m.admin_invite_pending_expires_in({ time: relative });
  });

  function handleRevoke(e: MouseEvent): void {
    e.stopPropagation();
    onrevoke(id);
  }
</script>

<div class="invite-card-wrap">
  <Card raised contentWrap={false} class="invite-card">
    <div class="card-inner">
      <div class="avatar-pending">
        <Link2 size={18} aria-hidden="true" />
      </div>

      <div class="content-group">
        <div class="name-row">
          <span class="pending-label">{inviterLabel}</span>
        </div>
        <span class="expiry-label">{expiryLabel}</span>
        {#if inviteUrl !== null}
          <span class="invite-url">{window.location.origin}{inviteUrl}</span>
        {/if}
      </div>

      <div class="action-area">
        <span class="stamp-chip role-stamp">{roleLabel}</span>
        <div class="action-buttons">
          {#if inviteUrl !== null && oncopy}
            <button
              class="copy-btn"
              onclick={handleCopy}
              aria-label={m.admin_invite_link_copy()}
              type="button"
            >
              <Copy size={14} aria-hidden="true" />
            </button>
          {/if}
          <button
            class="revoke-btn"
            onclick={handleRevoke}
            onkeydown={onKeyActivate(() => onrevoke(id))}
            aria-label={m.admin_invite_pending_revoke()}
            type="button"
            disabled={revoking}
          >
            {#if revoking}
              <Preloader class="w-4 h-4" />
            {:else}
              <X size={16} aria-hidden="true" />
            {/if}
          </button>
        </div>
      </div>
    </div>
  </Card>
</div>

<style>
  .invite-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .invite-card-wrap :global(.k-card) {
    margin: 0 !important;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1.5px dashed color-mix(in srgb, var(--ink) 20%, transparent);
    background: color-mix(in srgb, var(--ink) 2%, transparent);
  }

  .card-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
    text-align: left;
    width: 100%;
  }

  .avatar-pending {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--brand-accent) 12%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--brand-accent);
    opacity: 0.7;
  }

  .content-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 0;
  }

  .pending-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .expiry-label {
    font-size: var(--text-xs);
    color: var(--muted);
    opacity: 0.7;
  }

  .invite-url {
    font-family: var(--theme-font-mono);
    font-size: var(--text-xs);
    color: var(--muted);
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .action-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-xs, 4px);
    flex-shrink: 0;
  }

  .action-buttons {
    display: flex;
    gap: 2px;
  }

  /* The role is who the invitee will be: stamp anatomy in brand ink. */
  .role-stamp {
    color: var(--brand-text, var(--brand-primary));
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--brand-text);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.7;
  }

  .copy-btn:hover {
    background: color-mix(in srgb, var(--brand-text) 10%, transparent);
    opacity: 1;
  }

  .copy-btn:active {
    background: color-mix(in srgb, var(--brand-text) 18%, transparent);
  }

  .copy-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .revoke-btn {
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
    color: var(--danger, var(--color-red-500));
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.7;
  }

  @media (prefers-reduced-motion: no-preference) {
    .revoke-btn {
      transition: background-color 150ms linear;
    }
  }

  .revoke-btn:hover {
    background: color-mix(
      in srgb,
      var(--danger, var(--color-red-500)) 10%,
      transparent
    );
    opacity: 1;
  }

  .revoke-btn:active {
    background: color-mix(
      in srgb,
      var(--danger, var(--color-red-500)) 18%,
      transparent
    );
  }

  .revoke-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .revoke-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
</style>
