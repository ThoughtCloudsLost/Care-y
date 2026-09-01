<!--
  Email edit sheet: three-step flow for changing a client's email address.
  Step 1 (input): enter email address.
  Step 2 (confirm): confirm the change affects all tickets for this client.
  Step 3b (conflict): the server found a matching email hash on another client.

  Rendered inside a ShellSheet. Follows the PhoneEditSheet pattern.
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
  import { updateEmailInputSchema } from "@care-y/shared";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import EmailChangeSteps from "./EmailChangeSteps.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface EmailEditSheetProps {
    readonly opened: boolean;
    readonly clientId: string;
    readonly clientAlias: string;
    readonly ondismiss: () => void;
    readonly onmerge: (
      conflictingClientId: string,
      conflictingAlias: string,
    ) => void;
    /** Optional initial email to prefill step 1 (e.g. from a correction). */
    readonly initialEmail?: string;
  }

  let {
    opened,
    clientId,
    clientAlias,
    ondismiss,
    onmerge,
    initialEmail,
  }: EmailEditSheetProps = $props();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  type Step = "input" | "confirm" | "conflict";

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();

  let step = $state<Step>("input");
  let emailAddress = $state("");
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

  // Validate through the shared Zod schema (trim + lowercase + email format).
  const isValidEmail = $derived.by((): boolean => {
    const trimmed = emailAddress.trim();
    if (trimmed === "") return false;
    const result = updateEmailInputSchema.shape.emailAddress.safeParse(trimmed);
    return result.success;
  });

  // $state reads compile to getters, so narrowing `step` in the template's
  // else branch does not reach the child's prop type. Narrow it here instead.
  const gatedStep = $derived<"confirm" | "conflict">(
    step === "conflict" ? "conflict" : "confirm",
  );

  // Reset state when the sheet opens or closes. When opening with an
  // initialEmail (e.g. from a correction apply action), prefill step 1.
  $effect(() => {
    if (!opened) {
      step = "input";
      emailAddress = "";
      conflict = null;
    } else if (
      initialEmail !== undefined &&
      initialEmail !== "" &&
      emailAddress === ""
    ) {
      emailAddress = initialEmail;
    }
  });

  // ---------------------------------------------------------------------------
  // Mutation
  // ---------------------------------------------------------------------------

  const updateEmailMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; emailAddress: string }) => {
      const emailMatchHash = await orgKeyManager.emailMatchHash(
        input.emailAddress,
      );
      return clientsRouter.updateEmail.mutate({
        ...input,
        emailMatchHash: emailMatchHash ?? null,
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
        const msg = m.client_email_changed_toast();
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
    if (!isValidEmail) return;
    step = "confirm";
  }

  function handleConfirm(): void {
    updateEmailMutation.mutate({
      clientId,
      emailAddress: emailAddress.trim(),
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
  title={m.client_email_edit()}
  ariaLabel={m.client_email_edit()}
>
  {#if step === "input"}
    <div class="email-edit-step">
      <Block>
        <p class="step-heading">{m.client_email_edit()}</p>
      </Block>
      <List nested>
        <ListInput
          label={m.client_email_label()}
          type="email"
          placeholder={m.client_email_placeholder()}
          value={emailAddress}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              emailAddress = e.target.value;
            }
          }}
        />
      </List>
      <Block>
        <Button
          large
          onclick={handleSave}
          disabled={!isValidEmail || updateEmailMutation.isPending}
        >
          {#if updateEmailMutation.isPending}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.admin_user_save_changes()}
          {/if}
        </Button>
      </Block>
    </div>
  {:else}
    <EmailChangeSteps
      step={gatedStep}
      {clientAlias}
      {conflictAlias}
      pending={updateEmailMutation.isPending}
      onconfirm={handleConfirm}
      oncancel={handleCancel}
      onmerge={handleMerge}
      ontryanother={handleTryDifferent}
    />
  {/if}
</ShellSheet>

<style>
  .email-edit-step {
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
