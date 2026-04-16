<script lang="ts">
  import VirtualList from "./VirtualList.svelte";

  interface Props {
    items: string[];
    scrollContainer?: HTMLElement;
    estimateHeight?: number;
    overscan?: number;
    columns?: number;
    virtualizeThreshold?: number;
    onloadmore?: () => void;
    onloadprevious?: () => void;
  }

  let {
    items,
    scrollContainer,
    estimateHeight = 200,
    overscan = 3,
    columns = 1,
    virtualizeThreshold,
    onloadmore,
    onloadprevious,
  }: Props = $props();
</script>

<VirtualList
  {items}
  {scrollContainer}
  {estimateHeight}
  {overscan}
  {columns}
  {virtualizeThreshold}
  _forceVirtualize={true}
  getKey={(item: string) => item}
  {onloadmore}
  {onloadprevious}
>
  {#snippet children({ item, index })}
    <div class="test-item" data-index={index}>{item}</div>
  {/snippet}
</VirtualList>
