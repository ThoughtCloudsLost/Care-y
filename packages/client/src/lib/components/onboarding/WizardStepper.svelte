<!--
  WizardStepper: horizontal step indicator for the org setup wizard.

  On narrow viewports (<640px), collapses to "Step X of Y" text.
  On wider viewports, renders numbered circles with labels.

  Display-only (not interactive). Steps are not tappable because the
  wizard enforces sequential completion.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    steps: string[];
    currentStep: number;
    completedSteps: Set<number>;
  }

  let { steps, currentStep, completedSteps }: Props = $props();
</script>

<div class="wizard-stepper">
  <!-- Mobile: text-only progress -->
  <p class="stepper-mobile" aria-hidden="true">
    {m.onboarding_stepper_progress({
      current: String(currentStep + 1),
      total: String(steps.length),
    })}
  </p>

  <!-- Tablet+: numbered circles -->
  <ol class="stepper-desktop" aria-label={m.onboarding_stepper_label()}>
    {#each steps as label, i (i)}
      {@const isCurrent = i === currentStep}
      {@const isCompleted = completedSteps.has(i)}
      <li
        class="stepper-item"
        class:stepper-item--active={isCurrent}
        class:stepper-item--completed={isCompleted}
        aria-current={isCurrent ? "step" : undefined}
      >
        <span class="stepper-circle">
          {#if isCompleted}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              class="stepper-check"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          {:else}
            {i + 1}
          {/if}
        </span>
        <span class="stepper-label">{label}</span>
      </li>
    {/each}
  </ol>

  <!-- Screen reader: accessible progress summary -->
  <span class="sr-only">
    {m.onboarding_stepper_progress({
      current: String(currentStep + 1),
      total: String(steps.length),
    })}
  </span>
</div>

<style>
  .wizard-stepper {
    margin-bottom: 1.5rem;
  }

  .stepper-mobile {
    display: block;
    text-align: center;
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
  }

  .stepper-desktop {
    display: none;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: center;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .stepper-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-width: 3rem;
  }

  .stepper-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--muted, #6b7280);
    opacity: 0.4;
    color: white;
    transition:
      opacity 150ms linear,
      background 150ms linear;
  }

  .stepper-item--active .stepper-circle {
    background: var(--brand-primary, #4f46e5);
    opacity: 1;
  }

  .stepper-item--completed .stepper-circle {
    background: var(--brand-primary, #4f46e5);
    opacity: 0.7;
  }

  .stepper-check {
    width: 1rem;
    height: 1rem;
  }

  .stepper-label {
    font-size: 0.625rem;
    color: var(--muted, #6b7280);
    text-align: center;
    white-space: nowrap;
  }

  .stepper-item--active .stepper-label {
    color: var(--ink, #1f2937);
    font-weight: 600;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (min-width: 640px) {
    .stepper-mobile {
      display: none;
    }

    .stepper-desktop {
      display: flex;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stepper-circle {
      transition: none;
    }
  }
</style>
