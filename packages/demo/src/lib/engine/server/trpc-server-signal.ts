/**
 * Marks the page as a tRPC server context before @trpc/server loads.
 *
 * @trpc/server computes its isServerDefault once, when its module
 * evaluates, and accepts a truthy VITEST_WORKER_ID as "server context".
 * This is the only demo-owned way to run the real routers in a browser
 * without editing the product's initTRPC call. Fake value, no secret.
 *
 * @trpc/client shares that module (in dev, Vite prebundles both into one
 * chunk), and the entries reach @trpc/client statically through the
 * client's error types, long before the engine loads. So importing this
 * from globals-init is not early enough: each entry (phone-main.ts,
 * health/main.ts) imports it first. It has no imports of its own, so
 * nothing can evaluate ahead of it.
 */

interface ProcessLike {
  env: Record<string, string | undefined>;
}

if (typeof globalThis.process === "undefined") {
  (globalThis as Record<string, unknown>).process = { env: {} };
}

// Through a local, never a direct globalThis.process.env write: production
// builds statically replace process.env with {}, which would compile the
// assignment away.
const proc = globalThis.process as unknown as ProcessLike;
proc.env.VITEST_WORKER_ID = "1";
