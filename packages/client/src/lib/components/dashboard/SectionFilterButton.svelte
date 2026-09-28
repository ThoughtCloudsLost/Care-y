<!--
  A dashboard section's filter button. It shows and hides the section's
  filter row; the badge counts the section's active filters. The row also
  shows whenever filters are active, so `expanded` is the row's visibility
  rather than the button's own open state.
-->
<script lang="ts">
  import { ListFilter } from "@lucide/svelte";
  import BadgedIconButton from "$lib/components/filters/BadgedIconButton.svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    /** The section's heading, for the accessible name. */
    section: string;
    activeCount: number;
    /** The filter row is shown. */
    expanded: boolean;
    /** Id of the filter row. */
    controls: string;
    ontoggle: () => void;
  }

  let { section, activeCount, expanded, controls, ontoggle }: Props = $props();
</script>

<BadgedIconButton
  label={m.dashboard_section_filter({ section })}
  count={activeCount}
  {expanded}
  controls={expanded ? controls : undefined}
  onclick={ontoggle}
>
  <ListFilter size={18} aria-hidden="true" />
</BadgedIconButton>
