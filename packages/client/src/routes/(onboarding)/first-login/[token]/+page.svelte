<!--
  Volunteer first-login wizard: invite link landing page.

  Three-step wizard matching the admin setup flow (steps 0-2 only):
    0. Account creation (SetupInviteAccount)
    1. Security briefing (SecurityBriefing)
    2. 2FA enrollment (SetupTwoFactor)
  Then redirect to dashboard.

  Uses the same wizard infrastructure as the admin setup wizard
  (step tracking, wizard nav context, progress indicator, reauth).
-->
<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { Preloader, Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import {
    loadSavedState,
    saveState,
    clearState,
    resolveRecoveryStep,
  } from "$lib/onboarding/wizard-persistence.js";
  import { getWizardNavCtx } from "$lib/components/onboarding/wizard-nav-context.js";
  import SetupInviteAccount from "$lib/components/onboarding/SetupInviteAccount.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import SetupTwoFactor from "$lib/components/onboarding/SetupTwoFactor.svelte";
  import WizardReauth from "$lib/components/onboarding/WizardReauth.svelte";

  const token = $derived(page.params.token ?? "");

  const STORAGE_KEY = "care-y-firstlogin-wizard";

  const STEP_LABELS = [
    m.onboarding_step_account(),
    m.onboarding_step_briefing(),
    m.onboarding_step_twofa(),
  ];

  interface WizardData {
    userId: string;
    identifier: string;
  }

  const WIZARD_STEP_COUNT = STEP_LABELS.length + 1;

  const savedInit = browser
    ? loadSavedState(sessionStorage, STORAGE_KEY, WIZARD_STEP_COUNT)
    : null;
  let step = $state(savedInit?.step ?? 0);
  let completedSteps = $state(new Set<number>(savedInit?.completed ?? []));
  let wizardData = $state<Partial<WizardData>>({});

  const updateStep = getContext<
    (p: { current: number; total: number; label: string } | null) => void
  >("onboarding-update-step");

  const wizardNav = getWizardNavCtx();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  function goBack(): void {
    if (step <= 0) return;
    step -= 1;
    saveState(sessionStorage, STORAGE_KEY, step, completedSteps);
    history.pushState({ wizardStep: step }, "");
    document
      .querySelector(".onboarding-content")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }

  // ── Re-auth for page refresh recovery ──

  let needsReauth = $state(false);

  function handleReauthComplete(data: { hasSeenBriefing: boolean }): void {
    needsReauth = false;

    const recovery = resolveRecoveryStep(
      sessionStorage,
      STORAGE_KEY,
      WIZARD_STEP_COUNT,
      data.hasSeenBriefing,
    );
    step = recovery.step;
    completedSteps = new Set(recovery.completed);
    saveState(sessionStorage, STORAGE_KEY, step, completedSteps);

    haptic();
  }

  // ── Token validation ──

  const inviteQuery = createQuery(() => ({
    queryKey: onboardingKeys.validateInvite(token),
    queryFn: async () => onboarding.validateInvite.query({ token }),
    retry: false,
    enabled: token.length > 0,
  }));

  const isReady = $derived(inviteQuery.isSuccess && inviteQuery.data.valid);

  let recoveryHandled = $state(false);

  $effect(() => {
    if (!inviteQuery.data || recoveryHandled) return;
    if (!inviteQuery.data.valid) return;
    recoveryHandled = true;

    if (step > 0 && !isOrgKeyReady()) {
      needsReauth = true;
    }
  });

  // ── Step progress ──

  $effect(() => {
    if (!isReady || needsReauth) {
      updateStep(null);
      wizardNav.current = undefined;
      return;
    }
    const isLabeledStep = step < STEP_LABELS.length;
    updateStep(
      isLabeledStep
        ? {
            current: step + 1,
            total: STEP_LABELS.length,
            label: STEP_LABELS.at(step) ?? "",
          }
        : null,
    );
    if (!isLabeledStep) {
      wizardNav.current = undefined;
    }
  });

  onMount(() => {
    function handlePopState(e: PopStateEvent): void {
      const s: unknown = e.state;
      if (typeof s === "object" && s !== null && "wizardStep" in s) {
        const ws = (s as Record<string, unknown>).wizardStep;
        if (typeof ws === "number") {
          step = ws;
          document
            .querySelector(".onboarding-content")
            ?.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  });

  // ── Step handlers ──

  function handleAccountComplete(data: {
    userId: string;
    identifier: string;
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleBriefingConfirm(): void {
    void onboarding.markBriefingSeen.mutate();
    advanceStep();
  }

  async function handleTwofaComplete(): Promise<void> {
    try {
      await trpc.twoFactor.enroll.markVerifiedOnFirstEnrollment.mutate();
    } catch {
      /* best-effort; session is functionally verified at this point */
    }
    advanceStep();
  }

  // ── Completion ──

  $effect(() => {
    if (step === STEP_LABELS.length) {
      clearState(sessionStorage, STORAGE_KEY);
      toastStore.show(m.onboarding_step_complete());
      void goto(resolve("/"));
    }
  });

  function advanceStep(): void {
    completedSteps = new Set([...completedSteps, step]);
    step += 1;
    saveState(sessionStorage, STORAGE_KEY, step, completedSteps);
    history.pushState({ wizardStep: step }, "");
    document
      .querySelector(".onboarding-content")
      ?.scrollTo({ top: 0, behavior: "instant" });
    announceToLiveRegion(
      "polite",
      m.onboarding_stepper_progress({
        current: String(step + 1),
        total: String(STEP_LABELS.length),
      }),
    );
  }
</script>

{#if inviteQuery.isLoading}
  <Block>
    <div class="wizard-loading">
      <Preloader />
    </div>
  </Block>
{:else if inviteQuery.data?.valid !== true}
  <Block>
    <div class="error-container" role="alert">
      <p class="step-error">
        {m.onboarding_firstlogin_error_invalid_token()}
      </p>
    </div>
  </Block>
{:else if needsReauth}
  <WizardReauth onauthenticated={handleReauthComplete} />
{:else if isReady}
  {#if step === 0}
    <SetupInviteAccount {token} oncomplete={handleAccountComplete} />
  {:else if step === 1}
    <SecurityBriefing onconfirm={handleBriefingConfirm} {goBack} />
  {:else if step === 2}
    <SetupTwoFactor
      oncomplete={handleTwofaComplete}
      username={wizardData.identifier ?? ""}
      {goBack}
    />
  {/if}
{/if}

<style>
  .wizard-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .error-container {
    text-align: center;
    padding: var(--space-2xl) 0;
  }
</style>
