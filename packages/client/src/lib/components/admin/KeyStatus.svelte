<script lang="ts">
  import { Button, Card } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { ShieldCheck, ShieldAlert, RotateCw } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";

  interface KeyStatusProps {
    readonly onrotate: () => void;
  }

  let { onrotate }: KeyStatusProps = $props();

  const orgKeyManager = getOrgKeyManager();
  const keysRouter = trpc.keys;

  const wrappedKeyQuery = createQuery(() => ({
    queryKey: ["keys", "wrappedOrgKey"],
    queryFn: async () => keysRouter.getWrappedOrgKey.query(),
  }));

  const hasServerKey = $derived(
    wrappedKeyQuery.data !== undefined && wrappedKeyQuery.data !== null,
  );
  const clientLoaded = $derived(orgKeyManager.isLoaded);
  const isOk = $derived(hasServerKey && clientLoaded);
</script>

<Card raised contentWrap={false} class="key-status-card">
  <div class="key-status-inner">
    <!-- Status row -->
    <div class="status-row">
      <div class="status-icon" class:ok={isOk} class:missing={!isOk}>
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

    <!-- Actions -->
    <div class="key-actions">
      <Button large outline onclick={onrotate}>
        <span class="btn-content">
          <RotateCw size={18} aria-hidden="true" />
          {m.admin_keys_rotate_button()}
        </span>
      </Button>
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

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-icon.ok {
    background: color-mix(in srgb, var(--color-green-500) 15%, transparent);
    color: var(--color-green-500);
  }

  .status-icon.missing {
    background: color-mix(in srgb, var(--color-amber-500) 15%, transparent);
    color: var(--color-amber-500);
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

  .key-actions {
    padding-top: var(--space-xs);
  }

  .btn-content {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
  }
</style>
