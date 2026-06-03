import { SvelteSet } from "svelte/reactivity";

export interface MultiSelectState {
  readonly active: boolean;
  readonly selectedIds: SvelteSet<string>;
  toggle(): void;
  toggleSelection(ticketId: string): void;
  exit(): void;
  handleLongPress(ticketId: string): void;
}

export function createMultiSelect(): MultiSelectState {
  let active = $state(false);
  const selectedIds = new SvelteSet<string>();

  function toggle(): void {
    if (active) {
      exit();
    } else {
      active = true;
    }
  }

  function toggleSelection(ticketId: string): void {
    if (selectedIds.has(ticketId)) {
      selectedIds.delete(ticketId);
    } else {
      selectedIds.add(ticketId);
    }
  }

  function exit(): void {
    active = false;
    selectedIds.clear();
  }

  function handleLongPress(ticketId: string): void {
    if (!active) {
      active = true;
    }
    toggleSelection(ticketId);
  }

  return {
    get active(): boolean {
      return active;
    },
    get selectedIds(): SvelteSet<string> {
      return selectedIds;
    },
    toggle,
    toggleSelection,
    exit,
    handleLongPress,
  };
}
