<script lang="ts">
  import { Block, List, ListItem, Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";

  interface Props {
    onconfirm: () => void;
  }

  const { onconfirm }: Props = $props();

  let scrolledToBottom = $state(false);
  let sentinelEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            scrolledToBottom = true;
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelEl);

    return () => {
      observer.disconnect();
    };
  });

  function handleConfirm(): void {
    if (!scrolledToBottom) return;
    haptic();
    toastStore.show(m.onboarding_step_complete());
    announceToLiveRegion("polite", m.onboarding_step_complete());
    onconfirm();
  }

  const protectionRows = [
    {
      data: m.onboarding_briefing_practice_client_data(),
      access: m.onboarding_briefing_practice_client_access(),
      compromise: m.onboarding_briefing_practice_client_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_org_data(),
      access: m.onboarding_briefing_practice_org_access(),
      compromise: m.onboarding_briefing_practice_org_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_branding_data(),
      access: m.onboarding_briefing_practice_branding_access(),
      compromise: m.onboarding_briefing_practice_branding_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_vol_data(),
      access: m.onboarding_briefing_practice_vol_access(),
      compromise: m.onboarding_briefing_practice_vol_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_username_data(),
      access: m.onboarding_briefing_practice_username_access(),
      compromise: m.onboarding_briefing_practice_username_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_email_data(),
      access: m.onboarding_briefing_practice_email_access(),
      compromise: m.onboarding_briefing_practice_email_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_telephony_data(),
      access: m.onboarding_briefing_practice_telephony_access(),
      compromise: m.onboarding_briefing_practice_telephony_compromise(),
    },
  ];

  const scenarios = [
    {
      title: m.onboarding_briefing_scenario_seizure_title(),
      body: m.onboarding_briefing_scenario_seizure_body(),
    },
    {
      title: m.onboarding_briefing_scenario_oprf_title(),
      body: m.onboarding_briefing_scenario_oprf_body(),
    },
    {
      title: m.onboarding_briefing_scenario_device_title(),
      body: m.onboarding_briefing_scenario_device_body(),
    },
    {
      title: m.onboarding_briefing_scenario_insider_title(),
      body: m.onboarding_briefing_scenario_insider_body(),
    },
    {
      title: m.onboarding_briefing_scenario_telephony_title(),
      body: m.onboarding_briefing_scenario_telephony_body(),
    },
    {
      title: m.onboarding_briefing_scenario_network_title(),
      body: m.onboarding_briefing_scenario_network_body(),
    },
  ];

  const choices = [
    {
      title: m.onboarding_briefing_choice_telephony_title(),
      body: m.onboarding_briefing_choice_telephony_body(),
    },
    {
      title: m.onboarding_briefing_choice_2fa_title(),
      body: m.onboarding_briefing_choice_2fa_body(),
    },
    {
      title: m.onboarding_briefing_choice_tor_title(),
      body: m.onboarding_briefing_choice_tor_body(),
    },
  ];
</script>

<div class="briefing-content">
  <Block>
    <h2 class="briefing-heading">{m.onboarding_briefing_heading()}</h2>
    <p class="briefing-prose">{m.onboarding_briefing_intro()}</p>
  </Block>

  <Block>
    <img
      src="/images/crypto-overview.png"
      alt={m.onboarding_briefing_diagram_alt()}
      class="crypto-diagram"
    />
  </Block>

  <Block>
    <h3 class="briefing-subheading">
      {m.onboarding_briefing_practice_heading()}
    </h3>
  </Block>

  <div class="protection-table-header">
    <span class="col-label"
      >{m.onboarding_briefing_practice_col_protected()}</span
    >
    <span class="col-label">{m.onboarding_briefing_practice_col_access()}</span>
    <span class="col-label"
      >{m.onboarding_briefing_practice_col_compromise()}</span
    >
  </div>
  <List strong inset>
    {#each protectionRows as row (row.data)}
      <ListItem title={row.data} subtitle={row.access} text={row.compromise} />
    {/each}
  </List>

  <Block>
    <h3 class="briefing-subheading">
      {m.onboarding_briefing_scenarios_heading()}
    </h3>
  </Block>

  {#each scenarios as scenario (scenario.title)}
    <div class="scenario-wrapper">
      <details>
        <summary class="scenario-summary touch-feedback"
          >{scenario.title}</summary
        >
        <div class="scenario-body">
          <p>{scenario.body}</p>
        </div>
      </details>
    </div>
  {/each}

  <Block>
    <h3 class="briefing-subheading">
      {m.onboarding_briefing_choices_heading()}
    </h3>
    <p class="briefing-prose">{m.onboarding_briefing_choices_intro()}</p>
  </Block>

  {#each choices as choice (choice.title)}
    <div class="scenario-wrapper">
      <details>
        <summary class="scenario-summary touch-feedback">{choice.title}</summary
        >
        <div class="scenario-body">
          <p>{choice.body}</p>
        </div>
      </details>
    </div>
  {/each}

  <div bind:this={sentinelEl} class="scroll-sentinel" aria-hidden="true"></div>
</div>

<div class="confirm-bar">
  {#if !scrolledToBottom}
    <p class="scroll-hint" aria-live="polite">
      {m.onboarding_briefing_scroll_hint()}
    </p>
  {/if}
  <Button
    large
    disabled={!scrolledToBottom}
    aria-disabled={!scrolledToBottom}
    onclick={handleConfirm}
  >
    {m.onboarding_briefing_confirm()}
  </Button>
</div>

<style>
  .briefing-content {
    padding-bottom: 5rem;
  }

  .briefing-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.75rem;
  }

  .briefing-subheading {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .briefing-prose {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--ink, #1f2937);
    margin: 0;
  }

  .crypto-diagram {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    display: block;
    border-radius: 0.5rem;
    background: var(--surface-1, #f9fafb);
    padding: 0.5rem;
  }

  .protection-table-header {
    display: flex;
    gap: 0.5rem;
    padding: 0 1.5rem;
    margin-bottom: 0.25rem;
  }

  .col-label {
    flex: 1;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted, #6b7280);
  }

  .scenario-wrapper {
    margin: 0 1rem 0.5rem;
  }

  .scenario-summary {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ink, #1f2937);
    padding: 0.75rem 1rem;
    background: var(--surface-2, #f3f4f6);
    border-radius: 0.5rem;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .scenario-summary::before {
    content: "\25B6";
    font-size: 0.625rem;
    transition: transform 150ms linear;
    display: inline-block;
    color: var(--muted, #6b7280);
  }

  @media (prefers-reduced-motion: reduce) {
    .scenario-summary::before {
      transition: none;
    }
  }

  details[open] > .scenario-summary::before {
    transform: rotate(90deg);
  }

  .scenario-summary::-webkit-details-marker {
    display: none;
  }

  .scenario-body {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--ink, #1f2937);
  }

  .scenario-body p {
    margin: 0;
  }

  .scroll-sentinel {
    height: 1px;
    width: 1px;
  }

  .confirm-bar {
    position: sticky;
    bottom: 0;
    background: var(--paper, #faf8f5);
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--surface-2, #e5e7eb);
    text-align: center;
  }

  .scroll-hint {
    font-size: 0.8125rem;
    color: var(--muted, #6b7280);
    margin: 0 0 0.5rem;
  }
</style>
