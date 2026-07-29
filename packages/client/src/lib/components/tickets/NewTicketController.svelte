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
  import type {
    CollisionInfo,
    ClientSearchResult,
    PhoneLookupResult,
  } from "$lib/components/inputs/ClientSelect.svelte";
  import { isPhoneLookupResult } from "$lib/components/inputs/client-select-types.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter, RelayError } from "$lib/errors.js";
  import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
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
        keyWrap: payload.keyWrap,
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

  async function searchClients(query: string): Promise<ClientSearchResult[]> {
    const raw = await ticketRouter.searchClients.query({ query, limit: 10 });
    return raw.map((r) => ({
      ...r,
      alias:
        orgCache.decrypt(`client-alias:${r.id}`, r.encryptedAlias) ??
        r.id.slice(0, 8),
    }));
  }

  async function phoneLookup(phone: string): Promise<PhoneLookupResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (import.meta.env.DEV) {
      headers["x-org-slug"] = DEV_ORG_SLUG;
    }

    const res = await fetch("/relay/phone-lookup", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      throw new RelayError("PHONE_LOOKUP_FAILED", res.status);
    }

    // Validate the shape rather than casting: this is a fetch boundary, and
    // the guard exists for it.
    const raw: unknown = await res.json();
    if (!isPhoneLookupResult(raw)) {
      throw new RelayError("PHONE_LOOKUP_MALFORMED", res.status);
    }
    if (!raw.found) return raw;

    // Fall back to a short client id while the alias is still decrypting or
    // if it cannot be decrypted, so the field is never blank.
    return {
      ...raw,
      alias:
        orgCache.decrypt(`client-alias:${raw.clientId}`, raw.encryptedAlias) ??
        raw.clientId.slice(0, 8),
    };
  }
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
    queues={decryptedQueues}
    {searchClients}
    {phoneLookup}
    onsubmit={(p) => createTicketMutation.mutate(p)}
    oncollision={handleCollision}
    submitting={isPending}
    {formId}
    bind:canSubmit
  />
</ShellSheet>
