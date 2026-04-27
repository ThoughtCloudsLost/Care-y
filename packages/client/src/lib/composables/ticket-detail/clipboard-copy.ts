import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";

type ToastStore = typeof ToastStoreType;

export async function copyToClipboard(
  plaintext: string | undefined,
  toast: ToastStore,
  labels: { readonly success: string; readonly failure: string },
): Promise<void> {
  if (plaintext === undefined || plaintext === "") return;
  try {
    await navigator.clipboard.writeText(plaintext);
    toast.show(labels.success);
  } catch {
    toast.show(labels.failure);
  }
}
