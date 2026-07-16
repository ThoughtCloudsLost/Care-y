// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { Users, Layers, MessageSquareText } from "@lucide/svelte";
import IconTabToggle from "./IconTabToggle.svelte";

afterEach(cleanup);

const threeTabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "queues", label: "Queues", icon: Layers },
  { id: "chat", label: "Chat", icon: MessageSquareText },
];

describe("IconTabToggle", () => {
  describe("toggle semantics (default)", () => {
    it("renders a labeled group of aria-pressed buttons with no tab roles", () => {
      render(IconTabToggle, {
        props: {
          tabs: threeTabs,
          active: "queues",
          ariaLabel: "Views",
          onchange: vi.fn(),
        },
      });

      const group = screen.getByRole("group", { name: "Views" });
      expect(group).toBeTruthy();
      expect(screen.queryByRole("tablist")).toBeNull();
      expect(screen.queryByRole("tab")).toBeNull();

      const pressed = screen.getByRole("button", { name: "Queues" });
      expect(pressed.getAttribute("aria-pressed")).toBe("true");
      expect(pressed.hasAttribute("id")).toBe(false);
      expect(pressed.hasAttribute("aria-controls")).toBe(false);
      expect(pressed.hasAttribute("aria-selected")).toBe(false);
      expect(
        screen
          .getByRole("button", { name: "Users" })
          .getAttribute("aria-pressed"),
      ).toBe("false");
    });

    it("calls onchange with the clicked tab id", async () => {
      const onchange = vi.fn();
      render(IconTabToggle, {
        props: {
          tabs: threeTabs,
          active: "users",
          ariaLabel: "Views",
          onchange,
        },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Chat" }));
      expect(onchange).toHaveBeenCalledWith("chat");
    });
  });

  describe("tabs semantics", () => {
    function renderTabs(active = "users", onchange = vi.fn()) {
      const result = render(IconTabToggle, {
        props: {
          tabs: threeTabs,
          active,
          ariaLabel: "People",
          onchange,
          semantics: "tabs" as const,
        },
      });
      return { ...result, onchange };
    }

    it("renders the APG tablist with ids, aria-controls, and aria-selected", () => {
      renderTabs("queues");

      expect(screen.getByRole("tablist", { name: "People" })).toBeTruthy();
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);

      const queuesTab = screen.getByRole("tab", { name: "Queues" });
      expect(queuesTab.id).toBe("tab-queues");
      expect(queuesTab.getAttribute("aria-controls")).toBe("panel-queues");
      expect(queuesTab.getAttribute("aria-selected")).toBe("true");
      expect(
        screen
          .getByRole("tab", { name: "Users" })
          .getAttribute("aria-selected"),
      ).toBe("false");
    });

    it("gives the active tab tabindex 0 and the rest -1 (roving tabindex)", () => {
      renderTabs("chat");

      expect(
        screen.getByRole("tab", { name: "Chat" }).getAttribute("tabindex"),
      ).toBe("0");
      expect(
        screen.getByRole("tab", { name: "Users" }).getAttribute("tabindex"),
      ).toBe("-1");
      expect(
        screen.getByRole("tab", { name: "Queues" }).getAttribute("tabindex"),
      ).toBe("-1");
    });

    it("ArrowRight moves focus to the next tab and activates it", async () => {
      const { onchange } = renderTabs("users");
      const usersTab = screen.getByRole("tab", { name: "Users" });

      usersTab.focus();
      await fireEvent.keyDown(usersTab, { key: "ArrowRight" });

      expect(onchange).toHaveBeenCalledWith("queues");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Queues" }),
      );
    });

    it("ArrowRight wraps from the last tab to the first", async () => {
      const { onchange } = renderTabs("chat");
      const chatTab = screen.getByRole("tab", { name: "Chat" });

      chatTab.focus();
      await fireEvent.keyDown(chatTab, { key: "ArrowRight" });

      expect(onchange).toHaveBeenCalledWith("users");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Users" }),
      );
    });

    it("ArrowLeft wraps from the first tab to the last", async () => {
      const { onchange } = renderTabs("users");
      const usersTab = screen.getByRole("tab", { name: "Users" });

      usersTab.focus();
      await fireEvent.keyDown(usersTab, { key: "ArrowLeft" });

      expect(onchange).toHaveBeenCalledWith("chat");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Chat" }),
      );
    });

    it("Home and End jump to the first and last tabs", async () => {
      const { onchange } = renderTabs("queues");
      const queuesTab = screen.getByRole("tab", { name: "Queues" });

      queuesTab.focus();
      await fireEvent.keyDown(queuesTab, { key: "End" });
      expect(onchange).toHaveBeenCalledWith("chat");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Chat" }),
      );

      await fireEvent.keyDown(screen.getByRole("tab", { name: "Chat" }), {
        key: "Home",
      });
      expect(onchange).toHaveBeenCalledWith("users");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Users" }),
      );
    });

    it("ignores unrelated keys", async () => {
      const { onchange } = renderTabs("users");
      const usersTab = screen.getByRole("tab", { name: "Users" });

      await fireEvent.keyDown(usersTab, { key: "ArrowDown" });
      await fireEvent.keyDown(usersTab, { key: "Enter" });
      expect(onchange).not.toHaveBeenCalled();
    });

    it("calls onchange with the clicked tab id", async () => {
      const { onchange } = renderTabs("users");

      await fireEvent.click(screen.getByRole("tab", { name: "Queues" }));
      expect(onchange).toHaveBeenCalledWith("queues");
    });
  });
});
