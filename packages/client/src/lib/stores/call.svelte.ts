interface ActiveCall {
  ticketId: string;
  callSid: string;
  startedAt: number;
}

let active = $state<ActiveCall | null>(null);

export const callStore = {
  get active(): ActiveCall | null {
    return active;
  },
  start(call: Omit<ActiveCall, "startedAt">): void {
    active = { ...call, startedAt: Date.now() };
  },
  end(): void {
    active = null;
  },
};
