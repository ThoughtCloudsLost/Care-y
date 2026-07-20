// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockEncryptText = vi.fn().mockResolvedValue("encrypted-text");
let mockOrgKeyReady = true;

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  admin_queue_editor_name_label: () => "Queue Name",
  admin_queue_editor_name_placeholder: () => "e.g. General Intake",
  admin_queue_editor_name_required: () => "Queue name is required",
  admin_queue_editor_escalation_label: () => "Escalation Days",
  admin_queue_editor_escalation_hint: () =>
    "Days before a ticket auto-escalates.",
  admin_queue_editor_escalation_range: ({ min }: { min: string }) =>
    `Escalation days must be between ${min} and 365.`,
  admin_queue_editor_pii_warning: () => "Queue names are encrypted.",
  admin_queue_editor_no_org_key: () => "Organization key not loaded.",
  admin_queue_editor_color_label: () => "Color",
  admin_queue_editor_icon_label: () => "Icon",
  onboarding_queue_submit: () => "Create Queue",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    encryptText: mockEncryptText,
    isLoaded: true,
  }),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => mockOrgKeyReady,
}));

vi.mock("@care-y/shared", () => ({
  MAX_ESCALATION_DAYS: 365,
}));

const { default: QueueForm } = await import("./QueueForm.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockOrgKeyReady = true;
});

describe("QueueForm", () => {
  describe("create mode", () => {
    it("renders form fields and submit button", () => {
      render(QueueForm, {
        props: {
          mode: "create",
          submitLabel: "Create Queue",
          onsubmit: vi.fn(),
        },
      });
      expect(screen.getByText("Queue Name")).toBeTruthy();
      expect(screen.getByText("Escalation Days")).toBeTruthy();
      expect(screen.getByText("Create Queue")).toBeTruthy();
    });

    it("shows PII warning", () => {
      render(QueueForm, {
        props: {
          mode: "create",
          submitLabel: "Create Queue",
          onsubmit: vi.fn(),
        },
      });
      expect(screen.getByText("Queue names are encrypted.")).toBeTruthy();
    });

    it("encrypts name and calls onsubmit with encrypted data", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: { mode: "create", submitLabel: "Create Queue", onsubmit },
      });

      const inputs = container.querySelectorAll("input");
      const nameInput = inputs[0];
      if (nameInput) {
        await fireEvent.input(nameInput, {
          target: { value: "General Intake" },
        });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(mockEncryptText).toHaveBeenCalledWith("General Intake");
      expect(onsubmit).toHaveBeenCalledWith({
        encryptedName: "encrypted-text",
        encryptedColor: "encrypted-text",
        encryptedIcon: "encrypted-text",
        escalateDays: 7,
      });
    });

    it("defaults escalation to 7 when input is empty", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: { mode: "create", submitLabel: "Create Queue", onsubmit },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[0]) {
        await fireEvent.input(inputs[0], { target: { value: "Test" } });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(onsubmit).toHaveBeenCalledWith(
        expect.objectContaining({ escalateDays: 7 }),
      );
    });

    it("rejects empty queue name on submit", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: { mode: "create", submitLabel: "Create Queue", onsubmit },
      });

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(onsubmit).not.toHaveBeenCalled();
    });

    it("rejects escalation days outside 1-365 range", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: { mode: "create", submitLabel: "Create Queue", onsubmit },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[0]) {
        await fireEvent.input(inputs[0], { target: { value: "Test" } });
      }
      if (inputs[1]) {
        await fireEvent.input(inputs[1], { target: { value: "0" } });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(onsubmit).not.toHaveBeenCalled();
    });
  });

  describe("edit mode", () => {
    it("does not render submit button without submitLabel", () => {
      render(QueueForm, {
        props: {
          mode: "edit",
          initialName: "Intake",
          initialEscalation: 5,
          onsubmit: vi.fn(),
        },
      });
      expect(screen.queryByText("Create Queue")).toBeNull();
    });

    it("populates fields from initial values", () => {
      const { container } = render(QueueForm, {
        props: {
          mode: "edit",
          initialName: "Intake",
          initialEscalation: 5,
          onsubmit: vi.fn(),
        },
      });

      const inputs = container.querySelectorAll("input");
      expect((inputs[0] as HTMLInputElement).value).toBe("Intake");
      expect((inputs[1] as HTMLInputElement).value).toBe("5");
    });

    it("allows escalation days of 0 (disabled)", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: {
          mode: "edit",
          initialName: "Intake",
          initialEscalation: 5,
          onsubmit,
          formId: "test-form",
        },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[1]) {
        await fireEvent.input(inputs[1], { target: { value: "0" } });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(onsubmit).toHaveBeenCalledWith(
        expect.objectContaining({ escalateDays: 0 }),
      );
    });

    it("defaults escalation to 0 when input is empty", async () => {
      const onsubmit = vi.fn();
      const { container } = render(QueueForm, {
        props: {
          mode: "edit",
          initialName: "Intake",
          initialEscalation: 5,
          onsubmit,
        },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[1]) {
        await fireEvent.input(inputs[1], { target: { value: "" } });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      expect(onsubmit).toHaveBeenCalledWith(
        expect.objectContaining({ escalateDays: 0 }),
      );
    });
  });

  describe("onstatechange", () => {
    it("notifies caller of canSubmit state", async () => {
      const onstatechange = vi.fn();
      const { container } = render(QueueForm, {
        props: {
          mode: "create",
          submitLabel: "Create Queue",
          onsubmit: vi.fn(),
          onstatechange,
        },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[0]) {
        await fireEvent.input(inputs[0], { target: { value: "Test" } });
      }

      expect(onstatechange).toHaveBeenCalledWith(
        expect.objectContaining({ canSubmit: true }),
      );
    });
  });

  describe("org key not loaded", () => {
    it("shows org key warning when key is not loaded", () => {
      mockOrgKeyReady = false;
      render(QueueForm, {
        props: {
          mode: "create",
          submitLabel: "Create Queue",
          onsubmit: vi.fn(),
        },
      });
      expect(screen.getByText("Organization key not loaded.")).toBeTruthy();
    });
  });

  describe("error handling", () => {
    it("shows generic error when onsubmit throws", async () => {
      const onsubmit = vi.fn().mockRejectedValue(new Error("fail"));
      const { container } = render(QueueForm, {
        props: { mode: "create", submitLabel: "Create Queue", onsubmit },
      });

      const inputs = container.querySelectorAll("input");
      if (inputs[0]) {
        await fireEvent.input(inputs[0], { target: { value: "Test" } });
      }

      const form = container.querySelector("form");
      if (form) await fireEvent.submit(form);

      await vi.waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeTruthy();
      });
    });
  });
});
