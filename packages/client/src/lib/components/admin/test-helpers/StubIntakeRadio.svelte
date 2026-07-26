<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    checked: boolean;
    disabled: boolean;
    onchange: () => void;
  }

  let { checked, disabled, onchange }: Props = $props();
</script>

<button
  role="radio"
  aria-checked={checked}
  aria-label={m.admin_queue_intake_chip()}
  {disabled}
  onclick={(e) => {
    e.stopPropagation();
    onchange();
  }}>{m.admin_queue_intake_chip()}</button
>
