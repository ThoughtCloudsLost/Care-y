// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type {
  IntakeFieldConfig,
  IntakeFieldRole,
  AvailabilityData,
} from "@care-y/shared";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as AvailFieldMod from "./AvailabilityField.svelte";

// vi.mock required: pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_char_count: ({ count, max }: { count: number; max: number }) =>
    `${String(count)} / ${String(max)}`,
  intake_error_field_required: () => "This field is required.",
  intake_privacy_encrypted: () => "Fully encrypted.",
  intake_privacy_metadata: () => "Metadata shared.",
}));

// vi.mock required: AvailabilityField has deep Konsta/ShellSheet dependencies.
// Replaced with a stub that renders a div with the props for assertion.
vi.mock("./AvailabilityField.svelte", async (importOriginal) => {
  const { default: Passthrough } =
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte");
  return {
    ...(await importOriginal<typeof AvailFieldMod>()),
    default: Passthrough,
  };
});

const { default: IntakeFieldRenderer } =
  await import("./IntakeFieldRenderer.svelte");

afterEach(cleanup);

interface RendererProps {
  fieldId: string;
  label: string;
  config: IntakeFieldConfig;
  isRequired: boolean;
  role?: IntakeFieldRole | null;
  value: string | string[] | AvailabilityData | boolean | undefined;
  error?: string;
  onchange: (value: string | string[] | AvailabilityData | boolean) => void;
}

function makeProps(overrides: Partial<RendererProps> = {}): RendererProps {
  return {
    fieldId: "f-1",
    label: "Test field",
    config: { type: "text" },
    isRequired: false,
    value: "",
    onchange: vi.fn(),
    ...overrides,
  };
}

