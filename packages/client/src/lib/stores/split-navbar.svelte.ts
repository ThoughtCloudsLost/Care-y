import type { NavbarOverrideContainer } from "$lib/shell/context.js";

export interface SplitNavbarConfig {
  readonly rightNavbar: NavbarOverrideContainer;
  readonly rightWidth: string;
  readonly onclose: () => void;
  readonly onexpand: () => void;
}

let current = $state<SplitNavbarConfig | undefined>(undefined);
let rightSubnavH = $state(0);

export const splitNavbar = {
  get config(): SplitNavbarConfig | undefined {
    return current;
  },
  get rightSubnavbarHeight(): number {
    return rightSubnavH;
  },
  set(value: SplitNavbarConfig | undefined): void {
    current = value;
  },
  setRightHeight(h: number): void {
    rightSubnavH = h;
  },
};
