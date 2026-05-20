<script lang="ts" module>
  let testQueueCount = 0;

  export function _setTestQueueCount(n: number): void {
    testQueueCount = n;
  }

  export function _resetTestQueueCount(): void {
    testQueueCount = 0;
  }
</script>

<script lang="ts">
  let { autoAction: _autoAction = null }: { autoAction?: string | null } =
    $props();

  export function totalQueues(): number {
    return testQueueCount;
  }

  export function totalOpenTickets(): number {
    return 0;
  }

  export function totalMembers(): number {
    return 0;
  }

  export function getEditorQueueId(): string | null {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub matches QueuesSection API
  export function openEditor(_queueId: string | null): void {
    // noop
  }

  export function toggleReorderMode(): void {
    /* noop */
  }
</script>

<!-- eslint-disable care-y/no-hardcoded-strings -- test stub, not user-facing -->
<div data-testid="queues-section">Queues section (stub)</div>
