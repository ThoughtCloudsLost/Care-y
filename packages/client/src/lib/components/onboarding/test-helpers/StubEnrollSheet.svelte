<!--
  Test-only stub for the settings enroll sheets (Totp/Passkey/Email/Sms/
  Push/BackupCodes). Exposes the opened state and buttons that fire the
  callback props so orchestration flows can be driven from tests.

  The backup-codes sheet takes no onenrolled prop, so its stub renders
  only the dismiss trigger. Tests use that to tell it apart.
-->
<script lang="ts">
  interface Props {
    opened?: boolean;
    ondismiss?: () => void;
    onenrolled?: () => void;
  }

  let { opened = false, ondismiss, onenrolled }: Props = $props();

  // Test-only fixture labels, kept as constants so the template carries
  // no hardcoded user-facing strings.
  const ENROLLED_LABEL = "enrolled";
  const DISMISS_LABEL = "dismiss";
</script>

<div data-testid="stub-enroll-sheet" data-opened={opened}>
  {#if onenrolled}
    <button
      type="button"
      data-testid="stub-enrolled-trigger"
      onclick={onenrolled}
    >
      {ENROLLED_LABEL}
    </button>
  {/if}
  {#if ondismiss}
    <button
      type="button"
      data-testid="stub-dismiss-trigger"
      onclick={ondismiss}
    >
      {DISMISS_LABEL}
    </button>
  {/if}
</div>
