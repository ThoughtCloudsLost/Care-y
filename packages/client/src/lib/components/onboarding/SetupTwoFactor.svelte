<script lang="ts">
  import { Block } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import TwoFactorEnrollment from "./TwoFactorEnrollment.svelte";

  interface Props {
    readonly oncomplete: () => void;
    readonly userId: string;
    readonly username: string;
  }

  let { oncomplete, userId, username }: Props = $props();

  let enrolled = $state(false);

  function handleEnrolled(): void {
    enrolled = true;
  }
</script>

<div class="setup-twofa">
  <Block class="step-header">
    <h2 class="step-heading">{m.onboarding_twofa_heading()}</h2>
    <p class="step-desc">{m.onboarding_twofa_desc()}</p>
  </Block>

  <TwoFactorEnrollment {userId} {username} onenrolled={handleEnrolled} />

  <Block class="continue-block">
    <SoftButton full onclick={oncomplete} disabled={!enrolled}>
      {m.onboarding_twofa_continue()}
    </SoftButton>
  </Block>
</div>

<style>
  .setup-twofa {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .step-heading {
    font-size: 1.375rem;
    font-weight: 700;
    margin: 0 0 var(--space-xs);
  }

  .step-desc {
    font-size: 0.9rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }

  .setup-twofa :global(.continue-block) {
    margin-top: auto;
    padding-top: var(--space-md);
  }
</style>
