import { test, expect, type Frame, type Page } from "@playwright/test";

// The unit and smoke suites boot the engine under Node, bypassing the
// entry modules and the browser's module loading. These tests load the
// real pages and fail on any uncaught error or console error, and on an
// engine that never reports ready.

const ENGINE_BOOT_TIMEOUT_MS = 60_000;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    errors.push(err.stack ?? err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function waitForEngineReady(target: Page | Frame): Promise<void> {
  await target.waitForFunction(
    () => performance.getEntriesByName("demo-engine-ready").length > 0,
    undefined,
    { timeout: ENGINE_BOOT_TIMEOUT_MS },
  );
}

test("phone page boots the engine and shows the sign-in form", async ({
  page,
}) => {
  const errors = collectErrors(page);

  await page.goto("/phone.html");
  await waitForEngineReady(page);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("handbook page boots the simulator it embeds", async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto("/");
  const phone = page.frameLocator('iframe[src*="phone.html"]');
  await expect(phone.getByRole("button", { name: "Sign in" })).toBeVisible({
    timeout: ENGINE_BOOT_TIMEOUT_MS,
  });
  const phoneFrame = page
    .frames()
    .find((frame) => frame.url().includes("phone.html"));
  expect(phoneFrame).toBeDefined();
  if (phoneFrame !== undefined) await waitForEngineReady(phoneFrame);

  expect(errors).toEqual([]);
});
