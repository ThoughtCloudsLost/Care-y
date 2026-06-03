<script lang="ts">
  import { Link, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import {
    setWizardNavCtx,
    type WizardNavContainer,
  } from "$lib/components/onboarding/wizard-nav-context.js";

  interface Props {
    opened: boolean;
    onclose: () => void;
  }

  const { opened, onclose }: Props = $props();

  let wizardNav = $state<WizardNavContainer>({ current: undefined });
  setWizardNavCtx(wizardNav);

  const navLeft = $derived(wizardNav.current?.left);
  const navRight = $derived(wizardNav.current?.right);
</script>

<ShellPopup
  {opened}
  ondismiss={onclose}
  ariaLabel={m.onboarding_briefing_heading()}
>
  {#snippet left()}
    {#if navLeft}
      <Link
        class={navLeft.disabled ? "nav-disabled" : ""}
        aria-disabled={navLeft.disabled}
        onclick={navLeft.disabled ? undefined : navLeft.onaction}
      >
        {navLeft.label}
      </Link>
    {/if}
  {/snippet}
  {#snippet right()}
    {#if navRight}
      {@const isDisabled = navRight.disabled || navRight.loading}
      <Link
        class={isDisabled ? "nav-disabled" : ""}
        aria-disabled={isDisabled}
        onclick={isDisabled ? undefined : () => void navRight.onaction()}
      >
        {#if navRight.loading}
          <Preloader class="w-5 h-5" />
        {:else}
          {navRight.label}
        {/if}
      </Link>
    {/if}
  {/snippet}
  {#if opened}
    <SecurityBriefing onconfirm={onclose} goBack={onclose} />
  {/if}
</ShellPopup>
