/**
 * Shared recursive tRPC procedure proxy factory.
 *
 * Both the engine's caller adapter and the stubs' engine-delegation proxy
 * need the same pattern: a Proxy whose property access accumulates a
 * dotted path, and "query"/"mutate" terminals dispatch the accumulated
 * path to a callback. This module provides one implementation so the
 * shape stays in sync.
 */

/**
 * Dispatch callback signature. Receives the accumulated dotted path
 * segments and the tRPC procedure kind ("query" or "mutate").
 */
export type ProcDispatch = (
  path: readonly string[],
  kind: "query" | "mutate",
  input?: unknown,
) => Promise<unknown>;

/**
 * Structural type for the proxy tree returned by makeProcedureProxy.
 * At any depth, property access yields another ProcedureProxy, and
 * "query"/"mutate" terminals return async dispatch functions. This
 * narrows the `unknown` that createAdapter previously returned so
 * downstream assertions narrow instead of inventing from nothing.
 */
export interface ProcedureProxy {
  readonly query: (input?: unknown) => Promise<unknown>;
  readonly mutate: (input?: unknown) => Promise<unknown>;
  readonly [key: string]:
    ProcedureProxy | ((input?: unknown) => Promise<unknown>);
}

/**
 * Build a recursive Proxy tree that resolves tRPC-style dotted paths.
 *
 * Property access on "query" or "mutate" returns an async function that
 * invokes `dispatch` with the accumulated path segments and the terminal
 * kind. Any other property extends the path. Symbol properties return
 * undefined (Proxy internals, JSON.stringify probes, etc.).
 */
export function makeProcedureProxy(dispatch: ProcDispatch): ProcedureProxy {
  function makeNode(path: readonly string[]): ProcedureProxy {
    // Memoize child nodes and terminal functions so repeated access
    // to the same dispatch path is allocation-free.
    const children = new Map<string, ProcedureProxy>();
    const queryFn = async (input?: unknown): Promise<unknown> =>
      dispatch(path, "query", input);
    const mutateFn = async (input?: unknown): Promise<unknown> =>
      dispatch(path, "mutate", input);

    return new Proxy({} as ProcedureProxy, {
      get(_target, prop: string | symbol): unknown {
        if (typeof prop === "symbol") return undefined;
        if (prop === "query") return queryFn;
        if (prop === "mutate") return mutateFn;
        let child = children.get(prop);
        if (child === undefined) {
          child = makeNode([...path, prop]);
          children.set(prop, child);
        }
        return child;
      },
    });
  }

  return makeNode([]);
}
