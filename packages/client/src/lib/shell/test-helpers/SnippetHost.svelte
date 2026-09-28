<!--
  Test-only host that renders one snippet.

  A route hands its subnavbar to the shell as a snippet on the navbar
  override context rather than rendering it itself, so a spec that asserts
  on subnavbar content renders the published snippet through this host.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    readonly snippet: Snippet;
  }

  let { snippet }: Props = $props();
</script>

{@render snippet()}
