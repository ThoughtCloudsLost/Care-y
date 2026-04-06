<script lang="ts">
  import VirtualList from "./VirtualList.svelte";

  interface Props {
    items: string[];
    scrollContainer?: HTMLElement;
    estimateHeight?: number;
    overscan?: number;
    columns?: number;
    onloadmore?: () => void;
  }

  let {
    items,
    scrollContainer,
    estimateHeight = 200,
    overscan = 3,
    columns = 1,
    onloadmore,
  }: Props = $props();
</script>

<VirtualList
  {items}
  {scrollContainer}
  {estimateHeight}
  {overscan}
  {columns}
  _forceVirtualize={true}
  getKey={(item: string) => item}
  {onloadmore}
>
  {#snippet children({ item, index })}
    <div class="test-item" data-index={index}>{item}</div>
  {/snippet}
</VirtualList>
