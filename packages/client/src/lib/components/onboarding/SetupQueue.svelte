<!--
  SetupQueue: wizard step 4 (first queue creation).

  Encrypts queue name with orgKeyManager before sending.
  Follows the same encrypt-then-submit pattern as QueueEditor.
-->
<script lang="ts">
  import { List, ListInput, Button, Block, Preloader } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { queueKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

  interface Props {
    oncomplete: (data: { firstQueueCreated: boolean }) => void;
  }

  let { oncomplete }: Props = $props();

  if (!trpc.tickets) {
    throw new RouterNotAvailableError("tickets");
  }
  const ticketRouter: NonNullable<typeof trpc.tickets> = trpc.tickets;

  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const encoder = new TextEncoder();

  let queueName = $state("");
  let escalationDays = $state("7");
  let error = $state("");

  const nameValid = $derived(queueName.trim().length > 0);

  const parsedDays = $derived.by((): number => {
    const trimmed = escalationDays.trim();
    if (trimmed === "") return 7;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1 || n > 365) return -1;
    return n;
  });

  const daysValid = $derived(parsedDays >= 1);

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedName: string;
      escalateDays: number;
    }) => ticketRouter.createQueue.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.onboarding_queue_created());
      announceToLiveRegion("polite", m.onboarding_queue_created());
      void queryClient.invalidateQueries({ queryKey: queueKeys.all });
      oncomplete({ firstQueueCreated: true });
    },
    onError: () => {
      error = m.onboarding_queue_error();
      toastStore.show(m.onboarding_queue_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_queue_error());
    },
  }));

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const canSubmit = $derived(
    orgKeyLoaded && nameValid && daysValid && !createMut.isPending,
  );

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";

    if (!nameValid) {
      error = m.onboarding_queue_error_name_required();
      return;
    }
    if (!daysValid) {
      error = m.onboarding_queue_error_escalation_range();
      return;
    }

    const plainBytes = encoder.encode(queueName.trim());
    const cipherBytes = await orgKeyManager.encrypt(plainBytes);
    const encryptedName = uint8ArrayToBase64(cipherBytes);

    createMut.mutate({
      encryptedName,
      escalateDays: parsedDays,
    });
  }
</script>

<Block>
  <h2 class="step-heading">{m.onboarding_queue_heading()}</h2>
  <p class="step-subtext">{m.onboarding_queue_subtext()}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="error-text" role="alert">{error}</p>
    </Block>
  {/if}

  <List strong inset>
    <ListInput
      outline
      label={m.onboarding_queue_name_label()}
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
      info={m.onboarding_queue_escalation_hint()}
      disabled={createMut.isPending}
    />
  </List>

  <Block>
    <Button large type="submit" disabled={!canSubmit}>
      {#if createMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_queue_submit()}
      {/if}
    </Button>
  </Block>
</form>

<style>
  .step-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .step-subtext {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    margin: 0;
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
  }
</style>
