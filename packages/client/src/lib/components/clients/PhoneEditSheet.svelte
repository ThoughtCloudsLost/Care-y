<!--
  Phone edit sheet: three-step flow for changing a client's phone number.
  Step 1 (input): enter E.164 phone number.
  Step 2 (confirm): confirm the change affects all tickets for this client.
  Step 3b (conflict): the server found a matching phone hash on another client.

  Rendered inside a ShellSheet. Follows the ReplySheet pattern for imports.
-->
<script lang="ts">
  import { Block, Button, List, ListInput, Preloader } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { clientKeys, ticketsKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface PhoneEditSheetProps {
    readonly opened: boolean;
    readonly clientId: string;
    readonly clientAlias: string;
    readonly ondismiss: () => void;
    readonly onmerge: (
      conflictingClientId: string,
      conflictingAlias: string,
    ) => void;
  }

  let {
    opened,
    clientId,
    clientAlias,
    ondismiss,
    onmerge,
  }: PhoneEditSheetProps = $props();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  type Step = "input" | "confirm" | "conflict";

  let step = $state<Step>("input");
  let phoneNumber = $state("");
  let conflict = $state<{
    conflictingClientId: string;
    conflictingClientAlias: string;
  } | null>(null);

  const E164_PATTERN = /^\+[1-9]\d{1,14}$/;
  const isValidPhone = $derived(E164_PATTERN.test(phoneNumber.trim()));

  // Reset state when the sheet opens or closes
  $effect(() => {
    if (!opened) {
      step = "input";
      phoneNumber = "";
      conflict = null;
    }
  });

  // ---------------------------------------------------------------------------
  // Mutation
  // ---------------------------------------------------------------------------

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const queryClient = useQueryClient();

  const updatePhoneMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; phoneNumber: string }) =>
      clientsRouter.updatePhone.mutate(input),
    onSuccess: (result: {
      success: boolean;
      conflict: {
        conflictingClientId: string;
        conflictingClientAlias: string;
      } | null;
    }) => {
      if (result.conflict) {
        conflict = result.conflict;
        step = "conflict";
      } else {
        const msg = m.client_phone_changed_toast();
        toastStore.show(msg);
        haptic();
        void queryClient.invalidateQueries({ queryKey: clientKeys.all });
        void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
        ondismiss();
      }
    },
    onError: () => {
      toastStore.show(m.error_generic(), 3000);
    },
  }));

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSave(): void {
    if (!isValidPhone) return;
    step = "confirm";
  }

  function handleConfirm(): void {
    updatePhoneMutation.mutate({
      clientId,
      phoneNumber: phoneNumber.trim(),
    });
  }

  function handleCancel(): void {
    step = "input";
  }

  function handleTryDifferent(): void {
    conflict = null;
    step = "input";
  }

  function handleMerge(): void {
    if (conflict === null) return;
    onmerge(conflict.conflictingClientId, conflict.conflictingClientAlias);
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.phone_edit()}
  ariaLabel={m.phone_edit()}
>
  {#if step === "input"}
    <div class="phone-edit-step">
      <Block>
        <p class="step-heading">{m.phone_edit()}</p>
      </Block>
      <List nested>
        <ListInput
          label={m.client_phone_label()}
          type="tel"
          placeholder={m.client_phone_placeholder()}
          value={phoneNumber}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              phoneNumber = e.target.value;
            }
          }}
        />
      </List>
      <Block>
        <Button
          large
          onclick={handleSave}
          disabled={!isValidPhone || updatePhoneMutation.isPending}
        >
          {#if updatePhoneMutation.isPending}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.admin_user_save_changes()}
          {/if}
        </Button>
      </Block>
    </div>
  {:else if step === "confirm"}
    <div class="phone-edit-step">
      <Block>
        <p class="step-heading confirm-heading">
          {m.client_phone_confirm_title()}
        </p>
        <p class="confirm-body">
          {m.client_phone_confirm_body(withTerms({ alias: clientAlias }))}
        </p>
      </Block>
      <Block>
        <Button
          large
          class="confirm-btn"
          onclick={handleConfirm}
          disabled={updatePhoneMutation.isPending}
        >
          {#if updatePhoneMutation.isPending}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.client_phone_confirm_title()}
          {/if}
        </Button>
        <div class="btn-spacer"></div>
        <Button large outline onclick={handleCancel}>
          {m.common_cancel()}
        </Button>
      </Block>
    </div>
  {:else if step === "conflict"}
    <div class="phone-edit-step">
      <Block>
        <p class="step-heading conflict-heading">
          {m.client_phone_conflict_title()}
        </p>
        <p class="conflict-body">
          {m.client_phone_conflict_body({
            alias: conflict?.conflictingClientAlias ?? "",
          })}
        </p>
      </Block>
      <Block>
        <Button large onclick={handleMerge}>
          {m.client_phone_conflict_merge(withTerms())}
        </Button>
        <div class="btn-spacer"></div>
        <Button large outline onclick={handleTryDifferent}>
          {m.client_phone_edit()}
        </Button>
      </Block>
    </div>
  {/if}
</ShellSheet>

<style>
  .phone-edit-step {
    display: flex;
    flex-direction: column;
    padding: var(--space-md) 0;
  }

  .step-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 var(--space-sm) 0;
  }

  .confirm-heading {
    color: var(--urgent);
  }

  .confirm-body {
    color: var(--urgent);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  :global(.confirm-btn) {
    --k-color-primary: var(--danger);
  }

  .conflict-heading {
    color: var(--urgent);
  }

  .conflict-body {
    color: var(--ink);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  .btn-spacer {
    height: var(--space-sm);
  }
</style>
