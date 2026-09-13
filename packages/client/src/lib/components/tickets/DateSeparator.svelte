<!--
  The dateline that breaks a conversation into days.

  One implementation so a client and a volunteer looking at the same
  conversation see the same rule, in the same weight, in the same place.
  Both threads render it: the portal thread and, since the parity
  close-out, the org ticket thread.

  Callers decide when a line is needed with `needsDateSeparator` and pass
  the already-formatted label, because the grouping logic differs per
  thread while the anatomy does not.
-->
<script lang="ts">
  interface Props {
    /** Formatted day label, from `formatDateSeparator`. */
    readonly label: string;
  }

  let { label }: Props = $props();
</script>

<div class="date-separator" role="separator">
  <span class="date-separator-label">{label}</span>
</div>

<style>
  /* No padding of its own: the thread's gap and side padding place it. */
  .date-separator {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .date-separator::before,
  .date-separator::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--hair);
  }

  .date-separator-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }
</style>
