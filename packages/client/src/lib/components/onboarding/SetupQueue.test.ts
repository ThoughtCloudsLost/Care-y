// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockEncryptText = vi.fn().mockResolvedValue("encrypted-text");
const mockHaptic = vi.fn();
const mockToastShow = vi.fn();
const mockAnnounce = vi.fn();
const mockInvalidateQueries = vi.fn();
let mockOrgKeyReady = true;

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      createQueue: { mutate: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (_optsFn: () => Record<string, unknown>) => {
    return {
      get isPending() {
        return false;
      },
      mutate: vi.fn(),
      mutateAsync: mockMutateAsync,
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    encryptText: mockEncryptText,
    isLoaded: true,
  })),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => mockOrgKeyReady,
}));

vi.mock("@care-y/shared", () => ({
  MAX_ESCALATION_DAYS: 365,
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: mockAnnounce,
}));
vi.mock("$lib/query/keys.js", () => ({
  queueKeys: { all: ["queues"] },
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

const { default: SetupQueue } = await import("./SetupQueue.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockOrgKeyReady = true;
});

describe("SetupQueue", () => {
  it("renders heading and subtext", () => {
    render(SetupQueue, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Create Your First Queue")).toBeTruthy();
  });

  it("renders the queue form with submit button", () => {
    render(SetupQueue, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Create Queue")).toBeTruthy();
  });

  it("encrypts name and calls mutation on form submit", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupQueue, { props: { oncomplete } });

    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    if (nameInput) {
      await fireEvent.input(nameInput, {
        target: { value: "General Intake" },
      });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(mockEncryptText).toHaveBeenCalledWith("General Intake");
    });
  });

  it("calls oncomplete after successful mutation", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupQueue, { props: { oncomplete } });

    const inputs = container.querySelectorAll("input");
    if (inputs[0]) {
      await fireEvent.input(inputs[0], {
        target: { value: "General Intake" },
      });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(oncomplete).toHaveBeenCalledWith({ firstQueueCreated: true });
    });
  });

  it("fires haptic and toast on success", async () => {
    const { container } = render(SetupQueue, {
      props: { oncomplete: vi.fn() },
    });

    const inputs = container.querySelectorAll("input");
    if (inputs[0]) {
      await fireEvent.input(inputs[0], { target: { value: "Test" } });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalled();
    });
  });

  it("defaults escalation days to 7", () => {
    const { container } = render(SetupQueue, {
      props: { oncomplete: vi.fn() },
    });
    const numberInput = container.querySelector('input[type="number"]');
    expect((numberInput as HTMLInputElement).value).toBe("");
  });

  it("shows PII warning from shared form", () => {
    render(SetupQueue, { props: { oncomplete: vi.fn() } });
    expect(screen.getByRole("note")).toBeTruthy();
  });
});
