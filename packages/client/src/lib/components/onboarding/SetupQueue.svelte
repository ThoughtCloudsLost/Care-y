<!--
  SetupQueue: wizard step 5 (queue management).

  Reuses QueuesSection from admin/people. OnboardingCryptoBridge provides
  the contexts QueuesSection needs (OrgDecryptCache, identity, tabbar
  override). A "Create queue" button replaces the admin page's subnavbar
  create action, opening the same QueueEditor sheet.
-->
<script lang="ts">
  import { Block, BlockTitle, Preloader } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import QueuesSection from "$lib/components/admin/QueuesSection.svelte";

  interface Props {
    adminUserId: string;
    oncomplete: (data: { firstQueueCreated: boolean }) => void;
  }

  let { adminUserId, oncomplete }: Props = $props();

  let finishing = $state(false);
  let queuesSectionRef = $state<QueuesSection>();

  const hasQueues = $derived((queuesSectionRef?.totalQueues() ?? 0) > 0);

  function handleAddQueue(): void {
    queuesSectionRef?.openEditor("new");
  }

  function handleFinish(): void {
    finishing = true;
    haptic();
    toastStore.show(m.onboarding_queue_created(withTerms()));
    announceToLiveRegion("polite", m.onboarding_queue_created(withTerms()));
    oncomplete({ firstQueueCreated: true });
  }
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

{#if hasQueues}
  <Block>
    <SoftButton full disabled={finishing} onclick={handleFinish}>
      {#if finishing}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_queue_submit(withTerms())}
      {/if}
    </SoftButton>
  </Block>
{/if}
