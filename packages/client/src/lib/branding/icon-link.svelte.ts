let iconHref = $state<string | null>(null);

export function setAppleTouchIconHref(href: string | null): void {
  iconHref = href;
}

export function getAppleTouchIconHref(): string | null {
  return iconHref;
}
