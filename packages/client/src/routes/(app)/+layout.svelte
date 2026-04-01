<script lang="ts">
  import { setContext } from "svelte";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";

  let { children } = $props();

  // Initialize the CryptoBridge singleton for all authenticated routes.
  // The bridge spawns the Web Worker and captures postMessage at construction
  // time (SEC-210). All (app) child routes access this via getContext('cryptoBridge').
  const bridge = new CryptoBridge();
  setContext("cryptoBridge", bridge);
</script>

<!-- Auth guard placeholder: 6i will add session check + redirect here.
     For now, all (app) routes render unconditionally. -->
{@render children()}
