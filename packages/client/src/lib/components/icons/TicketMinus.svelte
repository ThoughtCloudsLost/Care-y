<script lang="ts">
  interface Props {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    class?: string;
    "aria-hidden"?: "true" | "false";
    "aria-label"?: string;
    [key: `data-${string}`]: string | undefined;
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
  class={["lucide-icon lucide lucide-ticket-minus", className]
    .filter(Boolean)
    .join(" ")}
  aria-hidden={ariaHidden}
  aria-label={ariaLabel}
>
  <path
    d="M2 21.286V15a3 3 0 0 0 0-6V7a2 2 0 0 1 2-2H20a2 2 0 0 1 2 2V9a3 3 0 0 0 0 6V17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286Z"
  />
  <path d="M9 12h6" />
</svg>
