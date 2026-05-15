<!--
  SetupQueue: wizard step 4 (first queue creation).

  Encrypts queue name with orgKeyManager before sending.
  Follows the same encrypt-then-submit pattern as QueueEditor.
-->
<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { queueKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { MAX_ESCALATION_DAYS } from "@care-y/shared";
  import { requireRouter } from "$lib/errors.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

  interface Props {
    oncomplete: (data: { firstQueueCreated: boolean }) => void;
  }

  let { oncomplete }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();

  let queueName = $state("");
  let escalationDays = $state("7");
  let error = $state("");

  const nameValid = $derived(queueName.trim().length > 0);

  const parsedDays = $derived.by((): number => {
    const trimmed = escalationDays.trim();
    if (trimmed === "") return 7;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1 || n > MAX_ESCALATION_DAYS) return -1;
    return n;
  });

  const daysValid = $derived(parsedDays >= 1);

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedName: string;
      escalateDays: number;
    }) => ticketRouter.createQueue.mutate(input),
  }));

  const orgKeyLoaded = $derived(isOrgKeyReady());
  const canSubmit = $derived(
    orgKeyLoaded && nameValid && daysValid && !createMut.isPending,
  );

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";

    if (!nameValid) {
      error = m.onboarding_queue_error_name_required(withTerms());
      return;
    }
    if (!daysValid) {
      error = m.onboarding_queue_error_escalation_range();
      return;
    }

    const encryptedName = await orgKeyManager.encryptText(queueName.trim());

    try {
      await createMut.mutateAsync({
        encryptedName,
        escalateDays: parsedDays,
      });
      haptic();
      toastStore.show(m.onboarding_queue_created(withTerms()));
      announceToLiveRegion("polite", m.onboarding_queue_created(withTerms()));
      void queryClient.invalidateQueries({ queryKey: queueKeys.all });
      oncomplete({ firstQueueCreated: true });
    } catch {
      error = m.onboarding_queue_error(withTerms());
      toastStore.show(m.onboarding_queue_error(withTerms()), 3000);
      announceToLiveRegion("assertive", m.onboarding_queue_error(withTerms()));
    }
  }
</script>

<BlockTitle medium>{m.onboarding_queue_heading(withTerms())}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_queue_subtext(withTerms())}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="step-error" role="alert">{error}</p>
    </Block>
  {/if}

  <List strong inset>
    <ListInput
      outline
      label={m.onboarding_queue_name_label(withTerms())}
      type="text"
      placeholder={m.onboarding_queue_name_placeholder()}
      value={queueName}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) queueName = e.target.value;
      }}
      disabled={createMut.isPending}
    />

    <ListInput
      outline
      label={m.onboarding_queue_escalation_label()}
      type="number"
      placeholder="7"
      value={escalationDays}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          escalationDays = e.target.value;
      }}
      info={m.onboarding_queue_escalation_hint(withTerms())}
      disabled={createMut.isPending}
    />
  </List>

  <Block>
    <Button large type="submit" disabled={!canSubmit}>
      {#if createMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_queue_submit(withTerms())}
      {/if}
    </Button>
  </Block>
</form>
