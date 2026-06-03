<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  if (browser) {
    try {
      sessionStorage.removeItem("care-y-2fa-methods");
    } catch {
      /* ok */
    }
    void goto(resolve("/login"));
  }
</script>
