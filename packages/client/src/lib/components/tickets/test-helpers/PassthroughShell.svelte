<!--
  Test-only passthrough component that renders its children snippet.
  Used to mock ShellPopup/ShellActionSheet in component tests.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    opened?: boolean;
    ondismiss?: () => void;
    title?: string;
  }

  let { children, opened, ondismiss, title }: Props = $props();
</script>

<div
  data-testid="passthrough-shell"
  data-opened={opened}
  data-title={title}
  data-has-dismiss={ondismiss != null}
>
  {@render children()}
</div>
