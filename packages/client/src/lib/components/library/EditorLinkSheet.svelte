<!--
  Shared link insert/edit sheet for ProseMirror-based editors.
  Both ArticleEditor and FormContentEditor use this component
  for creating and editing hyperlinks in editor content.
-->
<script lang="ts">
  import { Button as KButton, ListInput } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { isGenericLinkText } from "$lib/editor/atag-checks.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    /** Whether the sheet is open. */
    opened: boolean;
    /** The current URL value. Non-empty means editing an existing link. */
    url: string;
    /** The current link text value. */
    text: string;
    /** Called when the user changes the URL input. */
    onurlchange: (url: string) => void;
    /** Called when the user changes the text input. */
    ontextchange: (text: string) => void;
    /** Called when the user applies the link. */
    onapply: () => void;
    /** Called when the sheet is dismissed (cancel or swipe). */
    ondismiss: () => void;
  }

  let {
    opened,
    url,
    text,
    onurlchange,
    ontextchange,
    onapply,
    ondismiss,
  }: Props = $props();

  const textIsGeneric = $derived(isGenericLinkText(text));
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={url !== ""
    ? m.library_editor_link_edit_title()
    : m.library_editor_link_insert_title()}
>
  <div class="link-form">
    <ListInput
      label={m.library_editor_link_url()}
      type="url"
      value={url}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) onurlchange(e.target.value);
      }}
      placeholder={m.library_editor_url_placeholder()}
    />
    <ListInput
      label={m.library_editor_link_text()}
      type="text"
      value={text}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) ontextchange(e.target.value);
      }}
    />
    {#if textIsGeneric}
      <Register kind="careful" role="alert">
        {m.library_editor_link_generic_warning({ text: text.trim() })}
      </Register>
    {/if}
    <div class="link-actions">
      <KButton clear onclick={ondismiss}>
        {m.common_cancel()}
      </KButton>
      <KButton disabled={url.trim() === ""} onclick={onapply}>
        {m.library_editor_link_apply()}
      </KButton>
    </div>
  </div>
</ShellSheet>

<style>
  .link-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .link-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }
</style>
