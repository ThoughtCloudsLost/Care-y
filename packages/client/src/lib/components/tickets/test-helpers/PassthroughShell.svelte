<!--
  Test-only passthrough component that renders its children snippet.
  Used to mock ShellPopup/ShellSheet/ShellActionSheet in component tests.
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

  let { children, opened, ondismiss, title, headerRight, ...rest }: Props =
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
  {@render children?.()}
</div>
