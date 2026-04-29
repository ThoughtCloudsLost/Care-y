const DEFAULT_DURATION_MS = 500;

export interface LongPressState {
  start(callback: () => void): void;
  cancel(): void;
  cleanup(): void;
}

export function createLongPress(durationMs?: number): LongPressState {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function start(callback: () => void): void {
    timer = setTimeout(() => {
      callback();
      timer = null;
    }, durationMs ?? DEFAULT_DURATION_MS);
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function cleanup(): void {
    cancel();
  }

  return { start, cancel, cleanup };
}
