/**
 * Effect specs for library topics.
 *
 * Mark-only topics with PRESENCE specs:
 * - library-editor: the article editor surface on /library/new.
 * - library-vote: the was-this-helpful vote block on article detail.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  [
    "library-editor",
    {
      description: "Article editor surface is visible on /library/new",
      visible: [
        // ArticleEditor.svelte:1004 - wrapper div with scoped class
        ".article-editor",
        // ArticleEditor.svelte:1031 - ProseMirror mount with textbox role
        '[role="textbox"][aria-multiline="true"]',
      ],
    },
  ],
  [
    "library-vote",
    {
      description: "Was-this-helpful vote block is visible on article detail",
      visible: [
        // ArticleVote.svelte:63 - wrapper div with role="group"
        ".article-vote",
      ],
    },
  ],
  [
    "library-tools",
    {
      description: "Cards view-mode button is pressed after tap",
      visible: [
        // IconTabToggle.svelte:106 - aria-pressed on the active toggle button
        // ViewSwitcher.svelte:27 - label from m.view_switcher_cards()
        '[aria-pressed="true"][aria-label="Cards"]',
      ],
    },
  ],
  [
    "library-search",
    {
      description: "Inline search navigator toolbar opens",
      visible: [
        // SearchNavigator.svelte:87-88 - the navigator toolbar container
        '.search-navigator[role="toolbar"]',
      ],
    },
  ],
  [
    "library-categories",
    {
      description: "Category management sheet opens",
      visible: [
        // CategoryManageSheet.svelte:188 - title passed to ShellSheet
        // ShellSheet.svelte:112 - role="dialog" with aria-label from title
        '.shell-sheet-content[role="dialog"]',
      ],
    },
  ],
]);
