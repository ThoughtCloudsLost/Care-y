export interface InviteFlowDeps {
  readonly canInviteWithLink: () => boolean;
  readonly onInviteManual: () => void;
  readonly onInviteLink: () => void;
}

export interface InviteFlowState {
  readonly popoverOpen: boolean;
  readonly buttonEl: HTMLElement | undefined;
  handleInvite(e: MouseEvent): void;
  handleOption(optionId: string): void;
  dismiss(): void;
}

export function createInviteFlow(deps: InviteFlowDeps): InviteFlowState {
  let popoverOpen = $state(false);
  let buttonEl = $state<HTMLElement | undefined>(undefined);

  return {
    get popoverOpen(): boolean {
      return popoverOpen;
    },
    get buttonEl(): HTMLElement | undefined {
      return buttonEl;
    },
    handleInvite(e: MouseEvent): void {
      if (!deps.canInviteWithLink()) {
        deps.onInviteManual();
        return;
      }
      const target = e.currentTarget;
      buttonEl = target instanceof HTMLElement ? target : undefined;
      popoverOpen = true;
    },
    handleOption(optionId: string): void {
      popoverOpen = false;
      switch (optionId) {
        case "link":
          deps.onInviteLink();
          break;
        case "manual":
          deps.onInviteManual();
          break;
      }
    },
    dismiss(): void {
      popoverOpen = false;
    },
  };
}
