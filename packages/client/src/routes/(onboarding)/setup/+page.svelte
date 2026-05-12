<!--
  Org setup wizard: single route with client-side step navigation.

  Steps (array indices 0-8): account, briefing, org, branding,
  queue, telephony, escrow, invites, complete.
  Each step component calls oncomplete() to advance.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    Preloader,
    Block,
    BlockTitle,
    Button,
    List,
    ListItem,
  } from "konsta/svelte";
  import { CircleCheck, Circle } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
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

  const STORAGE_KEY = "care-y-setup-wizard";

  const STEP_LABELS = [
    m.onboarding_step_account(),
    m.onboarding_step_briefing(),
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
    orgName: string;
    language: string;
    countryCode: string;
    brandingDone: boolean;
    firstQueueCreated: boolean;
    telephonyMode: "byot" | "managed" | "skip";
    escrowExported: boolean;
    invitesSent: number;
  }

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
    if (!statusQuery.data) return;

    if (statusQuery.data.needsSetup) {
      return;
    }

    const saved = loadSavedState();
    if (saved !== null && saved.step > 0) {
      step = saved.step;
      completedSteps = new Set(saved.completed);
    } else {
      void goto(resolve("/login"));
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

  // --- Completion screen: query checklist state for step 8 ---

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    enabled: step === 8,
  }));

  interface NextStepMeta {
    readonly id: string;
    readonly label: () => string;
    readonly desc: () => string;
  }

  const nextSteps: NextStepMeta[] = [
    {
      id: "invite",
      label: m.getting_started_invite,
      desc: m.getting_started_invite_desc,
    },
    {
      id: "branding",
      label: m.getting_started_branding,
      desc: m.getting_started_branding_desc,
    },
    {
      id: "greetings",
      label: m.getting_started_greetings,
      desc: m.getting_started_greetings_desc,
    },
    {
      id: "sms",
      label: m.getting_started_sms,
      desc: m.getting_started_sms_desc,
    },
    {
      id: "presets",
      label: m.getting_started_presets,
      desc: () => m.getting_started_presets_desc(withTerms()),
    },
    {
      id: "kb",
      label: () => m.getting_started_kb(withTerms()),
      desc: () => m.getting_started_kb_desc(withTerms()),
    },
    {
      id: "queues",
      label: () => m.getting_started_queues(withTerms()),
      desc: () => m.getting_started_queues_desc(withTerms()),
    },
    {
      id: "retention",
      label: m.getting_started_retention,
      desc: m.getting_started_retention_desc,
    },
  ];

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
