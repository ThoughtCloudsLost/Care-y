<!--
  Route sheet for quarantined voicemails.
  Hosts ClientSelect for caller selection plus a direct ticket-ID input.
  On submit, base64-encodes the unsealed audio and calls route.mutate.
-->
<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys, ticketsKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter, ClientError } from "$lib/errors.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import { Preloader } from "konsta/svelte";
  import { isPhoneLookupResult } from "$lib/components/inputs/client-select-types.js";
  import type {
    ClientSelection,
    CollisionInfo,
    ClientSearchResult,
    PhoneLookupResult,
  } from "$lib/components/inputs/client-select-types.js";

  interface Props {
    opened: boolean;
    quarantineId: string;
    durationSeconds: number | null;
    unsealedAudio: Uint8Array | null;
    ondismiss: () => void;
    onsuccess: () => void;
  }

  let {
    opened,
    quarantineId,
    durationSeconds,
    unsealedAudio,
    ondismiss,
    onsuccess,
  }: Props = $props();

  const vqRouter = requireRouter(
    trpc.voicemailQuarantine,
    "voicemailQuarantine",
  );
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();

  let clientSelection = $state<ClientSelection>(null);
  let ticketIdInput = $state("");
  let routeMode = $state<"client" | "ticket">("client");

  const canSubmit = $derived.by(() => {
    if (routeMode === "ticket") {
      return ticketIdInput.trim().length > 0;
    }
    return clientSelection !== null;
  });

  function resetForm(): void {
    clientSelection = null;
    ticketIdInput = "";
    routeMode = "client";
  }

  async function searchClients(query: string): Promise<ClientSearchResult[]> {
    return ticketRouter.searchClients.query({ query, limit: 10 });
  }

  async function phoneLookup(phone: string): Promise<PhoneLookupResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (import.meta.env.DEV) {
      headers["x-org-slug"] = DEV_ORG_SLUG;
    }

    const res = await fetch("/relay/phone-lookup", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      throw new ClientError("Phone lookup failed");
    }

    const data: unknown = await res.json();
    if (!isPhoneLookupResult(data)) {
      throw new ClientError("Phone lookup returned an unexpected shape");
    }
    return data;
  }

  function handleCollision(_info: CollisionInfo): void {
    // In quarantine context, collisions are informational.
    // The admin can still pick the client from the results.
  }

  const routeMutation = createMutation(() => ({
    mutationFn: async () => {
      if (unsealedAudio === null) {
        throw new ClientError("No unsealed audio available");
      }

      const audioData = uint8ArrayToBase64(unsealedAudio);

      let target:
        | { type: "clientId"; clientId: string }
        | { type: "clientToken"; clientToken: string }
        | { type: "ticketId"; ticketId: string };

      if (routeMode === "ticket") {
        target = { type: "ticketId", ticketId: ticketIdInput.trim() };
      } else if (clientSelection === null) {
        throw new ClientError("No client selected");
      } else if (clientSelection.mode === "existing") {
        target = { type: "clientId", clientId: clientSelection.clientId };
      } else {
        target = { type: "clientToken", clientToken: clientSelection.token };
      }

      return vqRouter.route.mutate({
        quarantineId,
        target,
        audioData,
        durationSeconds: durationSeconds ?? undefined,
      });
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_quarantine_route_success());
      announceToLiveRegion("polite", m.admin_quarantine_route_success());
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.quarantine(),
      });
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.all,
      });
      onsuccess();
    },
    onError: () => {
      toastStore.show(m.admin_quarantine_route_error());
    },
  }));

  function handleSubmit(): void {
    if (!canSubmit || routeMutation.isPending) return;
    routeMutation.mutate(undefined);
  }
</script>

<ShellSheet
  {opened}
  ondismiss={() => {
    ondismiss();
    resetForm();
  }}
  ariaLabel={m.admin_quarantine_route_title()}
  title={m.admin_quarantine_route_title()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleSubmit}
      disabled={!canSubmit || routeMutation.isPending || unsealedAudio === null}
    >
      {#if routeMutation.isPending}
        {m.common_loading()}
      {:else}
        {m.admin_quarantine_route_submit()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="route-sheet-content">
    <div class="route-mode-tabs">
      <button
        type="button"
        class="route-tab"
        class:route-tab-active={routeMode === "client"}
        onclick={() => (routeMode = "client")}
      >
        {m.admin_quarantine_route_client_label()}
      </button>
      <button
        type="button"
        class="route-tab"
        class:route-tab-active={routeMode === "ticket"}
        onclick={() => (routeMode = "ticket")}
      >
        {m.admin_quarantine_route_ticket_label()}
      </button>
    </div>

    {#if routeMode === "client"}
      {#await import("$lib/components/inputs/ClientSelect.svelte")}
        <div class="import-loading"><Preloader /></div>
      {:then ClientSelectModule}
        <ClientSelectModule.default
          label={m.admin_quarantine_route_client_label()}
          placeholder={m.admin_quarantine_route_client_placeholder()}
          search={searchClients}
          onchange={(v: ClientSelection) => (clientSelection = v)}
          {phoneLookup}
          oncollision={handleCollision}
        />
      {:catch}
        <p class="form-error" role="alert">{m.error_generic()}</p>
      {/await}
    {:else}
      <div class="ticket-id-field">
        <label class="field-label" for="qr-ticket-id">
          {m.admin_quarantine_route_ticket_label()}
        </label>
        <input
          id="qr-ticket-id"
          type="text"
          class="form-input"
          placeholder={m.admin_quarantine_route_ticket_placeholder()}
          value={ticketIdInput}
          oninput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement)
              ticketIdInput = target.value;
          }}
        />
      </div>
    {/if}

    {#if unsealedAudio === null}
      <p class="route-hint" role="status">
        {m.admin_quarantine_player_loading()}
      </p>
    {/if}
  </div>
</ShellSheet>

<style>
  .import-loading {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .form-error {
    color: var(--danger, var(--k-color-red, #ff3b30));
    font-size: 0.875rem;
    margin: 0;
    padding: 0 var(--page-pad-x);
  }

  .route-sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) 0 var(--space-lg);
  }

  .route-mode-tabs {
    display: flex;
    gap: 0;
    padding: 0 var(--page-pad-x);
  }

  .route-tab {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: var(--text-sm);
    font-family: inherit;
    background: none;
    border: 1px solid var(--divider);
    color: var(--muted);
    cursor: pointer;
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }

  .route-tab:first-child {
    border-radius: 0.5rem 0 0 0.5rem;
  }

  .route-tab:last-child {
    border-radius: 0 0.5rem 0.5rem 0;
    border-left: none;
  }

  .route-tab-active {
    background: var(--brand-primary);
    color: var(--brand-on-primary, #fff);
    border-color: var(--brand-primary);
    font-weight: 500;
  }

  .ticket-id-field {
    padding: 0 var(--page-pad-x);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .route-hint {
    padding: 0 var(--page-pad-x);
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0;
  }
</style>
