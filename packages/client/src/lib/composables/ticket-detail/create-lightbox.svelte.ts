export interface LightboxState {
  readonly open: boolean;
  readonly url: string | null;
  show(imageUrl: string): void;
  dismiss(): void;
}

export function createLightbox(): LightboxState {
  let open = $state(false);
  let url = $state<string | null>(null);

  return {
    get open(): boolean {
      return open;
    },
    get url(): string | null {
      return url;
    },
    show(imageUrl: string): void {
      url = imageUrl;
      open = true;
    },
    dismiss(): void {
      open = false;
      url = null;
    },
  };
}
