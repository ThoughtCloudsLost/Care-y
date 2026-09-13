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
  import { trpc } from "$lib/trpc/index.js";
  import { clientKeys, ticketsKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import PhoneChangeSteps from "./PhoneChangeSteps.svelte";

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

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();

  let step = $state<Step>("input");
  let phoneNumber = $state("");
  let conflict = $state<{
    conflictingClientId: string;
    conflictingClientEncryptedAlias: string;
  } | null>(null);

  // The conflicting client's alias is ciphertext like any other alias, so it
  // decrypts through the shared cache rather than being read directly.
  const conflictAlias = $derived(
    conflict === null
      ? null
      : orgCache.decrypt(
          `client-alias:${conflict.conflictingClientId}`,
          conflict.conflictingClientEncryptedAlias,
        ),
  );

  const E164_PATTERN = /^\+[1-9]\d{1,14}$/;
  const isValidPhone = $derived(E164_PATTERN.test(phoneNumber.trim()));

  // $state reads compile to getters, so narrowing `step` in the template's
  // else branch does not reach the child's prop type. Narrow it here instead.
  const gatedStep = $derived<"confirm" | "conflict">(
    step === "conflict" ? "conflict" : "confirm",
  );

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

  const updatePhoneMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; phoneNumber: string }) => {
      const phoneMatchHash = await orgKeyManager.phoneMatchHash(
        input.phoneNumber,
      );
      return clientsRouter.updatePhone.mutate({
        ...input,
        phoneMatchHash: phoneMatchHash ?? null,
      });
    },
    onSuccess: (result: {
      success: boolean;
      conflict: {
        conflictingClientId: string;
        conflictingClientEncryptedAlias: string;
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
    onmerge(conflict.conflictingClientId, conflictAlias ?? "");
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
  {:else}
    <PhoneChangeSteps
      step={gatedStep}
      {clientAlias}
      {conflictAlias}
      pending={updatePhoneMutation.isPending}
      onconfirm={handleConfirm}
      oncancel={handleCancel}
      onmerge={handleMerge}
      ontryanother={handleTryDifferent}
    />
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
</style>
