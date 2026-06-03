let keyed = $state(false);

export function setCryptoKeyed(value: boolean): void {
  keyed = value;
}

export function isCryptoKeyed(): boolean {
  return keyed;
}
