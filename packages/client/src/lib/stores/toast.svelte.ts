/**
 * Global toast store. Queue-based, auto-dismiss, one visible at a time.
 *
 * Usage from any component:
 *   import { toastStore } from "$lib/stores/toast.svelte.js";
 *   toastStore.show("Filter saved");
 *
 * The (app) layout renders the ShellToast and reads from this store.
 * Toasts are FIFO: if a toast is showing when another is pushed,
 * the first auto-dismisses and the second takes over.
 */

const DEFAULT_DURATION_MS = 2500;

export interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly duration: number;
}

function createToastStore(): {
  readonly current: ToastItem | null;
  show(message: string, duration?: number): void;
  dismiss(): void;
} {
  let current = $state<ToastItem | null>(null);
  let nextId = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const queue: ToastItem[] = [];

  function scheduleAutoDismiss(item: ToastItem): void {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      if (current?.id === item.id) {
        advance();
      }
    }, item.duration);
  }

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function advance(): void {
    const next = queue.shift();
    if (next !== undefined) {
      current = next;
      scheduleAutoDismiss(next);
    } else {
      current = null;
    }
  }

  return {
    get current(): ToastItem | null {
      return current;
    },

    show(message: string, duration: number = DEFAULT_DURATION_MS): void {
      const item: ToastItem = { id: nextId++, message, duration };

      if (current === null) {
        current = item;
        scheduleAutoDismiss(item);
      } else {
        queue.push(item);
      }
    },

    dismiss(): void {
      clearTimer();
      advance();
    },
  };
}

export const toastStore = createToastStore();
