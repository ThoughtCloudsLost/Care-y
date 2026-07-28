<!--
  Test-only passthrough component that renders its children snippet.
  Used to mock ShellPopup/ShellSheet/ShellActionSheet in component tests.

  When `opened` is passed, children render only while it is true, mirroring
  the real shells, which drop their subtree once the outro finishes. Title and
  header content stay rendered while closed, which the real shells also do.

  When `opened` is omitted the children always render, because this component
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
  {#if title}
    <h3>{title}</h3>
  {/if}
  {#if headerRight}
    {@render headerRight()}
  {/if}
  {#if opened ?? true}
    {@render children?.()}
  {/if}
</div>
