<!--
  Shared alt-text prompt sheet for ProseMirror-based editors.
  Both ArticleEditor and FormContentEditor use this component
  to prompt for image alt text before insertion (ATAG pattern).
-->
<script lang="ts">
  import { Button as KButton, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    /** Whether the sheet is open. */
    opened: boolean;
    /** The current alt text value. */
    altText: string;
    /** Whether the image is marked decorative (empty alt). */
    decorative: boolean;
    /** Called when the user changes the alt text input. */
    onalttextchange: (altText: string) => void;
    /** Called when the user toggles the decorative checkbox. */
    ondecorativechange: (decorative: boolean) => void;
    /** Called when the user confirms and inserts. */
    oninsert: () => void;
    /** Called when the sheet is dismissed (cancel or swipe). */
    ondismiss: () => void;
  }

  let {
    opened,
    altText,
    decorative,
    onalttextchange,
    ondecorativechange,
    oninsert,
    ondismiss,
  }: Props = $props();

  const canInsert = $derived(decorative || altText.trim().length > 0);
</script>

<ShellSheet {opened} {ondismiss} title={m.library_editor_alt_text_title()}>
  <div class="alt-form">
    <ListInput
      label={m.library_editor_alt_text_placeholder()}
      type="textarea"
      value={altText}
      disabled={decorative}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLTextAreaElement)
          onalttextchange(e.target.value);
        else if (e.target instanceof HTMLInputElement)
          onalttextchange(e.target.value);
      }}
    />
    <label class="alt-decorative">
      <input
        type="checkbox"
        checked={decorative}
        onchange={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            ondecorativechange(e.target.checked);
        }}
      />
      {m.library_editor_decorative()}
    </label>
    <div class="alt-actions">
      <KButton clear onclick={ondismiss}>
        {m.common_cancel()}
      </KButton>
      <KButton disabled={!canInsert} onclick={oninsert}>
        {m.library_editor_insert()}
      </KButton>
    </div>
  </div>
</ShellSheet>

<style>
  .alt-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .alt-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }

  .alt-decorative {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    cursor: pointer;
    padding: 0 var(--space-md);
  }

  .alt-decorative input[type="checkbox"] {
    accent-color: var(--brand-accent);
    width: 1.125rem;
    height: 1.125rem;
  }
</style>
