<script lang="ts">
  export function activeCount(): number {
    return 1;
  }

  export function inactiveCount(): number {
    return 0;
  }

  export function pendingInviteCount(): number {
    return 0;
  }

  export function matchedUserIds(): readonly string[] {
    return [];
  }

  export function openInvite(): void {
    /* noop */
  }

  export function openInviteLink(): void {
    /* noop */
  }

  export function editUser(_userId: string): void {
    /* noop */
  }

  export function toggleMultiSelect(): void {
    /* noop */
  }
</script>
