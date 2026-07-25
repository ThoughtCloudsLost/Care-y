/**
 * Stub for $app/state.
 */

export const page = {
  params: {} as Record<string, string>,
  url: new URL("http://localhost"),
  route: { id: "" },
  status: 200,
  error: null as unknown,
  data: {} as Record<string, unknown>,
  form: null as unknown,
  state: {} as Record<string, unknown>,
};

export const navigating = null;

export const updated = {
  current: false,
  check: async (): Promise<boolean> => Promise.resolve(false),
};
