<!--
  SetupEscrow: wizard step 7 (escrow file export).
  Renders the shared EscrowFlow inline (not in a popup) with
  onboarding-specific features: page dots, HTTPS check,
  back navigation, and download-again dialog.
  Nav buttons are rendered by the layout via WizardNavContext.
-->
<script lang="ts">
  import { BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import EscrowFlow from "$lib/components/shared/EscrowFlow.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    oncomplete: () => void;
    goBack?: () => void;
  }

  let { oncomplete, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();
  let escrowRef = $state<EscrowFlow>();

  $effect(() => {
    const ref = escrowRef;
    const flowStep = Number(ref?.getStep() ?? 0);
    const orgKeyLoaded = Boolean(ref?.isOrgKeyLoaded());

    if (flowStep === 0) {
      wizardNav.current = {
        right: {
          label: m.common_next(),
          disabled: !orgKeyLoaded,
          loading: false,
          onaction() {
            ref?.goNext();
          },
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
    } else if (flowStep === 1) {
      wizardNav.current = {
        right: {
          label: m.common_next(),
          disabled: true,
          loading: false,
          onaction() {
            /* disabled, no-op */
          },
        },
        left: {
          label: m.common_back(),
          disabled: false,
          loading: false,
          onaction() {
            ref?.goPrev();
          },
        },
      };
    } else {
      wizardNav.current = {
        right: {
          label: m.common_next(),
          disabled: false,
          loading: false,
          onaction: oncomplete,
        },
        left: {
          label: m.onboarding_escrow_download_again(),
          disabled: false,
          loading: false,
          onaction() {
            ref?.openDownloadAgainDialog();
          },
        },
      };
    }
  });
</script>

<BlockTitle medium>{m.admin_escrow_step_education_heading()}</BlockTitle>

<EscrowFlow
  bind:this={escrowRef}
  {oncomplete}
  completeLabel={m.onboarding_escrow_continue()}
  showPageDots
  showHttpsCheck
  showDownloadAgain
  showBackButton
  externalNav
  scrollContainer=".onboarding-content"
/>
