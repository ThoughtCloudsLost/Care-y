<!--
  SetupEscrow: wizard step 7 (escrow file export).
  Renders the shared EscrowFlow inline (not in a popup) with
  onboarding-specific features: page dots, HTTPS check,
  back navigation, and download-again dialog.
-->
<script lang="ts">
  import { BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import EscrowFlow from "$lib/components/shared/EscrowFlow.svelte";

  interface Props {
    oncomplete: () => void;
  }

  let { oncomplete }: Props = $props();
</script>

<BlockTitle medium>{m.admin_escrow_step_education_heading()}</BlockTitle>

<EscrowFlow
  {oncomplete}
  completeLabel={m.onboarding_escrow_continue()}
  showPageDots
  showHttpsCheck
  showDownloadAgain
  showBackButton
  scrollContainer=".onboarding-content"
/>
