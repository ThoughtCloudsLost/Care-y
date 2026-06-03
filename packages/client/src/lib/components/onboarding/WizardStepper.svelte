<!--
  WizardStepper: progress indicator for the org setup wizard.

  Shows a Konsta Progressbar with step count text below.
  On wider viewports (640px+), also displays the current step label.

  Display-only (not interactive). Steps are not tappable because the
  wizard enforces sequential completion.
-->
<script lang="ts">
  import { Progressbar } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    steps: string[];
    currentStep: number;
    completedSteps: Set<number>;
  }

  let { steps, currentStep, completedSteps: _completedSteps }: Props = $props();

  const progress = $derived(currentStep / steps.length);
  const currentLabel = $derived(steps.at(currentStep) ?? "");
  const progressText = $derived(
    m.onboarding_stepper_progress({
      current: String(currentStep + 1),
      total: String(steps.length),
    }),
  );
</script>

<div
  class="wizard-stepper"
  role="group"
  aria-label={m.onboarding_stepper_label()}
>
  <Progressbar {progress} />
  <p class="stepper-text" aria-hidden="true">
    <span>{progressText}</span>
    <span class="stepper-label">{currentLabel}</span>
  </p>
  <span class="sr-only">{progressText}</span>
</div>

<style>
  .wizard-stepper {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .stepper-text {
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
    margin: 0;
  }

  .stepper-label {
    display: none;
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
    .stepper-label {
      display: inline;
    }

    .stepper-label::before {
      content: " \00b7  ";
    }
  }
</style>
