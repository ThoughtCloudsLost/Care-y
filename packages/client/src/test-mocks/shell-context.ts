/**
 * Shared vi.mock() factory for $lib/shell/context.js.
 *
 * The real module's getters come from Svelte 5 createContext and throw
 * outside a live component tree, so the factory replaces the full surface.
 * The `satisfies` stays in the test file so the guard text is where the
 * rule looks for it:
 *
 *   import type * as ShellContextNS from "$lib/shell/context.js";
 *   vi.mock("$lib/shell/context.js", async () =>
 *     (await import("$lib/../test-mocks/shell-context.js")).shellContextMock()
 *       satisfies typeof ShellContextNS);
 *
 * Tests read or reset the exported containers (e.g. mockNavbarCtx.current)
 * directly; the getters hand back these same objects.
 */

import { vi } from "vitest";
import type * as ShellContextNS from "$lib/shell/context.js";

export const mockNavbarCtx: ShellContextNS.NavbarOverrideContainer = {
  current: undefined,
};
export const mockTabbarCtx: ShellContextNS.TabbarOverrideContainer = {
  current: undefined,
};
export const mockTabbarHiddenCtx: ShellContextNS.TabbarHiddenContainer = {
  current: false,
};
export const mockSectionRailCtx: ShellContextNS.SectionRailContainer = {
  current: undefined,
};

export function shellContextMock(): typeof ShellContextNS {
  return {
    getScrollContainer: () => () => undefined,
    setScrollContainer: vi.fn(),
    getTabbarOverrideCtx: () => mockTabbarCtx,
    setTabbarOverrideCtx: vi.fn(),
    getTabbarHiddenCtx: () => mockTabbarHiddenCtx,
    setTabbarHiddenCtx: vi.fn(),
    getNavbarOverrideCtx: () => mockNavbarCtx,
    setNavbarOverrideCtx: vi.fn(),
    getSectionRailCtx: () => mockSectionRailCtx,
    setSectionRailCtx: vi.fn(),
  };
}
