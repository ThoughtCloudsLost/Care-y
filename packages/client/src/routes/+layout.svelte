<script lang="ts">
  import "../app.css";
  import { App } from "konsta/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import favicon from "$lib/assets/favicon.svg";
  import { themeStore } from "$lib/stores/theme.svelte";
  import RisoInkFilter from "$lib/components/RisoInkFilter.svelte";

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Stale after 30 seconds. Reasonable default for an encrypted data app.
        // Individual queries can override this.
        staleTime: 30_000,
      },
    },
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<RisoInkFilter />

<QueryClientProvider client={queryClient}>
  <App theme={themeStore.current}>
    {@render children()}
  </App>
</QueryClientProvider>
