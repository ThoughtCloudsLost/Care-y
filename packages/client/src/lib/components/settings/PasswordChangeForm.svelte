<!--
  The fields, progress and errors of a password change. The change itself
  runs through the orchestration in lib/settings/password-change.ts.

  Renders no submit control. The host (PasswordSheet's header button, the
  onboarding wizard's next action) holds the form through bind:this,
  calls submit(), and binds canSubmit and pending for its control.
  ondone runs after a successful change.
-->
<script lang="ts">
  import { List, Preloader } from "konsta/svelte";
  import { ErrorCode } from "@care-y/shared";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordConfirmPair from "$lib/components/inputs/PasswordConfirmPair.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
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

  interface PasswordChangeFormProps {
    readonly userId: string;
    readonly ondone: () => void | Promise<void>;
    /** Bound by the parent that owns the submit control. */
    canSubmit?: boolean;
    /** Bound by the parent; true while a change is in progress. */
    pending?: boolean;
  }

  let {
    userId,
    ondone,
    canSubmit = $bindable(false),
    pending = $bindable(false),
  }: PasswordChangeFormProps = $props();

  const primaryBridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let errorMessage = $state<string | null>(null);
  let stepMessage = $state<string | null>(null);

  const newPasswordValid = $derived(newPassword.length >= 16);
  const passwordsMatch = $derived(newPassword === confirmPassword);
  const currentPasswordFilled = $derived(currentPassword.length >= 16);
  const submittable = $derived(
    currentPasswordFilled && newPasswordValid && passwordsMatch,
  );

  const busy = $derived(stepMessage !== null);

  $effect(() => {
    canSubmit = submittable;
    pending = busy;
  });

  /** Clears every field and message. */
  export function reset(): void {
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    errorMessage = null;
    stepMessage = null;
  }

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

  function messageForError(err: unknown): string {
    const code = err instanceof Error ? err.message : "";
    if (code.includes(ErrorCode.INVALID_CREDENTIALS)) {
      return m.settings_password_wrong();
    }
    // A ticket key was granted after the wraps were fetched. Nothing
    // changed on the server; submitting again refetches them.
    if (code === ErrorCode.STALE_KEY_WRAPS) {
      return m.error_stale_key_wraps();
    }
    if (code === ErrorCode.PASSWORD_UNCHANGED) {
      return m.error_password_unchanged();
    }
    return m.settings_password_error();
  }

  /** Runs the change. No-op unless the fields are complete and no change is running. */
  export async function submit(): Promise<void> {
    if (!submittable || busy) return;
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
      errorMessage = messageForError(err);
      return;
    }

    haptic();
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    const msg = m.settings_password_saved();
    toastStore.show(msg);
    announceToLiveRegion("polite", msg);
    await ondone();
  }
</script>

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
    disabled={busy}
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
  disabled={busy}
/>
{#if errorMessage}
  <div class="error-slot">
    <FieldError message={errorMessage} />
  </div>
{/if}

<style>
  .progress-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.85rem;
    color: var(--muted);
  }

  .error-slot {
    padding: 0 var(--space-lg);
  }
</style>
