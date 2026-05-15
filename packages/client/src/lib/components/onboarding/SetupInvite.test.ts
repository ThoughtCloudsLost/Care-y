// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockMutate = vi.fn();
const mockCompleteSetup = vi.fn(() => Promise.resolve({ success: true }));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      generateInvite: {
        mutate: vi.fn(() =>
          Promise.resolve({
            inviteUrl: "/first-login/test-token",
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
        ),
      },
      completeSetup: { mutate: mockCompleteSetup },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as ((data: unknown) => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mockMutate(input);
        mutationFn(input).then(
          (data) => onSuccess?.(data),
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

const { default: SetupInvite } = await import("./SetupInvite.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupInvite", () => {
  it("renders the invite heading and generate button", () => {
    render(SetupInvite, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Invite Volunteers")).toBeTruthy();
    expect(screen.getByText("Generate Invite Link")).toBeTruthy();
  });

  it("shows the skip link when no invites generated", () => {
    render(SetupInvite, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("I'll invite volunteers later")).toBeTruthy();
  });

  it("defaults to Volunteer role", () => {
    const { container } = render(SetupInvite, {
      props: { oncomplete: vi.fn() },
    });
    const select = container.querySelector("select");
    expect(select).toBeTruthy();
    const selectedOption = select!.querySelector(
      "option:first-child",
    ) as HTMLOptionElement;
    expect(selectedOption.textContent).toBe("Volunteer");
  });

  it("calls generateInvite mutation with selected role", async () => {
    render(SetupInvite, { props: { oncomplete: vi.fn() } });

    const generateBtn = screen.getByText("Generate Invite Link");
    await fireEvent.click(generateBtn);

    expect(mockMutate).toHaveBeenCalledWith({
      roleId: expect.stringMatching(/\w+/) as string,
    });
  });

  it("skip calls completeSetup and oncomplete with 0 invites", async () => {
    const oncomplete = vi.fn();
    render(SetupInvite, { props: { oncomplete } });

    const skipBtn = screen.getByText("I'll invite volunteers later");
    await fireEvent.click(skipBtn);

    await vi.waitFor(() => {
      expect(mockCompleteSetup).toHaveBeenCalled();
    });
  });
});
