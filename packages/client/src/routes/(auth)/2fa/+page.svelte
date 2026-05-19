<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as m from "$lib/paraglide/messages.js";
  import TwoFactorChallenge from "$lib/components/auth/TwoFactorChallenge.svelte";

  let enrolledMethods = $state<string[]>([]);

  if (browser) {
    let methods: string[] = [];
    try {
      const raw = sessionStorage.getItem("care-y-2fa-methods");
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((v): v is string => typeof v === "string")
        ) {
          methods = parsed;
        }
      }
      sessionStorage.removeItem("care-y-2fa-methods");
    } catch {
      // sessionStorage unavailable or malformed JSON
    }

    if (methods.length === 0) {
      void goto(resolve("/login"));
    } else {
      enrolledMethods = methods;
    }
  }

  function handleBackToLogin(): void {
    try {
      sessionStorage.removeItem("care-y-2fa-methods");
    } catch {
      /* ok */
    }
    void goto(resolve("/login"));
  }
</script>

{#if enrolledMethods.length > 0}
  <TwoFactorChallenge
    methods={enrolledMethods}
    onsuccess={() => {
      void goto(resolve("/"));
    }}
  />
{/if}

<div class="text-center mt-6">
  <button type="button" class="back-link" onclick={handleBackToLogin}>
    {m.twofa_back_to_login()}
  </button>
</div>

<style>
  .back-link {
    background: none;
    border: none;
    color: var(--brand-primary, var(--k-color-primary, #007aff));
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem;
    min-height: 44px;
  }
</style>
