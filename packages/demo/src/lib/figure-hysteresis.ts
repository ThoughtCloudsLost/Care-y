/**
 * Mount hysteresis for virtualized figures.
 *
 * Figures enter at a tight viewport buffer and leave at a wider one, so
 * an element oscillating across the boundary does not unmount/remount
 * its video on every scroll tick. The tracker lives outside component
 * state on purpose: it is scratch memory updated inside a layout pass,
 * and making it reactive would subscribe the pass to its own output.
 */
export interface FigureHysteresis {
  /** Whether the index survived the previous committed pass. */
  wasMounted(index: number): boolean;
  /** Mark an index as mounted for the pass being built. */
  keep(index: number): void;
  /** Swap the built pass in as the committed set. */
  commit(): void;
}

export function createFigureHysteresis(): FigureHysteresis {
  let mounted = new Set<number>();
  let next = new Set<number>();
  return {
    wasMounted(index: number): boolean {
      return mounted.has(index);
    },
    keep(index: number): void {
      next.add(index);
    },
    commit(): void {
      mounted = next;
      next = new Set<number>();
    },
  };
}
