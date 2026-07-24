<script lang="ts">
  // Inert stand-ins for every function the people page calls on its
  // bind:this ref; without them the deep-link $effect throws.
  export function editUser(_userId: string): void {
    /* stub */
  }
  export function matchedUserIds(): readonly string[] {
    return [];
  }
  export function activeCount(): number {
    return 0;
  }
  export function inactiveCount(): number {
    return 0;
  }
  export function toggleMultiSelect(): void {
    /* stub */
  }
  export function openInvite(): void {
    /* stub */
  }
  export function openInviteLink(): void {
    /* stub */
  }
  export function bulkActionsSnippet(): undefined {
    return undefined;
  }
</script>

<!-- eslint-disable care-y/no-hardcoded-strings -- test stub sentinel text asserted verbatim by people-page tests -->
<!-- care-y-ignore-next-line no-hardcoded-user-strings -- test stub sentinel text asserted verbatim by people-page tests -->
<p>User management loading...</p>
