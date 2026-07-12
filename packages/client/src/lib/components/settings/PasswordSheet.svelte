<script lang="ts">
  import { List, Preloader } from "konsta/svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordConfirmPair from "$lib/components/inputs/PasswordConfirmPair.svelte";
  import { Save } from "@lucide/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    changePassword,
    type PasswordChangeCallbacks,
  } from "$lib/settings/password-change.js";
  import { solveProofOfWork } from "$lib/auth/pow-solver.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface PasswordSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly userId: string;
  }

  let { opened, ondismiss, userId }: PasswordSheetProps = $props();

  const queryClient = useQueryClient();
  const primaryBridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let errorMessage = $state<string | null>(null);
  let stepMessage = $state<string | null>(null);
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      errorMessage = null;
      stepMessage = null;
    }
    wasOpen = opened;
  });

  const newPasswordValid = $derived(newPassword.length >= 16);
  const passwordsMatch = $derived(newPassword === confirmPassword);
  const currentPasswordFilled = $derived(currentPassword.length >= 16);
  const canSubmit = $derived(
    currentPasswordFilled && newPasswordValid && passwordsMatch,
  );

  const isPending = $derived(stepMessage !== null);

  function makeCallbacks(): PasswordChangeCallbacks {
    return {
      onFetchWraps: () => {
        stepMessage = m.settings_password_step_fetch();
      },
      onDeriveNewKeys: () => {
        stepMessage = m.settings_password_step_derive();
      },
      onUnwrapOrgKey: () => {
        stepMessage = m.settings_password_step_fetch();
      },
      onRewrapKeys: () => {
        stepMessage = m.settings_password_step_rewrap(withTerms());
      },
      onRederive: () => {
        stepMessage = m.settings_password_step_derive();
      },
      onRewrapOrgKey: () => {
        stepMessage = m.settings_password_step_rewrap(withTerms());
      },
      onRotateKeys: () => {
        stepMessage = m.settings_password_step_rotate();
      },
      onReloadOrgKey: () => {
        stepMessage = m.settings_password_step_refresh();
      },
      onDone: () => {
        stepMessage = null;
      },
    };
  }

  async function handleSubmit(): Promise<void> {
    if (!canSubmit || isPending) return;
    errorMessage = null;
    stepMessage = m.settings_password_step_fetch();

    try {
      await changePassword({
        primaryBridge,
        orgKeyManager,
        userId,
        currentPassword,
        newPassword,
        callbacks: makeCallbacks(),
        onPowRequired: solveProofOfWork,
        createTempBridge: () => new CryptoBridge("dedicated"),
      });
    } catch (err: unknown) {
      stepMessage = null;
      if (err instanceof Error && err.message.includes("INVALID_CREDENTIALS")) {
        errorMessage = m.settings_password_wrong();
      } else {
        errorMessage = m.settings_password_error();
      }
      return;
    }

    haptic();
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    const msg = m.settings_password_saved();
    toastStore.show(msg);
    announceToLiveRegion("polite", msg);
    await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.settings_password_change()}
  title={m.settings_password_change()}
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
    {#if stepMessage}
      <div class="progress-bar" role="status" aria-live="polite">
        <Preloader class="w-5 h-5" />
        <span>{stepMessage}</span>
      </div>
    {/if}

    <List nested>
      <PasswordInput
        label={m.settings_password_current()}
        placeholder={m.settings_password_current()}
        bind:value={currentPassword}
        disabled={isPending}
      />
    </List>
    <PasswordConfirmPair
      bind:password={newPassword}
      bind:confirm={confirmPassword}
      passwordLabel={m.settings_password_new()}
      passwordPlaceholder={m.settings_password_new()}
      confirmLabel={m.settings_password_confirm()}
      confirmPlaceholder={m.settings_password_confirm()}
      mismatchError={m.settings_password_mismatch()}
      minLength={16}
      disabled={isPending}
    />
    {#if errorMessage}
      <p class="error-text" role="alert">{errorMessage}</p>
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

  .progress-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.85rem;
    color: var(--muted);
  }

  .error-text {
    color: var(--danger, var(--k-color-red));
    font-size: 0.85rem;
    padding: 0 var(--space-lg);
    margin: 0;
  }
</style>
