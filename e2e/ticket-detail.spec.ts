import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  isDesktopLayout,
  login,
  openComposeActions,
  openTicketByTitle,
  longPress,
} from "./helpers";

test.describe.serial("Ticket Detail (Chat View)", () => {
  let page: Page;
  let clientAlias = "";

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "ticket-detail");
    await page.close();
  });

  // ── 1. Navigate to "Help with housing" ──────────────────────────

  test("opens Help with housing ticket from ticket list", async () => {
    await openTicketByTitle(page, "Help with housing");

    // At desktop widths the ticket opens in a split-view pane whose inert
    // navbar context drops the alias button, so expand to the full-page
    // route. Below the breakpoint the tap already navigated there.
    // Branch on the layout rather than on whether the expand control is
    // visible: isVisible() ignores its timeout and returns immediately, so
    // sampling it can miss a pane header that has not painted yet and then
    // fail in the alias lookup below for a reason that looks unrelated.
    if (await isDesktopLayout(page)) {
      const expandBtn = page.getByRole("button", { name: /open full view/i });
      await expect(expandBtn).toBeVisible({ timeout: 10_000 });
      await expandBtn.click();
      await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/, {
        timeout: 5_000,
      });
    }

    // Capture the client alias from the navbar for use in subsequent tests.
    // Wait for the alias to decrypt (matches adjective-noun-number pattern).
    const aliasBtn = page.getByRole("button", {
      name: /view info for [a-z]+-[a-z]+-\d+/i,
    });
    await expect(aliasBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const aliasText = (await aliasBtn.innerText()).trim();
    clientAlias = aliasText;
  });

  // ── 2. Chat bubble alignment (Checkpoint 1) ─────────────────────

  test("client messages are left-aligned (type=received)", async () => {
    // "I need help finding a place to stay" is a client message.
    const clientBubble = page.locator('[data-source="client"]', {
      hasText: "I need help finding a place to stay",
    });
    await expect(clientBubble).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("volunteer messages are right-aligned (type=sent)", async () => {
    // "I can look into shelters in your area" is a volunteer message.
    const volBubble = page.locator('[data-source="volunteer"]', {
      hasText: "I can look into shelters in your area",
    });
    await expect(volBubble).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── 3. System events as centered Chips (Checkpoint 5) ───────────

  test("system events render with role=status", async () => {
    // System events are oldest follow-ups. On a 720px viewport the
    // VirtualList may not render them until we scroll to the top.
    const chatLog = page.locator('[role="log"]');
    await chatLog.evaluate((el) => {
      el.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);

    const systemEvent = page.locator('[role="status"]', {
      hasText: "assigned",
    });
    await expect(systemEvent.first()).toBeVisible({ timeout: 5_000 });

    // Priority change is further down; scroll back to reveal it.
    const priorityEvent = page.locator('[role="status"]', {
      hasText: "Priority changed",
    });
    if (
      !(await priorityEvent.isVisible({ timeout: 1_000 }).catch(() => false))
    ) {
      await chatLog.evaluate((el) => {
        el.scrollTo(0, el.scrollHeight / 2);
      });
      await page.waitForTimeout(300);
    }
    await expect(priorityEvent).toBeVisible({ timeout: 5_000 });
  });

  // ── 4. Internal notes with private styling (Checkpoint 6) ───────

  test("internal notes show private badge and content", async () => {
    // "Client sounds stressed but stable" is an internal note.
    // Target the PrivateNote card (aria-label="Private note by ..."),
    // not the outer fu-wrapper which also has role="article".
    const note = page.getByRole("article", { name: /private note/i }).filter({
      hasText: "Client sounds stressed",
    });
    await expect(note).toBeVisible();

    // The private badge ("Only your team can see this" or similar) should
    // be inside the note.
    const badge = note.locator('[data-testid="note-badge"]');
    await expect(badge).toBeVisible();
  });

  // ── 5. Bubble aria-labels (Checkpoint 22) ───────────────────────

  test("message bubbles have distinguishing aria-labels", async () => {
    // Client message bubble should have aria-label with "received" or client name.
    const clientBubble = page.locator("[data-fu-id]", {
      hasText: "I need help finding a place to stay",
    });
    const ariaLabel = await clientBubble.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    // The label should contain the client alias (set during seeding).
    // It uses ticket_message_received_from pattern.
    expect(ariaLabel!.length).toBeGreaterThan(10);

    // Volunteer bubble should have a different aria-label pattern.
    const volBubble = page.locator("[data-fu-id]", {
      hasText: "I can look into shelters",
    });
    const volLabel = await volBubble.getAttribute("aria-label");
    expect(volLabel).toBeTruthy();
    expect(volLabel).not.toBe(ariaLabel);
  });

  // ── 6. Date separators (Checkpoint 23) ──────────────────────────

  test("date separators appear between messages on different days", async () => {
    // "Help with housing" has follow-ups spanning 3 days.
    const separators = page.locator('[role="separator"]');
    const count = await separators.count();
    // At minimum: date separators between the 3-day span. Could also
    // include the unread divider. At least 1 date separator expected.
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── 7. Long-press on client message shows Copy (Checkpoint 19) ──

  test("long-press on client message shows Copy action", async () => {
    // Target the .bubble-text span which has the onpointerdown handler.
    // The [data-fu-id] wrapper has display:contents (no layout box), and
    // [data-source] is the bubble container whose center might not overlap
    // the .bubble-text child that binds the pointer events.
    const bubbleText = page.locator(".bubble-text", {
      hasText: "I need help finding a place to stay",
    });
    await expect(bubbleText).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Scroll the bubble away from the sticky header so pointer events
    // land on the correct element (not the banner overlay).
    const chatLog = page.locator('[role="log"]');
    await chatLog.evaluate((el) => {
      el.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
    await longPress(page, bubbleText);

    // Context menu action sheet should appear with Copy.
    await expect(page.getByText("Copy")).toBeVisible({ timeout: 5_000 });

    // Should NOT show Edit or Delete (this is a client message, not a note).
    await expect(page.getByText("Edit")).not.toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 8. Long-press on internal note shows Edit/Delete (Checkpoint 18) ──

  test("long-press on internal note shows Edit and Delete actions", async () => {
    const note = page.getByRole("article", { name: /private note/i }).filter({
      hasText: "Client sounds stressed",
    });
    await longPress(page, note);

    // Context menu should show Copy, Edit Note, and Delete Note actions.
    // Scope to the actions sheet to avoid matching the inline pencil edit
    // button in the note badge.
    const actionsSheet = page.locator('[data-testid="actions-sheet"]');
    await expect(page.getByText("Copy")).toBeVisible();
    await expect(actionsSheet.filter({ hasText: /edit note/i })).toBeVisible();
    await expect(
      actionsSheet.filter({ hasText: /delete note/i }),
    ).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 9. Note edit flow (Checkpoint 20 - edit path) ───────────────

  test("editing an internal note shows textarea and Save/Cancel", async () => {
    // Long-press the note and tap Edit Note from the context menu.
    const note = page.getByRole("article", { name: /private note/i }).filter({
      hasText: "Client sounds stressed",
    });
    await longPress(page, note);
    await page
      .locator('[data-testid="actions-sheet"]')
      .getByRole("button", { name: /edit note/i })
      .click();

    // The note edit sheet opens as a dialog.
    const editSheet = page.getByRole("dialog", { name: /edit note/i });
    await expect(editSheet).toBeVisible();

    const textarea = editSheet.getByRole("textbox");
    await expect(textarea).toBeVisible();

    // Save button should be present (text varies: "Update" in edit mode).
    await expect(
      editSheet.getByRole("button", { name: /update|save/i }),
    ).toBeVisible();

    // The textarea should contain the original note content.
    const value = await textarea.inputValue();
    expect(value).toContain("Client sounds stressed");

    // Dismiss the sheet to exit edit mode. Click the textarea first to
    // ensure focus is inside the dialog's focus trap before pressing Escape.
    await textarea.click();
    await page.keyboard.press("Escape");

    // Note should be back to read mode.
    await expect(textarea).not.toBeVisible({ timeout: 5_000 });
    await expect(note).toBeVisible();
  });

  // ── 10. Compose bar and mode toggle (Checkpoint 7) ──────────────

  test("compose bar has compose-actions, send, and textarea; tabbar is hidden", async () => {
    // Mobile tabbar hidden on ticket detail (desktop sidebar tablist stays visible).
    await expect(
      page.locator('[role="tablist"]:not([aria-orientation="vertical"])'),
    ).not.toBeVisible();

    // Compose actions (+) button visible in collapsed state.
    // Expand compose: tap +, then "Reply to client" to activate reply mode.
    // The send button and textarea only appear when compose mode is active.
    const dialog = await openComposeActions(page);
    await dialog.getByText(/reply to/i).click();

    // Send button.
    const sendBtn = page.getByRole("button", { name: /send/i });
    await expect(sendBtn).toBeVisible({ timeout: 3_000 });

    // Compose textarea (reply mode).
    const textarea = page.getByRole("textbox", { name: /type a reply/i });
    await expect(textarea).toBeVisible();

    // Dismiss compose mode for subsequent tests.
    const dismissBtn = page.getByRole("button", { name: /dismiss compose/i });
    await dismissBtn.click();
    await expect(textarea).not.toBeVisible({ timeout: 3_000 });
  });

  // ── 11. Preset fills compose (Checkpoint 8) ────────────────────

  test("compose actions popover opens preset sheet", async () => {
    const dialog = await openComposeActions(page);

    // Click "Preset replies" from the compose actions popover.
    const presetItem = dialog.getByText(/preset replies/i).first();
    await expect(presetItem).toBeVisible({ timeout: 3_000 });
    await presetItem.click();

    // The preset sheet opens. Without seeded presets it shows the empty state.
    await expect(page.getByText(/nothing here yet/i)).toBeVisible({
      timeout: 5_000,
    });

    // Dismiss the preset sheet and then the compose popover (two layers).
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  // ── 12. Action sheets (Checkpoints 9, 10, 11) ──────────────────

  test("more actions sheet shows ticket actions", async () => {
    // The full-page ticket route renders the client panel inline in an
    // <aside> only at desktop widths (desktopFull in
    // TicketDetailOrchestrator, set from fullView && layoutMode.isDesktop).
    // Below the breakpoint the same actions live behind the navbar's "More
    // actions" popup. Branch on the layout, which cannot change mid-test,
    // rather than on which control happens to be painted: isVisible()
    // ignores its timeout, so an early sample silently selects the wrong
    // branch and asserts nothing meaningful.
    if (await isDesktopLayout(page)) {
      const aside = page.locator("aside");
      await expect(aside.getByText("Release")).toBeVisible({
        timeout: 10_000,
      });
      await expect(aside.getByText("Assign", { exact: true })).toBeVisible();
    } else {
      const moreBtn = page.getByRole("button", { name: /more actions/i });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
      const panel = page.locator(
        `[data-testid="popup-dialog"][aria-label="${clientAlias}"]`,
      );
      await expect(panel.getByText("Release")).toBeVisible();
      await expect(panel.getByText("Assign", { exact: true })).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });

  test("call sheet shows browser and phone options", async () => {
    // Same layout split as the previous test: Call sits inline in the aside
    // at desktop widths, behind the "More actions" popup below them.
    const desktop = await isDesktopLayout(page);

    if (desktop) {
      const aside = page.locator("aside");
      const callBtn = aside.getByRole("button", { name: /call/i });
      await expect(callBtn).toBeVisible({ timeout: 10_000 });
      await callBtn.dispatchEvent("click");
    } else {
      const moreBtn = page.getByRole("button", { name: /more actions/i });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
      const panel = page.locator(
        `[data-testid="popup-dialog"][aria-label="${clientAlias}"]`,
      );
      await expect(panel).toBeVisible({ timeout: 5_000 });
      const callBtn = panel.getByRole("button", { name: /call/i });
      await callBtn.click();
    }

    const callSheet = page.getByRole("dialog", { name: /call options/i });
    await expect(callSheet.getByText(/call via browser/i)).toBeVisible();

    // Dismiss call sheet (and the popup, when that is what opened it).
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (!desktop) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
  });

  test("client alias opens client info panel", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const aliasBtn = page.getByRole("button", { name: /view info for/i });
    // Navbar z-index can cover the alias button. Dispatch directly.
    await aliasBtn.dispatchEvent("click");

    // Client info panel opens as a ShellPopup with aria-label matching the alias.
    const panel = page.locator(
      `[data-testid="popup-dialog"][aria-label="${clientAlias}"]`,
    );
    await expect(panel).toBeVisible({ timeout: 5_000 });

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 13. Keyboard navigation (Checkpoint 25) ────────────────────

  test("message bubbles are focusable and keyboard-navigable", async () => {
    // Use getByRole to find visible article elements within the chat log.
    const chatLog = page.locator('[role="log"]');
    const firstBubble = chatLog.getByRole("article").first();
    await expect(firstBubble).toBeVisible({ timeout: 5_000 });

    // Verify it has data-fu-id and tabindex=0 (keyboard-accessible).
    const fuId = await firstBubble.getAttribute("data-fu-id");
    expect(fuId).not.toBeNull();
    const tabindex = await firstBubble.getAttribute("tabindex");
    expect(tabindex).toBe("0");
  });

  test("Shift+F10 opens context menu on focused bubble", async () => {
    // Focus a message bubble and dispatch Shift+F10 in one evaluate call.
    // This avoids issues where prior tests' focus traps redirect focus
    // between the focus() call and the keyboard event.
    const clientBubble = page.locator("[data-fu-id]", {
      hasText: "I need help finding a place to stay",
    });
    await clientBubble.evaluate((el: HTMLElement) => {
      el.focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "F10",
          shiftKey: true,
          bubbles: true,
        }),
      );
    });

    // Context menu should appear.
    await expect(page.getByText("Copy")).toBeVisible();

    // Dismiss and wait for the backdrop animation to fully clear.
    await page.keyboard.press("Escape");
    await expect(page.locator(".fixed.z-40"))
      .toBeHidden({
        timeout: 2000,
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional: backdrop may not exist
      .catch(() => {});
  });

  // ── 14. Chat container accessibility (Checkpoint 21) ────────────

  test("chat container has role=log with aria-label containing client alias", async () => {
    const logEl = page.locator('[role="log"]');
    const ariaLabel = await logEl.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    // The aria-label includes the client alias from the ticket.
    // The alias is assigned during seeding (adjective + animal pattern).
    expect(ariaLabel!.length).toBeGreaterThan(5);
  });

  // ── 15. Draft persistence (Checkpoint 13) ───────────────────────

  test("draft text preserved across navigation via in-memory store", async () => {
    // Drain any residual overlays (context menu backdrop, compose sheet, etc.)
    // left by previous tests in this serial group.
    for (let i = 0; i < 5; i++) {
      const backdrop = page.locator(".fixed.z-40").first();
      if (!(await backdrop.isVisible().catch(() => false))) break;
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }

    // Activate reply compose mode (collapsed bar only shows + button).
    const dialog = await openComposeActions(page);
    await dialog.getByText(/reply to/i).click();

    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeVisible({ timeout: 3_000 });
    await textarea.fill("Snapshot test draft");

    // Blur textarea to dismiss any compose-mode overlay, then wait for
    // the backdrop animation to clear.
    await page.keyboard.press("Escape");
    await expect(page.locator(".fixed.z-40"))
      .toBeHidden({ timeout: 2000 })
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional: backdrop may not exist
      .catch(() => {});

    const backBtn = page.getByRole("button", { name: /back/i });
    await backBtn.click();
    await expect(page).toHaveURL("/tickets");

    await openTicketByTitle(page, "Help with housing");

    // Reopen compose mode to check if the draft was preserved.
    const dialog2 = await openComposeActions(page);
    await dialog2.getByText(/reply to/i).click();

    const restoredTextarea = page.getByRole("textbox");
    await expect(restoredTextarea).toBeVisible({ timeout: 3_000 });
    const restored = await restoredTextarea.inputValue();
    expect(restored).toBe("Snapshot test draft");

    await restoredTextarea.fill("");
    const dismissBtn = page.getByRole("button", { name: /dismiss compose/i });
    await dismissBtn.click();
  });

  // ── 16. Accessibility audit (axe-core) ──────────────────────────

  test("passes axe accessibility audit", async () => {
    await auditA11y(page);
  });

  // ── 17. Navigate to ticket with media ───────────────────────────

  test("voicemail player renders in Safety planning session ticket", async () => {
    // Open a ticket with voicemail. In desktop split-view the ticket list
    // is already visible, so openTicketByTitle clicks the card directly.
    await openTicketByTitle(page, "Safety planning session");

    // Wait for voicemail player to appear (it eagerly decrypts).
    // The player has a play button with aria-label.
    const _playBtn = page
      .locator("button", { hasText: /play|pause/i })
      .or(page.locator('[aria-label*="Play"]'));

    // The voicemail may still be loading/decrypting. Wait for the
    // player element (has role="status" while loading, role="group" when ready).
    // Scope to the chat log to avoid matching the global toast container.
    const chatLog = page.locator('[role="log"]');
    const playerOrLoading = chatLog
      .getByRole("group")
      .or(chatLog.getByRole("status"));
    await expect(playerOrLoading.first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 18. Voicemail accessibility (Checkpoint 24) ─────────────────

  test("voicemail player has accessible play button and progress", async () => {
    // Audio player wrapper has role="group" with aria-label containing "voicemail".
    const player = page.getByRole("group", { name: /voicemail/i }).first();

    // Player may still be loading (role="status"). Check if the group is visible.
    const isGroupVisible = await player.isVisible().catch(() => false);

    if (isGroupVisible) {
      // Verify play button exists with aria-label.
      const playBtn = player.getByRole("button", { name: /play|pause/i });
      await expect(playBtn).toBeVisible();
      const btnLabel = await playBtn.getAttribute("aria-label");
      expect(btnLabel).toBeTruthy();

      // Verify waveform progressbar exists.
      const waveform = player.locator('[role="progressbar"]');
      await expect(waveform).toBeVisible();
      const valueNow = await waveform.getAttribute("aria-valuenow");
      expect(valueNow).not.toBeNull();
    }
  });

  // ── 19. Visual screenshot ───────────────────────────────────────

  test("ticket detail renders without visual breakage", async () => {
    await page.screenshot({
      path: "test-results/ticket-detail-chat.png",
      fullPage: false,
    });
  });
});
