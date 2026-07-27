// @vitest-environment jsdom
/**
 * Tests for PhoneChangeSteps: the confirm and conflict steps of a phone change.
 *
 * PhoneEditSheet's own tests cannot render the conflict step, because its
 * mocked createMutation never propagates the state change that reveals it.
 * This component holds no mutation, so both steps render from props here.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  client_phone_confirm_title: () => "Confirm phone change",
  client_phone_confirm_body: ({ alias }: { alias: string }) =>
    `This changes the phone for ${alias} across all their tickets.`,
  client_phone_conflict_title: () => "Phone conflict",
  client_phone_conflict_body: ({ alias }: { alias: string }) =>
    `This number belongs to ${alias}. Merge instead?`,
  client_phone_conflict_merge: () => "Merge clients",
  client_phone_edit: () => "Edit phone",
  common_cancel: () => "Cancel",
}));

import PhoneChangeSteps from "./PhoneChangeSteps.svelte";

interface StepProps {
  step: "confirm" | "conflict";
  clientAlias: string;
  conflictAlias: string | null;
  pending: boolean;
  onconfirm: () => void;
  oncancel: () => void;
  onmerge: () => void;
  ontryanother: () => void;
}

function makeProps(overrides: Partial<StepProps> = {}): StepProps {
  return {
    step: "confirm",
    clientAlias: "quiet-harbor",
    conflictAlias: null,
    pending: false,
    onconfirm: vi.fn(),
    oncancel: vi.fn(),
    onmerge: vi.fn(),
    ontryanother: vi.fn(),
    ...overrides,
  };
}

describe("PhoneChangeSteps", () => {
  afterEach(cleanup);

  describe("confirm step", () => {
    it("warns that the change reaches every ticket for the client", () => {
      render(PhoneChangeSteps, { props: makeProps() });

      expect(
        screen.getByText(
          "This changes the phone for quiet-harbor across all their tickets.",
        ),
      ).toBeTruthy();
    });

    it("interpolates the client alias into the warning", () => {
      render(PhoneChangeSteps, {
        props: makeProps({ clientAlias: "seaward-lamp" }),
      });

      expect(screen.getByText(/seaward-lamp/)).toBeTruthy();
    });

    it("fires onconfirm when the confirm control is pressed", async () => {
      const onconfirm = vi.fn();
      render(PhoneChangeSteps, { props: makeProps({ onconfirm }) });

      await fireEvent.click(
        screen.getByRole("button", { name: "Confirm phone change" }),
      );

      expect(onconfirm).toHaveBeenCalledOnce();
    });

    it("fires oncancel when Cancel is pressed", async () => {
      const oncancel = vi.fn();
      render(PhoneChangeSteps, { props: makeProps({ oncancel }) });

      await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(oncancel).toHaveBeenCalledOnce();
    });

    it("shows no conflict copy", () => {
      render(PhoneChangeSteps, { props: makeProps() });
      expect(screen.queryByText("Phone conflict")).toBeNull();
    });
  });

  describe("conflict step", () => {
    it("names the client that already holds the number", () => {
      render(PhoneChangeSteps, {
        props: makeProps({ step: "conflict", conflictAlias: "seaward-lamp" }),
      });

      expect(
        screen.getByText("This number belongs to seaward-lamp. Merge instead?"),
      ).toBeTruthy();
    });

    it("renders without an alias when none was supplied", () => {
      render(PhoneChangeSteps, {
        props: makeProps({ step: "conflict", conflictAlias: null }),
      });

      expect(screen.getByText("Phone conflict")).toBeTruthy();
    });

    it("fires onmerge when Merge is pressed", async () => {
      const onmerge = vi.fn();
      render(PhoneChangeSteps, {
        props: makeProps({
          step: "conflict",
          conflictAlias: "seaward-lamp",
          onmerge,
        }),
      });

      await fireEvent.click(
        screen.getByRole("button", { name: "Merge clients" }),
      );

      expect(onmerge).toHaveBeenCalledOnce();
    });

    it("fires ontryanother when the edit action is pressed", async () => {
      const ontryanother = vi.fn();
      render(PhoneChangeSteps, {
        props: makeProps({
          step: "conflict",
          conflictAlias: "seaward-lamp",
          ontryanother,
        }),
      });

      await fireEvent.click(screen.getByRole("button", { name: "Edit phone" }));

      expect(ontryanother).toHaveBeenCalledOnce();
    });

    it("shows no confirm warning", () => {
      render(PhoneChangeSteps, {
        props: makeProps({ step: "conflict", conflictAlias: "seaward-lamp" }),
      });

      expect(screen.queryByText(/across all their tickets/)).toBeNull();
    });
  });

  describe("pending", () => {
    it("disables both confirm-step controls while the write is in flight", () => {
      render(PhoneChangeSteps, { props: makeProps({ pending: true }) });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        expect(button.hasAttribute("disabled")).toBe(true);
      }
    });

    it("disables the merge handoff while the write is in flight", () => {
      render(PhoneChangeSteps, {
        props: makeProps({
          step: "conflict",
          conflictAlias: "seaward-lamp",
          pending: true,
        }),
      });

      expect(
        screen
          .getByRole("button", { name: "Merge clients" })
          .hasAttribute("disabled"),
      ).toBe(true);
    });

    it("leaves controls enabled when idle", () => {
      render(PhoneChangeSteps, { props: makeProps({ pending: false }) });

      expect(
        screen
          .getByRole("button", { name: "Confirm phone change" })
          .hasAttribute("disabled"),
      ).toBe(false);
    });
  });
});
