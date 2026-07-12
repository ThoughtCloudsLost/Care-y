<!-- Minimal ResultItem for SearchResults tests: renders the label and
     forwards taps, nothing else. -->
<script lang="ts">
  interface FakeResultData {
    id: string;
    label: string;
  }

  let {
    result,
    ontap,
  }: { result: FakeResultData; ontap: (id: string) => void } = $props();
</script>

<button
  type="button"
  data-testid="fake-result"
  onclick={() => ontap(result.id)}
>
  {result.label}
</button>
