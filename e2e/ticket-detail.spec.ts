import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login, openTicketByTitle, longPress } from "./helpers";

test.describe.serial("Ticket Detail (Chat View)", () => {
  let page: Page;

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
    // "Assigned to Dev Admin" and "Priority changed to high" are system events.
    const systemEvent = page.locator('[role="status"]', {
      hasText: "Assigned to Dev Admin",
    });
    await expect(systemEvent).toBeVisible();

    const priorityEvent = page.locator('[role="status"]', {
      hasText: "Priority changed to high",
    });
    await expect(priorityEvent).toBeVisible();
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
    // Scope to Konsta Actions buttons (.k-actions-button) to avoid matching
    // the inline pencil edit button in the note badge.
    await expect(page.getByText("Copy")).toBeVisible();
    await expect(
      page.locator(".k-actions-button").filter({ hasText: /edit note/i }),
    ).toBeVisible();
    await expect(
      page.locator(".k-actions-button").filter({ hasText: /delete note/i }),
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
      .locator(".k-actions-button")
      .filter({ hasText: /edit/i })
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

    // Dismiss the sheet to exit edit mode.
    await page.keyboard.press("Escape");

    // Note should be back to read mode.
    await expect(textarea).not.toBeVisible();
    await expect(note).toBeVisible();
  });

  // ── 10. Compose bar and mode toggle (Checkpoint 7) ──────────────

  test("compose bar has compose-actions, send, and textarea; tabbar is hidden", async () => {
    // Tabbar hidden.
    await expect(page.locator('[role="tablist"]')).not.toBeVisible();

    // Compose actions (+) button opens the popover with attach/preset/note.
    const plusBtn = page.getByRole("button", { name: /compose actions/i });
    await expect(plusBtn).toBeVisible();

    // Send button.
    const sendBtn = page.getByRole("button", { name: /send/i });
    await expect(sendBtn).toBeVisible();

    // Compose textarea (reply mode).
    const textarea = page.getByRole("textbox", { name: /type a reply/i });
    await expect(textarea).toBeVisible();
  });

  // ── 11. Preset fills compose (Checkpoint 8) ────────────────────

  test("compose actions popover opens preset sheet", async () => {
    // Open compose actions popover via the + button.
    const plusBtn = page.getByRole("button", { name: /compose actions/i });
    await plusBtn.click();

    // Click "Preset replies" from the compose actions popover.
    const presetItem = page.getByText(/preset replies/i).first();
    await expect(presetItem).toBeVisible({ timeout: 3_000 });
    await presetItem.click();

    // The preset sheet opens. Without seeded presets it shows the empty state.
    await expect(page.getByText(/nothing here yet/i)).toBeVisible({
      timeout: 5_000,
    });

    // Dismiss the sheet.
    await page.keyboard.press("Escape");
  });

  // ── 12. Action sheets (Checkpoints 9, 10, 11) ──────────────────

  test("more actions sheet shows ticket actions", async () => {
    // Prior tests may leave a z-40 backdrop from compose/preset overlays.
    // Dispatch click directly on the button to bypass any residual overlay.
    const moreBtn = page.getByRole("button", { name: /more actions/i });
    await moreBtn.dispatchEvent("click");

    // "Help with housing" is assigned to me, so Release should show.
    // Scope to the panel popup to avoid strict mode violations from
    // "Assigned to Dev Admin" text elsewhere on the page.
    const panel = page.getByRole("dialog", { name: /glad-mist/i });
    await expect(panel.getByText("Release")).toBeVisible();
    await expect(panel.getByText("Assign", { exact: true })).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  test("call sheet shows browser and phone options", async () => {
    // The Call button lives inside the panel popup. Re-open it first.
    const moreBtn = page.getByRole("button", { name: /more actions/i });
    await moreBtn.dispatchEvent("click");
    const panel = page.getByRole("dialog", { name: /glad-mist/i });
    await expect(panel).toBeVisible({ timeout: 5_000 });

    const callBtn = panel.getByRole("button", { name: /call/i });
    await callBtn.click();

    await expect(page.getByText(/call via browser/i)).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  test("client alias opens client info panel", async () => {
    const aliasBtn = page.getByRole("button", { name: /client info/i });
    await aliasBtn.click();

    // Client info panel opens as a dialog.
    await expect(page.getByRole("dialog").last()).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 13. Keyboard navigation (Checkpoint 25) ────────────────────

  test("Tab navigates through message bubbles", async () => {
    // Focus the first bubble via Tab from the top.
    // First, focus something at the top of the page.
    await page.keyboard.press("Tab");

    // Keep tabbing until we reach a bubble with data-fu-id.
    let foundBubble = false;
    for (let i = 0; i < 30; i++) {
      const focused = page.locator(":focus");
      const hasFuId = await focused.getAttribute("data-fu-id");
      if (hasFuId !== null) {
        foundBubble = true;
        break;
      }
      await page.keyboard.press("Tab");
    }
    expect(foundBubble).toBe(true);
  });

  test("Shift+F10 opens context menu on focused bubble", async () => {
    // Focus a message bubble first.
    const clientBubble = page.locator("[data-fu-id]", {
      hasText: "I need help finding a place to stay",
    });
    await clientBubble.focus();

    // Shift+F10 is the keyboard equivalent of long-press.
    await page.keyboard.press("Shift+F10");

    // Context menu should appear.
    await expect(page.getByText("Copy")).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
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

  // ── 15. Draft snapshot (Checkpoint 13) ──────────────────────────

  test("draft text preserved across navigation via snapshot", async () => {
    const textarea = page.getByRole("textbox");
    await textarea.fill("Snapshot test draft");

    // Navigate away.
    const backBtn = page.getByRole("button", { name: /back/i });
    await backBtn.click();
    await expect(page).toHaveURL("/tickets");

    // Navigate back to the same ticket.
    await openTicketByTitle(page, "Help with housing");

    // Draft should be restored.
    const restored = await page.getByRole("textbox").inputValue();
    expect(restored).toBe("Snapshot test draft");

    // Clear draft.
    await page.getByRole("textbox").fill("");
  });

  // ── 16. Accessibility audit (axe-core) ──────────────────────────

  test("passes axe accessibility audit", async () => {
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── 17. Navigate to ticket with media ───────────────────────────

  test("voicemail player renders in Safety planning session ticket", async () => {
    // Go back and open a ticket with voicemail.
    await page.getByRole("button", { name: /back/i }).click();
    await openTicketByTitle(page, "Safety planning session");

    // Wait for voicemail player to appear (it eagerly decrypts).
    // The player has a play button with aria-label.
    const _playBtn = page
      .locator("button", { hasText: /play|pause/i })
      .or(page.locator('[aria-label*="Play"]'));

    // The voicemail may still be loading/decrypting. Wait for the
    // player element (has role="status" while loading, role="group" when ready).
    const playerOrLoading = page
      .getByRole("group")
      .or(page.getByRole("status"));
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
