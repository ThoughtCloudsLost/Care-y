let settled = $state(false);

export function setCryptoSettled(value: boolean): void {
  settled = value;
}

export function isCryptoSettled(): boolean {
  return settled;
}
