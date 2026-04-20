<script lang="ts">
  import {
    Block,
    Card,
    Chip,
    DialogButton,
    List,
    ListItem,
  } from "konsta/svelte";
  import {
    createQuery,
    createQueries,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { SvelteSet, SvelteMap } from "svelte/reactivity";
  import { ChevronUp, ChevronDown, Pencil, Plus, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { ErrorCode } from "@care-y/shared";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import QueueMemberPicker from "./QueueMemberPicker.svelte";
  import QueueEditor from "./QueueEditor.svelte";

  interface QueuesSectionProps {
    readonly autoAction?: string | null;
  }

  let { autoAction = null }: QueuesSectionProps = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const authRouter = trpc.auth;
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  // ── Queries ──

  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"],
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  // Admin user list for looking up display names from member IDs
  const usersQuery = createQuery(() => ({
    queryKey: ["admin", "users"],
    queryFn: async () => authRouter.listUsers.query(),
  }));

  type QueueRecord = NonNullable<typeof queuesQuery.data>[number];
  type AdminUser = NonNullable<typeof usersQuery.data>[number];

  // ── User lookup map (O(1) instead of .find()) ──

  const userMap = $derived.by((): SvelteMap<string, AdminUser> => {
    const map = new SvelteMap<string, AdminUser>();
    for (const u of usersQuery.data ?? []) map.set(u.id, u);
    return map;
  });

  // ── Decrypt helpers ──

  function decryptQueueName(queue: QueueRecord): string {
    return (
      orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ??
      queue.id.slice(0, 8)
    );
  }

  function decryptUserName(userId: string): string | null {
    const user = userMap.get(userId);
    if (!user) return null;
    const bytes = base64ToUint8Array(user.encryptedDisplayName);
    return orgCache.decrypt(`user:${userId}`, bytes);
  }

  // ── Queue members via createQueries (one query per queue) ──

  const memberResults = createQueries(() => ({
    queries: (queuesQuery.data ?? []).map((q) => ({
      queryKey: ["queue-members", q.id] as const,
      queryFn: async () =>
        ticketRouter.listQueueMembers.query({ queueId: q.id }),
    })),
  }));

  const memberData = $derived.by(() => {
    const queues = queuesQuery.data ?? [];
    const members = new SvelteMap<string, readonly string[]>();
    const loading = new SvelteMap<string, boolean>();
    const results = memberResults;
    let idx = 0;
    for (const q of queues) {
      const result = results[idx++];
      if (result?.data) members.set(q.id, result.data);
      loading.set(q.id, result?.isLoading ?? true);
    }
    return { members, loading };
  });

  // ── Expandable sections (expanded by default) ──

  const expandedQueues = new SvelteSet<string>();

  $effect(() => {
    const queues = queuesQuery.data;
    if (!queues) return;
    for (const q of queues) {
      if (!expandedQueues.has(q.id)) {
        expandedQueues.add(q.id);
      }
    }
  });

  function toggleExpand(queueId: string): void {
    if (expandedQueues.has(queueId)) {
      expandedQueues.delete(queueId);
    } else {
      expandedQueues.add(queueId);
    }
  }

  // ── Mutations ──

  const removeMemberMutation = createMutation(() => ({
    mutationFn: async (input: { queueId: string; userId: string }) =>
      ticketRouter.removeQueueMember.mutate(input),
    onSuccess: (
      _data: unknown,
      variables: { queueId: string; userId: string },
    ) => {
      haptic();
      toastStore.show(m.admin_queue_member_removed());
      announceToLiveRegion("polite", m.admin_queue_member_removed());
      void queryClient.invalidateQueries({
        queryKey: ["queue-members", variables.queueId],
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const reorderMutation = createMutation(() => ({
    mutationFn: async (items: { queueId: string; sortOrder: number }[]) =>
      ticketRouter.reorderQueues.mutate(items),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_queue_reordered());
      announceToLiveRegion("polite", m.admin_queue_reordered());
      void queryClient.invalidateQueries({ queryKey: ["queues"] });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const deleteMutation = createMutation(() => ({
    mutationFn: async (input: { queueId: string; reassignTo?: string }) =>
      ticketRouter.deleteQueue.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_queue_deleted());
      announceToLiveRegion("assertive", m.admin_queue_deleted());
      void queryClient.invalidateQueries({ queryKey: ["queues"] });
    },
  }));

  // ── Reorder ──

  function handleMove(index: number, direction: -1 | 1): void {
    const queues = queuesQuery.data;
    if (!queues) return;
    const outOfBounds =
      direction === -1 ? index <= 0 : index >= queues.length - 1;
    if (outOfBounds) return;
    const newOrder = [...queues];
    const removed = newOrder.splice(index, 1);
    const item = removed[0];
    if (item === undefined) return;
    newOrder.splice(index + direction, 0, item);
    reorderMutation.mutate(
      newOrder.map((q, i) => ({ queueId: q.id, sortOrder: i })),
    );
  }

  // ── Delete: two-step flow ──
  // Step 1: simple confirmation dialog
  // Step 2: if server returns QUEUE_HAS_TICKETS, open reassignment sheet

  let deleteDialogOpened = $state(false);
  let reassignSheetOpened = $state(false);
  let deleteQueueId = $state("");
  let deleteQueueName = $state("");
  let reassignTargetId = $state("");

  const otherQueues = $derived(
    (queuesQuery.data ?? []).filter((q) => q.id !== deleteQueueId),
  );

  function openDeleteDialog(queue: QueueRecord): void {
    deleteQueueId = queue.id;
    deleteQueueName = decryptQueueName(queue);
    reassignTargetId = "";
    deleteDialogOpened = true;
  }

  function confirmDelete(): void {
    deleteDialogOpened = false;
    deleteMutation.mutate(
      { queueId: deleteQueueId },
      {
        onError: (err: unknown) => {
          if (
            err instanceof Error &&
            err.message === ErrorCode.QUEUE_HAS_TICKETS
          ) {
            reassignSheetOpened = true;
          } else {
            toastStore.show(m.error_generic());
          }
        },
      },
    );
  }

  function confirmReassignDelete(): void {
    if (!reassignTargetId) return;
    reassignSheetOpened = false;
    deleteMutation.mutate({
      queueId: deleteQueueId,
      reassignTo: reassignTargetId,
    });
  }

  // ── Member picker ──

  let pickerOpened = $state(false);
  let pickerQueueId = $state("");
  const pickerMemberSet: ReadonlySet<string> = $derived(
    new Set(memberData.members.get(pickerQueueId) ?? []),
  );

  function openMemberPicker(queueId: string): void {
    pickerQueueId = queueId;
    pickerOpened = true;
  }

  function handlePickerDismiss(): void {
    pickerOpened = false;
  }

  // ── Edit handler (QueueEditor wires into this) ──

  let editorQueueId = $state<string | null>(null);

  export function getEditorQueueId(): string | null {
    return editorQueueId;
  }

  export function openEditor(queueId: string | null): void {
    editorQueueId = queueId;
  }

  $effect(() => {
    if (autoAction === "create") {
      editorQueueId = "new";
    }
  });

  const totalCount = $derived((queuesQuery.data ?? []).length);
  const canDelete = $derived(totalCount > 1);

  // ── Queue editor state ──

  const editorOpened = $derived(editorQueueId !== null);

  const editorQueue = $derived.by((): QueueRecord | null => {
    if (editorQueueId === null || editorQueueId === "new") return null;
    return (queuesQuery.data ?? []).find((q) => q.id === editorQueueId) ?? null;
  });

  function handleEditorDismiss(): void {
    editorQueueId = null;
  }

  function handleEditorDeleteQueue(qId: string): void {
    const queue = (queuesQuery.data ?? []).find((q) => q.id === qId);
    if (queue) openDeleteDialog(queue);
  }
</script>

<div class="queues-page pb-20">
  {#if queuesQuery.isLoading}
    <div class="queue-list">
      {#each { length: 3 } as _, i (i)}
        <Card raised contentWrap={false} class="queue-card">
          <div class="queue-card-inner">
            <div class="queue-header">
              <DecryptPlaceholder
                content={null}
                length={16}
                class="font-semibold"
              />
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {:else if queuesQuery.isError}
    <QueryError
      error={queuesQuery.error}
      onretry={() => void queuesQuery.refetch()}
    />
  {:else if totalCount === 0}
    <Block class="text-center text-[--muted]">
      {m.admin_queues_empty()}
    </Block>
  {:else}
    <div class="queue-list">
      {#each queuesQuery.data ?? [] as queue, index (queue.id)}
        {@const queueName = decryptQueueName(queue)}
        {@const isExpanded = expandedQueues.has(queue.id)}
        {@const members = memberData.members.get(queue.id) ?? []}
        {@const isLoading = memberData.loading.get(queue.id) ?? true}

        <Card raised contentWrap={false} class="queue-card">
          <div class="queue-card-inner">
            <!-- Queue header row -->
            <div
              class="queue-header"
              role="button"
              tabindex="0"
              aria-expanded={isExpanded}
              aria-label={queueName}
              onclick={() => toggleExpand(queue.id)}
              onkeydown={onKeyActivate(() => toggleExpand(queue.id))}
            >
              <div class="queue-info">
                <DecryptPlaceholder
                  content={queueName}
                  length={16}
                  class="font-semibold"
                />
                <span class="queue-meta">
                  {members.length > 0
                    ? m.admin_queue_members({ count: members.length })
                    : m.admin_queue_no_members()}
                </span>
              </div>

              <div class="queue-actions">
                <button
                  class="icon-btn"
                  aria-label={m.admin_queue_move_up()}
                  disabled={index === 0}
                  onclick={(e) => {
                    e.stopPropagation();
                    handleMove(index, -1);
                  }}
                >
                  <ChevronUp size={18} aria-hidden="true" />
                </button>

                <button
                  class="icon-btn"
                  aria-label={m.admin_queue_move_down()}
                  disabled={index === (queuesQuery.data?.length ?? 0) - 1}
                  onclick={(e) => {
                    e.stopPropagation();
                    handleMove(index, 1);
                  }}
                >
                  <ChevronDown size={18} aria-hidden="true" />
                </button>

                <button
                  class="icon-btn"
                  aria-label={m.admin_queue_edit()}
                  onclick={(e) => {
                    e.stopPropagation();
                    openEditor(queue.id);
                  }}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <!-- Expanded member section -->
            {#if isExpanded}
              <div
                class="member-section"
                role="region"
                aria-label={m.admin_queue_members({ count: members.length })}
              >
                {#if isLoading}
                  <div class="member-loading">
                    <span class="text-sm text-[--muted]">...</span>
                  </div>
                {:else}
                  <div class="member-chips">
                    {#each members as memberId (memberId)}
                      {@const memberName = decryptUserName(memberId)}
                      <Chip outline class="member-chip">
                        <DecryptPlaceholder content={memberName} length={10} />
                        <button
                          class="chip-remove"
                          aria-label={m.admin_queue_remove_member({
                            name: memberName ?? memberId.slice(0, 8),
                          })}
                          onclick={() =>
                            removeMemberMutation.mutate({
                              queueId: queue.id,
                              userId: memberId,
                            })}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </Chip>
                    {/each}

                    <button
                      class="add-member-btn"
                      aria-label={m.admin_queue_add_member()}
                      onclick={() => openMemberPicker(queue.id)}
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>

                  {#if members.length === 0}
                    <p class="no-members">
                      {m.admin_queue_no_members()}
                    </p>
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Step 1: simple delete confirmation -->
<ShellDialog
  opened={deleteDialogOpened}
  ondismiss={() => (deleteDialogOpened = false)}
  title={m.admin_queue_delete_title({ name: deleteQueueName })}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_queue_delete_confirm_empty()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (deleteDialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class="text-[--color-red-500] font-semibold"
      onclick={confirmDelete}
    >
      {m.admin_queue_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<!-- Step 2: reassignment sheet (opens if queue has tickets) -->
<ShellSheet
  opened={reassignSheetOpened}
  ondismiss={() => (reassignSheetOpened = false)}
  ariaLabel={m.admin_queue_delete_reassign_label()}
>
  <div class="reassign-sheet-content">
    <p class="reassign-title">{m.admin_queue_delete_confirm_tickets()}</p>
    <List strong inset>
      {#each otherQueues as q (q.id)}
        {@const name = decryptQueueName(q)}
        <ListItem
          link
          chevron={false}
          class={reassignTargetId === q.id ? "selected-queue" : ""}
          onClick={() => (reassignTargetId = q.id)}
        >
          {#snippet title()}
            <DecryptPlaceholder content={name} length={14} />
          {/snippet}
        </ListItem>
      {/each}
    </List>
    <div class="reassign-actions">
      <button
        class="reassign-confirm"
        disabled={!reassignTargetId}
        onclick={confirmReassignDelete}
      >
        {m.admin_queue_delete()}
      </button>
    </div>
  </div>
</ShellSheet>

<!-- Member picker sheet -->
<QueueMemberPicker
  opened={pickerOpened}
  queueId={pickerQueueId}
  currentMemberIds={pickerMemberSet}
  ondismiss={handlePickerDismiss}
/>

<!-- Queue editor sheet (create / edit) -->
<QueueEditor
  opened={editorOpened}
  ondismiss={handleEditorDismiss}
  queueId={editorQueue?.id ?? null}
  queueEncryptedName={editorQueue?.encryptedName ?? null}
  queueEscalateDays={editorQueue?.escalateDays ?? 0}
  ondeletequeue={canDelete ? handleEditorDeleteQueue : undefined}
/>

<style>
  .queues-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .queue-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  .queue-list :global(.k-card) {
    margin: 0 !important;
  }

  .queue-card-inner {
    display: flex;
    flex-direction: column;
  }

  /* ── Queue header ── */
  .queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .queue-header:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: var(--card-radius);
  }

  .queue-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .queue-meta {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .queue-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  /* ── Icon buttons ── */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.15s;
  }

  .icon-btn:hover:not(:disabled) {
    color: var(--brand-text);
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .icon-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  /* ── Member section ── */
  .member-section {
    border-top: 1px solid color-mix(in srgb, var(--muted) 20%, transparent);
    padding: var(--space-md) var(--card-pad-x) var(--card-pad-y);
  }

  .member-loading {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }

  .member-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
  }

  .chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    padding: 2px;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    border-radius: 50%;
  }

  .chip-remove:hover {
    color: var(--color-red-500);
  }

  .chip-remove:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 1px;
  }

  .add-member-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px dashed var(--muted);
    background: none;
    color: var(--muted);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .add-member-btn:hover {
    color: var(--brand-text);
    border-color: var(--brand-text);
  }

  .add-member-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .no-members {
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-sm) 0;
  }

  /* ── Reassignment sheet ── */
  .reassign-sheet-content {
    padding: 0 var(--page-pad-x);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .reassign-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--brand-text);
  }

  .reassign-actions {
    padding: var(--space-md) 0;
  }

  .reassign-confirm {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: var(--card-radius);
    background: var(--color-red-500);
    color: white;
    font-weight: 600;
    font-size: var(--text-base);
    cursor: pointer;
  }

  .reassign-confirm:disabled {
    opacity: 0.4;
    cursor: default;
  }

  :global(.selected-queue) {
    background: color-mix(in srgb, var(--brand-accent) 15%, transparent);
  }
</style>
