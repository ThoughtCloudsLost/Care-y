// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    twoFactor: {
      status: {
        query: vi.fn(() =>
          Promise.resolve({
            enrolled: false,
            methods: [],
            backupCodesRemaining: 0,
          }),
        ),
      },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  createQuery: () => ({
    get isPending() {
      return false;
    },
    get data() {
      return { enrolled: false, methods: [], backupCodesRemaining: 0 };
    },
  }),
}));

vi.mock("$lib/query/keys.js", () => ({
  twoFactorKeys: { status: () => ["twoFactor", "status"] },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

const stubComponent = () => ({
  $destroy: vi.fn(),
  $set: vi.fn(),
  $$: { on_mount: [], on_destroy: [], ctx: [] },
});

vi.mock("$lib/components/settings/TotpEnrollSheet.svelte", () => ({
  default: stubComponent,
}));
vi.mock("$lib/components/settings/PasskeyEnrollSheet.svelte", () => ({
  default: stubComponent,
}));
vi.mock("$lib/components/settings/EmailEnrollSheet.svelte", () => ({
  default: stubComponent,
}));
vi.mock("$lib/components/settings/SmsEnrollSheet.svelte", () => ({
  default: stubComponent,
}));
vi.mock("$lib/components/settings/PushEnrollSheet.svelte", () => ({
  default: stubComponent,
}));
vi.mock("$lib/components/settings/BackupCodesSheet.svelte", () => ({
  default: stubComponent,
}));

const { default: SetupTwoFactor } = await import("./SetupTwoFactor.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupTwoFactor", () => {
  it("renders heading and description", () => {
    render(SetupTwoFactor, {
      props: { oncomplete: vi.fn(), userId: "u1", username: "admin" },
    });
    expect(screen.getByText("Set Up Two-Factor Authentication")).toBeTruthy();
  });

  it("renders continue button disabled initially", () => {
    render(SetupTwoFactor, {
      props: { oncomplete: vi.fn(), userId: "u1", username: "admin" },
    });
    const button = screen.getByText("Continue");
    expect(button.closest("button")?.disabled).toBe(true);
  });

  it("renders the enrollment method list", () => {
    render(SetupTwoFactor, {
      props: { oncomplete: vi.fn(), userId: "u1", username: "admin" },
    });
    expect(
      screen.getByText("Enroll at least one method to continue."),
    ).toBeTruthy();
  });
});
