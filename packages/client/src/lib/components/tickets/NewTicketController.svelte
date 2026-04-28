<!--
  New ticket popup controller.
  Owns data fetching (queues), mutation (createTicket), and collision navigation.
  Layout renders this with bind:opened. Same pattern as AssignSheet.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import NewTicketForm from "./NewTicketForm.svelte";
  import type { NewTicketPayload } from "./NewTicketForm.svelte";
  import type { CollisionInfo } from "./ClientSelect.svelte";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import * as m from "$lib/paraglide/messages.js";

  /* eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- $bindable() is required for bind:, not a default */
  let { opened = $bindable() }: { opened: boolean } = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"],
    queryFn: async () => ticketRouter.listQueues.query(),
    enabled: opened,
  }));

  const decryptedQueues = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      id: q.id,
      name: orgCache.decrypt(`queue:${q.id}`, q.encryptedName) ?? "...",
    })),
  );

  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- NewTicketPayload fields are strongly typed; eslint can't resolve .svelte module exports */
  const createTicketMutation = createMutation(() => ({
    mutationFn: async (payload: NewTicketPayload) =>
      ticketRouter.create.mutate({
        clientId: payload.clientId,
        clientToken: payload.clientToken,
        queueId: payload.queueId,
        encryptedTitle: payload.encryptedTitle,
        encryptedDescription: payload.encryptedDescription,
        priority: payload.priority,
        keyGeneration: payload.keyGeneration,
        keyWrap: payload.keyWrap,
      }),
    onSuccess: () => {
      toastStore.show(m.ticket_new_success());
      opened = false;
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
    onError: () => {
      toastStore.show(m.ticket_new_error_submit_failed(), 3000);
    },
  }));

  function handleCollision(info: CollisionInfo): void {
    opened = false;
    const ticketId: string = info.openTicketId;
    void goto(resolve(`/tickets/${ticketId}`));
  }
</script>

<ShellPopup
  {opened}
  ondismiss={() => (opened = false)}
  title={m.ticket_new_title()}
>
  <NewTicketForm
    queues={decryptedQueues}
    onsubmit={(p) => createTicketMutation.mutate(p)}
    oncancel={() => (opened = false)}
    oncollision={handleCollision}
    submitting={createTicketMutation.isPending}
  />
</ShellPopup>
