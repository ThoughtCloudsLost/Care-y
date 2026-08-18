<!--
  Expandable disclosure showing how the intake form protects user data.
  Native <details>/<summary> with explicit aria-expanded binding per the
  APG disclosure pattern. Three two-part what/why facts from the
  visibility system.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  let expanded = $state(false);

  function handleToggle(e: Event): void {
    if (e.currentTarget instanceof HTMLDetailsElement) {
      expanded = e.currentTarget.open;
    }
  }
</script>

<details class="how-protected" ontoggle={handleToggle}>
  <summary aria-expanded={expanded}>
    {m.intake_protected_title()}
  </summary>

  <div class="how-protected-content">
    <p class="how-protected-summary">
      {m.intake_protected_summary()}
    </p>

    <dl class="how-protected-facts">
      <div class="how-protected-fact">
        <dt>{m.intake_protected_encrypted_what()}</dt>
        <dd>{m.intake_protected_encrypted_why()}</dd>
      </div>

      <div class="how-protected-fact">
        <dt>{m.intake_protected_volunteers_what()}</dt>
        <dd>{m.intake_protected_volunteers_why()}</dd>
      </div>

      <div class="how-protected-fact">
        <dt>{m.intake_protected_server_what()}</dt>
        <dd>{m.intake_protected_server_why()}</dd>
      </div>
    </dl>
  </div>
</details>

<style>
  .how-protected {
    margin: var(--space-sm) 0;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    font-size: var(--text-base);
    color: var(--ink);
    padding: var(--space-sm) 0;
    list-style: revert;
    -webkit-tap-highlight-color: transparent;
  }

  .how-protected-content {
    padding: var(--space-sm) 0 var(--space-md);
  }

  .how-protected-summary {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0 0 var(--space-md);
    line-height: 1.5;
  }

  .how-protected-facts {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .how-protected-fact {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .how-protected-fact dt {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    line-height: 1.4;
  }

  .how-protected-fact dd {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }
</style>
