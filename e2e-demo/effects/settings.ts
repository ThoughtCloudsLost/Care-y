/**
 * Effect specs for settings topics.
 *
 * Mark-only topics with PRESENCE specs:
 * - settings-password: the password row on the settings page.
 * - settings-appearance: the color scheme control.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  [
    "settings-profile",
    {
      description: "Display name edit sheet opens",
      visible: [
        // DisplayNameSheet.svelte:78 - ariaLabel={m.settings_display_name()}
        // ShellSheet.svelte:112 - role="dialog" with aria-label from ariaLabel
        '.shell-sheet-content[role="dialog"]',
      ],
    },
  ],
  [
    "settings-2fa",
    {
      description: "Two-factor enrollment sheet opens",
      visible: [
        // TwoFactorSheet.svelte:145 - ariaLabel={m.twofa_enroll_title()}
        // ShellSheet.svelte:112 - role="dialog" with aria-label from ariaLabel
        '.shell-sheet-content[role="dialog"]',
      ],
    },
  ],
  [
    "settings-security",
    {
      description: "Security briefing popup opens",
      visible: [
        // SecurityBriefingPopup.svelte:32 - ariaLabel={m.onboarding_briefing_heading()}
        // ShellPopup.svelte:46-48 - role="dialog" on .popup-dialog
        '.popup-dialog[role="dialog"]',
      ],
    },
  ],
  [
    "settings-password",
    {
      description: "Password row is visible on the settings page",
      visible: [
        // settings/+page.svelte:153 - data-testid on the password ListItem
        '[data-testid="settings-password-row"]',
      ],
    },
  ],
  [
    "settings-appearance",
    {
      description: "Color scheme row is visible on the settings page",
      visible: [
        // settings/+page.svelte:167 - data-testid on the color scheme ListItem
        '[data-testid="settings-color-scheme-row"]',
      ],
    },
  ],
]);
