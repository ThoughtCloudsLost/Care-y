/**
 * Factory for the demo's TanStack QueryClient.
 *
 * Every query resolves in-process against the embedded server engine,
 * so no fixture pre-seeding happens here (a pre-engine auth.me fixture
 * with placeholder ciphertexts once lived in this file and silently
 * shadowed the real endpoint via staleTime: Infinity). Refetch-on-*
 * triggers stay off because data only changes through mutations, which
 * invalidate their own query keys.
 */

import { QueryClient } from "@tanstack/svelte-query";

/**
 * Create a QueryClient configured for the demo: no retries, no
 * focus/reconnect refetching, infinite staleTime and gc. Errored
 * queries still refetch when a new observer mounts (retryOnMount
 * default), which is how the login page's pre-auth 401 on auth.me
 * recovers once the app shell mounts after login.
 */
export function createDemoQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
}

/**
 * Clear all cached data. Restart is an iframe reload in the current
 * demo, so this exists for tests and any future soft-reset path.
 */
export function reseedDemoQueryClient(client: QueryClient): void {
  client.clear();
}
