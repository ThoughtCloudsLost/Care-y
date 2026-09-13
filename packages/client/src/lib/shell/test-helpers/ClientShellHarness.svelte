<!--
  Test-only harness for ClientShell.

  Wraps the shell in a Konsta App pinned to the iOS theme, matching the
  AppShell harness, because ShellNavbar's glass effects address the two
  layers the Navbar only paints under that theme.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import ClientShell from "../ClientShell.svelte";
</script>

<App theme="ios">
  <ClientShell>
    <div data-testid="shell-child"></div>
  </ClientShell>
</App>
