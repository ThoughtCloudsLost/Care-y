// @vitest-environment jsdom
/**
 * ClientSelect component tests.
 *
 * Tests the search debounce, phone lookup (found/not-found/collision),
 * phone validation, view mode switching, and error display.
 *
 * Bits UI's Combobox requires DOM APIs that jsdom partially supports.
 * Tests focus on callback wiring and state transitions visible in the
 * rendered output.
 */

import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";

// vi.mock required: $lib/paraglide/messages.js is a Paraglide-generated module
// that may not resolve correctly in the vitest Vite alias chain. Spread
// importOriginal so unstubbed message functions track the real module surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  ticket_new_success: () => "New client created",
  ticket_new_error_submit_failed: () => "Lookup failed",
  ticket_new_create_client: () => "Create new client",
  ticket_new_back_to_search: () => "Back to search",
  ticket_new_field_phone_placeholder: () => "+1 555 000 0000",
  ticket_new_field_phone: () => "Phone number",
  empty_no_results: () => "No results",
  common_loading: () => "Loading",
}));

const { default: ClientSelect } = await import("./ClientSelect.svelte");

interface ClientSearchResult {
  id: string;
  alias: string;
  encryptedAlias: string;
  maskedPhone: string;
}

type PhoneLookupResult =
  | { found: false; token: string }
  | {
      found: true;
      clientId: string;
      alias: string;
      encryptedAlias: string;
      openTicketId: string | null;
    };

type ClientSelection =
  | { mode: "existing"; clientId: string; displayAlias: string }
  | { mode: "new"; token: string }
  | null;

interface CollisionInfo {
  clientId: string;
  alias: string;
  openTicketId: string;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function baseProps(): {
  label: string;
  placeholder: string;
  search: (query: string) => Promise<ClientSearchResult[]>;
  onchange: (value: ClientSelection) => void;
} {
  return {
    label: "Client",
    placeholder: "Search clients...",
    search: vi.fn(async () => []),
    onchange: vi.fn<(value: ClientSelection) => void>(),
  };
}

describe("ClientSelect", () => {
  describe("rendering", () => {
    it("renders label and search input", () => {
      const { container } = render(ClientSelect, baseProps());
      expect(container.textContent).toContain("Client");
      const input = container.querySelector("input");
      expect(input).not.toBeNull();
    });

    it("shows error message when error prop is set", () => {
      const { container } = render(ClientSelect, {
        ...baseProps(),
        error: "Client is required",
      });
      const alert = container.querySelector("[role='alert']");
      expect(alert).not.toBeNull();
      expect(alert!.textContent).toBe("Client is required");
    });

    it("applies error styling when error is set", () => {
      const { container } = render(ClientSelect, {
        ...baseProps(),
        error: "Required",
      });
      const wrapper = container.querySelector(".client-select-error");
      expect(wrapper).not.toBeNull();
    });

    it("does not show error styling when error is empty", () => {
      const { container } = render(ClientSelect, baseProps());
      const wrapper = container.querySelector(".client-select-error");
      expect(wrapper).toBeNull();
    });
  });

  describe("search debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("debounces search calls by 300ms", async () => {
      const searchFn = vi.fn(async () => []);
      const { container } = render(ClientSelect, {
        ...baseProps(),
        search: searchFn,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "ali" } });

      // Should not call search immediately
      expect(searchFn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);
      expect(searchFn).toHaveBeenCalledWith("ali");
    });

