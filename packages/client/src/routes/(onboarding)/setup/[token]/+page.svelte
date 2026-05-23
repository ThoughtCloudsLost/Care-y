<!--
  Org setup wizard: single route with client-side step navigation.
  Requires a valid setup token in the URL path.

  Steps (array indices 0-7): account, briefing, 2FA, organization,
  invite, queue, communications, escrow.
  Each step component calls oncomplete() to advance.
-->
<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    Preloader,
    Block,
    BlockTitle,
    Button,
    Link,
    List,
    ListInput,
    ListItem,
  } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import { CircleCheck, Circle } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import { CHECKLIST_ITEMS } from "$lib/onboarding/checklist-items.js";
  import WizardReauth from "$lib/components/onboarding/WizardReauth.svelte";
  import SetupAccount from "$lib/components/onboarding/SetupAccount.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import SetupTwoFactor from "$lib/components/onboarding/SetupTwoFactor.svelte";
  import SetupOrganization from "$lib/components/onboarding/SetupOrganization.svelte";
  import SetupInvite from "$lib/components/onboarding/SetupInvite.svelte";
  import SetupQueue from "$lib/components/onboarding/SetupQueue.svelte";
  import SetupCommunications from "$lib/components/onboarding/SetupCommunications.svelte";
  import SetupEscrow from "$lib/components/onboarding/SetupEscrow.svelte";
  import { getWizardNavCtx } from "$lib/components/onboarding/wizard-nav-context.js";

  const setupToken: string = page.params.token ?? "";

  const STORAGE_KEY = "care-y-setup-wizard";

  const STEP_LABELS = [
    m.onboarding_step_account(),
    m.onboarding_step_briefing(),
    m.onboarding_step_twofa(),
    m.onboarding_step_org(),
    m.onboarding_step_invites(),
    m.onboarding_step_queue(withTerms()),
    m.onboarding_step_communications(),
    m.onboarding_step_escrow(),
  ];

  interface WizardData {
    userId: string;
    adminVolPublic: string;
    twofaEnrolled: boolean;
    firstQueueCreated: boolean;
    telephonyMode: "byot" | "managed" | "skip";
    escrowExported: boolean;
    invitesSent: number;
  }

  const WIZARD_STEP_COUNT = STEP_LABELS.length + 1;

  function loadSavedState(): { step: number; completed: number[] } | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("step" in parsed) ||
        !("completed" in parsed)
      ) {
        return null;
      }
      const obj = parsed as Record<string, unknown>;
      if (
        typeof obj.step === "number" &&
        Array.isArray(obj.completed) &&
        obj.completed.every((v): v is number => typeof v === "number")
      ) {
        if (obj.step >= WIZARD_STEP_COUNT) {
          sessionStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return { step: obj.step, completed: obj.completed };
      }
    } catch {
      /* malformed data */
    }
    return null;
  }

  function saveState(s: number, completed: Set<number>): void {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step: s, completed: [...completed] }),
      );
    } catch {
      /* storage full or unavailable */
    }
  }

  function clearState(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  const savedInit = browser ? loadSavedState() : null;
  let step = $state(savedInit?.step ?? 0);
  let completedSteps = $state(new Set<number>(savedInit?.completed ?? []));
  let wizardData = $state<Partial<WizardData>>({});

  const updateStep = getContext<
    (p: { current: number; total: number; label: string } | null) => void
  >("onboarding-update-step");

  const wizardNav = getWizardNavCtx();

  function goBack(): void {
    if (step <= 0) return;
    step -= 1;
    saveState(step, completedSteps);
    history.pushState({ wizardStep: step }, "");
    document
      .querySelector(".onboarding-content")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  // ── Re-auth for page refresh recovery ──

  let needsReauth = $state(false);

  function handleReauthComplete(data: { hasSeenBriefing: boolean }): void {
    needsReauth = false;

    const saved = loadSavedState();
    if (saved !== null && saved.step > 0) {
      step = saved.step;
      completedSteps = new Set(saved.completed);
    } else if (data.hasSeenBriefing) {
      step = 2;
      completedSteps = new Set([0, 1]);
      saveState(2, completedSteps);
    } else {
      step = 1;
      completedSteps = new Set([0]);
      saveState(1, completedSteps);
    }

    haptic();
  }

  const statusQuery = createQuery(() => ({
    queryKey: onboardingKeys.status(),
    queryFn: async () => onboarding.getStatus.query(),
    retry: false,
  }));

  let recoveryHandled = $state(false);
  let tokenOverride = $state("");

  $effect(() => {
    if (!statusQuery.data || recoveryHandled) return;
    recoveryHandled = true;

    const setupComplete = !statusQuery.data.needsSetup;

    if (step > 0 && !isOrgKeyReady()) {
      needsReauth = true;
      return;
    }

    if (setupComplete && step === 0) {
      void goto(resolve("/"));
    }
  });

  const isReady = $derived(
    statusQuery.isSuccess && (statusQuery.data.needsSetup || step > 0),
  );

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

  function handleAccountComplete(data: {
    userId: string;
    adminVolPublic: string;
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleBriefingConfirm(): void {
    void onboarding.markBriefingSeen.mutate();
    advanceStep();
  }

  function handleTwofaComplete(): void {
    wizardData = { ...wizardData, twofaEnrolled: true };
    advanceStep();
  }

  function handleOrganizationComplete(): void {
    advanceStep();
  }

  function handleInviteComplete(data: { invitesSent: number }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleQueueComplete(data: { firstQueueCreated: boolean }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  function handleCommunicationsComplete(data: {
    telephonyMode: "byot" | "managed" | "skip";
  }): void {
    wizardData = { ...wizardData, ...data };
    advanceStep();
  }

  async function handleEscrowComplete(): Promise<void> {
    try {
      await onboarding.completeSetup.mutate();
    } catch {
      /* best-effort; setup is functionally complete at this point */
    }
    wizardData = { ...wizardData, escrowExported: true };
    advanceStep();
  }

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    enabled: step === 8,
  }));

  const nextSteps = CHECKLIST_ITEMS;

  function isStepComplete(id: string): boolean {
    return (
      checklistQuery.data?.items.find((i) => i.id === id)?.complete ?? false
    );
  }

  function advanceStep(): void {
    completedSteps = new Set([...completedSteps, step]);
    step += 1;
    saveState(step, completedSteps);
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

{#if statusQuery.isLoading}
  <Block>
    <div class="wizard-loading">
      <Preloader />
      <p class="step-desc">{m.onboarding_setup_loading()}</p>
    </div>
  </Block>
{:else if statusQuery.isError}
  <Block>
    <p class="step-error" role="alert">{m.onboarding_setup_error()}</p>
  </Block>
  <Block>
    <Button large onclick={() => void statusQuery.refetch()}
      >{m.common_retry()}</Button
    >
  </Block>
  <BlockTitle>{m.onboarding_setup_have_token()}</BlockTitle>
  <List inset strong>
    <ListInput
      type="text"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
      label={m.onboarding_setup_token_label()}
      placeholder={m.onboarding_setup_token_placeholder()}
      value={tokenOverride}
      onInput={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) tokenOverride = target.value;
      }}
    />
  </List>
  <Block>
    <Button
      large
      onclick={() => {
        const trimmed = tokenOverride.trim();
        if (trimmed.length > 0) void goto(resolve(`/setup/${trimmed}`));
      }}
      disabled={tokenOverride.trim().length === 0}
      >{m.onboarding_setup_go_to_setup()}</Button
    >
    <div class="home-link">
      <Link onclick={() => void goto(resolve("/"))}>{m.common_go_home()}</Link>
    </div>
  </Block>
{:else if needsReauth}
  <WizardReauth onauthenticated={handleReauthComplete} />
{:else if isReady}
  {#if step === 0}
    <SetupAccount {setupToken} oncomplete={handleAccountComplete} />
  {:else if step === 1}
    <SecurityBriefing onconfirm={handleBriefingConfirm} {goBack} />
  {:else if step === 2}
    <SetupTwoFactor
      oncomplete={handleTwofaComplete}
      username={wizardData.userId ?? ""}
      {goBack}
    />
  {:else if step === 3}
    <SetupOrganization
      adminUserId={wizardData.userId ?? ""}
      oncomplete={handleOrganizationComplete}
      {goBack}
    />
  {:else if step === 4}
    <SetupInvite
      adminUserId={wizardData.userId ?? ""}
      oncomplete={handleInviteComplete}
      {goBack}
    />
  {:else if step === 5}
    <SetupQueue
      adminUserId={wizardData.userId ?? ""}
      oncomplete={handleQueueComplete}
      {goBack}
    />
  {:else if step === 6}
    <SetupCommunications
      adminUserId={wizardData.userId ?? ""}
      oncomplete={handleCommunicationsComplete}
      {goBack}
    />
  {:else if step === 7}
    <SetupEscrow oncomplete={handleEscrowComplete} {goBack} />
  {:else if step === 8}
    <BlockTitle medium>{m.onboarding_wizard_complete_heading()}</BlockTitle>
    <Block>
      <div class="complete-screen">
        <p class="step-desc">{m.onboarding_wizard_complete_body()}</p>
      </div>
    </Block>
    <BlockTitle>{m.onboarding_wizard_complete_next_steps()}</BlockTitle>
    <List strong inset>
      {#each nextSteps as meta (meta.id)}
        {@const complete = isStepComplete(meta.id)}
        <ListItem title={meta.label()} subtitle={meta.desc()}>
          {#snippet media()}
            {#if complete}
              <CircleCheck
                size={22}
                style="color: var(--brand-primary, #22c55e)"
              />
            {:else}
              <Circle size={22} style="color: var(--muted, #999)" />
            {/if}
          {/snippet}
        </ListItem>
      {/each}
    </List>
    <Block>
      <SoftButton
        full
        onclick={() => {
          clearState();
          void goto(resolve("/"));
        }}
      >
        {m.onboarding_wizard_complete_go()}
      </SoftButton>
    </Block>
  {/if}
{/if}

<style>
  .home-link {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
  }

  .wizard-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl) 0;
    gap: var(--space-lg);
  }

  .complete-screen {
    text-align: center;
    padding: var(--space-2xl) 0;
  }
</style>
