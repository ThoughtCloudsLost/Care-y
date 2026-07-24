// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const { mockBackupCodes, mockToastShow } = vi.hoisted(() => ({
  mockBackupCodes: vi
    .fn()
    .mockResolvedValue({ codes: ["AAAA-1111", "BBBB-2222"] }),
  mockToastShow: vi.fn(),
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  twofa_backup_codes_title: () => "Backup codes",
  twofa_backup_codes_warning: () => "Save these now. They are shown only once.",
  twofa_backup_codes_regenerated: () => "Your old backup codes no longer work.",
  twofa_backup_codes_copy: () => "Copy all codes",
  twofa_backup_codes_copied: () => "Copied",
  twofa_backup_codes_confirm_title: () => "Leave without saving?",
  twofa_backup_codes_confirm_text: () => "These codes will not be shown again.",
  twofa_backup_codes_confirm_saved: () => "I saved them",
  twofa_backup_codes_confirm_back: () => "Go back",
  twofa_error_invalid_code: () => "Something went wrong",
  shell_close: () => "Close",
}));

// $lib/trpc/index.js creates a live HTTP client at import time
// (vi.mock exception 2: $lib alias with import side effects).
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    twoFactor: {
      enroll: {
        backupCodes: { mutate: mockBackupCodes },
      },
    },
  },
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

const { default: BackupCodesSheet } = await import("./BackupCodesSheet.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

async function renderOpened(
  props: Partial<{ regenerating: boolean; ondismiss: () => void }> = {},
): Promise<void> {
  render(BackupCodesSheet, {
    props: {
      opened: true,
      ondismiss: props.ondismiss ?? vi.fn(),
      regenerating: props.regenerating ?? false,
    },
  });
  // Codes arrive from the mocked mutation after the open effect runs.
  await screen.findByText("AAAA-1111");
}

describe("BackupCodesSheet", () => {
  it("fetches and renders the codes when opened", async () => {
    await renderOpened();
    expect(mockBackupCodes).toHaveBeenCalledTimes(1);
    expect(screen.getByText("BBBB-2222")).toBeTruthy();
  });

  it("shows the one-time reveal as a Warning register with role=alert", async () => {
    await renderOpened();
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBe(1);
    expect(alerts[0]?.getAttribute("data-register")).toBe("warning");
    expect(
      screen.getByText("Save these now. They are shown only once."),
    ).toBeTruthy();
  });

  it("adds the regeneration Warning register while regenerating", async () => {
    await renderOpened({ regenerating: true });
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBe(2);
    for (const alert of alerts) {
      expect(alert.getAttribute("data-register")).toBe("warning");
    }
    expect(
      screen.getByText("Your old backup codes no longer work."),
    ).toBeTruthy();
  });

  it("asks for confirmation instead of dismissing while codes are visible", async () => {
    const ondismiss = vi.fn();
    await renderOpened({ ondismiss });
    // Escape reaches the sheet's dismissal path, which must divert to
    // the save confirmation while codes are on screen (audit fix).
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(await screen.findByText("Leave without saving?")).toBeTruthy();
    expect(ondismiss).not.toHaveBeenCalled();
  });
});
