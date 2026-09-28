// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { flushSync } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as WizardNavContextNS from "./wizard-nav-context.js";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as PasswordChangeNS from "$lib/settings/password-change.js";
import type * as PowSolverNS from "$lib/auth/pow-solver.js";

const { mockChangePassword } = vi.hoisted(() => ({
  mockChangePassword: vi.fn<typeof PasswordChangeNS.changePassword>(),
}));

vi.mock("$lib/settings/password-change.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PasswordChangeNS>()),
  changePassword: mockChangePassword,
}));

vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PowSolverNS>()),
  solveProofOfWork: vi.fn(),
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getCryptoBridge: vi.fn(() => ({})),
  getOrgKeyManager: vi.fn(() => ({})),
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
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContextNS>()),
  getWizardNavCtx: () => wizardNavContainer,
}));

const { default: SetupOwnPassword } = await import("./SetupOwnPassword.svelte");

const CURRENT = "temporary-password-from-admin";
const NEXT = "my-own-password-long-enough";

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

async function fillForm(): Promise<void> {
  await fireEvent.input(screen.getByLabelText(m.settings_password_current()), {
    target: { value: CURRENT },
  });
  await fireEvent.input(screen.getByLabelText(m.settings_password_new()), {
    target: { value: NEXT },
  });
  await fireEvent.input(screen.getByLabelText(m.settings_password_confirm()), {
    target: { value: NEXT },
  });
}

async function pressNext(): Promise<void> {
  const action = wizardNavContainer.current?.right?.onaction;
  expect(action, "No right nav action registered").toBeTruthy();
  await action?.();
  flushSync();
}

describe("SetupOwnPassword", () => {
  it("shows the heading and the explanation", () => {
    render(SetupOwnPassword, {
      props: { oncomplete: vi.fn(), userId: "user-1" },
    });
    expect(screen.getByText(m.onboarding_password_heading())).toBeTruthy();
    expect(screen.getByText(m.onboarding_password_desc())).toBeTruthy();
  });

  it("registers Next as disabled while the form is empty", () => {
    render(SetupOwnPassword, {
      props: { oncomplete: vi.fn(), userId: "user-1" },
    });
    expect(wizardNavContainer.current?.right?.label).toBe(m.common_next());
    expect(wizardNavContainer.current?.right?.disabled).toBe(true);
  });

  it("changes the password on Next and completes the step", async () => {
    mockChangePassword.mockResolvedValue(undefined);
    const oncomplete = vi.fn();
    render(SetupOwnPassword, {
      props: { oncomplete, userId: "user-1" },
    });

    await fillForm();
    await pressNext();

    expect(mockChangePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        currentPassword: CURRENT,
        newPassword: NEXT,
      }),
    );
    expect(oncomplete).toHaveBeenCalledOnce();
  });

  it("asks for a retry when a key wrap was granted during the change", async () => {
    mockChangePassword.mockRejectedValue(new Error("STALE_KEY_WRAPS"));
    const oncomplete = vi.fn();
    render(SetupOwnPassword, {
      props: { oncomplete, userId: "user-1" },
    });

    await fillForm();
    await pressNext();

    expect(await screen.findByText(m.error_stale_key_wraps())).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });
});
