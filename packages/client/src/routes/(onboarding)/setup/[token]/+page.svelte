<!--
  Org setup wizard: single route with client-side step navigation.
  Requires a valid setup token in the URL path.

  Steps (array indices 0-8): account, briefing, org, branding,
  queue, telephony, escrow, invites, complete.
  Each step component calls oncomplete() to advance.
-->
<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { TerminologyLabels } from "@care-y/shared";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    Preloader,
    Block,
    BlockTitle,
    Button,
    List,
    ListInput,
    ListItem,
  } from "konsta/svelte";
  import { CircleCheck, Circle } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    isOrgKeyReady,
    setOrgKeyReady,
  } from "$lib/crypto/org-key-ready.svelte.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import {
    buildLoginCallbacks,
    type PhaseUpdater,
  } from "$lib/auth/crypto-callbacks.js";
  import { fetchAndUnwrapOrgKey } from "$lib/auth/crypto-helpers.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import { CHECKLIST_ITEMS } from "$lib/onboarding/checklist-items.js";
  import WizardStepper from "$lib/components/onboarding/WizardStepper.svelte";
  import SetupAccount from "$lib/components/onboarding/SetupAccount.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import SetupOrg from "$lib/components/onboarding/SetupOrg.svelte";
  import SetupBranding from "$lib/components/onboarding/SetupBranding.svelte";
  import SetupQueue from "$lib/components/onboarding/SetupQueue.svelte";
  import SetupTelephony from "$lib/components/onboarding/SetupTelephony.svelte";
  import SetupTwoFactor from "$lib/components/onboarding/SetupTwoFactor.svelte";
  import SetupEscrow from "$lib/components/onboarding/SetupEscrow.svelte";
  import SetupInvite from "$lib/components/onboarding/SetupInvite.svelte";

  const setupToken: string = page.params.token ?? "";

  const STORAGE_KEY = "care-y-setup-wizard";

  const STEP_LABELS = [
    m.onboarding_step_account(),
    m.onboarding_step_briefing(),
    m.onboarding_step_twofa(),
    m.onboarding_step_org(),
    m.onboarding_step_branding(),
    m.onboarding_step_queue(withTerms()),
    m.onboarding_step_telephony(),
    m.onboarding_step_escrow(),
    m.onboarding_step_invites(),
  ];

  interface WizardData {
    userId: string;
    adminVolPublic: string;
    twofaEnrolled: boolean;
    orgName: string;
    language: string;
    countryCode: string;
    brandingDone: boolean;
    firstQueueCreated: boolean;
    telephonyMode: "byot" | "managed" | "skip";
    escrowExported: boolean;
    invitesSent: number;
  }

  const WIZARD_STEP_COUNT = STEP_LABELS.length + 1; // labels + completion screen

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

  let step = $state(0);
  let completedSteps = $state(new Set<number>());
  let wizardData = $state<Partial<WizardData>>({});

  const updateTerminology = getContext<(labels: TerminologyLabels) => void>(
    "onboarding-update-terminology",
  );

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  // ── Re-auth for page refresh recovery ──

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  let needsReauth = $state(false);
  let reauthUsername = $state("");
  let reauthPassword = $state("");
  let reauthError = $state("");
  let reauthSubmitting = $state(false);

  async function handleReauth(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    reauthError = "";
    reauthSubmitting = true;

    try {
      await bridge.zeroAll();

      await onboarding.reauthenticate.mutate({
        identifier: reauthUsername,
        password: reauthPassword,
      });

      // eslint-disable-next-line @typescript-eslint/no-empty-function -- reauth has no UI phases to display
      const noopPhase: PhaseUpdater = () => {};
      const result = await loginCrypto(
        reauthUsername,
        reauthPassword,
        bridge,
        buildLoginCallbacks(noopPhase),
      );

      if (result.orgPublicKey !== null) {
        orgKeyManager.load(result.orgPublicKey);
        setOrgKeyReady(true);
      } else {
        const unwrapped = await fetchAndUnwrapOrgKey(bridge);
        if (unwrapped !== null) {
          orgKeyManager.load(unwrapped);
          setOrgKeyReady(true);
        }
      }

      installCleanupHandler(bridge, orgKeyManager);

      haptic();
      needsReauth = false;

      const saved = loadSavedState();
      if (saved !== null && saved.step > 0) {
        step = saved.step;
        completedSteps = new Set(saved.completed);
      } else {
        step = 2;
        completedSteps = new Set([0, 1]);
        saveState(2, completedSteps);
      }
    } catch {
      reauthError = m.auth_invalid_credentials();
    } finally {
      reauthSubmitting = false;
    }
  }

  const statusQuery = createQuery(() => ({
    queryKey: onboardingKeys.status(),
    queryFn: async () => onboarding.getStatus.query(),
    retry: false,
  }));

  let recoveryHandled = $state(false);

  $effect(() => {
    if (!statusQuery.data) return;
    if (recoveryHandled) return;

    if (statusQuery.data.needsSetup) {
      recoveryHandled = true;
      return;
    }

    recoveryHandled = true;

    if (!isOrgKeyReady()) {
      needsReauth = true;
      return;
    }

    const saved = loadSavedState();
    if (saved !== null && saved.step > 0) {
      step = saved.step;
      completedSteps = new Set(saved.completed);
    } else {
      void goto(resolve("/"));
    }
  });

  const isReady = $derived(
    statusQuery.isSuccess && (statusQuery.data.needsSetup || step > 0),
  );

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

  function handleTwofaComplete(): void {
    wizardData = { ...wizardData, twofaEnrolled: true };
    advanceStep();
  }

  function handleOrgComplete(data: {
    orgName: string;
    language: string;
    countryCode: string;
    terminology: TerminologyLabels;
  }): void {
    wizardData = { ...wizardData, ...data };
    updateTerminology(data.terminology);
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

  // --- Completion screen: query checklist state for step 9 ---

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    enabled: step === 9,
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
{:else if needsReauth}
  <BlockTitle medium>{m.onboarding_account_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_reauth_message()}</p>
  </Block>

  {#if reauthError}
    <Block role="alert">
      <p class="step-error">{reauthError}</p>
    </Block>
  {/if}

  <form onsubmit={handleReauth}>
    <List strong inset>
      <ListInput
        label={m.onboarding_account_username()}
        type="text"
        placeholder={m.onboarding_account_username_placeholder()}
        bind:value={reauthUsername}
        autocomplete="username"
        autocapitalize="none"
        disabled={reauthSubmitting}
        required
      />
      <ListInput
        label={m.onboarding_account_password()}
        type="password"
        placeholder={m.onboarding_account_password_placeholder()}
        bind:value={reauthPassword}
        autocomplete="current-password"
        disabled={reauthSubmitting}
        required
      />
    </List>
    <Block>
      <Button
        large
        type="submit"
        disabled={!reauthUsername || !reauthPassword || reauthSubmitting}
      >
        {#if reauthSubmitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.onboarding_firstlogin_signin()}
        {/if}
      </Button>
    </Block>
  </form>
{:else if isReady}
  <WizardStepper steps={STEP_LABELS} currentStep={step} {completedSteps} />

  {#if step === 0}
    <SetupAccount {setupToken} oncomplete={handleAccountComplete} />
  {:else if step === 1}
    <SecurityBriefing onconfirm={advanceStep} />
  {:else if step === 2}
    <SetupTwoFactor
      oncomplete={handleTwofaComplete}
      userId={wizardData.userId ?? ""}
      username={wizardData.userId ?? ""}
    />
  {:else if step === 3}
    <SetupOrg oncomplete={handleOrgComplete} />
  {:else if step === 4}
    <SetupBranding
      orgName={wizardData.orgName ?? ""}
      oncomplete={handleBrandingComplete}
      onskip={handleBrandingSkip}
    />
  {:else if step === 5}
    <SetupQueue oncomplete={handleQueueComplete} />
  {:else if step === 6}
    <SetupTelephony oncomplete={handleTelephonyComplete} />
  {:else if step === 7}
    <SetupEscrow oncomplete={handleEscrowComplete} />
  {:else if step === 8}
    <SetupInvite oncomplete={handleInviteComplete} />
  {:else if step === 9}
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
      <Button
        large
        onclick={() => {
          clearState();
          void goto(resolve("/"));
        }}
      >
        {m.onboarding_wizard_complete_go()}
      </Button>
    </Block>
  {/if}
{/if}

<style>
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
