// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";

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

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", () => ({
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
