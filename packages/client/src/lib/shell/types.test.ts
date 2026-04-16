import { describe, it, expect, expectTypeOf } from "vitest";
import {
  TAB_IDS,
  type TabId,
  type AppShellProps,
  type ShellNavbarProps,
  type PageLayoutProps,
  type ShellSheetProps,
  type ShellPopupProps,
  type ShellActionSheetProps,
  type NavbarOverride,
  type TabbarOverride,
} from "./types";

/**
 * Compile-time type tests. These verify the types are importable
 * and structurally correct. No runtime assertions needed.
 */
describe("shell types", () => {
  it("exports TAB_IDS as a readonly tuple", () => {
    expectTypeOf(TAB_IDS).toExtend<readonly string[]>();
    expect(TAB_IDS).toEqual(["home", "tickets", "library"]);
  });

  it("TabId is a union of the tab ID strings", () => {
    expectTypeOf<TabId>().toEqualTypeOf<"home" | "tickets" | "library">();
  });

  it("AppShellProps has activeTab, ontabchange, and children", () => {
    expectTypeOf<AppShellProps>().toHaveProperty("activeTab");
    expectTypeOf<AppShellProps>().toHaveProperty("ontabchange");
    expectTypeOf<AppShellProps>().toHaveProperty("children");
  });

  it("ShellNavbarProps has optional title and backLink", () => {
    expectTypeOf<ShellNavbarProps>().toHaveProperty("title");
    expectTypeOf<ShellNavbarProps>().toHaveProperty("backLink");
  });

  it("PageLayoutProps has optional lockScroll and touchAction", () => {
    expectTypeOf<PageLayoutProps>().toHaveProperty("lockScroll");
    expectTypeOf<PageLayoutProps>().toHaveProperty("touchAction");
    expectTypeOf<PageLayoutProps>().toHaveProperty("children");
  });

  it("ShellSheetProps has opened, ondismiss, and children", () => {
    expectTypeOf<ShellSheetProps>().toHaveProperty("opened");
    expectTypeOf<ShellSheetProps>().toHaveProperty("ondismiss");
    expectTypeOf<ShellSheetProps>().toHaveProperty("children");
  });

  it("ShellPopupProps has optional title", () => {
    expectTypeOf<ShellPopupProps>().toHaveProperty("title");
    expectTypeOf<ShellPopupProps>().toHaveProperty("opened");
  });

  it("ShellActionSheetProps has opened and ondismiss", () => {
    expectTypeOf<ShellActionSheetProps>().toHaveProperty("opened");
    expectTypeOf<ShellActionSheetProps>().toHaveProperty("ondismiss");
  });

  it("NavbarOverride has searchHidden", () => {
    expectTypeOf<NavbarOverride>().toHaveProperty("searchHidden");
  });

  it("TabbarOverride has left, middle, right snippet slots", () => {
    expectTypeOf<TabbarOverride>().toHaveProperty("left");
    expectTypeOf<TabbarOverride>().toHaveProperty("middle");
    expectTypeOf<TabbarOverride>().toHaveProperty("right");
    expectTypeOf<TabbarOverride>().toHaveProperty("ariaLabel");
  });
});
