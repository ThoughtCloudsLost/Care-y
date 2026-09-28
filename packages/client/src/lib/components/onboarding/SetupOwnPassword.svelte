<!--
  SetupOwnPassword: onboarding step for an account an administrator
  created directly. The holder signed in with the temporary password the
  administrator chose and replaces it here, using the same form as the
  settings password sheet. Next submits the form; oncomplete runs once
  the change has gone through.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import PasswordChangeForm from "$lib/components/settings/PasswordChangeForm.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    readonly oncomplete: () => void | Promise<void>;
    readonly userId: string;
    readonly goBack?: () => void;
  }

  let { oncomplete, userId, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  let form = $state<ReturnType<typeof PasswordChangeForm> | null>(null);

  // One object so the flags bound from the form are read as live state in
  // the effect below (a bare `let` never assigned in script narrows to false).
  const formState = $state({ canSubmit: false, pending: false });

  async function handleNext(): Promise<void> {
    await form?.submit();
  }

  $effect(() => {
    wizardNav.current = {
      right: {
        label: m.common_next(),
        disabled: !formState.canSubmit || formState.pending,
        loading: formState.pending,
        onaction: handleNext,
      },
      left: goBack
        ? {
            label: m.common_back(),
            disabled: formState.pending,
            loading: false,
            onaction: goBack,
          }
        : undefined,
    };
  });
</script>

<BlockTitle medium>{m.onboarding_password_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_password_desc()}</p>
</Block>

<PasswordChangeForm
  bind:this={form}
  bind:canSubmit={formState.canSubmit}
  bind:pending={formState.pending}
  {userId}
  ondone={oncomplete}
/>
