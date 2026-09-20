<script lang="ts">
  import { Card } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { orgKeyKeys } from "$lib/query/keys.js";
  import { ShieldCheck, ShieldAlert, RotateCw, Download } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager, getCryptoBridge } from "$lib/crypto/context.js";
  import { resealSweep } from "$lib/crypto/reseal-sweep.svelte.js";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface KeyStatusProps {
    readonly onrotate: () => void;
    readonly onexport: () => void;
  }

  let { onrotate, onexport }: KeyStatusProps = $props();

  const orgKeyManager = getOrgKeyManager();
  const bridge = getCryptoBridge();
  const keysRouter = trpc.keys;

  const wrappedKeyQuery = createQuery(() => ({
    queryKey: orgKeyKeys.wrappedOrgKey(),
    queryFn: async () => keysRouter.getWrappedOrgKey.query(),
  }));

  const resealStatusQuery = createQuery(() => ({
    queryKey: orgKeyKeys.resealStatus(),
    queryFn: async () => keysRouter.resealStatus.query(),
  }));

  const hasServerKey = $derived(
    wrappedKeyQuery.data !== undefined && wrappedKeyQuery.data !== null,
  );
  const clientLoaded = $derived(orgKeyManager.isLoaded);
  const isOk = $derived(hasServerKey && clientLoaded);

  const pendingCount = $derived.by(() => {
    // While the sweep is running, prefer live store numbers
    if (resealSweep.running) return resealSweep.total - resealSweep.done;
    const data = resealStatusQuery.data;
    if (data == null) return 0;
    let sum = 0;
    for (const t of data.tables) sum += t.pending;
    for (const t of data.indexTables) sum += t.pending;
    return sum;
  });
</script>

<Card raised contentWrap={false} class="key-status-card">
  <div class="key-status-inner">
    <!-- Status row -->
    <div class="status-row">
      <div class="status-icon" class:ok={isOk} class:status-attention={!isOk}>
        {#if isOk}
          <ShieldCheck size={24} aria-hidden="true" />
        {:else}
          <ShieldAlert size={24} aria-hidden="true" />
        {/if}
      </div>
      <p class="status-label">
        {isOk ? m.admin_keys_org_key_loaded() : m.admin_keys_org_key_missing()}
      </p>
    </div>

    <!-- Explainer -->
    <p class="explainer">
      {m.admin_keys_explainer()}
    </p>

    <p class="explainer">
      {m.admin_rotation_dialog_why()}
    </p>

    <!-- Reseal sentinel -->
    <div class="reseal-sentinel" data-testid="reseal-sentinel">
      {#if resealSweep.running}
        <p class="explainer">
          {m.admin_rotation_resealing({
            done: String(resealSweep.done),
            total: String(resealSweep.total),
          })}
        </p>
      {:else if pendingCount === 0}
        <p class="explainer">{m.admin_keys_reseal_ok()}</p>
      {:else}
        <p class="explainer">
          {m.admin_keys_reseal_pending({ count: String(pendingCount) })}
        </p>
        <SoftButton onclick={() => void resealSweep.checkAndResume(bridge)}>
          {m.admin_keys_reseal_resume()}
        </SoftButton>
      {/if}
    </div>

    <!-- Actions -->
    <div class="key-actions">
      <SoftButton onclick={onrotate}>
        <RotateCw size={18} aria-hidden="true" />
        {m.admin_keys_rotate_button()}
      </SoftButton>
      <SoftButton onclick={onexport}>
        <Download size={18} aria-hidden="true" />
        {m.admin_keys_export_button()}
      </SoftButton>
    </div>
  </div>
</Card>

<style>
  :global(.key-status-card) {
    margin: 0 !important;
  }

  .key-status-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .status-label {
    font-weight: 600;
    font-size: var(--text-base);
  }

  .explainer {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .reseal-sentinel {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .key-actions {
    display: flex;
    gap: var(--space-sm);
    padding-top: var(--space-xs);
  }

  .key-actions :global(.soft-btn) {
    flex: 1;
  }
</style>
