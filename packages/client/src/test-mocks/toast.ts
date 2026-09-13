/**
 * Shared vi.mock() factory for $lib/stores/toast.svelte.js.
 *
 * The real store is a $state rune module, so factories replace it outright
 * instead of spreading importOriginal. The `satisfies` stays in the test
 * file so the guard text is where the rule looks for it:
 *
 *   import type * as ToastNS from "$lib/stores/toast.svelte.js";
 *   vi.mock("$lib/stores/toast.svelte.js", async () =>
 *     (await import("$lib/../test-mocks/toast.js")).toastMock() satisfies
 *       typeof ToastNS);
 *
 * Assert on `mockToastShow` / `mockToastDismiss`.
 */

import { vi, type Mock } from "vitest";
import type * as ToastNS from "$lib/stores/toast.svelte.js";

type ToastStore = typeof ToastNS.toastStore;

export const mockToastShow: Mock<ToastStore["show"]> = vi.fn();
export const mockToastDismiss: Mock<ToastStore["dismiss"]> = vi.fn();

export function toastMock(): typeof ToastNS {
  return {
    toastStore: {
      current: null,
      show: mockToastShow,
      dismiss: mockToastDismiss,
    },
  };
}
