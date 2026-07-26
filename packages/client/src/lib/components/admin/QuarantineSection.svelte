<!--
  Admin quarantine list for voicemails that could not be auto-routed.
  Patterned on BlocklistSection: createQuery + requireRouter, QueryError,
  empty state, encrypted number display via OrgDecryptCache.
-->
<script lang="ts">
  import { DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Play, Route, Trash2 } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import QuarantinePlayer from "./QuarantinePlayer.svelte";
  import QuarantineRouteSheet from "./QuarantineRouteSheet.svelte";

  const vqRouter = requireRouter(
    trpc.voicemailQuarantine,
    "voicemailQuarantine",
  );

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  // ── Query ──

  const quarantineQuery = createQuery(() => ({
    queryKey: adminKeys.quarantine(),
    queryFn: async () => vqRouter.list.query({ status: "pending", limit: 50 }),
  }));

  type QuarantineRow = NonNullable<typeof quarantineQuery.data>[number];

  function reasonLabel(reason: string): string {
    switch (reason) {
      case "tracker_miss":
        return m.admin_quarantine_reason_tracker_miss();
      case "no_intake_queue":
        return m.admin_quarantine_reason_no_intake_queue();
      case "unresolved_client":
        return m.admin_quarantine_reason_unresolved_client();
      default:
        return reason;
    }
  }

  function decryptNumber(
    id: string,
    prefix: string,
    encryptedBase64: string | null,
  ): string | null {
    if (encryptedBase64 === null) return null;
    const bytes = base64ToUint8Array(encryptedBase64);
    return orgCache.decrypt(`vq:${prefix}:${id}`, bytes);
  }

  // ── Player state ──

  let activePlayerId = $state<string | null>(null);
  let activePlayerSealedBase64 = $state<string | null>(null);
  let activePlayerDuration = $state<number | null>(null);
  let playerFetchingId = $state<string | null>(null);
  let unsealedAudioCache = $state(new Map<string, Uint8Array>());

  async function handlePlay(row: QuarantineRow): Promise<void> {
    if (playerFetchingId !== null) return;

    if (activePlayerId === row.id) {
      activePlayerId = null;
      activePlayerSealedBase64 = null;
      return;
    }

    playerFetchingId = row.id;
    try {
      const result = await vqRouter.download.query({
        quarantineId: row.id,
      });
      activePlayerId = row.id;
      activePlayerSealedBase64 = result.sealedBase64;
      activePlayerDuration = result.durationSeconds;

      // Pre-unseal for route reuse
      if (!unsealedAudioCache.has(row.id)) {
        try {
          const sealed = base64ToUint8Array(result.sealedBase64);
          const unsealed = await orgKeyManager.decrypt(sealed);
          unsealedAudioCache.set(row.id, unsealed);
        } catch {
          // Unseal failure is non-fatal for play; player handles its own decrypt
        }
      }
    } catch {
      toastStore.show(m.admin_quarantine_player_error());
    } finally {
      playerFetchingId = null;
    }
  }

  // ── Route sheet ──

  let routeTarget = $state<QuarantineRow | null>(null);
  let routeSheetOpen = $state(false);
  let routeFetchingId = $state<string | null>(null);

  async function startRoute(row: QuarantineRow): Promise<void> {
    if (routeFetchingId !== null) return;

    // If we already have unsealed audio, open the sheet immediately
    if (unsealedAudioCache.has(row.id)) {
      routeTarget = row;
      routeSheetOpen = true;
      return;
    }

    // Otherwise fetch + unseal first
    routeFetchingId = row.id;
    try {
      const result = await vqRouter.download.query({
        quarantineId: row.id,
      });
      const sealed = base64ToUint8Array(result.sealedBase64);
      const unsealed = await orgKeyManager.decrypt(sealed);
      unsealedAudioCache.set(row.id, unsealed);
      routeTarget = row;
      routeSheetOpen = true;
    } catch {
      toastStore.show(m.admin_quarantine_player_error());
    } finally {
      routeFetchingId = null;
    }
  }

  function handleRouteSuccess(): void {
    routeSheetOpen = false;
    if (routeTarget) {
      unsealedAudioCache.delete(routeTarget.id);
    }
    routeTarget = null;
    activePlayerId = null;
    activePlayerSealedBase64 = null;
  }

  // ── Dismiss confirmation ──

  let dismissTarget = $state<QuarantineRow | null>(null);
  let dismissDialogOpen = $state(false);

  const dismissMutation = createMutation(() => ({
    mutationFn: async (quarantineId: string) =>
      vqRouter.dismiss.mutate({ quarantineId }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_quarantine_dismiss_success());
      announceToLiveRegion("polite", m.admin_quarantine_dismiss_success());
      dismissDialogOpen = false;
      const dismissedId = dismissTarget?.id;
      if (dismissTarget) {
        unsealedAudioCache.delete(dismissTarget.id);
      }
      dismissTarget = null;
      if (dismissedId !== undefined && activePlayerId === dismissedId) {
        activePlayerId = null;
        activePlayerSealedBase64 = null;
      }
      void queryClient.invalidateQueries({
        queryKey: adminKeys.quarantine(),
      });
    },
    onError: () => {
      toastStore.show(m.admin_quarantine_dismiss_error());
    },
  }));

  function startDismiss(row: QuarantineRow): void {
    dismissTarget = row;
    dismissDialogOpen = true;
  }

  function confirmDismiss(): void {
    if (!dismissTarget || dismissMutation.isPending) return;
    dismissMutation.mutate(dismissTarget.id);
  }
