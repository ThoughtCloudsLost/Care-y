/**
 * Type augmentation for SharedWorker extendedLifetime option.
 *
 * The extendedLifetime option is Baseline 2026 but not yet in TS 5.x's
 * lib.dom.d.ts. This declaration merging adds it to WorkerOptions so
 * the SharedWorker constructor accepts it without type suppression.
 *
 * See: https://html.spec.whatwg.org/multipage/workers.html#shared-workers
 */

interface WorkerOptions {
  extendedLifetime?: boolean;
}
