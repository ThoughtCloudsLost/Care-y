<!--
  Org setup wizard: single route with client-side step navigation.

  Steps (array indices 0-8): account, briefing, org, branding,
  queue, telephony, escrow, invites, complete.

  Steps 1-7 are placeholder stubs until their real components land.
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
  import WizardStepper from "$lib/components/onboarding/WizardStepper.svelte";
  import SetupAccount from "$lib/components/onboarding/SetupAccount.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";

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
    throw new Error("Onboarding router not available");
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
    <Block>
      <h2 class="step-heading">{m.onboarding_placeholder_heading_org()}</h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
  {:else if step === 3}
    <Block>
      <h2 class="step-heading">
        {m.onboarding_placeholder_heading_branding()}
      </h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
  {:else if step === 4}
    <Block>
      <h2 class="step-heading">{m.onboarding_placeholder_heading_queue()}</h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
  {:else if step === 5}
    <Block>
      <h2 class="step-heading">
        {m.onboarding_placeholder_heading_telephony()}
      </h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
  {:else if step === 6}
    <Block>
      <h2 class="step-heading">{m.onboarding_placeholder_heading_escrow()}</h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
  {:else if step === 7}
    <Block>
      <h2 class="step-heading">{m.onboarding_placeholder_heading_invites()}</h2>
      <p class="step-subtext">{m.onboarding_placeholder_pending()}</p>
      <div class="mt-4">
        <Button large onclick={advanceStep}
          >{m.onboarding_placeholder_continue()}</Button
        >
      </div>
    </Block>
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
