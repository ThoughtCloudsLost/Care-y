<!--
  Test-only publisher for a navbar override.

  A route supplies an override by writing to the shell context container,
  never as a prop, so a spec that wants one has to render a child that does
  the same thing a route does.
-->
<script lang="ts">
  import { getNavbarOverrideCtx } from "../context.js";
  import type { NavbarOverride } from "../types.js";

  interface Props {
    readonly override: NavbarOverride;
  }

  let { override }: Props = $props();

  const container = getNavbarOverrideCtx();

  $effect(() => {
    container.current = override;
    return () => {
      container.current = undefined;
    };
  });
</script>
