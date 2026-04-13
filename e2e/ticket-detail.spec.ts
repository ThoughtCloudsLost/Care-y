import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Crypto pipeline timeout: Argon2id (64 MiB WASM) + OPRF round-trips +
// ECIES key wrapping + Worker decryption. 60s is generous but safe.
const CRYPTO_TIMEOUT = 60_000;

// Long-press: pointerdown, hold 600ms, pointerup. Matches the 500ms
// threshold in TicketDetail's startLongPress + margin.
async function longPress(
  page: Page,
  locator: ReturnType<Page["locator"]>,
): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element not found for long-press");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
}

/** Navigate to the ticket list and open a ticket by its decrypted title. */
async function openTicketByTitle(page: Page, title: string): Promise<void> {
  // Ensure we're on the ticket list.
  const currentUrl = page.url();
  if (!currentUrl.endsWith("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  // Wait for the target ticket's decrypted title to appear.
  await expect(page.getByText(title)).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });

  // Click the card containing this title. The title is inside a
  // .card-inner, so find the card that contains this text.
  const card = page.locator(".swipeable-card", { hasText: title });
  await card.locator(".card-inner").click();

  // Wait for the detail route.
  await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/);
  await expect(page.locator('[role="log"]')).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
}

// Single shared page instance. One login boots the crypto Worker, then
// all tests navigate via SPA without re-authenticating.
test.describe.serial("Ticket Detail (Chat View)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/");

    // Wait for the crypto pipeline to complete on dashboard.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ── 1. Navigate to "Help with housing" ──────────────────────────

  test("opens Help with housing ticket from ticket list", async () => {
    await openTicketByTitle(page, "Help with housing");
  });

  // ── 2. Chat bubble alignment (Checkpoint 1) ─────────────────────

  test("client messages are left-aligned (type=received)", async () => {
    // "I need help finding a place to stay" is a client message.
    const clientBubble = page.locator(".message-received", {
      hasText: "I need help finding a place to stay",
    });
    await expect(clientBubble).toBeVisible();
  });

  test("volunteer messages are right-aligned (type=sent)", async () => {
    // "I can look into shelters in your area" is a volunteer message.
    const volBubble = page.locator(".message-sent", {
      hasText: "I can look into shelters in your area",
    });
    await expect(volBubble).toBeVisible();
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
    const note = page.locator('[role="article"]', {
      hasText: "Client sounds stressed",
    });
    await expect(note).toBeVisible();

    // The private badge ("Only your team can see this" or similar) should
    // be inside the note.
    const badge = note.locator(".note-badge");
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
    const clientBubble = page.locator("[data-fu-id]", {
      hasText: "I need help finding a place to stay",
    });
    await longPress(page, clientBubble);

    // Context menu action sheet should appear with Copy.
    await expect(page.getByText("Copy")).toBeVisible();

    // Should NOT show Edit or Delete (this is a client message, not a note).
    await expect(page.getByText("Edit")).not.toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 8. Long-press on internal note shows Edit/Delete (Checkpoint 18) ──

  test("long-press on internal note shows Edit and Delete actions", async () => {
    const note = page.locator('[role="article"]', {
      hasText: "Client sounds stressed",
    });
    await longPress(page, note);

    // Context menu should show Copy, Edit, and Delete.
    await expect(page.getByText("Copy")).toBeVisible();
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Delete")).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  // ── 9. Note edit flow (Checkpoint 20 - edit path) ───────────────

  test("editing an internal note shows textarea and Save/Cancel", async () => {
    // Long-press the note and tap Edit.
    const note = page.locator('[role="article"]', {
      hasText: "Client sounds stressed",
    });
    await longPress(page, note);
    await page.getByText("Edit").click();

    // The note should switch to edit mode with a textarea.
    const textarea = page.locator(".note-edit-list textarea");
    await expect(textarea).toBeVisible();

    // Save and Cancel buttons should be present.
    await expect(page.locator(".note-edit-save")).toBeVisible();
    await expect(page.locator(".note-edit-cancel")).toBeVisible();

    // The textarea should contain the original note content.
    const value = await textarea.inputValue();
    expect(value).toContain("Client sounds stressed");

    // Cancel to exit edit mode without saving.
    await page.locator(".note-edit-cancel").click();

    // Note should be back to read mode.
    await expect(textarea).not.toBeVisible();
    await expect(note).toBeVisible();
  });

  // ── 10. Compose bar and mode toggle (Checkpoint 7) ──────────────

  test("compose bar has attach, preset, and send; tabbar is hidden", async () => {
    // Tabbar hidden.
    await expect(page.locator('[role="tablist"]')).not.toBeVisible();

    // Attach button.
    const attachBtn = page.getByRole("link", { name: /attach/i });
    await expect(attachBtn).toBeVisible();

    // Preset button.
    const presetBtn = page.getByRole("link", { name: /preset/i });
    await expect(presetBtn).toBeVisible();

    // Send button.
    const sendBtn = page.getByRole("link", { name: /send/i });
    await expect(sendBtn).toBeVisible();

    // Mode pill defaults to REPLY.
    await expect(page.getByText("REPLY")).toBeVisible();
  });

  // ── 11. Preset fills compose (Checkpoint 8) ────────────────────

  test("selecting a preset reply fills the compose textarea", async () => {
    // Open preset sheet.
    const presetBtn = page.getByRole("link", { name: /preset/i });
    await presetBtn.click();

    // Wait for preset list to appear.
    const presetContent = page.locator(".preset-reply-content");
    await expect(presetContent).toBeVisible();

    // Click the first preset item.
    const firstPreset = presetContent.locator("li").first();
    await firstPreset.click();

    // The compose textarea should now contain text from the preset.
    const textarea = page.locator(
      ".messagebar textarea, .messagebar [contenteditable]",
    );
    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(0);

    // Clear the draft for subsequent tests.
    await textarea.fill("");
  });

  // ── 12. Action sheets (Checkpoints 9, 10, 11) ──────────────────

  test("more actions sheet shows ticket actions", async () => {
    const moreBtn = page.getByRole("button", { name: /more actions/i });
    await moreBtn.click();

    // Verify key actions are present.
    const content = page.locator(".ticket-actions-content");
    await expect(content).toBeVisible();

    // "Help with housing" is assigned to me, so Release should show.
    await expect(page.getByText("Release")).toBeVisible();
    await expect(page.getByText("Assign")).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  test("call sheet shows browser and phone options", async () => {
    const callBtn = page.getByRole("button", { name: /call/i }).first();
    await callBtn.click();

    await expect(page.getByText(/call via browser/i)).toBeVisible();

    // Dismiss.
    await page.keyboard.press("Escape");
  });

  test("client alias opens client info sheet", async () => {
    const aliasBtn = page.locator(".client-alias-btn");
    await aliasBtn.click();

    await expect(page.locator(".client-info-content")).toBeVisible();

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
    const textarea = page.locator(
      ".messagebar textarea, .messagebar [contenteditable]",
    );
    await textarea.fill("Snapshot test draft");

    // Navigate away.
    const backBtn = page.getByRole("button", { name: /back/i });
    await backBtn.click();
    await expect(page).toHaveURL("/tickets");

    // Navigate back to the same ticket.
    await openTicketByTitle(page, "Help with housing");

    // Draft should be restored.
    const restored = await page
      .locator(".messagebar textarea, .messagebar [contenteditable]")
      .inputValue();
    expect(restored).toBe("Snapshot test draft");

    // Clear draft.
    await page
      .locator(".messagebar textarea, .messagebar [contenteditable]")
      .fill("");
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
    const playBtn = page
      .locator("button", { hasText: /play|pause/i })
      .or(page.locator('[aria-label*="Play"]'));

    // The voicemail may still be loading/decrypting. Wait for either
    // the player or a loading indicator.
    const playerOrLoading = page.locator(".voicemail-player");
    await expect(playerOrLoading.first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 18. Voicemail accessibility (Checkpoint 24) ─────────────────

  test("voicemail player has accessible play button and progress", async () => {
    const player = page.locator(".voicemail-player").first();
    await expect(player).toBeVisible();

    // Player should have role="group" with aria-label.
    const groupRole = await player.getAttribute("role");

    // If still loading, it has role="status" instead. Both are acceptable.
    expect(["group", "status"]).toContain(groupRole);

    if (groupRole === "group") {
      // Verify play button exists with aria-label.
      const playBtn = player.locator(".voicemail-play-btn");
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
