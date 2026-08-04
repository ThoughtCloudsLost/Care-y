<script lang="ts">
  interface Props {
    rows?: readonly unknown[];
    actorNames?: ReadonlyMap<string, string>;
    isLoading?: boolean;
    [key: string]: unknown;
  }

  let { rows = [], isLoading = false, ..._rest }: Props = $props();
</script>

<!-- eslint-disable care-y/no-hardcoded-strings -- test stub sentinel text asserted verbatim by logs-page tests -->
{#if isLoading}
  <!-- care-y-ignore-next-line no-hardcoded-user-strings -- test stub sentinel text asserted verbatim by logs-page tests -->
  <p>Audit log loading...</p>
{:else}
  <!-- care-y-ignore-next-line no-hardcoded-user-strings -- test stub sentinel text asserted verbatim by logs-page tests -->
  <p>Audit log section ({rows.length} rows)</p>
{/if}
