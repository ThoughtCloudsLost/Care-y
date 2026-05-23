<!--
  Post-auth onboarding: completes remaining setup steps after login.

  The login page redirects here when a user has pending onboarding
  steps (security briefing not seen, or 2FA not enrolled). Queries
  the server to determine which steps are needed, then shows the
  same wizard components used by the admin setup and volunteer
  first-login flows.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { Preloader, Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { authKeys, twoFactorKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { getWizardNavCtx } from "$lib/components/onboarding/wizard-nav-context.js";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import SetupTwoFactor from "$lib/components/onboarding/SetupTwoFactor.svelte";

  const updateStep = getContext<
    (p: { current: number; total: number; label: string } | null) => void
  >("onboarding-update-step");

  const wizardNav = getWizardNavCtx();

  const meQuery = createQuery(() => ({
    queryKey: authKeys.me(),
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
    retry: false,
  }));

  const twofaQuery = createQuery(() => ({
    queryKey: twoFactorKeys.status(),
    queryFn: async () => trpc.twoFactor.status.query(),
    enabled: meQuery.isSuccess,
  }));

  $effect(() => {
    if (!browser) return;
    if (meQuery.isError) {
      void goto(resolve("/login"));
    }
  });

  interface StepConfig {
    readonly id: "briefing" | "twofa";
    readonly label: string;
  }

  let stepsResolved = $state(false);
  let stepConfigs = $state<StepConfig[]>([]);

  $effect(() => {
    if (stepsResolved) return;
    if (!meQuery.data || !twofaQuery.data) return;
    stepsResolved = true;

    const configs: StepConfig[] = [];
    if (!meQuery.data.user.hasSeenBriefing) {
      configs.push({
        id: "briefing",
        label: m.onboarding_step_briefing(),
      });
    }
    if (twofaQuery.data.methods.length === 0) {
      configs.push({
        id: "twofa",
        label: m.onboarding_step_twofa(),
      });
    }
    stepConfigs = configs;

    if (configs.length === 0) {
      void goto(resolve("/"));
    }
  });

  let step = $state(0);

  $effect(() => {
    if (!stepsResolved || stepConfigs.length === 0) {
      updateStep(null);
      wizardNav.current = undefined;
      return;
    }
    const isLabeledStep = step < stepConfigs.length;
    updateStep(
      isLabeledStep
        ? {
            current: step + 1,
            total: stepConfigs.length,
            // eslint-disable-next-line security/detect-object-injection -- step is a controlled integer index
            label: stepConfigs[step]?.label ?? "",
          }
        : null,
    );
    if (!isLabeledStep) {
      wizardNav.current = undefined;
    }
  });

  // eslint-disable-next-line security/detect-object-injection -- step is a controlled integer index
  const currentStepId = $derived(stepConfigs[step]?.id);

  function goBack(): void {
    if (step <= 0) return;
    step -= 1;
    document
      .querySelector(".onboarding-content")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }

  function advanceStep(): void {
    step += 1;
    document
      .querySelector(".onboarding-content")
      ?.scrollTo({ top: 0, behavior: "instant" });
    if (step < stepConfigs.length) {
      announceToLiveRegion(
        "polite",
        m.onboarding_stepper_progress({
          current: String(step + 1),
          total: String(stepConfigs.length),
        }),
      );
    }
  }

  function handleBriefingConfirm(): void {
    void trpc.profile.markBriefingSeen.mutate();
    advanceStep();
  }

  async function handleTwofaComplete(): Promise<void> {
    try {
      await trpc.twoFactor.enroll.markVerifiedOnFirstEnrollment.mutate();
    } catch {
      /* best-effort */
    }
    advanceStep();
  }

  $effect(() => {
    if (stepsResolved && step >= stepConfigs.length && stepConfigs.length > 0) {
      toastStore.show(m.onboarding_step_complete());
      haptic();
      void goto(resolve("/"));
    }
  });
</script>

{#if !stepsResolved}
  <Block>
    <div class="wizard-loading">
      <Preloader />
    </div>
  </Block>
{:else if currentStepId === "briefing"}
  <SecurityBriefing
    onconfirm={handleBriefingConfirm}
    goBack={step > 0 ? goBack : undefined}
  />
{:else if currentStepId === "twofa"}
  <SetupTwoFactor
    oncomplete={handleTwofaComplete}
    username={meQuery.data?.user.id ?? ""}
    goBack={step > 0 ? goBack : undefined}
  />
{/if}

<style>
  .wizard-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
</style>
