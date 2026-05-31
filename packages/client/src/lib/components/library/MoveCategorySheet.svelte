<script lang="ts">
  import { ActionsGroup, ActionsButton, ActionsLabel } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";

  interface MoveCategorySheetProps {
    opened: boolean;
    /** Categories available to move to (caller should exclude the current category) */
    categories: readonly { id: string; name: string | null }[];
    ondismiss: () => void;
    onmove: (categoryId: string) => void;
  }

  let { opened, categories, ondismiss, onmove }: MoveCategorySheetProps =
    $props();
</script>

<ShellActionSheet {opened} {ondismiss} ariaLabel={m.library_move_category()}>
  <ActionsGroup>
    <ActionsLabel>{m.library_move_title()}</ActionsLabel>
    {#each categories as cat (cat.id)}
      <ActionsButton
        onclick={() => {
          onmove(cat.id);
          ondismiss();
        }}
      >
        {cat.name ?? "..."}
      </ActionsButton>
    {/each}
    <ActionsButton
      colors={{ textIos: "text-red-500", textMaterial: "text-red-500" }}
      onclick={ondismiss}
    >
      {m.common_cancel()}
    </ActionsButton>
  </ActionsGroup>
</ShellActionSheet>
