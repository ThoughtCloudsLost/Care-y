// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const mockInvalidateQueries = vi.fn();
let queryEnabled = true;
let mockStatusData: {
  enrolled: boolean;
  methods: { type: string; labelKey: string; label: string; index: number }[];
  backupCodesRemaining: number;
} = { enrolled: false, methods: [], backupCodesRemaining: 0 };

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    twoFactor: {
      status: { query: vi.fn(() => Promise.resolve(mockStatusData)) },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    queryEnabled = opts.enabled as boolean;
    return {
      get isPending() {
        return false;
      },
      get data() {
        return mockStatusData;
      },
    };
  },
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

const { default: TwoFactorEnrollment } =
  await import("./TwoFactorEnrollment.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockStatusData = { enrolled: false, methods: [], backupCodesRemaining: 0 };
});

describe("TwoFactorEnrollment", () => {
  it("renders method list when no methods are enrolled", () => {
    render(TwoFactorEnrollment, {
      props: { username: "admin", onenrolled: vi.fn() },
    });
    expect(
      screen.getByText("Enroll at least one method to continue."),
    ).toBeTruthy();
  });

  it("shows enrolled badge when methods exist", () => {
    mockStatusData = {
      enrolled: true,
      methods: [
        { type: "totp", labelKey: "twofa_totp_label", label: "TOTP", index: 0 },
      ],
      backupCodesRemaining: 8,
    };
    render(TwoFactorEnrollment, {
      props: { username: "admin", onenrolled: vi.fn() },
    });
    expect(screen.getByText("1 method(s) enrolled")).toBeTruthy();
  });

  it("displays available methods as list items", () => {
    render(TwoFactorEnrollment, {
      props: { username: "admin", onenrolled: vi.fn() },
    });
    // METHOD_INFO has 6 entries (platform webauthn, crossplatform, totp, email, sms, push)
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeGreaterThanOrEqual(1);
  });

  it("enables query on mount", () => {
    render(TwoFactorEnrollment, {
      props: { username: "admin", onenrolled: vi.fn() },
    });
    expect(queryEnabled).toBe(true);
  });
});