describe("IntakeFieldRenderer", () => {
  describe("text type", () => {
    it("renders a text input with the label", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "text" } }),
      });
      // Label text appears in both the sr-only <label> and the visible BlockTitle
      const matches = screen.getAllByText("Test field");
      expect(matches.length).toBe(2);
      // The visible heading carries the labelId for aria-labelledby usage
      const heading = document.getElementById("intake-label-f-1");
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toBe("Test field");
    });

    it("emits value on input", async () => {
      const onchange = vi.fn();
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "text" }, onchange }),
      });
      const input = document.querySelector("input[type='text']");
      expect(input).not.toBeNull();
      await fireEvent.input(input!, { target: { value: "hello" } });
      expect(onchange).toHaveBeenCalledWith("hello");
    });

    it("shows required marker when isRequired is true", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "text" }, isRequired: true }),
      });
      // Required marker appears in both the sr-only <label> and BlockTitle
      const matches = screen.getAllByText("Test field *");
      expect(matches.length).toBe(2);
    });

    it("renders char count when maxLength is set", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "text", maxLength: 100 },
          value: "hi",
        }),
      });
      expect(screen.getByText("2 / 100")).toBeTruthy();
    });

    it("respects placeholder from config", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "text", placeholder: "Enter name" },
        }),
      });
      const input = document.querySelector("input[placeholder='Enter name']");
      expect(input).not.toBeNull();
    });
  });

  describe("textarea type", () => {
    it("renders a textarea", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "textarea" } }),
      });
      const textarea = document.querySelector("textarea");
      expect(textarea).not.toBeNull();
    });

    it("emits value on input", async () => {
      const onchange = vi.fn();
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "textarea" }, onchange }),
      });
      const textarea = document.querySelector("textarea");
      expect(textarea).not.toBeNull();
      await fireEvent.input(textarea!, { target: { value: "long text" } });
      expect(onchange).toHaveBeenCalledWith("long text");
    });
  });

  describe("select type", () => {
    const selectConfig: IntakeFieldConfig = {
      type: "select",
      options: ["Phone", "Email", "None"],
    };

    it("renders a select with options", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: selectConfig }),
      });
      const select = document.querySelector("select");
      expect(select).not.toBeNull();
      const options = select!.querySelectorAll("option");
      // prompt option + 3 real options
      expect(options.length).toBe(4);
    });

    it("emits value on change", async () => {
      const onchange = vi.fn();
      render(IntakeFieldRenderer, {
        props: makeProps({ config: selectConfig, onchange }),
      });
      const select = document.querySelector("select");
      expect(select).not.toBeNull();
      await fireEvent.change(select!, { target: { value: "Email" } });
      expect(onchange).toHaveBeenCalledWith("Email");
    });

    it("has a disabled prompt option with the label text", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: selectConfig }),
      });
      const prompt = document.querySelector(
        "option[disabled]",
      ) as HTMLOptionElement | null;
      expect(prompt).not.toBeNull();
      expect(prompt!.value).toBe("");
      expect(prompt!.textContent).toBe("Test field");
    });
  });

  describe("multiselect type", () => {
    const multiConfig: IntakeFieldConfig = {
      type: "multiselect",
      options: ["Housing", "Legal", "Medical"],
    };

    it("renders checkbox list items with role group and aria-labelledby", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: multiConfig }),
      });
      const group = document.querySelector("[role='group']");
      expect(group).not.toBeNull();
      const labelId = group!.getAttribute("aria-labelledby");
      expect(labelId).toBeTruthy();
      const label = document.getElementById(labelId!);
      expect(label).not.toBeNull();
    });

    it("renders option text for each checkbox item", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: multiConfig }),
      });
      expect(screen.getByText("Housing")).toBeTruthy();
      expect(screen.getByText("Legal")).toBeTruthy();
      expect(screen.getByText("Medical")).toBeTruthy();
    });
  });

  describe("error display", () => {
    it("renders FieldError when error prop is set", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "text" },
          error: "This field is required.",
        }),
      });
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe("This field is required.");
    });

    it("renders no error when error prop is undefined", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({ config: { type: "text" } }),
      });
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  describe("checkbox type", () => {
    it("renders a single checkbox with the label", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "checkbox" },
          value: false,
        }),
      });
      expect(screen.getByText("Test field")).toBeTruthy();
    });

    it("reflects checked state from value prop (true)", () => {
      const { container } = render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "checkbox" },
          value: true,
        }),
      });
      const checkbox = container.querySelector(
        "input[type='checkbox']",
      ) as HTMLInputElement | null;
      expect(checkbox).not.toBeNull();
      expect(checkbox!.checked).toBe(true);
    });

    it("reflects checked state from value prop (false)", () => {
      const { container } = render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "checkbox" },
          value: false,
        }),
      });
      const checkbox = container.querySelector(
        "input[type='checkbox']",
      ) as HTMLInputElement | null;
      expect(checkbox).not.toBeNull();
      expect(checkbox!.checked).toBe(false);
    });

    it("emits toggled boolean on change", async () => {
      const onchange = vi.fn();
      const { container } = render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "checkbox" },
          value: false,
          onchange,
        }),
      });
      // Find and click the checkbox label (Konsta wraps in ListItem label)
      const listItem = container.querySelector("label");
      if (listItem) {
        await fireEvent.click(listItem);
      }
      expect(onchange).toHaveBeenCalledWith(true);
    });
  });

  describe("privacy indicator", () => {
    it("shows encrypted indicator for browser-side role", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "text" },
          role: "phone-contact",
        }),
      });
      expect(screen.getByText("Fully encrypted.")).toBeTruthy();
    });

    it("shows metadata indicator for server-metadata role", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "select", options: ["A", "B"] },
          role: "queue-routing",
        }),
      });
      expect(screen.getByText("Metadata shared.")).toBeTruthy();
    });

    it("omits indicator when role is null", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: { type: "text" },
          role: null,
        }),
      });
      expect(screen.queryByText("Fully encrypted.")).toBeNull();
      expect(screen.queryByText("Metadata shared.")).toBeNull();
    });
  });

  describe("availability type", () => {
    it("delegates to AvailabilityField (stubbed)", () => {
      render(IntakeFieldRenderer, {
        props: makeProps({
          config: {
            type: "availability",
            allowRecurring: true,
            allowSpecific: true,
          },
        }),
      });
      // The stub (PassthroughShell) renders a div with data-testid
      const stub = document.querySelector("[data-testid='passthrough-shell']");
      expect(stub).not.toBeNull();
    });
  });
});
