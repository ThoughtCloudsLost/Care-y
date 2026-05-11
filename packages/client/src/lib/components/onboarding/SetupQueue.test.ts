// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockMutate = vi.fn();
const mockEncrypt = vi.fn(
  (buf: Uint8Array) => new Uint8Array([...buf].map((b) => b ^ 0x42)),
);

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      createQueue: { mutate: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mockMutate(input);
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: vi.fn(() => ({
    encrypt: mockEncrypt,
    isLoaded: true,
    getPublicKey: () => new Uint8Array(32),
  })),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: (buf: Uint8Array) => btoa(String.fromCharCode(...buf)),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/query/keys.js", () => ({
  queueKeys: { all: ["queues"] },
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));

const { default: SetupQueue } = await import("./SetupQueue.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupQueue", () => {
  it("renders the queue creation form", () => {
    render(SetupQueue, { props: { oncomplete: vi.fn() } });
    expect(screen.getByText("Create Your First Queue")).toBeTruthy();
    expect(screen.getByText("Create Queue")).toBeTruthy();
  });

  it("shows validation error when queue name is empty", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupQueue, { props: { oncomplete } });

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(screen.getByText("Queue name is required.")).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("encrypts queue name before sending", async () => {
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

    expect(mockEncrypt).toHaveBeenCalled();
    const encryptArg = mockEncrypt.mock.calls[0]?.[0] as Uint8Array;
    expect(encryptArg.constructor.name).toBe("Uint8Array");
    expect(new TextDecoder().decode(encryptArg)).toBe("General Intake");
  });

  it("defaults escalation days to 7", () => {
    const { container } = render(SetupQueue, {
      props: { oncomplete: vi.fn() },
    });
    const numberInput = container.querySelector('input[type="number"]');
    expect((numberInput as HTMLInputElement).value).toBe("7");
  });

  it("shows escalation error for invalid values", async () => {
    const oncomplete = vi.fn();
    const { container } = render(SetupQueue, { props: { oncomplete } });

    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    const daysInput = inputs[1];
    if (nameInput) {
      await fireEvent.input(nameInput, {
        target: { value: "Test Queue" },
      });
    }
    if (daysInput) {
      await fireEvent.input(daysInput, {
        target: { value: "999" },
      });
    }

    const form = container.querySelector("form");
    if (form) await fireEvent.submit(form);

    expect(
      screen.getByText("Escalation days must be between 1 and 365."),
    ).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });
});
