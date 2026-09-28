<!--
  New ticket sheet controller.
  Owns data fetching (queues), mutation (createTicket), and collision navigation.
  Same pattern as InternalNoteSheet / DisplayNameSheet.
-->
<script lang="ts">
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import NewTicketForm from "./NewTicketForm.svelte";
  import type { NewTicketPayload } from "./NewTicketForm.svelte";
  import type { CollisionInfo } from "$lib/components/inputs/ClientSelect.svelte";
  import { createClientSelectSearch } from "$lib/components/inputs/client-select-search.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { decryptQueueAppearance } from "$lib/utils/queue-appearance.js";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  interface Props {
    opened: boolean;
    ondismiss: () => void;
    oncollision: (ticketId: string) => void;
  }

  let { opened, ondismiss, oncollision }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"],
    queryFn: async () => ticketRouter.listQueues.query(),
    enabled: opened,
  }));

  const decryptedQueues = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      id: q.id,
      name:
        orgCache.decrypt(`queue:${q.id}`, q.encryptedName, {
          table: "queues",
          id: q.id,
        }) ?? "...",
      appearance: decryptQueueAppearance(orgCache, q),
    })),
  );

  let canSubmit = $state(false);
  const formId = "new-ticket-form";

  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- NewTicketPayload fields are strongly typed; eslint can't resolve .svelte module exports */
  const createTicketMutation = createMutation(() => ({
    mutationFn: async (payload: NewTicketPayload) =>
      ticketRouter.create.mutate({
        id: payload.id,
        clientId: payload.clientId,
        clientToken: payload.clientToken,
        queueId: payload.queueId,
        encryptedTitle: payload.encryptedTitle,
        encryptedDescription: payload.encryptedDescription,
        priority: payload.priority,
        keyGeneration: payload.keyGeneration,
        keyWraps: [...payload.keyWraps],
      }),
    onSuccess: () => {
      toastStore.show(m.ticket_new_success(withTerms()));
      ondismiss();
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
    onError: () => {
      toastStore.show(m.ticket_new_error_submit_failed(withTerms()), 3000);
    },
  }));

  const isPending = $derived(createTicketMutation.isPending);

  function handleCollision(info: CollisionInfo): void {
    ondismiss();
    const ticketId: string = info.openTicketId;
    oncollision(ticketId);
  }

  const clientSearch = createClientSelectSearch({
    ticketRouter,
    orgCache,
    orgKeyManager,
  });

  $effect(() => {
    if (!opened) {
      clientSearch.reset();
    }
  });
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_new_title(withTerms())}
  title={m.ticket_new_title(withTerms())}
>
  {#snippet headerRight()}
    <SoftButton type="submit" form={formId} disabled={!canSubmit || isPending}>
      {isPending ? m.ticket_new_submitting() : m.ticket_new_submit(withTerms())}
    </SoftButton>
  {/snippet}
  <NewTicketForm
    resolveCreateTarget={async (clientId: string) =>
      ticketRouter.resolveCreateTarget.query({ clientId })}
    fetchQueueMemberKeys={async (qId: string) =>
      ticketRouter.listQueueMemberPublicKeys.query({ queueId: qId })}
    queues={decryptedQueues}
    searchClients={clientSearch.search}
    phoneLookup={clientSearch.phoneLookup}
    onsubmit={(p) => createTicketMutation.mutate(p)}
    oncollision={handleCollision}
    submitting={isPending}
    {formId}
    bind:canSubmit
  />
</ShellSheet>
