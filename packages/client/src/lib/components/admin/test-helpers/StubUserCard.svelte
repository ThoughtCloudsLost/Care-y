<!--
  Test stub for UserCard: one button named by the user id that reports the
  id to onselect, with aria-pressed mirroring the selected prop.
-->
<script lang="ts">
  interface Props {
    userId: string;
    selected?: boolean;
    onselect?: (userId: string) => void;
    [key: string]: unknown;
  }

  let { userId, selected = false, onselect, ..._rest }: Props = $props();
</script>

<button
  type="button"
  data-testid="stub-user-card"
  aria-label={userId}
  aria-pressed={selected}
  onclick={() => onselect?.(userId)}
></button>
