/**
 * Shim for node:util
 *
 * Only promisify is used by the reachable graph (scrypt-hash.ts,
 * salt-defense.ts). Re-exports from the node-crypto-shim which
 * has its own promisify.
 */

export function promisify<TArgs extends unknown[], TResult>(
  fn: (
    ...args: [...TArgs, (err: Error | null, result: TResult) => void]
  ) => void,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> =>
    new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, result: TResult) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
}

/** Standard no-op deprecate: returns the function unchanged. */
export function deprecate<T>(fn: T, _message?: string): T {
  return fn;
}

/** Minimal inspect for logging paths; JSON is close enough for a demo. */
export function inspect(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Minimal %s/%d/%j format subset. */
export function format(template: string, ...args: readonly unknown[]): string {
  let i = 0;
  return template.replace(/%[sdj%]/g, (match) => {
    if (match === "%%") return "%";
    const arg = args.at(i);
    i += 1;
    if (match === "%j") return inspect(arg);
    return String(arg);
  });
}

export default { promisify, deprecate, inspect, format };
