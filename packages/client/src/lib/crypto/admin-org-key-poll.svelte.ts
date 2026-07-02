let polling = $state(false);

export function setAdminOrgKeyPolling(value: boolean): void {
  polling = value;
}

export function isAdminOrgKeyPolling(): boolean {
  return polling;
}
