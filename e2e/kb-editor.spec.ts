import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login, navigateToNewArticle } from "./helpers";

const SUFFIX = String(Date.now()).slice(-6);
const TEST_ARTICLE_TITLE = `E2E Article ${SUFFIX}`;

test.describe.serial("KB Editor (Create/Edit, Categories, ATAG)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("recently updated")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "kb-editor");
    await page.close();
  });

  // ── 1. Article creation flow ────────────────────────────────────

  test("navigate to Library tab with seeded articles", async () => {
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library");

    // Wait for article list to load with decrypted titles.
    // "Intake call checklist" is a seeded article with org-key encryption.
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("create: navigate to /library/new", async () => {
    await navigateToNewArticle(page);
  });

  test("create: toolbar is visible with formatting buttons", async () => {
    // Wait for the editor to mount and populate the bridge.
    // EditorToolbar renders inside the subnavbar or keyboard-docked toolbar.
    // On desktop (hover-capable), it appears in the subnavbar.
    await expect(page.getByRole("button", { name: "Bold" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "Italic" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Heading" })).toBeVisible();
  });

  test("create: Publish button is disabled until title and category set", async () => {
    // The Publish button (Save icon) should be visually disabled.
    const publishBtn = page.getByRole("button", { name: "Publish" });
    await expect(publishBtn).toBeVisible();
    await expect(publishBtn).toHaveClass(/opacity-40|pointer-events-none/);
  });

  test("create: enter title and select category", async () => {
    // Fill the title input.
    const titleInput = page.getByPlaceholder("Article title");
    await titleInput.fill(TEST_ARTICLE_TITLE);

    // Open category selector. It's a Konsta ListItem that opens a ShellPopover.
    // The row shows "Category" as title and "Select category" as the after text.
    const catRow = page.getByText("Select category");
    await catRow.click();

    // Pick "Procedures" from the popover list of decrypted category names.
    // Wait for the popover to appear, then click the category.
    await expect(page.getByText("Procedures").last()).toBeVisible({
      timeout: 5_000,
    });
    await page.getByText("Procedures").last().click();
  });

  test("create: type body text in editor", async () => {
    // Click into the ProseMirror editor area to focus it.
    const editorArea = page.locator("[role='textbox'][aria-multiline='true']");
    await editorArea.click();

    // ProseMirror uses contenteditable, not <input>. Use keyboard.type().
    await page.keyboard.type("This is a test article created by E2E tests.");
  });

  test("create: apply bold formatting via keyboard shortcut", async () => {
    // Press Enter for a new line, then type bold text.
    await page.keyboard.press("Enter");
    await page.keyboard.press("ControlOrMeta+b");
    await page.keyboard.type("Bold section");
    await page.keyboard.press("ControlOrMeta+b"); // toggle off

    // The bold toolbar button should have been active while typing bold.
    // Verify the text was typed.
    await expect(page.locator("[role='textbox']")).toContainText(
      "Bold section",
    );
  });

  test("create: apply heading via keyboard", async () => {
    // Press Enter twice for a new block. The editor is still focused
    // from the previous test.
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // On desktop, the subnavbar toolbar is hidden when the editor is
    // focused (editorFocused=true hides it, keyboard-docked toolbar is
    // display:none on hover-capable devices). Blur the editor first by
    // clicking the title input, then re-enter the editor after clicking
    // the heading button. Alternatively, just use keyboard shortcuts.
    // The heading cycle command is not mapped to a keyboard shortcut by
    // default, so we blur, click the toolbar, then re-focus.
    await page.getByPlaceholder("Article title").click();

    const headingBtn = page.getByRole("button", { name: "Heading" });
    await expect(headingBtn).toBeVisible({ timeout: 5_000 });
    await headingBtn.click();

    // Re-focus editor and type heading text.
    const editorArea = page.locator("[role='textbox'][aria-multiline='true']");
    await editorArea.click();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.type("Test Heading");
  });

  test("create: publish the article", async () => {
    // Blur the editor so the navbar is fully interactive.
    await page.getByPlaceholder("Article title").click();

    // The Publish button should now be enabled (title + category set).
    const publishBtn = page.getByRole("button", { name: "Publish" });
    await expect(publishBtn).toBeVisible({ timeout: 5_000 });
    await publishBtn.click();

    // After publish, should navigate back to the library.
    await expect(page).toHaveURL("/library", { timeout: 15_000 });

    // The new article should appear in the list.
    await expect(page.getByText(TEST_ARTICLE_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 2. Article edit flow ────────────────────────────────────────

  test("edit: navigate to article detail and tap Edit", async () => {
    // Tap the article we just created.
    await page.getByText(TEST_ARTICLE_TITLE).click();

    // Should navigate to article detail.
    await expect(page).toHaveURL(/\/library\/.+/);

    // Wait for decrypted title to render.
    await expect(page.locator("h1").getByText(TEST_ARTICLE_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Tap the edit button (pencil icon) in the navbar.
    const editBtn = page.getByRole("button", { name: "Edit article" });
    await editBtn.click();

    // Should navigate to the edit page.
    await expect(page).toHaveURL(/\/library\/.+\/edit/);
  });

  test("edit: editor loads with existing content", async () => {
    // Wait for the editor to load with decrypted content.
    const editorArea = page.locator("[role='textbox'][aria-multiline='true']");
    await expect(editorArea).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The body should contain the text we wrote during creation.
    await expect(editorArea).toContainText(
      "This is a test article created by E2E tests.",
      { timeout: CRYPTO_TIMEOUT },
    );
  });

  test("edit: modify content and save", async () => {
    // Click into the editor and append text.
    const editorArea = page.locator("[role='textbox'][aria-multiline='true']");
    await editorArea.click();

    // Move to end of document.
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Added during edit.");

    // Blur the editor so the navbar save button becomes visible
    // (editorFocused hides the subnavbar toolbar on desktop, and the
    // navbar buttons are rendered separately from the toolbar).
    // The save button (Save icon) is in the navbar right snippet.
    // Click the title input to blur the editor while keeping the page.
    await page.getByPlaceholder("Article title").click();

    // Save the article. On the edit page, the button label is "Save"
    // (not "Publish" like the create page).
    const saveBtn = page.getByRole("button", { name: "Save" });
    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    await saveBtn.click();

    // Should navigate back (to article detail or library).
    await expect(page).toHaveURL(/\/library/, { timeout: 15_000 });
  });

  test("edit: saved changes are visible on article detail", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // Navigate to the article detail to verify saved changes.
    // If we're on the library list, tap the article.
    if (page.url().endsWith("/library")) {
      await page.getByText(TEST_ARTICLE_TITLE).click();
      await expect(page).toHaveURL(/\/library\/.+/);
    }

    // Wait for the rendered article body.
    await expect(page.getByText("Added during edit.")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Navigate back to library for subsequent tests.
    const backBtn = page.getByRole("button", {
      name: /back to knowledge base/i,
    });
    await expect(backBtn).toBeVisible({ timeout: 5_000 });
    await backBtn.click();
    await expect(page).toHaveURL("/library");
  });

  // ── 3. ATAG accessibility checks ───────────────────────────────

  test("atag: seeded article with a11y violations shows issues", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // Open the "Accessibility issues example" article (seeded with violations).
    await page.getByText("Accessibility issues example").click();
    await expect(page).toHaveURL(/\/library\/.+/);
    await expect(
      page.locator("h1").getByText("Accessibility issues example"),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Tap the edit button to open the editor.
    const editBtn = page.getByRole("button", { name: "Edit article" });
    await editBtn.click();
    await expect(page).toHaveURL(/\/library\/.+\/edit/);

    // Wait for ProseMirror to mount and render decrypted content.
    // The editor-area div gets role=textbox immediately, but ProseMirror
    // creates a .ProseMirror child only after onMount + doc parsing.
    const pmContent = page.locator(".ProseMirror");
    await expect(pmContent).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(pmContent).toContainText("About this article", {
      timeout: CRYPTO_TIMEOUT * 2,
    });
  });

  test("atag: toggle a11y check shows issue count badge", async () => {
    // The a11y toggle is in the tabbar override (Accessibility icon).
    const a11yBtn = page.getByRole("button", {
      name: /show accessibility issues/i,
    });
    await a11yBtn.click();

    // After toggling, the badge should show a non-zero count.
    // The seeded article has heading skips, empty headings, missing alt,
    // and generic link text. That totals 10+ violations.
    const badge = page.locator(".a11y-badge");
    await expect(badge).toBeVisible({ timeout: 5_000 });

    // Badge should contain a number > 0.
    const badgeText = await badge.textContent();
    expect(Number(badgeText)).toBeGreaterThan(0);
  });

  test("atag: toggle off hides decorations", async () => {
    // Toggle a11y check off.
    const a11yBtn = page.getByRole("button", {
      name: /hide accessibility issues/i,
    });
    await a11yBtn.click();

    // Badge should disappear or show 0 when a11y is hidden.
    // Actually the badge still shows the count but the decorations are hidden.
    // The button label changes back to "Show accessibility issues".
    await expect(
      page.getByRole("button", { name: /show accessibility issues/i }),
    ).toBeVisible();
  });

  test("atag: leave edit page without saving", async () => {
    // Cancel out of the edit page. Since we didn't modify content,
    // the navigation guard should not trigger.
    // Use .first() to target the navbar Cancel (there may be multiple
    // Cancel buttons in hidden overlay elements like Dialog).
    const cancelBtn = page.getByRole("button", { name: "Cancel" }).first();
    await cancelBtn.click();

    // Should navigate back to the article detail.
    await expect(page).toHaveURL(/\/library\/.+/);

    // Go back to library list.
    const backBtn = page.getByRole("button", {
      name: /back to knowledge base/i,
    });
    await backBtn.click();
    await expect(page).toHaveURL("/library");
  });

  // ── 4. Category management ─────────────────────────────────────

  test("category: gear button visible for admin/manager", async () => {
    // SPA navigation to preserve crypto Worker state.
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The dev auto-login user is an admin, so the gear button should appear.
    const gearBtn = page.getByRole("button", {
      name: "Manage categories",
    });
    await expect(gearBtn).toBeVisible({ timeout: 5_000 });
  });

  test("category: open management sheet", async () => {
    const gearBtn = page.getByRole("button", {
      name: "Manage categories",
    });
    await expect(gearBtn).toBeVisible();
    // The manage button sits in the subnavbar toolbar, which the sticky
    // Navbar (z-20) can cover. Dispatch click directly on the element
    // to bypass coordinate-based hit testing.
    await gearBtn.dispatchEvent("click");

    // The ShellSheet should show "Manage Categories" title.
    await expect(page.getByText("Manage Categories")).toBeVisible({
      timeout: 5_000,
    });

    // Should list the seeded categories with decrypted names.
    await expect(page.getByText("Procedures").first()).toBeVisible();
    await expect(page.getByText("Resources").first()).toBeVisible();
    await expect(page.getByText("Safety").first()).toBeVisible();
  });

  test("category: create a new category", async () => {
    // Tap "Add Category" button inside the sheet.
    await page.getByText("Add Category").click();

    // The add form appears with Konsta ListInput fields.
    // Target the last visible input in the sheet.
    const nameInput = page.locator("input").last();
    await expect(nameInput).toBeVisible({ timeout: 3_000 });
    await nameInput.fill(`E2E Cat ${SUFFIX}`);

    // Save the new category. Scope to the sheet overlay to avoid
    // hitting the hidden filter sheet's Save button.
    const sheet = page.locator(".shell-sheet-content").last();
    await sheet.getByRole("button", { name: "Save" }).click();

    // The new category should appear in the list after cache refresh.
    // Use .first() because the name may also appear in an overlay element.
    await expect(page.getByText(`E2E Cat ${SUFFIX}`).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  // Category rename and delete tests are deferred. The category sheet's
  // inline edit form and cache invalidation timing (SSE 404 in the test
  // environment prevents real-time updates) make these tests flaky.
  // The create flow above verifies the core category management path.

  test("category: dismiss management sheet", async () => {
    // The category management sheet is still open from the previous test.
    // Dismiss it first, then navigate via SPA (preserves crypto Worker).
    await page.keyboard.press("Escape");
    // Wait for the sheet close animation and any toast to auto-dismiss.
    await page
      .locator(".k-toast")
      .waitFor({ state: "hidden", timeout: 5_000 })
      .catch(() => undefined);
    await page.waitForTimeout(500);
    await page.getByRole("tab", { name: "Home" }).click({ force: true });
    await expect(page).toHaveURL("/");
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 5. Unsaved changes guard ───────────────────────────────────

  test("discard dialog appears when canceling with unsaved changes", async () => {
    await navigateToNewArticle(page);

    // Type some content so the editor is dirty.
    const titleInput = page.getByPlaceholder("Article title");
    await titleInput.fill("Unsaved article");

    // Tap Cancel (navbar, first visible).
    const cancelBtn = page.getByRole("button", { name: "Cancel" }).first();
    await cancelBtn.click();

    // The discard dialog should appear.
    await expect(page.getByText("Discard changes?")).toBeVisible({
      timeout: 3_000,
    });
  });

  test("discard dialog: discard navigates away", async () => {
    // The discard dialog from the previous test is open.
    // Tap "Discard" to confirm and navigate away.
    // Konsta DialogButton renders inside a div with specific Konsta
    // classes. Target the "Discard" text directly.
    const discardBtn = page.getByText("Discard", { exact: true });
    await expect(discardBtn).toBeVisible({ timeout: 3_000 });
    await discardBtn.click();

    // Should navigate back to library.
    await expect(page).toHaveURL("/library", { timeout: 5_000 });
  });

  // ── 6. Accessibility audits ────────────────────────────────────

  test("a11y: new article page passes axe-core audit", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 6);
    await navigateToNewArticle(page);

    // Wait for toolbar to render.
    await expect(page.getByRole("button", { name: "Bold" })).toBeVisible({
      timeout: 10_000,
    });

    // Exclude known framework-level violations:
    // - tablist: Konsta UI internal (children role mismatch)
    // - listbox: Konsta sort/filter popover structure
    // - listitem: Konsta List renders <li> outside <ul> in some contexts
    // - meta-viewport: ArticleEditor sets maximum-scale=1 (intentional,
    //   prevents iOS auto-zoom on contenteditable which breaks keyboard
    //   toolbar positioning)
    let violations: unknown[] = [];
    try {
      const results = await new AxeBuilder({ page })
        .setLegacyMode(true)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude("[role='tablist']")
        .exclude("[role='listbox']")
        .disableRules(["listitem", "meta-viewport"])
        .analyze();
      violations = results.violations;
    } finally {
      // Clean up: dismiss the dirty editor so subsequent tests start from /library.
      // Cancel opens a discard dialog whose Discard button triggers navigation,
      // which detaches the button mid-click. Use dispatchEvent to bypass
      // visibility and stability checks.
      if (!page.isClosed()) {
        const cancelBtn = page.getByRole("button", { name: "Cancel" }).first();
        await cancelBtn.dispatchEvent("click");
        const discardBtn = page.getByText("Discard", { exact: true });
        if (await discardBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await discardBtn.dispatchEvent("click");
        }
        await expect(page).toHaveURL("/library", { timeout: 5_000 });
      }
    }
    expect(violations).toEqual([]);
  });

  test("a11y: category management sheet passes axe-core audit", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    // Navigate fresh to /library regardless of prior state. The previous test
    // may leave overlays or stale DOM that blocks article rendering.
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Open category management sheet.
    const gearBtn = page.getByRole("button", {
      name: "Manage categories",
    });
    // Same navbar coverage issue as the earlier test. Dispatch directly.
    await gearBtn.dispatchEvent("click");
    await expect(page.getByText("Manage Categories")).toBeVisible({
      timeout: 5_000,
    });

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[role='tablist']")
      .exclude("[role='listbox']")
      .disableRules(["listitem", "meta-viewport"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
