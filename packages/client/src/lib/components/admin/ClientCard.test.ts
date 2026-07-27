// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  clients_ticket_count_one: ({ count }: { count: number }) =>
    `${String(count)} ticket`,
  clients_ticket_count_other: ({ count }: { count: number }) =>
    `${String(count)} tickets`,
  clients_merged_label: () => "Merged",
  client_edit_title: () => "Edit client",
}));

import ClientCard from "./ClientCard.svelte";

interface ClientCardTestProps {
  viewMode: "list" | "grid";
  clientId: string;
  alias: string;
  phone: string;
  ticketCount: number;
  createdAt: string;
  mergedInto: string | null;
  onedit: (clientId: string) => void;
}

function makeProps(
  overrides: Partial<ClientCardTestProps> = {},
): ClientCardTestProps {
  return {
    viewMode: "list",
    clientId: "c-1",
    alias: "quiet-harbor",
    phone: "***1234",
    ticketCount: 2,
    createdAt: "2026-01-15T00:00:00.000Z",
    mergedInto: null,
    onedit: vi.fn(),
    ...overrides,
  };
}

describe("ClientCard", () => {
  afterEach(cleanup);

  describe("content", () => {
    it("renders the alias", () => {
      render(ClientCard, { props: makeProps() });
      expect(screen.getByText("quiet-harbor")).toBeTruthy();
    });

    it("renders the phone string as given", () => {
      render(ClientCard, { props: makeProps({ phone: "+1 (555) 000-1234" }) });
      expect(screen.getByText("+1 (555) 000-1234")).toBeTruthy();
    });

    it("renders a masked phone string unchanged", () => {
      render(ClientCard, { props: makeProps({ phone: "***1234" }) });
      expect(screen.getByText("***1234")).toBeTruthy();
    });

    it("renders the created date", () => {
      const { container } = render(ClientCard, {
        props: makeProps({ createdAt: "2026-01-15T00:00:00.000Z" }),
      });
      const meta = container.querySelector(".meta");
      expect(meta).toBeTruthy();
      const expected = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date("2026-01-15T00:00:00.000Z"));
      expect(meta!.textContent).toContain(expected);
    });
  });

  describe("ticket count key selection", () => {
    it("uses the singular key for exactly one ticket", () => {
      render(ClientCard, { props: makeProps({ ticketCount: 1 }) });
      expect(screen.getByText(/1 ticket/)).toBeTruthy();
      expect(screen.queryByText(/1 tickets/)).toBeNull();
    });

    it("uses the plural key for more than one ticket", () => {
      render(ClientCard, { props: makeProps({ ticketCount: 4 }) });
      expect(screen.getByText(/4 tickets/)).toBeTruthy();
    });

    it("uses the plural key for zero tickets", () => {
      render(ClientCard, { props: makeProps({ ticketCount: 0 }) });
      expect(screen.getByText(/0 tickets/)).toBeTruthy();
    });
  });

  describe("merged badge", () => {
    it("hides the badge when the client was not merged", () => {
      render(ClientCard, { props: makeProps({ mergedInto: null }) });
      expect(screen.queryByText("Merged")).toBeNull();
    });

    it("shows the badge when the client was merged into another", () => {
      render(ClientCard, { props: makeProps({ mergedInto: "c-9" }) });
      expect(screen.getByText("Merged")).toBeTruthy();
    });

    it("renders the badge in its own slot rather than inside the meta line", () => {
      const { container } = render(ClientCard, {
        props: makeProps({ mergedInto: "c-9" }),
      });
      expect(container.querySelector(".alias-row .merged-badge")).toBeTruthy();
      expect(container.querySelector(".meta .merged-badge")).toBeNull();
    });
  });

  describe("activation", () => {
    it("calls onedit with the client id when the edit button is clicked", async () => {
      const onedit = vi.fn();
      render(ClientCard, { props: makeProps({ clientId: "c-7", onedit }) });

      await fireEvent.click(
        screen.getByRole("button", { name: "Edit client" }),
      );

      expect(onedit).toHaveBeenCalledWith("c-7");
    });

    it("calls onedit when Enter is pressed on the edit button", async () => {
      const onedit = vi.fn();
      render(ClientCard, { props: makeProps({ clientId: "c-7", onedit }) });

      await fireEvent.keyDown(
        screen.getByRole("button", { name: "Edit client" }),
        { key: "Enter" },
      );

      expect(onedit).toHaveBeenCalledWith("c-7");
    });

    it("calls onedit when Space is pressed on the edit button", async () => {
      const onedit = vi.fn();
      render(ClientCard, { props: makeProps({ clientId: "c-7", onedit }) });

      await fireEvent.keyDown(
        screen.getByRole("button", { name: "Edit client" }),
        { key: " " },
      );

      expect(onedit).toHaveBeenCalledWith("c-7");
    });

    it("ignores unrelated keys", async () => {
      const onedit = vi.fn();
      render(ClientCard, { props: makeProps({ onedit }) });

      await fireEvent.keyDown(
        screen.getByRole("button", { name: "Edit client" }),
        { key: "a" },
      );

      expect(onedit).not.toHaveBeenCalled();
    });

    it("does not activate when the row body is clicked", async () => {
      const onedit = vi.fn();
      const { container } = render(ClientCard, {
        props: makeProps({ onedit }),
      });

      const row = container.querySelector(".card-inner");
      expect(row).toBeTruthy();
      await fireEvent.click(row!);

      expect(onedit).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("exposes exactly one button, the edit control", () => {
      render(ClientCard, { props: makeProps() });

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]!.getAttribute("aria-label")).toBe("Edit client");
    });

    it("leaves the row itself out of the tab order", () => {
      const { container } = render(ClientCard, { props: makeProps() });

      const row = container.querySelector(".card-inner");
      expect(row!.getAttribute("tabindex")).toBeNull();
      expect(row!.getAttribute("role")).toBeNull();
    });

    it("hides the meta separator from assistive technology", () => {
      const { container } = render(ClientCard, { props: makeProps() });
      const dot = container.querySelector(".meta-dot");
      expect(dot).toBeTruthy();
      expect(dot!.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("view mode", () => {
    it("applies the list layout class in list mode", () => {
      const { container } = render(ClientCard, {
        props: makeProps({ viewMode: "list" }),
      });
      expect(container.querySelector(".card-inner--list")).toBeTruthy();
    });
  });
});
