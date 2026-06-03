import { hasContext, getContext, setContext } from "svelte";

export interface WizardNavAction {
  readonly label: string;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly onaction: () => void | Promise<void>;
}

export interface WizardNavState {
  readonly right?: WizardNavAction;
  readonly left?: WizardNavAction;
}

export interface WizardNavContainer {
  current: WizardNavState | undefined;
}

const CTX_KEY = "onboarding-wizard-nav";

const NOOP_CONTAINER: WizardNavContainer = { current: undefined };

export function getWizardNavCtx(): WizardNavContainer {
  if (hasContext(CTX_KEY)) {
    return getContext<WizardNavContainer>(CTX_KEY);
  }
  return NOOP_CONTAINER;
}

export function setWizardNavCtx(container: WizardNavContainer): void {
  setContext(CTX_KEY, container);
}
