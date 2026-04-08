/**
 * Stub for $app/state (SvelteKit virtual module).
 *
 * Vite's import analysis resolves module specifiers during transformation,
 * before vitest's vi.mock() kicks in. .svelte components that import
 * $app/state fail unless Vite can resolve the specifier. This stub
 * provides the resolution target; individual tests override via vi.mock().
 */

export const page = {
  params: {} as Record<string, string>,
  url: new URL("http://localhost"),
  route: { id: "" },
  status: 200,
  error: null,
  data: {},
  form: null,
  state: {},
};

export const navigating = null;

export const updated = {
  current: false,
  check: async (): Promise<boolean> => Promise.resolve(false),
};
