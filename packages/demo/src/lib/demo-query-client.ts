/**
 * Factory for a network-safe TanStack QueryClient pre-seeded with
 * fixture data that AppShell reads on mount.
 *
 * Retries, refetching, and gc are all disabled so the demo never
 * attempts real network requests or evicts seeded data.
 */

import { QueryClient } from "@tanstack/svelte-query";
import { authKeys } from "$lib/query/keys.js";

// -----------------------------------------------------------------------
// Fixture constants (sourced from stubs/crypto-context.ts defaults)
// -----------------------------------------------------------------------

const DEMO_USER_ID = "demo-user-001";
const DEMO_ROLE_ID = "demo-role-001";
/** Fake ciphertext standing in for the encrypted display name. */
const DEMO_ENCRYPTED_DISPLAY_NAME = "x".repeat(60);

/**
 * Minimal auth.me response shape that satisfies AppShell's reads:
 *   - meQuery.data.user.id
 *   - meQuery.data.user.roleId
 *   - meQuery.data.user.encryptedDisplayName
 *   - meQuery.data.user.encryptedIdentifier
 *   - meQuery.data.permissions
 */
interface DemoMeResponse {
  readonly user: {
    readonly id: string;
    readonly encryptedIdentifier: string;
    readonly encryptedDisplayName: string;
    readonly encryptedPreferredLocale: string | null;
    readonly roleId: string;
    readonly hasSeenBriefing: boolean;
  };
  readonly permissions: readonly string[];
  readonly twofaVerified: boolean;
}

function buildMeFixture(): DemoMeResponse {
  return {
    user: {
      id: DEMO_USER_ID,
      encryptedIdentifier: "x".repeat(50),
      encryptedDisplayName: DEMO_ENCRYPTED_DISPLAY_NAME,
      encryptedPreferredLocale: null,
      roleId: DEMO_ROLE_ID,
      hasSeenBriefing: true,
    },
    permissions: [
      "tickets:read",
      "tickets:write",
      "tickets:assign",
      "kb:read",
      "kb:write",
    ],
    twofaVerified: true,
  };
}

/**
 * Create a QueryClient configured for the demo: no network, no retries,
 * infinite staleTime, and pre-seeded with the data AppShell queries on mount.
 */
export function createDemoQueryClient(): QueryClient {
  const client = new QueryClient({
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

  // Seed auth.me so AppShell's meQuery resolves immediately
  client.setQueryData(authKeys.me(), buildMeFixture());

  return client;
}

/**
 * Clear all cached data and re-seed auth.me. Use this on demo restart
 * so that list/detail queries refetch from the reset trpc mock while
 * AppShell's meQuery still resolves immediately.
 */
export function reseedDemoQueryClient(client: QueryClient): void {
  client.clear();
  client.setQueryData(authKeys.me(), buildMeFixture());
}
