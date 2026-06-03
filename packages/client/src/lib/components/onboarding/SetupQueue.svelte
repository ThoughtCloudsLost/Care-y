<!--
  SetupQueue: wizard step 5 (queue management).

  Reuses QueuesSection from admin/people. OnboardingCryptoBridge provides
  the contexts QueuesSection needs (OrgDecryptCache, identity, tabbar
  override). A "Create queue" button replaces the admin page's subnavbar
  create action, opening the same QueueEditor sheet.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { haptic } from "$lib/utils/haptic.js";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import QueuesSection from "$lib/components/admin/QueuesSection.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    adminUserId: string;
    oncomplete: (data: { firstQueueCreated: boolean }) => void;
    goBack?: () => void;
  }

  let { adminUserId, oncomplete, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  let finishing = $state(false);
  let queuesSectionRef = $state<QueuesSection>();

  const hasQueues = $derived((queuesSectionRef?.totalQueues() ?? 0) > 0);

  function handleAddQueue(): void {
    queuesSectionRef?.openEditor("new");
  }

  function handleFinish(): void {
    finishing = true;
    haptic();
    oncomplete({ firstQueueCreated: true });
  }

  $effect(() => {
    wizardNav.current = {
      right: {
        label: m.common_next(),
        disabled: !hasQueues || finishing,
        loading: finishing,
        onaction: handleFinish,
      },
      left: goBack
        ? {
            label: m.common_back(),
            disabled: finishing,
            loading: false,
            onaction: goBack,
          }
        : undefined,
    };
  });
</script>

<BlockTitle medium>{m.onboarding_queue_heading(withTerms())}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_queue_subtext(withTerms())}</p>
</Block>

<Block>
  <SoftButton full onclick={handleAddQueue} disabled={finishing}>
    {m.admin_queues_create_button(withTerms())}
  </SoftButton>
</Block>

<OnboardingCryptoBridge {adminUserId}>
  <QueuesSection bind:this={queuesSectionRef} />
</OnboardingCryptoBridge>
