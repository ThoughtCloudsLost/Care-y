import type { NavbarOverrideContainer } from "$lib/shell/context.js";

export interface SplitNavbarConfig {
  readonly rightNavbar: NavbarOverrideContainer;
  readonly rightWidth: string;
  readonly onclose: () => void;
  readonly onexpand: () => void;
}

let current = $state<SplitNavbarConfig | undefined>(undefined);

export const splitNavbar = {
  get config(): SplitNavbarConfig | undefined {
    return current;
  },
  set(value: SplitNavbarConfig | undefined): void {
    current = value;
  },
};
