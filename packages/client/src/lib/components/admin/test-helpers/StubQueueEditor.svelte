<!--
  Test-only stub for QueueEditor. Renders a clickable trigger so tests
  can invoke the ondeletequeue callback that QueuesSection passes in.
-->
<script lang="ts">
  interface Props {
    opened?: boolean;
    ondismiss?: () => void;
    queueId?: string | null;
    ondeletequeue?: (qId: string) => void;
    [key: string]: unknown;
  }

  let {
    opened,
    ondismiss: _,
    queueId,
    ondeletequeue,
    ..._rest
  }: Props = $props();
</script>

{#if opened}
  <div data-testid="stub-queue-editor" data-queue-id={queueId}>
    {#if ondeletequeue && queueId}
      <button
        data-testid="editor-delete-trigger"
        aria-hidden="true"
        onclick={() => ondeletequeue(queueId)}
      ></button>
    {/if}
  </div>
{/if}
