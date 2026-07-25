<!--
  DemoSurface: bridge between the demo site shell and a flow.

  Wraps DemoFrame with the Konsta <App theme="ios"> root inside the
  screen, mirroring the ThemeProvider pattern without stores or DevPanel.
  Replicates the .app-shell / .k-page sizing globals from the client
  layout, scoped so they only apply inside the frame's screen.

  Accepts a snippet for flow content and forwards a bound script handle
  from the flow for the parent caption bar to read.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import DemoFrame from "./DemoFrame.svelte";
  import type { Snippet } from "svelte";
  import type { DemoScript } from "./engine/script.svelte.js";

  interface Props {
    dark?: boolean;
    script?: DemoScript | undefined;
    children: Snippet;
  }

  let { dark = false, script = $bindable(), children }: Props = $props();
</script>

<div class="demo-surface">
  <DemoFrame {dark}>
    <App theme="ios" {dark} class="app-shell">
      {@render children()}
    </App>
  </DemoFrame>
</div>

<style>
  .demo-surface {
    width: 100%;
    height: 100%;
  }

  /* Mirror the client layout's .app-shell / .k-page globals, scoped
     to the demo frame. Uses 100% instead of 100dvh because the app
     fills the device frame, not the viewport. */
  .demo-surface :global(.app-shell) {
    height: 100%;
    min-height: auto;
    overflow: hidden;
  }

  .demo-surface :global(.k-page) {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  .demo-surface :global(.dark .k-page) {
    isolation: isolate;
  }
</style>
