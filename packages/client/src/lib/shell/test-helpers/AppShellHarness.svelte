<!--
  Test-only harness for AppShell.

  Wraps the shell in a Konsta App pinned to the iOS theme, because the
  Navbar renders its blur layer only under iOS and the glass interpolation
  effect addresses those layers by child position.

  An override arrives through the shell context, the way a route supplies
  one, so the harness renders a publisher as AppShell's child rather than
  passing the override down as a prop.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import AppShell from "../AppShell.svelte";
  import NavbarOverridePublisher from "./NavbarOverridePublisher.svelte";
  import type { AreaId, NavbarOverride, TabId } from "../types.js";

  interface Props {
    readonly orgName?: string;
    readonly override?: NavbarOverride;
    readonly ontabchange?: (tabId: TabId) => void;
    readonly onareatap?: (areaId: AreaId) => void;
  }

  let {
    orgName = "Safe Harbor",
    override,
    ontabchange = () => undefined,
    onareatap = () => undefined,
  }: Props = $props();
</script>

<App theme="ios">
  <AppShell
    activeTab="home"
    activeArea={null}
    {orgName}
    {ontabchange}
    {onareatap}
  >
    {#if override}
      <NavbarOverridePublisher {override} />
    {/if}
    <div data-testid="shell-child"></div>
  </AppShell>
</App>
