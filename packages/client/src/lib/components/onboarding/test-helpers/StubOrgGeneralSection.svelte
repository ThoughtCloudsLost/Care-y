<script lang="ts" module>
  let testDirty = false;
  let testHasName = true;
  let testSaveError: Error | null = null;
  let saveCalls = 0;

  export function _setTestDirty(dirty: boolean): void {
    testDirty = dirty;
  }

  export function _setTestHasOrgName(has: boolean): void {
    testHasName = has;
  }

  export function _setTestSaveError(err: Error | null): void {
    testSaveError = err;
  }

  export function _getSaveCalls(): number {
    return saveCalls;
  }

  export function _reset(): void {
    testDirty = false;
    testHasName = true;
    testSaveError = null;
    saveCalls = 0;
  }
</script>

<script lang="ts">
  let { externalSave: _externalSave = false }: { externalSave?: boolean } =
    $props();

  export function isDirty(): boolean {
    return testDirty;
  }

  export function hasOrgName(): boolean {
    return testHasName;
  }

  export function save(): void {
    saveCalls++;
    if (testSaveError) throw testSaveError;
  }
</script>

<!-- eslint-disable care-y/no-hardcoded-strings -- test stub -->
<div data-testid="org-general-section">stub</div>
