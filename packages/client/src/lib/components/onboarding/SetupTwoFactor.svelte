<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import TwoFactorEnrollment from "./TwoFactorEnrollment.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    readonly oncomplete: () => void;
    readonly username: string;
    readonly goBack?: () => void;
  }

  let { oncomplete, username, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  let enrolled = $state(false);

  function handleEnrolled(): void {
    enrolled = true;
  }

  $effect(() => {
    wizardNav.current = {
      right: {
        label: m.common_next(),
        disabled: !enrolled,
        loading: false,
        onaction: oncomplete,
      },
      left: goBack
        ? {
            label: m.common_back(),
            disabled: false,
            loading: false,
            onaction: goBack,
          }
        : undefined,
    };
  });
</script>

<BlockTitle medium>{m.onboarding_twofa_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_twofa_desc()}</p>
</Block>

<TwoFactorEnrollment {username} onenrolled={handleEnrolled} />