</script>

<div class="quarantine-section">
  {#if quarantineQuery.isLoading}
    <div class="vq-content skeleton-pulse">
      <div class="vq-surface card-elevated">
        {#each { length: 3 } as _, i (i)}
          <div class="vq-row">
            <div class="vq-info">
              <DecryptPlaceholder content={null} length={14} />
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if quarantineQuery.isError}
    <QueryError
      error={quarantineQuery.error}
      onretry={() => void quarantineQuery.refetch()}
    />
  {:else if (quarantineQuery.data ?? []).length === 0}
    <div class="vq-content">
      <p class="vq-empty">{m.admin_quarantine_empty()}</p>
    </div>
  {:else}
    <div class="vq-content">
      <div class="vq-surface card-elevated">
        {#each quarantineQuery.data ?? [] as row (row.id)}
          {@const callerNum = decryptNumber(
            row.id,
            "caller",
            row.encryptedCallerNumber,
          )}
          {@const calledNum = decryptNumber(
            row.id,
            "called",
            row.encryptedCalledNumber,
          )}
          <div class="vq-row">
            <div class="vq-info">
              <div class="vq-numbers">
                {#if row.encryptedCallerNumber !== null}
                  <span class="vq-number-label"
                    >{m.admin_quarantine_caller()}:</span
                  >
                  <span class="vq-number">
                    <DecryptPlaceholder content={callerNum} length={14} />
                  </span>
                {/if}
                {#if row.encryptedCalledNumber !== null}
                  <span class="vq-number-label"
                    >{m.admin_quarantine_called()}:</span
                  >
                  <span class="vq-number">
                    <DecryptPlaceholder content={calledNum} length={14} />
                  </span>
                {/if}
              </div>
              <div class="vq-meta">
                <span class="vq-reason">{reasonLabel(row.reason)}</span>
                <span class="vq-time">
                  {formatRelativeTime(new Date(row.createdAt))}
                </span>
              </div>
            </div>

            <div class="vq-actions">
              <button
                type="button"
                class="vq-action-btn touch-feedback"
                aria-label={m.admin_quarantine_play()}
                disabled={playerFetchingId !== null}
                onclick={() => void handlePlay(row)}
              >
                <Play size={16} />
              </button>
              <button
                type="button"
                class="vq-action-btn touch-feedback"
                aria-label={m.admin_quarantine_route()}
                disabled={routeFetchingId !== null}
                onclick={() => void startRoute(row)}
              >
                <Route size={16} />
              </button>
              <button
                type="button"
                class="vq-action-btn vq-action-destructive touch-feedback"
                aria-label={m.admin_quarantine_dismiss()}
                onclick={() => startDismiss(row)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {#if activePlayerId === row.id && activePlayerSealedBase64}
            <div class="vq-player-row">
              <QuarantinePlayer
                sealedBase64={activePlayerSealedBase64}
                durationSeconds={activePlayerDuration}
              />
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Route Sheet -->
{#if routeTarget}
  <QuarantineRouteSheet
    opened={routeSheetOpen}
    quarantineId={routeTarget.id}
    durationSeconds={routeTarget.durationSeconds}
    unsealedAudio={unsealedAudioCache.get(routeTarget.id) ?? null}
    ondismiss={() => {
      routeSheetOpen = false;
      routeTarget = null;
    }}
    onsuccess={handleRouteSuccess}
  />
{/if}

<!-- Dismiss Confirmation Dialog -->
<ShellDialog
  opened={dismissDialogOpen}
  ondismiss={() => {
    dismissDialogOpen = false;
    dismissTarget = null;
  }}
  title={m.admin_quarantine_dismiss_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_quarantine_dismiss_confirm()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        dismissDialogOpen = false;
        dismissTarget = null;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      disabled={dismissMutation.isPending}
      onclick={confirmDismiss}
    >
      {m.admin_quarantine_dismiss()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .quarantine-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0.25rem 0 0;
  }

  .vq-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  .vq-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
    padding: var(--space-lg) 0;
  }

  .vq-surface {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .vq-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--hair, var(--divider));
  }

  .vq-row:last-child {
    border-bottom: none;
  }

  .vq-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .vq-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
    font-size: var(--text-base);
    color: var(--ink);
  }

  .vq-number-label {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .vq-number {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  .vq-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .vq-reason {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 500;
  }

  .vq-time {
    font-size: var(--text-xs);
    color: var(--muted);
    opacity: 0.7;
  }

  .vq-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .vq-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    background: transparent;
    color: var(--brand-text, var(--k-color-primary, #007aff));
    border-radius: 50%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .vq-action-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .vq-action-destructive {
    color: var(--danger, var(--color-red-500));
  }

  .vq-player-row {
    padding: 0 var(--page-pad-x) var(--space-md);
    border-bottom: 1px solid var(--hair, var(--divider));
  }
</style>
