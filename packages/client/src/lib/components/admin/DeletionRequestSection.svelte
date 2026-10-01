<script lang="ts">
  import { Card, List, ListInput, DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { RotateCcw, Trash } from "@lucide/svelte";
  import { ORG_DELETION_COOLING_OFF_DAYS } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { orgDeletionKeys } from "$lib/query/keys.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import { formatShortDate } from "$lib/utils/time.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  const orgDeletion = requireRouter(trpc.orgDeletion, "orgDeletion");
  const queryClient = useQueryClient();

  // The slug the server resolves this org by: the subdomain in production,
  // the dev slug the tRPC link sends in development.
  const orgSlug = getOrgSlug();

  // Empty when no slug resolves: Konsta renders no info line for "", and
  // the request button can never enable without a slug to match.
  const confirmHint =
    orgSlug !== null ? m.org_deletion_confirm_hint({ slug: orgSlug }) : "";

  const statusQuery = createQuery(() => ({
    queryKey: orgDeletionKeys.status(),
    queryFn: async () => orgDeletion.status.query(),
  }));

  // The server never returns a cancelled row; treating one as "no request"
  // keeps every branch below reachable only for the statuses it names.
  const request = $derived(
    statusQuery.data != null && statusQuery.data.status !== "cancelled"
      ? statusQuery.data
      : null,
  );

  let confirmInput = $state("");

  // Exact match, as the server compares it: no trimming or case folding.
  const slugMatches = $derived(orgSlug !== null && confirmInput === orgSlug);

  function invalidateStatus(): void {
    void queryClient.invalidateQueries({
      queryKey: orgDeletionKeys.status(),
    });
  }

  const requestMutation = createMutation(() => ({
    mutationFn: async (confirmSlug: string) =>
      orgDeletion.request.mutate({ confirmSlug }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.org_deletion_requested());
      announceToLiveRegion("polite", m.org_deletion_requested());
      confirmInput = "";
      invalidateStatus();
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));

  const cancelMutation = createMutation(() => ({
    mutationFn: async () => orgDeletion.cancel.mutate(),
    onSuccess: () => {
      haptic();
      toastStore.show(m.org_deletion_cancelled());
      announceToLiveRegion("polite", m.org_deletion_cancelled());
      invalidateStatus();
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));

  // ── Confirmation dialogs ──

  let requestDialogOpened = $state(false);
  let cancelDialogOpened = $state(false);

  function handleRequest(): void {
    if (!slugMatches || requestMutation.isPending) return;
    requestDialogOpened = true;
  }

  function confirmRequest(): void {
    requestDialogOpened = false;
    if (!slugMatches) return;
    requestMutation.mutate(confirmInput);
  }

  function handleCancel(): void {
    if (cancelMutation.isPending) return;
    cancelDialogOpened = true;
  }

  function confirmCancel(): void {
    cancelDialogOpened = false;
    cancelMutation.mutate();
  }
</script>

<div class="org-deletion-section">
  {#if statusQuery.isLoading}
    <Card raised contentWrap={false} class="org-deletion-card">
      <div class="org-deletion-inner" aria-busy="true">
        <p class="status-line">
          <InlineSkeleton width="24ch" />
        </p>
      </div>
    </Card>
  {:else if statusQuery.isError}
    <QueryError
      error={statusQuery.error}
      onretry={() => void statusQuery.refetch()}
    />
  {:else if request === null}
    <Card raised contentWrap={false} class="org-deletion-card">
      <div class="org-deletion-inner">
        <p class="explainer">
          {m.org_deletion_description({ days: ORG_DELETION_COOLING_OFF_DAYS })}
        </p>

        <!-- Konsta ListInput renders its label as a <div>, not <label for="">.
             The hidden <label> gives the input its accessible name through
             inputId + for pairing. -->
        <label for="org-deletion-confirm" class="sr-only">
          {m.org_deletion_confirm_label()}
        </label>
        <List strong inset class="org-deletion-list">
          <ListInput
            label={m.org_deletion_confirm_label()}
            inputId="org-deletion-confirm"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            placeholder={orgSlug ?? ""}
            value={confirmInput}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement)
                confirmInput = e.target.value;
            }}
            disabled={requestMutation.isPending}
            info={confirmHint}
          />
        </List>

        <div class="org-deletion-actions">
          <SoftButton
            onclick={handleRequest}
            disabled={!slugMatches || requestMutation.isPending}
            full
          >
            <Trash size={18} aria-hidden="true" />
            {m.org_deletion_request_button()}
          </SoftButton>
        </div>
      </div>
    </Card>
  {:else if request.status === "pending"}
    <Card raised contentWrap={false} class="org-deletion-card">
      <div class="org-deletion-inner">
        <p class="status-line">
          {m.org_deletion_pending({
            date: formatShortDate(request.coolingOffUntil),
          })}
        </p>

        {#if request.cancellable}
          <p class="explainer">{m.org_deletion_pending_hint()}</p>
          <div class="org-deletion-actions">
            <SoftButton
              onclick={handleCancel}
              disabled={cancelMutation.isPending}
              full
            >
              <RotateCcw size={18} aria-hidden="true" />
              {m.org_deletion_cancel_button()}
            </SoftButton>
          </div>
        {/if}
      </div>
    </Card>
  {:else}
    <Card raised contentWrap={false} class="org-deletion-card">
      <div class="org-deletion-inner">
        <p class="status-line">
          {request.status === "processing"
            ? m.org_deletion_processing()
            : m.org_deletion_done()}
        </p>
      </div>
    </Card>
  {/if}
</div>

<ShellDialog
  opened={requestDialogOpened}
  ondismiss={() => (requestDialogOpened = false)}
  title={m.org_deletion_request_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.org_deletion_request_body({ days: ORG_DELETION_COOLING_OFF_DAYS })}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (requestDialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmRequest}
    >
      {m.org_deletion_request_button()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<ShellDialog
  opened={cancelDialogOpened}
  ondismiss={() => (cancelDialogOpened = false)}
  title={m.org_deletion_cancel_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.org_deletion_cancel_body({ days: ORG_DELETION_COOLING_OFF_DAYS })}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (cancelDialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={confirmCancel}>
      {m.org_deletion_cancel_button()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .org-deletion-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.org-deletion-card) {
    margin: 0 !important;
  }

  :global(.org-deletion-list) {
    margin: 0 !important;
  }

  .org-deletion-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .explainer {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .status-line {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
  }

  .org-deletion-actions {
    padding-top: var(--space-xs);
  }
</style>
