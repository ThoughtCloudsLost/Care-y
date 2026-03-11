/**
 * tRPC client bootstrap.
 *
 * Uses vanilla @trpc/client with httpBatchLink.
 * All tRPC calls go through TanStack Query createQuery() with manual query keys.
 *
 * Pattern:
 *   createQuery({
 *     queryKey: ['resource', 'action'],
 *     queryFn: () => trpc.resource.action.query(),
 *   })
 */

import type { TRPCClient } from "@trpc/client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@care-y/server";

export const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      // Vite proxy in dev (/trpc -> localhost:3000), Caddy route in prod.
      // Same-origin requests: no CORS, cookies work naturally.
      url: "/trpc",
      // tRPC's RequestInitEsque has signal?: AbortSignal | undefined, incompatible
      // with native fetch's RequestInit under exactOptionalPropertyTypes (trpc/trpc#1904)
      async fetch(url, options) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return fetch(url, {
          ...options,
          credentials: "include",
        } as RequestInit);
      },
    }),
  ],
});
