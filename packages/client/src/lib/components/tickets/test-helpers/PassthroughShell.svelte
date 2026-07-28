<!--
  Test-only passthrough component that renders its children snippet.
  Used to mock ShellPopup/ShellSheet/ShellActionSheet in component tests.

  When `opened` is passed, the title, header content, and children render only
  while it is true, mirroring the real shells, which drop the whole subtree
  once the outro finishes. The `data-*` attributes stay in both states so tests
  can assert on which shell rendered and what it was given.

  When `opened` is omitted everything always renders, because this component
  also stands in for non-overlay wrappers such as QueryError.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
    opened?: boolean;
    ondismiss?: () => void;
    title?: string;
    headerRight?: Snippet;
    [key: string]: unknown;
  }

  let { children, opened, ondismiss, title, headerRight, ..._rest }: Props =
    $props();
</script>

<div
  data-testid="passthrough-shell"
  data-opened={opened}
  data-title={title}
  data-has-dismiss={ondismiss != null}
>
  {#if opened ?? true}
    {#if title}
      <h3>{title}</h3>
    {/if}
    {#if headerRight}
      {@render headerRight()}
    {/if}
    {@render children?.()}
  {/if}
</div>
