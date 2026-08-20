// jsdom does not implement matchMedia. Stub it so modules that read
// media queries at import time (svelte/motion's prefersReducedMotion
// constructs a MediaQuery the moment the module evaluates) don't crash.
// Mirrors the client package's test-setup stub.
if (
  typeof globalThis.window !== "undefined" &&
  typeof window.matchMedia !== "function"
) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener(_cb: unknown) {
        /* deprecated stub */
      },
      removeListener(_cb: unknown) {
        /* deprecated stub */
      },
      addEventListener(_type: string, _cb: unknown) {
        /* stub */
      },
      removeEventListener(_type: string, _cb: unknown) {
        /* stub */
      },
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
