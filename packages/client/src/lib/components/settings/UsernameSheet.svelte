<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import { Save } from "@lucide/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { identifierSchema } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { authKeys } from "$lib/query/keys.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";

  interface UsernameSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly currentUsername: string;
  }

  let { opened, ondismiss, currentUsername }: UsernameSheetProps = $props();

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  let newUsername = $state("");
  let currentPassword = $state("");
  let errorMessage = $state<string | null>(null);
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      newUsername = currentUsername;
      currentPassword = "";
      errorMessage = null;
    }
    wasOpen = opened;
  });

  const parsedUsername = $derived(identifierSchema.safeParse(newUsername));
  const trimmedUsername = $derived(
    parsedUsername.success
      ? parsedUsername.data
      : newUsername.trim().toLowerCase(),
  );
  const usernameValid = $derived(parsedUsername.success);
  const passwordFilled = $derived(currentPassword.length >= 16);
  const hasChanges = $derived(trimmedUsername !== currentUsername);
  const canSubmit = $derived(usernameValid && passwordFilled && hasChanges);

  const mut = createMutation(() => ({
    mutationFn: async (input: {
      currentPassword: string;
      newIdentifier: string;
    }) => trpc.profile.updateUsername.mutate(input),
    onSuccess: async () => {
      haptic();
      const msg = m.settings_username_saved();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      // The refetched me response carries fresh sealed ciphertext (ADR-052)
      orgCache.delete("me:identifier");
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      currentPassword = "";
      ondismiss();
    },
    onError: (err: Error) => {
      if (err.message.includes("INVALID_CREDENTIALS")) {
        errorMessage = m.settings_password_wrong();
      } else {
        errorMessage = m.settings_username_error();
      }
    },
  }));

  const isPending = $derived(mut.isPending);

  function handleSubmit(): void {
    if (!canSubmit || isPending) return;
    errorMessage = null;
    mut.mutate({
      currentPassword,
      newIdentifier: trimmedUsername,
    });
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.settings_username()}
  title={m.settings_username()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSubmit} disabled={!canSubmit || isPending}>
      {#if isPending}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {m.settings_change()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested>
      <ListInput
        label={m.settings_username_new()}
        type="text"
        placeholder={m.settings_username_new()}
        value={newUsername}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            newUsername = e.target.value;
        }}
        disabled={isPending}
      />
    </List>
    <div class="pii-register">
      <Register kind="careful">
        {m.user_field_login_username_pii_warning()}
      </Register>
    </div>
    <List nested>
      <PasswordInput
        label={m.settings_username_password()}
        placeholder={m.settings_username_password_hint()}
        bind:value={currentPassword}
        disabled={isPending}
      />
    </List>
    {#if errorMessage}
      <div class="error-slot">
        <FieldError message={errorMessage} />
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 0 0 var(--space-lg);
    flex: 1;
  }

  .pii-register {
    margin: 0 var(--space-lg);
  }

  .error-slot {
    padding: 0 var(--space-lg);
  }
</style>
