let opened = $state(false);

export const devPanel = {
  get opened(): boolean {
    return opened;
  },
  toggle: (): void => {
    opened = !opened;
  },
  close: (): void => {
    opened = false;
  },
};
