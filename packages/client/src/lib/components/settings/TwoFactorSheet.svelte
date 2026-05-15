<script lang="ts">
  import { List, ListItem, BlockTitle, Preloader, Button } from "konsta/svelte";
  import { Plus, Trash2 } from "@lucide/svelte";
  import { useQueryClient, createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { twoFactorKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    METHOD_INFO,
    type TwoFactorMethodInfo,
    type TwoFactorMethodType,
  } from "@care-y/shared";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import TotpEnrollSheet from "./TotpEnrollSheet.svelte";
  import PasskeyEnrollSheet from "./PasskeyEnrollSheet.svelte";
  import EmailEnrollSheet from "./EmailEnrollSheet.svelte";
  import SmsEnrollSheet from "./SmsEnrollSheet.svelte";
  import PushEnrollSheet from "./PushEnrollSheet.svelte";
  import BackupCodesSheet from "./BackupCodesSheet.svelte";

  interface TwoFactorSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly userId: string;
    readonly username: string;
  }

  let { opened, ondismiss, userId, username }: TwoFactorSheetProps = $props();

  const queryClient = useQueryClient();

  const statusQuery = createQuery(() => ({
    queryKey: twoFactorKeys.status(),
    queryFn: async () => trpc.twoFactor.status.query(),
    enabled: opened,
  }));

  // --- Child sheet state ---
  let totpSheetOpen = $state(false);
  let passkeySheetOpen = $state(false);
  let emailSheetOpen = $state(false);
  let smsSheetOpen = $state(false);
  let pushSheetOpen = $state(false);
  let backupCodesSheetOpen = $state(false);

  // --- Remove confirmation state ---
  let removingMethod = $state<{
    type: TwoFactorMethodType;
    credentialId?: string;
  } | null>(null);
  let removeLoading = $state(false);

  const enrolledMethods = $derived(statusQuery.data?.methods ?? []);
  const isFirstEnrollment = $derived(enrolledMethods.length === 0);

  function getMethodInfoLabel(labelKey: string): string {
    // METHOD_INFO uses paraglide key names; look up the message function
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dynamic paraglide key lookup
    const messages = m as unknown as Record<string, (() => string) | undefined>;
    // eslint-disable-next-line security/detect-object-injection -- labelKey is from METHOD_INFO constants, not user input
    const fn = messages[labelKey];
    return fn ? fn() : labelKey;
  }

  function getAvailableMethods(): readonly TwoFactorMethodInfo[] {
    const enrolledTypes = new Set(enrolledMethods.map((em) => em.type));
    return METHOD_INFO.filter((mi) => !enrolledTypes.has(mi.type));
  }

  function openEnrollSheet(method: TwoFactorMethodInfo): void {
    switch (method.type) {
      case "totp":
        totpSheetOpen = true;
        break;
      case "webauthn":
        passkeySheetOpen = true;
        break;
      case "email":
        emailSheetOpen = true;
        break;
      case "sms":
        smsSheetOpen = true;
        break;
      case "push":
        pushSheetOpen = true;
        break;
    }
  }

  function handleEnrolled(): void {
    void queryClient.invalidateQueries({
      queryKey: twoFactorKeys.status(),
    });
    totpSheetOpen = false;
    passkeySheetOpen = false;
    emailSheetOpen = false;
    smsSheetOpen = false;
    pushSheetOpen = false;

    if (isFirstEnrollment) {
      backupCodesSheetOpen = true;
    }
  }

  function confirmRemove(
    type: TwoFactorMethodType,
    credentialId?: string,
  ): void {
    removingMethod = { type, credentialId };
  }

  function cancelRemove(): void {
    removingMethod = null;
  }

  async function executeRemove(): Promise<void> {
    if (removingMethod === null) return;
    removeLoading = true;
    try {
      await trpc.twoFactor.methods.remove.mutate({
        method: removingMethod.type,
        credentialId: removingMethod.credentialId,
      });
      haptic();
      const msg = m.twofa_method_removed();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      void queryClient.invalidateQueries({
        queryKey: twoFactorKeys.status(),
      });
    } catch {
      toastStore.show(m.twofa_error_invalid_code(), 3000);
    } finally {
      removeLoading = false;
      removingMethod = null;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_enroll_title()}
  title={m.twofa_enroll_title()}
>
  <div class="sheet-content">
    {#if statusQuery.isPending}
      <div class="loading-state" role="status">
        <Preloader class="w-6 h-6" />
      </div>
    {:else}
      <!-- Enrolled methods -->
      {#if enrolledMethods.length > 0}
        <List strong inset>
          {#each enrolledMethods as method (method.type + String(method.index))}
            <ListItem title={method.label}>
              {#snippet after()}
                {#if removingMethod?.type === method.type}
                  <div class="remove-confirm">
                    <span class="remove-prompt">
                      {m.twofa_remove_confirm()}
                    </span>
                    <button
                      type="button"
                      class="remove-yes"
                      onclick={() => {
                        void executeRemove();
                      }}
                      disabled={removeLoading}
                    >
                      {#if removeLoading}
                        <Preloader class="w-4 h-4" />
                      {:else}
                        {m.twofa_remove_confirm_yes()}
                      {/if}
                    </button>
                    <button
                      type="button"
                      class="remove-cancel"
                      onclick={cancelRemove}
                    >
                      {m.common_cancel()}
                    </button>
                  </div>
                {:else}
                  <button
                    type="button"
                    class="remove-btn"
                    onclick={() => {
                      confirmRemove(method.type);
                    }}
                    aria-label={m.twofa_remove_confirm()}
                  >
                    <Trash2 size={16} />
                  </button>
                {/if}
              {/snippet}
            </ListItem>
          {/each}
        </List>

        {#if (statusQuery.data?.backupCodesRemaining ?? 0) > 0}
          <p class="backup-remaining">
            {m.twofa_backup_codes_remaining({
              count: String(statusQuery.data?.backupCodesRemaining ?? 0),
            })}
          </p>
        {/if}
      {/if}

      <!-- Available methods to add -->
      {#if getAvailableMethods().length > 0}
        <BlockTitle>{m.twofa_enroll_choose()}</BlockTitle>
        <List strong inset>
          {#each getAvailableMethods() as method (method.type + (method.webauthnAttachment ?? ""))}
            <ListItem
              title={getMethodInfoLabel(method.labelKey)}
              subtitle={getMethodInfoLabel(method.descriptionKey)}
              link
              onclick={() => {
                openEnrollSheet(method);
              }}
            >
              {#snippet media()}
                <Plus size={20} class="method-add-icon" />
              {/snippet}
            </ListItem>
          {/each}
        </List>
      {/if}

      <!-- Backup codes management -->
      {#if enrolledMethods.length > 0}
        <div class="backup-action">
          <Button
            outline
            onclick={() => {
              backupCodesSheetOpen = true;
            }}
          >
            {m.twofa_backup_codes_title()}
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</ShellSheet>

<TotpEnrollSheet
  opened={totpSheetOpen}
  ondismiss={() => {
    totpSheetOpen = false;
  }}
  onenrolled={handleEnrolled}
/>

<PasskeyEnrollSheet
  opened={passkeySheetOpen}
  ondismiss={() => {
    passkeySheetOpen = false;
  }}
  onenrolled={handleEnrolled}
  {userId}
  {username}
/>

<EmailEnrollSheet
  opened={emailSheetOpen}
  ondismiss={() => {
    emailSheetOpen = false;
  }}
  onenrolled={handleEnrolled}
/>

<SmsEnrollSheet
  opened={smsSheetOpen}
  ondismiss={() => {
    smsSheetOpen = false;
  }}
  onenrolled={handleEnrolled}
/>

<PushEnrollSheet
  opened={pushSheetOpen}
  ondismiss={() => {
    pushSheetOpen = false;
  }}
  onenrolled={handleEnrolled}
/>

<BackupCodesSheet
  opened={backupCodesSheetOpen}
  ondismiss={() => {
    backupCodesSheetOpen = false;
  }}
/>

<style>
  .sheet-content {
    padding: var(--space-sm) 0 var(--space-lg);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: var(--space-xl) 0;
  }

  .remove-confirm {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .remove-prompt {
    font-size: 0.8rem;
    color: var(--k-color-red, #ef4444);
  }

  .remove-yes {
    background: var(--k-color-red, #ef4444);
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    min-height: 32px;
    min-width: 44px;
  }

  .remove-cancel {
    background: none;
    border: 1px solid var(--muted, #999);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    color: var(--ink);
    min-height: 32px;
    min-width: 44px;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--k-color-red, #ef4444);
    cursor: pointer;
    padding: var(--space-xs);
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .backup-remaining {
    font-size: 0.8rem;
    color: var(--muted);
    text-align: center;
    margin: var(--space-xs) 0 var(--space-sm);
  }

  .backup-action {
    display: flex;
    justify-content: center;
    padding: var(--space-md) var(--space-lg) 0;
  }

  :global(.method-add-icon) {
    color: var(--brand-primary, var(--k-color-primary, #007aff));
  }
</style>
