<script lang="ts">
  import { tick } from "svelte";
  import { Card, Toggle, DialogButton } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { adminKeys } from "$lib/query/keys.js";
  import { Save } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  const authRouter = trpc.auth;
  const queryClient = useQueryClient();

  const hubStatusQuery = createQuery(() => ({
    queryKey: adminKeys.hubStatus(),
    queryFn: async () => authRouter.hubStatus.query(),
    staleTime: 60_000,
  }));

  const serverDays = $derived(hubStatusQuery.data?.retentionDays ?? null);

  let enabled = $state(false);
  let daysInput = $state("");
  let initialized = $state(false);

  $effect(() => {
    if (hubStatusQuery.data && !initialized) {
      const days = hubStatusQuery.data.retentionDays;
      enabled = days !== null;
      daysInput = days !== null ? String(days) : "";
      initialized = true;
    }
  });

  const parsedDays = $derived.by(() => {
    const n = parseInt(daysInput, 10);
    if (Number.isNaN(n) || n < 1 || n > 3650) return null;
    return n;
  });

  const hasChanges = $derived(
    enabled && parsedDays !== null && parsedDays !== serverDays,
  );

  const setRetentionMutation = createMutation(() => ({
    mutationFn: async (days: number | null) =>
      authRouter.setPiiRetention.mutate({ days }),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: adminKeys.hubStatus() });
      toastStore.show(m.admin_retention_saved());
      announceToLiveRegion("polite", m.admin_retention_saved());
    },
    onError: () => {
      toastStore.show(m.admin_retention_error());
    },
  }));

  // ── Confirmation dialogs ──

  let setDialogOpened = $state(false);
  let clearDialogOpened = $state(false);

  function handleSave(): void {
    if (!hasChanges || parsedDays === null) return;
    setDialogOpened = true;
  }

  function confirmSet(): void {
    setDialogOpened = false;
    if (parsedDays !== null) {
      setRetentionMutation.mutate(parsedDays);
    }
  }

  function confirmClear(): void {
    clearDialogOpened = false;
    enabled = false;
    daysInput = "";
    setRetentionMutation.mutate(null);
  }

  function cancelClear(): void {
    clearDialogOpened = false;
    enabled = true;
  }

  const DEFAULT_RETENTION_DAYS = 365;

  let daysInputEl = $state<HTMLInputElement | null>(null);

  async function handleToggle(): Promise<void> {
    if (enabled) {
      enabled = false;
      clearDialogOpened = true;
    } else {
      enabled = true;
      if (daysInput === "") {
        daysInput = String(DEFAULT_RETENTION_DAYS);
      }
      await tick();
      daysInputEl?.focus();
      daysInputEl?.select();
    }
  }
</script>

<div class="retention-section">
  {#if hubStatusQuery.isLoading}
    <Card raised contentWrap={false} class="retention-card">
      <div class="retention-inner">
        <div class="toggle-row">
          <span class="toggle-label">{m.admin_retention_toggle_label()}</span>
          <Toggle disabled />
        </div>
      </div>
    </Card>
  {:else if hubStatusQuery.isError}
    <QueryError
      error={hubStatusQuery.error}
      onretry={() => void hubStatusQuery.refetch()}
    />
  {:else}
    <Card raised contentWrap={false} class="retention-card">
      <div class="retention-inner">
        <div class="toggle-row">
          <span class="toggle-label">{m.admin_retention_toggle_label()}</span>
          <Toggle checked={enabled} onchange={handleToggle} />
        </div>

        <p class="explainer">
          {serverDays !== null
            ? m.admin_retention_active_description({ days: serverDays })
            : m.admin_retention_inactive_description()}
        </p>

        <div class="input-row">
          <label class="days-label" for="retention-days">
            {m.admin_retention_days_label()}
          </label>
          <input
            bind:this={daysInputEl}
            id="retention-days"
            type="number"
            inputmode="numeric"
            min={1}
            max={3650}
            disabled={!enabled}
            placeholder={m.admin_retention_days_placeholder()}
            value={daysInput}
            oninput={(e: Event) => {
              const target = e.target;
              if (target instanceof HTMLInputElement) {
                daysInput = target.value;
              }
            }}
            class="days-input"
          />
          <span class="range-hint">{m.admin_retention_range_hint()}</span>
        </div>

        {#if hasChanges}
          <div class="unsaved-hint" role="status">
            {m.admin_retention_unsaved_hint()}
          </div>
          <div class="retention-actions">
            <SoftButton
              onclick={handleSave}
              disabled={setRetentionMutation.isPending}
              full
            >
              <Save size={18} aria-hidden="true" />
              {m.admin_retention_confirm()}
            </SoftButton>
          </div>
        {/if}
      </div>
    </Card>
  {/if}
</div>

<ShellDialog
  opened={setDialogOpened}
  ondismiss={() => (setDialogOpened = false)}
  title={parsedDays !== null
    ? m.admin_retention_set_title({ days: parsedDays })
    : ""}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {#if parsedDays !== null}
        {m.admin_retention_set_body({ days: parsedDays })}
      {/if}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (setDialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class="text-[--color-red-500] font-semibold"
      onclick={confirmSet}
    >
      {m.admin_retention_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<ShellDialog
  opened={clearDialogOpened}
  ondismiss={cancelClear}
  title={m.admin_retention_clear_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_retention_clear_body()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={cancelClear}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={confirmClear}>
      {m.admin_retention_disable()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .retention-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.retention-card) {
    margin: 0 !important;
  }

  .retention-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .explainer {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .toggle-label {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .input-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .days-label {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .days-input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    background: transparent;
    color: var(--ink);
    font-size: 16px;
    font-family: inherit;
  }

  .days-input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .days-input:focus {
    outline: 2px solid var(--brand-text);
    outline-offset: -1px;
    border-color: transparent;
  }

  .range-hint {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .unsaved-hint {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-amber-500);
  }

  .retention-actions {
    padding-top: var(--space-xs);
  }
</style>
