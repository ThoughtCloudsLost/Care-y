<script lang="ts">
  import { List, ListItem, BlockTitle, Preloader } from "konsta/svelte";
  import { Plus, ShieldCheck } from "@lucide/svelte";
  import { useQueryClient, createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { twoFactorKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { METHOD_INFO, type TwoFactorMethodInfo } from "@care-y/shared";
  import TotpEnrollSheet from "$lib/components/settings/TotpEnrollSheet.svelte";
  import PasskeyEnrollSheet from "$lib/components/settings/PasskeyEnrollSheet.svelte";
  import EmailEnrollSheet from "$lib/components/settings/EmailEnrollSheet.svelte";
  import SmsEnrollSheet from "$lib/components/settings/SmsEnrollSheet.svelte";
  import PushEnrollSheet from "$lib/components/settings/PushEnrollSheet.svelte";
  import BackupCodesSheet from "$lib/components/settings/BackupCodesSheet.svelte";

  interface TwoFactorEnrollmentProps {
    readonly username: string;
    readonly onenrolled: () => void;
  }

  let { username, onenrolled }: TwoFactorEnrollmentProps = $props();

  const queryClient = useQueryClient();

  const statusQuery = createQuery(() => ({
    queryKey: twoFactorKeys.status(),
    queryFn: async () => trpc.twoFactor.status.query(),
    enabled: true,
  }));

  let totpSheetOpen = $state(false);
  let passkeySheetOpen = $state(false);
  let emailSheetOpen = $state(false);
  let smsSheetOpen = $state(false);
  let pushSheetOpen = $state(false);
  let backupCodesSheetOpen = $state(false);
  let hasNotifiedParent = $state(false);
  let hasShownBackupCodes = $state(false);

  const enrolledMethods = $derived(statusQuery.data?.methods ?? []);
  const enrolledCount = $derived(enrolledMethods.length);
  $effect(() => {
    if (enrolledCount > 0 && !hasNotifiedParent) {
      hasNotifiedParent = true;
      onenrolled();
    }
  });

  function getMethodInfoLabel(labelKey: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dynamic paraglide key lookup
    const messages = m as unknown as Record<string, (() => string) | undefined>;
    // eslint-disable-next-line security/detect-object-injection -- labelKey is from METHOD_INFO constants
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

    haptic();

    if (!hasShownBackupCodes) {
      backupCodesSheetOpen = true;
    } else if (!hasNotifiedParent) {
      hasNotifiedParent = true;
      onenrolled();
    }
  }

  function handleBackupCodesDismissed(): void {
    backupCodesSheetOpen = false;
    hasShownBackupCodes = true;
    if (!hasNotifiedParent) {
      hasNotifiedParent = true;
      onenrolled();
    }
  }
</script>

<div class="twofa-enrollment">
  {#if statusQuery.isPending}
    <div class="loading-state" role="status">
      <Preloader class="w-6 h-6" />
    </div>
  {:else}
    {#if enrolledCount > 0}
      <div class="enrolled-badge" role="status">
        <ShieldCheck size={20} class="enrolled-icon" />
        <span
          >{enrolledCount === 1
            ? m.onboarding_twofa_enrolled_one()
            : m.onboarding_twofa_enrolled({ count: enrolledCount })}</span
        >
      </div>

      <List strong inset>
        {#each enrolledMethods as method (method.type + String(method.index))}
          <ListItem title={method.label} />
        {/each}
      </List>
    {/if}

    {#if getAvailableMethods().length > 0}
      <BlockTitle>
        {enrolledCount === 0
          ? m.onboarding_twofa_at_least_one()
          : m.twofa_enroll_choose()}
      </BlockTitle>
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
  {/if}
</div>

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
  ondismiss={handleBackupCodesDismissed}
/>

<style>
  .twofa-enrollment {
    padding: var(--space-sm) 0;
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: var(--space-xl) 0;
  }

  /* Enrolled is the earned normal state: a quiet ink line, no tint and
     no success hue. The shield glyph plus the word carry the meaning. */
  .enrolled-badge {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    margin: 0 var(--space-md) var(--space-sm);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ink-2, inherit);
  }

  :global(.enrolled-icon) {
    flex-shrink: 0;
  }

  /* Icons are tools on the desk: the accent slot, not brand text. */
  :global(.method-add-icon) {
    color: var(--brand-accent, var(--brand-primary, #007aff));
  }
</style>
