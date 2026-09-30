/**
 * Compile-time contract between a stub and the module it replaces.
 *
 * Each aliased stub takes a type-only namespace import of itself and of
 * the real module (by relative path, since the $lib alias points back at
 * the stub) and declares:
 *
 *   type _Contract = NoStubDrift<StubDrift<typeof ThisStub, typeof Real>>;
 *
 * StubDrift resolves to the names of the real module's value exports that
 * the stub is missing or has drifted on. NoStubDrift only accepts an empty
 * union, so a mismatch fails typecheck with the offending export names in
 * the error. Everything here is erased at compile time; nothing reaches
 * the bundle.
 *
 * Assignability alone misses the failure this exists for. TypeScript lets
 * a function with fewer parameters stand in for one with more (the
 * handbook's "Comparing two functions" section), so a stub that drops a
 * trailing argument still type-checks against the real signature. Function
 * exports therefore also have to match the real parameter count,
 * optionality included.
 *
 * A module's namespace type holds only its values, so interfaces and type
 * aliases fall outside the check. Methods on object exports (stores, the
 * trpc proxy) get the assignability check but not the parameter count.
 */

type AnyFunction = (...args: never[]) => unknown;

type Arity<F> = F extends (...args: infer P) => unknown ? P["length"] : never;

type SameArity<S, R> = [R] extends [AnyFunction]
  ? [Arity<S>] extends [Arity<R>]
    ? [Arity<R>] extends [Arity<S>]
      ? true
      : false
    : false
  : true;

/** Names of the real module's value exports the stub lacks or mismatches. */
export type StubDrift<Stub, Real> = {
  [K in keyof Real]: K extends keyof Stub
    ? [Stub[K]] extends [Real[K]]
      ? SameArity<Stub[K], Real[K]> extends true
        ? never
        : K
      : K
    : K;
}[keyof Real];

/** Accepts only an empty drift union; anything else fails typecheck. */
export type NoStubDrift<Drift extends never> = Drift;
