<!--
  Test stub for UserCard: one button named by the user id that reports the
  id to onselect, with aria-pressed mirroring the selected prop and data-locked
  mirroring the locked prop.
-->
<script lang="ts">
  interface Props {
    userId: string;
    selected?: boolean;
    locked?: boolean;
    onselect?: (userId: string) => void;
    [key: string]: unknown;
  }

  let {
    userId,
    selected = false,
    locked = false,
    onselect,
    ..._rest
  }: Props = $props();
</script>

<button
  type="button"
  data-testid="stub-user-card"
  aria-label={userId}
  aria-pressed={selected}
  data-locked={locked}
  onclick={() => onselect?.(userId)}
></button>
