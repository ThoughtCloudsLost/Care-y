<!--
  Org setup wizard: single route with client-side step navigation.

  Steps (array indices 0-8): account, briefing, org, branding,
  queue, telephony, escrow, invites, complete.
  Each step component calls oncomplete() to advance.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { Preloader, Block, Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import WizardStepper from "$lib/components/onboarding/WizardStepper.svelte";
  import SetupAccount from "$lib/components/onboarding/SetupAccount.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import SetupOrg from "$lib/components/onboarding/SetupOrg.svelte";
  import SetupBranding from "$lib/components/onboarding/SetupBranding.svelte";
  import SetupQueue from "$lib/components/onboarding/SetupQueue.svelte";
  import SetupTelephony from "$lib/components/onboarding/SetupTelephony.svelte";
  import SetupEscrow from "$lib/components/onboarding/SetupEscrow.svelte";
  import SetupInvite from "$lib/components/onboarding/SetupInvite.svelte";

  const STEP_LABELS = [
    m.onboarding_step_account(),
    m.onboarding_step_briefing(),
    m.onboarding_step_org(),
    m.onboarding_step_branding(),
    m.onboarding_step_queue(),
    m.onboarding_step_telephony(),
    m.onboarding_step_escrow(),
    m.onboarding_step_invites(),
  ];

  interface WizardData {
    userId: string;
    adminVolPublic: string;
    orgName: string;
    language: string;
    countryCode: string;
    brandingDone: boolean;
    firstQueueCreated: boolean;
    telephonyMode: "byot" | "managed" | "skip";
    escrowExported: boolean;
    invitesSent: number;
  }

  let step = $state(0);
  let completedSteps = $state(new Set<number>());
  let wizardData = $state<Partial<WizardData>>({});

  const onboarding = trpc.onboarding;
  if (!onboarding) {
    throw new RouterNotAvailableError("onboarding");
  }

  const statusQuery = createQuery(() => ({
    queryKey: onboardingKeys.status(),
    queryFn: async () => onboarding.getStatus.query(),
    retry: false,
  }));

  $effect(() => {
    if (statusQuery.data && !statusQuery.data.needsSetup) {
      void goto(resolve("/login"));
    }
  });

  const isReady = $derived(
    statusQuery.isSuccess && statusQuery.data.needsSetup,
  );

  function handleAccountComplete(data: {
    userId: string;
    adminVolPublic: string;
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleOrgComplete(data: {
    orgName: string;
    language: string;
    countryCode: string;
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleBrandingComplete(): void {
    wizardData = { ...wizardData, brandingDone: true };
    advanceStep();
  }

  function handleBrandingSkip(): void {
    wizardData = { ...wizardData, brandingDone: false };
    advanceStep();
  }

  function handleQueueComplete(data: { firstQueueCreated: boolean }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleTelephonyComplete(data: {
    telephonyMode: "byot" | "managed" | "skip";
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleEscrowComplete(): void {
    wizardData = { ...wizardData, escrowExported: true };
    advanceStep();
  }

  function handleInviteComplete(data: { invitesSent: number }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function advanceStep(): void {
    completedSteps = new Set([...completedSteps, step]);
    step += 1;
    announceToLiveRegion(
      "polite",
      m.onboarding_stepper_progress({
        current: String(step + 1),
        total: String(STEP_LABELS.length),
      }),
    );
  }
</script>

{#if statusQuery.isLoading}
  <div class="wizard-loading">
    <Preloader />
    <p class="loading-text">{m.onboarding_setup_loading()}</p>
  </div>
{:else if statusQuery.isError}
  <Block>
    <p class="error-text" role="alert">{m.onboarding_setup_error()}</p>
  </Block>
{:else if isReady}
  <WizardStepper steps={STEP_LABELS} currentStep={step} {completedSteps} />

  {#if step === 0}
    <SetupAccount oncomplete={handleAccountComplete} />
  {:else if step === 1}
    <SecurityBriefing onconfirm={advanceStep} />
  {:else if step === 2}
    <SetupOrg oncomplete={handleOrgComplete} />
  {:else if step === 3}
    <SetupBranding
      orgName={wizardData.orgName ?? ""}
      oncomplete={handleBrandingComplete}
      onskip={handleBrandingSkip}
    />
  {:else if step === 4}
    <SetupQueue oncomplete={handleQueueComplete} />
  {:else if step === 5}
    <SetupTelephony oncomplete={handleTelephonyComplete} />
  {:else if step === 6}
    <SetupEscrow oncomplete={handleEscrowComplete} />
  {:else if step === 7}
    <SetupInvite oncomplete={handleInviteComplete} />
  {:else if step === 8}
    <Block>
      <div class="complete-screen">
        <h2 class="step-heading">{m.onboarding_wizard_complete_heading()}</h2>
        <p class="step-subtext">{m.onboarding_wizard_complete_body()}</p>
        <div class="mt-6">
          <Button large onclick={() => void goto(resolve("/"))}>
            {m.onboarding_wizard_complete_go()}
          </Button>
        </div>
      </div>
    </Block>
  {/if}
{/if}

<style>
  .wizard-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 1rem;
  }

  .loading-text {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
    text-align: center;
  }

  .step-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .step-subtext {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    margin: 0;
  }

  .complete-screen {
    text-align: center;
    padding: 2rem 0;
  }
</style>
