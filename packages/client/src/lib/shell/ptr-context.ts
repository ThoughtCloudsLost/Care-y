/**
 * Context key for pull-to-refresh opt-out.
 *
 * Any route that should suppress PTR calls:
 *   setContext(PTR_CONTEXT_KEY, false)
 *
 * AppShell reads this via getContext and skips gesture handling when false.
 */
export const PTR_CONTEXT_KEY: unique symbol = Symbol("pull-to-refresh-enabled");
