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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub matches UsersSection API
  export function openInvite(): void {
    /* noop */
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub matches UsersSection API
  export function openInviteLink(): void {
    /* noop */
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub matches UsersSection API
  export function editUser(_userId: string): void {
    /* noop */
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub matches UsersSection API
  export function toggleMultiSelect(): void {
    /* noop */
  }
</script>
