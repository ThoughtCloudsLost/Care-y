<!--
  SetupQueue: wizard step 4 (first queue creation).
  Composes QueueForm (shared) and handles the tRPC mutation + toast.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { queueKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import QueueForm from "$lib/components/shared/QueueForm.svelte";

  interface Props {
    oncomplete: (data: { firstQueueCreated: boolean }) => void;
  }

  let { oncomplete }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedName: string;
      escalateDays: number;
    }) => ticketRouter.createQueue.mutate(input),
  }));

  async function handleSubmit(data: {
    encryptedName: string;
    escalateDays: number;
  }): Promise<void> {
    await createMut.mutateAsync(data);
    haptic();
    toastStore.show(m.onboarding_queue_created(withTerms()));
    announceToLiveRegion("polite", m.onboarding_queue_created(withTerms()));
    void queryClient.invalidateQueries({ queryKey: queueKeys.all });
    oncomplete({ firstQueueCreated: true });
  }
</script>

<BlockTitle medium>{m.onboarding_queue_heading(withTerms())}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_queue_subtext(withTerms())}</p>
</Block>

<QueueForm
  mode="create"
  submitLabel={m.onboarding_queue_submit(withTerms())}
  onsubmit={handleSubmit}
  disabled={createMut.isPending}
/>