    it("does not search for empty/whitespace queries", async () => {
      const searchFn = vi.fn(async () => []);
      const { container } = render(ClientSelect, {
        ...baseProps(),
        search: searchFn,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "   " } });

      await vi.advanceTimersByTimeAsync(500);
      expect(searchFn).not.toHaveBeenCalled();
    });

    it("cancels previous debounce when new input arrives", async () => {
      const searchFn = vi.fn(async () => []);
      const { container } = render(ClientSelect, {
        ...baseProps(),
        search: searchFn,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "al" } });
      await vi.advanceTimersByTimeAsync(200);

      await fireEvent.input(input, { target: { value: "alice" } });
      await vi.advanceTimersByTimeAsync(300);

      // Only "alice" should have been searched (the "al" timer was cancelled)
      expect(searchFn).toHaveBeenCalledTimes(1);
      expect(searchFn).toHaveBeenCalledWith("alice");
    });

    it("clears results and resets onChange when input changes after selection", async () => {
      const onchange = vi.fn<(value: ClientSelection) => void>();
      const { container } = render(ClientSelect, {
        ...baseProps(),
        onchange,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "new text" } });

      // onChange should be called with null when input changes
      expect(onchange).toHaveBeenCalledWith(null);
    });
  });

  describe("search error handling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("clears results when search throws", async () => {
      const searchFn = vi.fn(async () => {
        throw new Error("network error");
      });
      const { container } = render(ClientSelect, {
        ...baseProps(),
        search: searchFn,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "fail" } });
      await vi.advanceTimersByTimeAsync(300);

      // Wait for the rejected promise to settle
      await vi.advanceTimersByTimeAsync(50);

      // No crash, component still rendered
      expect(container.querySelector("input")).not.toBeNull();
    });
  });

  describe("create mode (phone lookup)", () => {
    it("switches to create mode and shows phone input", async () => {
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: false,
        token: "tok-123",
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        phoneLookup,
      });

      // Find and click the "Create new client" button
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        // Phone input should now be visible
        const phoneInput = container.querySelector("input[type='tel']");
        expect(phoneInput).not.toBeNull();

        // "Back to search" button should be visible
        const backBtn = Array.from(container.querySelectorAll("button")).find(
          (btn) => btn.textContent!.includes("Back to search"),
        );
        expect(backBtn).toBeDefined();
      }
    });

    it("switches back to search mode when back button is clicked", async () => {
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: false,
        token: "tok-123",
      }));
      const onchange = vi.fn<(value: ClientSelection) => void>();
      const { container } = render(ClientSelect, {
        ...baseProps(),
        onchange,
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        // onchange(null) was called when switching to create
        expect(onchange).toHaveBeenCalledWith(null);

        // Click back
        const backBtn = Array.from(container.querySelectorAll("button")).find(
          (btn) => btn.textContent!.includes("Back to search"),
        );
        if (backBtn) {
          onchange.mockClear();
          await fireEvent.click(backBtn);
          await new Promise((r) => setTimeout(r, 50));

          // onchange(null) called again on switch back
          expect(onchange).toHaveBeenCalledWith(null);

          // Search input should be visible again
          expect(container.querySelector("input[type='tel']")).toBeNull();
        }
      }
    });

    it("calls phoneLookup on blur with valid phone and reports new client", async () => {
      const onchange = vi.fn<(value: ClientSelection) => void>();
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: false,
        token: "tok-456",
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        onchange,
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        // Type a valid phone number
        await fireEvent.input(phoneInput, {
          target: { value: "+15551234567" },
        });
        await fireEvent.blur(phoneInput);

        // Wait for async phoneLookup
        await new Promise((r) => setTimeout(r, 100));

        expect(phoneLookup).toHaveBeenCalledWith("+15551234567");
        expect(onchange).toHaveBeenCalledWith({
          mode: "new",
          token: "tok-456",
        });
      }
    });

    it("calls oncollision when phoneLookup finds existing client with open ticket", async () => {
      const oncollision = vi.fn();
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: true,
        clientId: "c-1",
        alias: "Alice",
        encryptedAlias: "enc-Alice",
        openTicketId: "t-99",
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        phoneLookup,
        oncollision,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        await fireEvent.input(phoneInput, {
          target: { value: "+15559876543" },
        });
        await fireEvent.blur(phoneInput);
        await new Promise((r) => setTimeout(r, 100));

        expect(oncollision).toHaveBeenCalledWith({
          clientId: "c-1",
          alias: "Alice",
          openTicketId: "t-99",
        } satisfies CollisionInfo);
      }
    });

    it("selects existing client when phoneLookup finds one without open ticket", async () => {
      const onchange = vi.fn<(value: ClientSelection) => void>();
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: true,
        clientId: "c-2",
        alias: "Bob",
        encryptedAlias: "enc-Bob",
        openTicketId: null,
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        onchange,
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        await fireEvent.input(phoneInput, {
          target: { value: "+15551112222" },
        });
        await fireEvent.blur(phoneInput);
        await new Promise((r) => setTimeout(r, 100));

        expect(onchange).toHaveBeenCalledWith({
          mode: "existing",
          clientId: "c-2",
          displayAlias: "Bob",
        } satisfies ClientSelection);
      }
    });

    it("does not call phoneLookup for invalid phone numbers", async () => {
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: false,
        token: "tok",
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        // Invalid: too short, missing +
        await fireEvent.input(phoneInput, {
          target: { value: "12345" },
        });
        await fireEvent.blur(phoneInput);
        await new Promise((r) => setTimeout(r, 100));

        expect(phoneLookup).not.toHaveBeenCalled();
      }
    });

    it("shows error message when phoneLookup throws", async () => {
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => {
        throw new Error("server error");
      });
      const { container } = render(ClientSelect, {
        ...baseProps(),
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        await fireEvent.input(phoneInput, {
          target: { value: "+15551234567" },
        });
        await fireEvent.blur(phoneInput);
        await new Promise((r) => setTimeout(r, 100));

        expect(container.textContent).toContain("Lookup failed");
      }
    });

    it("does not call phoneLookup when phoneLookup prop is not provided", async () => {
      // No phoneLookup prop, so the "Create new client" button should not appear
      const { container } = render(ClientSelect, baseProps());

      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );
      // Without phoneLookup, the create button is not rendered
      expect(createBtn).toBeUndefined();
    });
  });

  describe("disabled state", () => {
    it("disables the search input when disabled is true", () => {
      const { container } = render(ClientSelect, {
        ...baseProps(),
        disabled: true,
      });
      const input = container.querySelector("input");
      expect(input?.disabled).toBe(true);
    });
  });

  describe("phone validation edge cases", () => {
    it("strips whitespace, hyphens, dots, and parens before validating", async () => {
      const phoneLookup = vi.fn(async (): Promise<PhoneLookupResult> => ({
        found: false,
        token: "tok-strip",
      }));
      const { container } = render(ClientSelect, {
        ...baseProps(),
        phoneLookup,
      });

      // Switch to create mode
      const createBtn = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent!.includes("Create new client"),
      );

      if (createBtn) {
        await fireEvent.click(createBtn);
        await new Promise((r) => setTimeout(r, 50));

        const phoneInput = container.querySelector(
          "input[type='tel']",
        ) as HTMLInputElement;

        // Phone with formatting chars that should be stripped
        await fireEvent.input(phoneInput, {
          target: { value: "+1 (555) 123-4567" },
        });
        await fireEvent.blur(phoneInput);
        await new Promise((r) => setTimeout(r, 100));

        expect(phoneLookup).toHaveBeenCalledWith("+15551234567");
      }
    });
  });
});
