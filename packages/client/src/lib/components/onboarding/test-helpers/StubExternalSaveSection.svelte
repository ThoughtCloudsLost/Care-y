<script lang="ts">
  let {
    externalSave: _externalSave = false,
    testid = "admin-section",
  }: { externalSave?: boolean; testid?: string } = $props();

  export function isDirty(): boolean {
    return false;
  }

  export async function save(): Promise<void> {
    /* noop */
  }
</script>

<!-- eslint-disable care-y/no-hardcoded-strings -- test stub -->
<div data-testid={testid}>stub</div>
