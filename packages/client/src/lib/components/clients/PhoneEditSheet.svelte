<!--
  Phone edit sheet: three-step flow for changing a client's phone number.
  Step 1 (input): enter E.164 phone number.
  Step 2 (confirm): confirm the change affects all tickets for this client.
  Step 3b (conflict): the server found a matching phone hash on another client.

  Rendered inside a ShellSheet. Follows the ReplySheet pattern for imports.
-->
<script lang="ts">
  import {
    Block,
    Button,
    List,
    ListInput,
    ListItem,
    Preloader,
    Toggle,
  } from "konsta/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Permission } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { clientKeys, ticketKeys, ticketsKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    getOrgDecryptCache,
    getOrgKeyManager,
    getCurrentPermissions,
  } from "$lib/crypto/context.js";
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
    /** Optional initial phone number to prefill step 1 (e.g. from a correction). */
    readonly initialPhone?: string;
    /** Fired after a successful phone update (before ondismiss). */
    readonly onsuccess?: () => void;
  }

  let {
    opened,
    clientId,
    clientAlias,
    ondismiss,
    onmerge,
    initialPhone,
    onsuccess,
  }: PhoneEditSheetProps = $props();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  type Step = "input" | "confirm" | "conflict";

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  const permissionsGetter = getCurrentPermissions();
  const canMarkShared = $derived(
    permissionsGetter().has(Permission.VIEW_CLIENTS),
  );

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
          { table: "clients", id: conflict.conflictingClientId },
        ),
  );

  const E164_PATTERN = /^\+[1-9]\d{1,14}$/;
  const isValidPhone = $derived(E164_PATTERN.test(phoneNumber.trim()));

  // $state reads compile to getters, so narrowing `step` in the template's
  // else branch does not reach the child's prop type. Narrow it here instead.
  const gatedStep = $derived<"confirm" | "conflict">(
    step === "conflict" ? "conflict" : "confirm",
  );

  // Reset state when the sheet opens or closes. When opening with an
  // initialPhone (e.g. from a correction apply action), prefill step 1.
  $effect(() => {
    if (!opened) {
      step = "input";
      phoneNumber = "";
      conflict = null;
    } else if (
      initialPhone !== undefined &&
      initialPhone !== "" &&
      phoneNumber === ""
    ) {
      phoneNumber = initialPhone;
    }
  });

  // ---------------------------------------------------------------------------
  // Phone shared line query + mutation
  // ---------------------------------------------------------------------------

  const sharedLineQuery = createQuery(() => ({
    queryKey: clientKeys.phoneSharedLine(clientId),
    queryFn: async () => {
      return clientsRouter.getPhoneSharedLine.query({ clientId });
    },
    enabled: opened && canMarkShared,
    staleTime: Infinity,
  }));

  const sharedLineMutation = createMutation(() => ({
    mutationFn: async (shared: boolean) => {
      return clientsRouter.setPhoneSharedLine.mutate({ clientId, shared });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientKeys.phoneSharedLine(clientId),
      });
      void queryClient.invalidateQueries({
        queryKey: clientKeys.mergeCandidates(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic(), 3000);
    },
  }));

  const sharedLineValue = $derived(sharedLineQuery.data?.shared ?? null);

  function handleSharedLineToggle(e: Event): void {
    if (e.target instanceof HTMLInputElement) {
      sharedLineMutation.mutate(e.target.checked);
    }
  }

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
        // Detail views live under a separate namespace and hold the
        // client's contact fields, so without this the ticket the
        // volunteer is looking at keeps showing the old number.
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.everyDetail,
        });
        onsuccess?.();
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
      {#if canMarkShared && sharedLineValue != null}
        <List nested>
          <ListItem label title={m.phone_shared_line_label()}>
            {#snippet after()}
              <Toggle
                checked={sharedLineValue}
                disabled={sharedLineMutation.isPending}
                onchange={handleSharedLineToggle}
              />
            {/snippet}
          </ListItem>
        </List>
        <Block>
          <p class="shared-line-hint">{m.phone_shared_line_hint()}</p>
        </Block>
      {/if}
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

  .shared-line-hint {
    font-size: 0.75rem;
    color: var(--muted);
    line-height: 1.4;
    margin: 0;
  }
</style>
