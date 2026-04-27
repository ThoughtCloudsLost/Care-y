let ready = $state(false);

export function setOrgKeyReady(value: boolean): void {
  ready = value;
}

export function isOrgKeyReady(): boolean {
  return ready;
}
