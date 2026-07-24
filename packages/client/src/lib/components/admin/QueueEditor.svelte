<script lang="ts">
  import { Save } from "@lucide/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { queueKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import QueueForm from "$lib/components/shared/QueueForm.svelte";
  import {
    resolveQueueAppearance,
    queueAppearanceCacheKeys,
  } from "$lib/utils/queue-appearance.js";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

  interface QueueEditorProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly queueId: string | null;
    readonly queueEncryptedName: SerializedBuffer | Uint8Array | null;
    readonly queueEncryptedColor: SerializedBuffer | Uint8Array | null;
    readonly queueEncryptedIcon: SerializedBuffer | Uint8Array | null;
    readonly queueEscalateDays: number;
    readonly ondeletequeue: ((queueId: string) => void) | undefined;
  }

  let {
    opened,
    ondismiss,
    queueId,
    queueEncryptedName,
    queueEncryptedColor,
    queueEncryptedIcon,
    queueEscalateDays,
    ondeletequeue,
  }: QueueEditorProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  const isCreateMode = $derived(queueId === null);

  let wasOpen = $state(false);
  let decryptedName = $state("");
  let initialEscalation = $state<number | undefined>(undefined);
  let initialColor = $state<string | undefined>(undefined);
  let initialIcon = $state<string | undefined>(undefined);
  let formCanSubmit = $state(false);
  let formIsPending = $state(false);

  const FORM_ID = "queue-editor-form";

  $effect(() => {
    if (opened && !wasOpen) {
      if (isCreateMode) {
        decryptedName = "";
        initialEscalation = undefined;
        initialColor = undefined;
        initialIcon = undefined;
      } else {
        const id = queueId ?? "";
        decryptedName =
          orgCache.decrypt(`queue:${id}`, queueEncryptedName) ?? "";
        initialEscalation = queueEscalateDays;
        // Resolve through the appearance helper so unknown or legacy
        // (null) tokens land on the canonical defaults in the form.
        const appearance = resolveQueueAppearance(
          orgCache.decrypt(`queue-color:${id}`, queueEncryptedColor),
          orgCache.decrypt(`queue-icon:${id}`, queueEncryptedIcon),
        );
        initialColor = appearance.colorId;
        initialIcon = appearance.iconId;
      }
    }
    wasOpen = opened;
  });

  function onMutationSuccess(message: string): void {
    haptic();
    toastStore.show(message);
    announceToLiveRegion("polite", message);
    if (queueId !== null) {
      orgCache.delete(`queue:${queueId}`);
      for (const key of queueAppearanceCacheKeys(queueId)) {
        orgCache.delete(key);
      }
    }
    void queryClient.invalidateQueries({ queryKey: queueKeys.all });
    ondismiss();
  }

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedName: string;
      encryptedColor: string;
      encryptedIcon: string;
      escalateDays: number;
    }) => ticketRouter.createQueue.mutate(input),
    onSuccess: () => onMutationSuccess(m.admin_queue_created(withTerms())),
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: async (input: {
      queueId: string;
      encryptedName?: string;
      encryptedColor?: string;
      encryptedIcon?: string;
      escalateDays?: number;
    }) => ticketRouter.updateQueue.mutate(input),
    onSuccess: () => onMutationSuccess(m.admin_queue_updated(withTerms())),
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const isPending = $derived(
    createMut.isPending || updateMut.isPending || formIsPending,
  );

  function handleFormSubmit(data: {
    encryptedName: string;
    encryptedColor: string;
    encryptedIcon: string;
    escalateDays: number;
  }): void {
    if (isCreateMode) {
      createMut.mutate({
        encryptedName: data.encryptedName,
        encryptedColor: data.encryptedColor,
        encryptedIcon: data.encryptedIcon,
        escalateDays: data.escalateDays,
      });
    } else if (queueId !== null) {
      updateMut.mutate({
        queueId,
        encryptedName: data.encryptedName,
        encryptedColor: data.encryptedColor,
        encryptedIcon: data.encryptedIcon,
        escalateDays: data.escalateDays,
      });
    }
  }

  function handleFormStateChange(state: {
    canSubmit: boolean;
    isPending: boolean;
  }): void {
    formCanSubmit = state.canSubmit;
    formIsPending = state.isPending;
  }

  function triggerSubmit(): void {
    const form = document.getElementById(FORM_ID);
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  }

  function handleDelete(): void {
    if (queueId === null || ondeletequeue === undefined) return;
    ondismiss();
    ondeletequeue(queueId);
  }

  const title = $derived(
    isCreateMode
      ? m.admin_queue_editor_create_title(withTerms())
      : m.admin_queue_editor_edit_title(withTerms()),
  );
</script>

<ShellSheet {opened} {ondismiss} ariaLabel={title} {title}>
  {#snippet headerRight()}
    <SoftButton onclick={triggerSubmit} disabled={!formCanSubmit || isPending}>
      {#if isPending}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {isCreateMode
          ? m.admin_queue_editor_save_create(withTerms())
          : m.admin_queue_editor_save_edit()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="editor-content">
    <QueueForm
      mode={isCreateMode ? "create" : "edit"}
      initialName={decryptedName}
      {initialEscalation}
      {initialColor}
      {initialIcon}
      disabled={isPending}
      formId={FORM_ID}
      onsubmit={handleFormSubmit}
      onstatechange={handleFormStateChange}
    />

    {#if !isCreateMode && ondeletequeue}
      <div class="delete-action">
        <button
          type="button"
          class="delete-btn"
          onclick={handleDelete}
          disabled={isPending}
        >
          {m.admin_queue_editor_delete(withTerms())}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .editor-content {
    display: flex;
    flex-direction: column;
    padding: 0 0 var(--space-lg);
    flex: 1;
  }

  .delete-action {
    padding: var(--space-2xl) var(--k-block-padding-horizontal) 0;
  }

  .delete-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    border: none;
    background: none;
    color: var(--danger, var(--color-red-500));
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
