// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";

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

// vi.mock required: the real enroll sheets drive platform APIs (WebAuthn,
// QR rendering, SMS verification) that jsdom cannot provide; they are
// covered by E2E. The stub exposes opened state and callback triggers so
// this component's orchestration can be exercised.
vi.mock("$lib/components/settings/TotpEnrollSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));
vi.mock("$lib/components/settings/PasskeyEnrollSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));
vi.mock("$lib/components/settings/EmailEnrollSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));
vi.mock("$lib/components/settings/SmsEnrollSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));
vi.mock("$lib/components/settings/PushEnrollSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));
vi.mock("$lib/components/settings/BackupCodesSheet.svelte", async () => ({
  default: (await import("./test-helpers/StubEnrollSheet.svelte")).default,
}));

const { default: TwoFactorEnrollment } =
  await import("./TwoFactorEnrollment.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockStatusData = { enrolled: false, methods: [], backupCodesRemaining: 0 };
});

describe("TwoFactorEnrollment", () => {
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
    expect(screen.getByText("1 method enrolled")).toBeTruthy();
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

  it("notifies the parent once when a method is already enrolled", async () => {
    mockStatusData = {
      enrolled: true,
      methods: [
        {
          type: "totp",
          labelKey: "twofa_totp_label",
          label: "Authenticator app",
          index: 0,
        },
      ],
      backupCodesRemaining: 8,
    };
    const onenrolled = vi.fn();
    render(TwoFactorEnrollment, { props: { username: "admin", onenrolled } });

    await waitFor(() => {
      expect(onenrolled).toHaveBeenCalledTimes(1);
    });
  });

  it("hides already-enrolled methods from the available list", () => {
    mockStatusData = {
      enrolled: true,
      methods: [
        {
          type: "totp",
          labelKey: "twofa_totp_label",
          label: "Authenticator app",
          index: 0,
        },
      ],
      backupCodesRemaining: 8,
    };
    render(TwoFactorEnrollment, {
      props: { username: "admin", onenrolled: vi.fn() },
    });

    // The TOTP label appears once (the enrolled list), not again as an
    // available method. Other methods stay offered.
    expect(screen.getAllByText(m.twofa_totp_label())).toHaveLength(1);
    expect(screen.getByText(m.twofa_sms_label())).toBeTruthy();
    expect(screen.getByText(m.twofa_enroll_choose())).toBeTruthy();
  });

  describe("enrollment flow", () => {
    function openSheets(): HTMLElement[] {
      return screen
        .getAllByTestId("stub-enroll-sheet")
        .filter((el) => el.getAttribute("data-opened") === "true");
    }

    it("opens a single enroll sheet when a method is tapped", async () => {
      render(TwoFactorEnrollment, {
        props: { username: "admin", onenrolled: vi.fn() },
      });

      expect(openSheets()).toHaveLength(0);
      await fireEvent.click(screen.getByText(m.twofa_totp_label()));
      expect(openSheets()).toHaveLength(1);
    });

    it("shows backup codes after the first enrollment only and notifies the parent once", async () => {
      const onenrolled = vi.fn();
      render(TwoFactorEnrollment, { props: { username: "admin", onenrolled } });

      // First enrollment: tap a method, complete its sheet.
      await fireEvent.click(screen.getByText(m.twofa_totp_label()));
      const enrollSheet = openSheets()[0];
      expect(enrollSheet).toBeDefined();
      if (!enrollSheet) return;
      await fireEvent.click(
        within(enrollSheet).getByTestId("stub-enrolled-trigger"),
      );

      // The enroll sheet closes and the backup-codes sheet (the stub
      // without an enrolled trigger) takes its place. Parent not yet told.
      const afterEnroll = openSheets();
      expect(afterEnroll).toHaveLength(1);
      const backupSheet = afterEnroll[0];
      expect(backupSheet).toBeDefined();
      if (!backupSheet) return;
      expect(
        within(backupSheet).queryByTestId("stub-enrolled-trigger"),
      ).toBeNull();
      expect(onenrolled).not.toHaveBeenCalled();

      // Dismissing the backup codes completes the step exactly once.
      await fireEvent.click(
        within(backupSheet).getByTestId("stub-dismiss-trigger"),
      );
      expect(openSheets()).toHaveLength(0);
      expect(onenrolled).toHaveBeenCalledTimes(1);

      // Second enrollment: backup codes are not shown again and the
      // parent is not re-notified.
      await fireEvent.click(screen.getByText(m.twofa_sms_label()));
      const secondSheet = openSheets()[0];
      expect(secondSheet).toBeDefined();
      if (!secondSheet) return;
      await fireEvent.click(
        within(secondSheet).getByTestId("stub-enrolled-trigger"),
      );

      expect(openSheets()).toHaveLength(0);
      expect(onenrolled).toHaveBeenCalledTimes(1);
    });
  });
});
