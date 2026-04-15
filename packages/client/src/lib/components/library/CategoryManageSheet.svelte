<script lang="ts">
  import { Button, List, ListItem, ListInput, BlockTitle } from "konsta/svelte";
  import { Pencil } from "@lucide/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  export interface CategoryEntry {
    id: string;
    name: string | null;
    description: string | null;
    articleCount: number;
  }

  interface CategoryManageSheetProps {
    opened: boolean;
    categories: CategoryEntry[];
    ondismiss: () => void;
  }

  let { opened, categories, ondismiss }: CategoryManageSheetProps = $props();

  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  if (!trpc.kb) throw new RouterNotAvailableError("kb");
  const kbRouter = trpc.kb;

  // Edit state: null = browsing, { id } = editing existing, { id: undefined } = adding new.
  let editingId = $state<string | undefined>(undefined);
  let isAdding = $state(false);
  let editName = $state("");
  let editDescription = $state("");
  let saving = $state(false);

  const canSave = $derived(editName.trim().length > 0 && !saving);

  function encryptText(text: string): string {
    const plaintext = new TextEncoder().encode(text);
    const ciphertext = orgKeyManager.encrypt(plaintext);
    return uint8ArrayToBase64(ciphertext);
  }

  function startEdit(cat: CategoryEntry): void {
    editingId = cat.id;
    isAdding = false;
    editName = cat.name ?? "";
    editDescription = cat.description ?? "";
  }

  function startAdd(): void {
    editingId = undefined;
    isAdding = true;
    editName = "";
    editDescription = "";
  }

  function cancelEdit(): void {
    editingId = undefined;
    isAdding = false;
    editName = "";
    editDescription = "";
  }

  async function handleSave(): Promise<void> {
    const trimmedName = editName.trim();
    const trimmedDesc = editDescription.trim();
    if (trimmedName.length === 0 || saving) return;

    saving = true;

    const encryptedName = encryptText(trimmedName);
    const encryptedDescription =
      trimmedDesc.length > 0 ? encryptText(trimmedDesc) : undefined;

    try {
      if (isAdding) {
        await kbRouter.createCategory.mutate({
          encryptedName,
          encryptedDescription,
        });
        haptic();
        toastStore.show(m.library_category_created());
      } else if (editingId !== undefined) {
        await kbRouter.updateCategory.mutate({
          categoryId: editingId,
          encryptedName,
          encryptedDescription,
        });
        haptic();
        toastStore.show(m.library_category_updated());
      }

      cancelEdit();
      void queryClient.invalidateQueries({ queryKey: ["kb", "categories"] });
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      saving = false;
    }
  }

  async function handleDelete(categoryId: string): Promise<void> {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat && cat.articleCount > 0) {
      toastStore.show(m.library_category_delete_blocked(), 3000);
      return;
    }

    saving = true;
    try {
      await kbRouter.deleteCategory.mutate({ categoryId });
      haptic();
      toastStore.show(m.library_category_deleted());
      cancelEdit();
      void queryClient.invalidateQueries({ queryKey: ["kb", "categories"] });
    } catch {
      // The server's FK RESTRICT constraint is the authoritative guard.
      // The client-side articleCount check above is a fast-path optimization
      // but may be stale (infinite scroll doesn't load all pages). If the
      // server rejects the delete for any reason, show the specific message
      // since FK violation is the only realistic failure mode here.
      toastStore.show(m.library_category_delete_blocked(), 3000);
    } finally {
      saving = false;
    }
  }
</script>

{#snippet editForm(categoryId: string | undefined)}
  <List nested>
    <ListInput
      label={m.library_category_name()}
      type="text"
      bind:value={editName}
    />
    <ListInput
      label={m.library_category_description()}
      type="textarea"
      bind:value={editDescription}
    />
  </List>
  <div class="edit-actions">
    <Button small inline disabled={!canSave} onclick={() => void handleSave()}>
      {m.library_category_save()}
    </Button>
    <Button small inline clear onclick={cancelEdit}>
      {m.common_cancel()}
    </Button>
    {#if categoryId !== undefined}
      <Button
        small
        inline
        clear
        class="delete-btn"
        colors={{ textIos: "text-red-500", textMaterial: "text-red-500" }}
        onclick={() => void handleDelete(categoryId)}
      >
        {m.library_category_delete()}
      </Button>
    {/if}
  </div>
{/snippet}

<ShellSheet
  {opened}
  ondismiss={() => {
    cancelEdit();
    ondismiss();
  }}
>
  <BlockTitle large class="sheet-title">
    {m.library_category_sheet_title()}
  </BlockTitle>

  <List>
    {#each categories as cat (cat.id)}
      {#if editingId === cat.id}
        <li class="edit-form">
          {@render editForm(cat.id)}
        </li>
      {:else}
        <ListItem
          title={cat.name ?? "..."}
          after={m.library_category_articles({
            count: String(cat.articleCount),
          })}
        >
          {#snippet media()}
            <Button
              small
              inline
              clear
              class="edit-icon-btn"
              aria-label={m.library_category_edit()}
              onclick={() => startEdit(cat)}
            >
              <Pencil size={16} aria-hidden="true" />
            </Button>
          {/snippet}
        </ListItem>
      {/if}
    {/each}
  </List>

  {#if isAdding}
    <div class="edit-form add-form">
      {@render editForm(undefined)}
    </div>
  {:else}
    <div class="add-row">
      <Button clear onclick={startAdd}>
        {m.library_category_add()}
      </Button>
    </div>
  {/if}
</ShellSheet>

<style>
  .edit-form {
    padding: 0.5rem var(--page-pad-x);
    list-style: none;
  }

  .edit-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0.5rem 0;
  }

  .add-row {
    padding: 0.5rem var(--page-pad-x);
  }

  .add-form {
    padding-bottom: 1rem;
  }

  :global(.edit-icon-btn) {
    width: 2rem !important;
    padding: 0 !important;
    color: var(--muted) !important;
  }

  :global(.sheet-title) {
    padding-top: 1rem !important;
  }
</style>
