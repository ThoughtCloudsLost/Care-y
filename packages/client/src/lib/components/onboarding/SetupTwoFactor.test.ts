// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as WizardNavContextNS from "./wizard-nav-context.js";
import type * as KeysNS from "$lib/query/keys.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as BackupCodesSheetNS from "$lib/components/settings/BackupCodesSheet.svelte";
import type * as PushEnrollSheetNS from "$lib/components/settings/PushEnrollSheet.svelte";
import type * as SmsEnrollSheetNS from "$lib/components/settings/SmsEnrollSheet.svelte";
import type * as EmailEnrollSheetNS from "$lib/components/settings/EmailEnrollSheet.svelte";
import type * as PasskeyEnrollSheetNS from "$lib/components/settings/PasskeyEnrollSheet.svelte";
import type * as TotpEnrollSheetNS from "$lib/components/settings/TotpEnrollSheet.svelte";

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
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

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
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

vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KeysNS>()),
  twoFactorKeys: { status: () => ["twoFactor", "status"] },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);
vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);
vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

const stubComponent = () => ({
  $destroy: vi.fn(),
  $set: vi.fn(),
  $$: { on_mount: [], on_destroy: [], ctx: [] },
});

vi.mock(
  "$lib/components/settings/TotpEnrollSheet.svelte",
  () =>
    ({
      default:
        stubComponent as unknown as (typeof TotpEnrollSheetNS)["default"],
    }) satisfies typeof TotpEnrollSheetNS,
);
vi.mock(
  "$lib/components/settings/PasskeyEnrollSheet.svelte",
  () =>
    ({
      default:
        stubComponent as unknown as (typeof PasskeyEnrollSheetNS)["default"],
    }) satisfies typeof PasskeyEnrollSheetNS,
);
vi.mock(
  "$lib/components/settings/EmailEnrollSheet.svelte",
  () =>
    ({
      default:
        stubComponent as unknown as (typeof EmailEnrollSheetNS)["default"],
    }) satisfies typeof EmailEnrollSheetNS,
);
vi.mock(
  "$lib/components/settings/SmsEnrollSheet.svelte",
  () =>
    ({
      default: stubComponent as unknown as (typeof SmsEnrollSheetNS)["default"],
    }) satisfies typeof SmsEnrollSheetNS,
);
vi.mock(
  "$lib/components/settings/PushEnrollSheet.svelte",
  () =>
    ({
      default:
        stubComponent as unknown as (typeof PushEnrollSheetNS)["default"],
    }) satisfies typeof PushEnrollSheetNS,
);
vi.mock(
  "$lib/components/settings/BackupCodesSheet.svelte",
  () =>
    ({
      default:
        stubComponent as unknown as (typeof BackupCodesSheetNS)["default"],
    }) satisfies typeof BackupCodesSheetNS,
);

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContextNS>()),
  getWizardNavCtx: () => wizardNavContainer,
}));

const { default: SetupTwoFactor } = await import("./SetupTwoFactor.svelte");

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupTwoFactor", () => {
  it("registers continue as disabled initially", () => {
    render(SetupTwoFactor, {
      props: { oncomplete: vi.fn(), username: "admin" },
    });
    expect(wizardNavContainer.current?.right?.label).toBe(m.common_next());
    expect(wizardNavContainer.current?.right?.disabled).toBe(true);
  });
});
