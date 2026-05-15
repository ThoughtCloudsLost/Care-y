// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      saveTelephonyChoice: { mutate: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      | ((data: unknown, variables: unknown) => void)
      | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return mockIsPending;
      },
      mutate(input: unknown) {
        mockMutate(input);
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          () => onError?.(),
        );
      },
    };
  },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

const { default: SetupTelephony } = await import("./SetupTelephony.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockIsPending = false;
});

describe("SetupTelephony", () => {
  it("renders three radio options", () => {
    render(SetupTelephony, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("I have a Twilio account")).toBeTruthy();
    expect(screen.getByText("Set up telephony for me")).toBeTruthy();
    expect(screen.getByText("Configure later")).toBeTruthy();
  });

  it("defaults to skip mode", () => {
    const { container } = render(SetupTelephony, {
      props: { oncomplete: vi.fn() },
    });
    const radios = container.querySelectorAll('input[type="radio"]');
    const skipRadio = radios[2] as HTMLInputElement;
    expect(skipRadio.checked).toBe(true);
  });

  it("does not show credential inputs by default (skip selected)", () => {
    const { container } = render(SetupTelephony, {
      props: { oncomplete: vi.fn() },
    });
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("shows credential inputs when BYOT is selected", async () => {
    const { container } = render(SetupTelephony, {
      props: { oncomplete: vi.fn() },
    });

    const radios = container.querySelectorAll('input[type="radio"]');
    const byotRadio = radios[0] as HTMLInputElement;
    await fireEvent.change(byotRadio);

    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it("skip mode calls oncomplete directly without server call", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupTelephony, { props: { oncomplete } });

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "skip" });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("BYOT mode validates SID and token are present", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupTelephony, { props: { oncomplete } });

    const radios = container.querySelectorAll('input[type="radio"]');
    await fireEvent.change(radios[0] as HTMLInputElement);

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(screen.getByText("Account SID is required.")).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("BYOT mode sends credentials via mutation", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupTelephony, { props: { oncomplete } });

    const radios = container.querySelectorAll('input[type="radio"]');
    await fireEvent.change(radios[0] as HTMLInputElement);

    const inputs = container.querySelectorAll("input:not([type='radio'])");
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: "AC1234567890" },
    });
    await fireEvent.input(inputs[1] as HTMLInputElement, {
      target: { value: "secret-token" },
    });

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(mockMutate).toHaveBeenCalledWith({
      mode: "byot",
      accountSid: "AC1234567890",
      authToken: "secret-token",
    });
  });
});
