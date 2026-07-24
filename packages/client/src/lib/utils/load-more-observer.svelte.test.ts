import { describe, it, expect, vi, afterEach } from "vitest";
import { loadMoreObserver } from "./load-more-observer.svelte.js";

type ObserverEntries = { isIntersecting: boolean }[];
type ObserverCallback = (entries: ObserverEntries) => void;

function stubIntersectionObserver(): {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  emit: (entries: ObserverEntries) => void;
  options: () => IntersectionObserverInit | undefined;
} {
  const observe = vi.fn();
  const disconnect = vi.fn();
  let callback: ObserverCallback | undefined;
  let capturedOptions: IntersectionObserverInit | undefined;

  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (
      this: { observe: typeof observe; disconnect: typeof disconnect },
      cb: ObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      callback = cb;
      capturedOptions = options;
      this.observe = observe;
      this.disconnect = disconnect;
    }),
  );

  return {
    observe,
    disconnect,
    emit: (entries) => callback?.(entries),
    options: () => capturedOptions,
  };
}

describe("loadMoreObserver", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const el = {} as unknown as HTMLElement;

  it("observes the attached element with a 200px lookahead", () => {
    const stub = stubIntersectionObserver();
    const attach = loadMoreObserver(vi.fn());

    attach(el);

    expect(stub.observe).toHaveBeenCalledWith(el);
    expect(stub.options()).toEqual({ rootMargin: "200px" });
  });

  it("calls onloadmore when the sentinel intersects", () => {
    const stub = stubIntersectionObserver();
    const onloadmore = vi.fn();
    loadMoreObserver(onloadmore)(el);

    stub.emit([{ isIntersecting: true }]);

    expect(onloadmore).toHaveBeenCalledOnce();
  });

  it("does not call onloadmore for non-intersecting entries", () => {
    const stub = stubIntersectionObserver();
    const onloadmore = vi.fn();
    loadMoreObserver(onloadmore)(el);

    stub.emit([{ isIntersecting: false }]);
    stub.emit([]);

    expect(onloadmore).not.toHaveBeenCalled();
  });

  it("disconnects the observer on cleanup", () => {
    const stub = stubIntersectionObserver();
    const cleanup = loadMoreObserver(vi.fn())(el);

    expect(typeof cleanup).toBe("function");
    (cleanup as () => void)();

    expect(stub.disconnect).toHaveBeenCalledOnce();
  });
});
