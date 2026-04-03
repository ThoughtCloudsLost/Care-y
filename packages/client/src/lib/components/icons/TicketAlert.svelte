<script lang="ts">
  interface Props {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    class?: string;
    "aria-hidden"?: "true" | "false";
    "aria-label"?: string;
  }

  let {
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
    class: className,
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
  }: Props = $props();

  const sw = $derived(Number(strokeWidth));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={sw}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={["lucide-icon lucide lucide-ticket-alert", className]
    .filter(Boolean)
    .join(" ")}
  aria-hidden={ariaHidden}
  aria-label={ariaLabel}
>
  <!-- Ticket body, no perforation dashes to keep interior clean for the symbol -->
  <path
    d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
  />
  <!-- Exclamation mark centered in ticket body -->
  <path d="M12 9v4" />
  <path d="M12 15h.01" />
</svg>
