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
      // The tRPC server runs on the Node API server (port 3000),
      // separate from SvelteKit's Vite dev server (port 5173).
      url: "http://localhost:3000",
    }),
  ],
});
