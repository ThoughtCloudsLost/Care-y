<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";

  export type RegisterKind = "note" | "careful" | "warning" | "protected";

  interface Props {
    kind: RegisterKind;
    children: Snippet;
  }

  let { kind, children }: Props = $props();

  // The four registers replace amber-for-everything callouts. Protected is
  // deliberately calm: it shares Note's surface and earns its distinction
  // from the shield glyph and the word, not from color (a protection claim
  // is reassurance, not alarm). No left borders, no icon soup.
  // Map lookup (not object indexing) per the lint security rules; the
  // fallback is unreachable with a valid RegisterKind.
  const eyebrows = new Map<RegisterKind, () => string>([
    ["note", m.register_note],
    ["careful", m.register_careful],
    ["warning", m.register_warning],
    ["protected", m.register_protected],
  ]);

  const eyebrow = $derived((eyebrows.get(kind) ?? m.register_note)());
</script>

<div class="register register-{kind}" data-register={kind} role="note">
  <div class="register-eyebrow">
    {#if kind === "protected"}
      <svg width="11" height="12" viewBox="0 0 12 13" aria-hidden="true">
        <path
          d="M6 1l4.5 1.8v3.4c0 2.7-1.8 4.6-4.5 5.7-2.7-1.1-4.5-3-4.5-5.7V2.8L6 1z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linejoin="round"
        />
      </svg>
    {/if}
    <span>{eyebrow}</span>
  </div>
  <div class="register-body">
    {@render children()}
  </div>
</div>

<style>
  .register {
    border-radius: 10px;
    padding: 10px 13px;
    background: var(--paper-deep);
  }

  .register-careful {
    background: var(--care-soft);
  }

  .register-warning {
    background: var(--urgent-soft);
  }

  .register-eyebrow {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.6875rem; /* 11px */
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 3px;
  }

  .register-careful .register-eyebrow {
    color: var(--care);
  }

  .register-warning .register-eyebrow {
    color: var(--urgent);
  }

  .register-eyebrow svg {
    display: block;
    flex: none;
  }

  .register-body {
    font-size: var(--text-base);
    line-height: 1.5;
    color: var(--ink-2);
  }
</style>
