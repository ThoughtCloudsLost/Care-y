/* eslint-disable -- Dev-only tooling, not user-facing */
import type { HandleClientError } from "@sveltejs/kit";

if (import.meta.env.DEV) {
  const { pushLog, pushNet, BODY_PREVIEW_CHARS } =
    await import("$lib/dev/log-buffer.js");

  // Console patch
  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...args: unknown[]) => {
    orig.log(...args);
    pushLog("log", args);
  };
  console.info = (...args: unknown[]) => {
    orig.info(...args);
    pushLog("log", args);
  };
  console.debug = (...args: unknown[]) => {
    orig.debug(...args);
    pushLog("log", args);
  };
  console.warn = (...args: unknown[]) => {
    orig.warn(...args);
    pushLog("warn", args);
  };
  console.error = (...args: unknown[]) => {
    orig.error(...args);
    pushLog("error", args);
  };

  // Window error events
  window.addEventListener("error", (e: ErrorEvent) => {
    const loc = e.filename ? `${e.filename}:${e.lineno.toString()}` : "";
    pushLog("error", [`[uncaught] ${e.message}`, loc]);
  });
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    let reason: string;
    try {
      reason = JSON.stringify(e.reason);
    } catch {
      reason = String(e.reason);
    }
    pushLog("error", [`[unhandled rejection] ${reason}`]);
  });

  // EventSource patch
  const OrigEventSource = globalThis.EventSource;
  globalThis.EventSource = class extends OrigEventSource {
    constructor(url: string | URL, init?: EventSourceInit) {
      const urlStr = typeof url === "string" ? url : url.href;
      super(url, init);
      const start = performance.now();
      this.addEventListener("open", () => {
        pushNet({
          method: "SSE",
          url: urlStr,
          status: 200,
          duration: Math.round(performance.now() - start),
          body: null,
        });
      });
      this.addEventListener("error", () => {
        pushNet({
          method: "SSE",
          url: urlStr,
          status: null,
          duration: Math.round(performance.now() - start),
          body: "(connection error)",
        });
      });
    }
  };

  // Fetch patch
  const origFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const method = init?.method ?? "GET";
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const start = performance.now();
    try {
      const res = await origFetch(input, init);
      const duration = Math.round(performance.now() - start);
      // res.clone().text() buffers the full response body into memory.
      // This is acceptable in dev but would be a correctness and memory risk
      // in prod. The outer import.meta.env.DEV guard ensures this never runs
      // in a production build. Do not move this fetch patch outside that guard.
      let body: string | null = null;
      try {
        const text = await res.clone().text();
        body =
          text.length > BODY_PREVIEW_CHARS
            ? text.slice(0, BODY_PREVIEW_CHARS) + "…"
            : text;
      } catch {
        body = "(unreadable)";
      }
      pushNet({ method, url, status: res.status, duration, body });
      return res;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      let errStr: string;
      try {
        errStr = JSON.stringify(err);
      } catch {
        errStr = String(err);
      }
      pushNet({
        method,
        url,
        status: null,
        duration,
        body: `(failed) ${errStr}`,
      });
      throw err;
    }
  };
}

export const handleError: HandleClientError = ({ error, status }) => {
  if (import.meta.env.DEV) {
    console.error(`[handleError] ${status}:`, error);
  }
};
