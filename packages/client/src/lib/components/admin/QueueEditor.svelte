<script lang="ts">
  import { List, ListInput, Block, Button } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

  interface QueueEditorProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly queueId: string | null;
    readonly queueEncryptedName: SerializedBuffer | Uint8Array | null;
    readonly queueEscalateDays: number;
    readonly ondeletequeue: ((queueId: string) => void) | undefined;
  }

  let {
    opened,
    ondismiss,
    queueId,
    queueEncryptedName,
    queueEscalateDays,
    ondeletequeue,
  }: QueueEditorProps = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  const isCreateMode = $derived(queueId === null);
  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);

  let queueName = $state("");
  let escalationDays = $state("");
  let wasOpen = $state(false);

  const textEncoder = new TextEncoder();

  $effect(() => {
    if (opened && !wasOpen) {
      if (isCreateMode) {
        queueName = "";
        escalationDays = "";
      } else {
        const id = queueId ?? "";
        const decrypted = orgCache.decrypt(`queue:${id}`, queueEncryptedName);
        queueName = decrypted ?? "";
        escalationDays = queueEscalateDays > 0 ? String(queueEscalateDays) : "";
      }
    }
    wasOpen = opened;
  });

  const nameEmpty = $derived(queueName.trim().length === 0);

  const parsedEscalationDays = $derived.by((): number => {
    const trimmed = escalationDays.trim();
    if (trimmed === "") return 0;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 0 || n > 365) return -1;
    return n;
  });

  const escalationValid = $derived(parsedEscalationDays >= 0);

  const canSubmit = $derived(orgKeyLoaded && !nameEmpty && escalationValid);

  function onMutationSuccess(message: string): void {
    haptic();
    toastStore.show(message);
    announceToLiveRegion("polite", message);
    void queryClient.invalidateQueries({ queryKey: ["queues"] });
    ondismiss();
  }

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedName: string;
      escalateDays: number;
    }) => ticketRouter.createQueue.mutate(input),
    onSuccess: () => onMutationSuccess(m.admin_queue_created()),
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: async (input: {
      queueId: string;
      encryptedName?: string;
      escalateDays?: number;
    }) => ticketRouter.updateQueue.mutate(input),
    onSuccess: () => onMutationSuccess(m.admin_queue_updated()),
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const isPending = $derived(createMut.isPending || updateMut.isPending);

  function handleSubmit(): void {
    if (!canSubmit || isPending) return;

    const plainBytes = textEncoder.encode(queueName.trim());
    const cipherBytes = orgKeyManager.encrypt(plainBytes);
    const encryptedName = uint8ArrayToBase64(cipherBytes);
    const days = parsedEscalationDays;

    if (isCreateMode) {
      createMut.mutate({ encryptedName, escalateDays: days });
    } else if (queueId !== null) {
      updateMut.mutate({
        queueId,
        encryptedName,
        escalateDays: days,
      });
    }
  }

  function handleDelete(): void {
    if (queueId === null || ondeletequeue === undefined) return;
    ondismiss();
    ondeletequeue(queueId);
  }

  const title = $derived(
    isCreateMode
      ? m.admin_queue_editor_create_title()
      : m.admin_queue_editor_edit_title(),
  );
</script>

<ShellSheet {opened} {ondismiss} ariaLabel={title}>
  <div class="editor-content">
    <h2 class="editor-title">{title}</h2>

    {#if !orgKeyLoaded}
      <Block>
        <p class="text-sm text-[--color-amber-500] font-medium" role="alert">
          {m.admin_queue_editor_no_org_key()}
        </p>
      </Block>
    {/if}

    <List strong inset>
      <ListInput
        label={m.admin_queue_editor_name_label()}
        type="text"
        placeholder={m.admin_queue_editor_name_placeholder()}
        value={queueName}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) queueName = e.target.value;
        }}
        disabled={!orgKeyLoaded || isPending}
      />
    </List>

    <Block>
      <div class="pii-warning" role="note">
        <span class="pii-icon" aria-hidden="true">⚠</span>
        <p>{m.admin_queue_editor_pii_warning()}</p>
      </div>
    </Block>

    <List strong inset>
      <ListInput
        label={m.admin_queue_editor_escalation_label()}
        type="number"
        placeholder="0"
        value={escalationDays}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            escalationDays = e.target.value;
        }}
        disabled={!orgKeyLoaded || isPending}
        info={m.admin_queue_editor_escalation_hint()}
      />
    </List>

    {#if nameEmpty && queueName.length > 0}
      <Block>
        <p class="text-sm text-[--color-red-500]" role="alert">
          {m.admin_queue_editor_name_required()}
        </p>
      </Block>
    {/if}

    <Block>
      <Button onclick={handleSubmit} disabled={!canSubmit || isPending}>
        {#if isPending}
          {m.common_loading()}
        {:else}
          {m.admin_queue_editor_save()}
        {/if}
      </Button>
    </Block>

    {#if !isCreateMode && ondeletequeue}
      <Block>
        <button
          type="button"
          class="delete-btn"
          onclick={handleDelete}
          disabled={isPending}
        >
          {m.admin_queue_editor_delete()}
        </button>
      </Block>
    {/if}
  </div>
</ShellSheet>

<style>
  .editor-content {
    padding: 0 0 var(--space-lg);
  }

  .editor-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    padding: var(--space-md) var(--page-pad-x) 0;
  }

  .pii-warning {
    display: flex;
    gap: var(--space-sm);
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    margin: 0;
    line-height: 1.4;
  }

  .pii-warning p {
    margin: 0;
  }

  .pii-icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1.4;
  }

  .delete-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    border: none;
    background: none;
    color: var(--color-red-500);
    font-size: var(--text-sm);
    font-weight: 600;
    text-align: center;
    cursor: pointer;
  }

  .delete-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .delete-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>
