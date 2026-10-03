/**
 * Playwright setup project: seeds crypto-dependent test data.
 *
 * The server seed (global-setup.ts) creates structural data (org, admin,
 * queues, clients, KB categories) but cannot create tickets or KB articles
 * because those require crypto keys that only exist after the first login.
 *
 * This setup project runs in a real browser before the test projects. It:
 * 1. Logs in (triggers Argon2id + OPRF + key derivation, creating vol_public)
 * 2. Seeds the real org keypair through keys.devSeedOrgKey (key setup)
 * 3. Runs the Settings page dev seed, the same browser adapter a developer
 *    runs. It resets the seed tables, then replays the deterministic seed
 *    stories and the handbook story ticket through the product's own
 *    endpoints. replay-tickets.ts derives the titles specs assert on.
 * 4. Adds one ticket the admin holds no key for (LOCKED_TICKET_TITLE),
 *    through the product: a seed volunteer signs in for the first time
 *    and creates it in a queue the admin has just left, then the admin
 *    rejoins. See createLockedTicket below.
 *
 * Layer 3 test suites (3a-ticket-create, 3b-ticket-lifecycle, 3c-kb-create)
 * cover the production UI create/manage flows separately.
 */

import {
  expect,
  test as setup,
  type Browser,
  type Page,
} from "@playwright/test";
import { CRYPTO_TIMEOUT, E2eError, createTicket, login } from "./helpers";
import { LOCKED_TICKET_TITLE } from "./replay-tickets";

/**
 * Budget for the dev seed replay. It is a guess sized well above the
 * 7.6 s a full replay took in Node on an M1 laptop, since the browser
 * replay pays an HTTP round trip per mutation and runs crypto in a
 * worker. Tune it from a measured e2e setup run.
 */
const SEED_REPLAY_TIMEOUT = 600_000;

/** Org name the e2e specs assert on (shell-architecture, intake). */
const E2E_ORG_NAME = "E2E Test Org";

/**
 * The seed volunteer who creates the locked ticket. vol.crisis is a member
 * of the Crisis queue only. The replay registers every seed account with
 * the dev password (SEED_USERS in packages/client/src/lib/dev/seed-replay.ts).
 */
const LOCKED_TICKET_VOLUNTEER = "vol.crisis";
/** RoleId.VOLUNTEER and Permission.VIEW_CLIENT_PII in packages/shared/src/roles.ts;
 *  the e2e project does not import the shared package. */
const VOLUNTEER_ROLE_ID = "dXwG0zR9BtJp";
const VIEW_CLIENT_PII = "view_client_pii";
const VOLUNTEER_PASSWORD = "dev-password-1234!";
/** What the volunteer's first login sets in place of the temporary password. */
const REPLACED_VOLUNTEER_PASSWORD = "dev-password-1234!-chosen";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Calls a tRPC procedure from the page with its session cookie, as a query
 * (GET) when there is no input and as a mutation (POST) otherwise. Returns
 * the procedure's result data. Failures report the status only, never the
 * response body.
 */
async function callTrpc(
  page: Page,
  procedure: string,
  input?: Record<string, unknown>,
): Promise<unknown> {
  const outcome = await page.evaluate(
    async (args) => {
      const res = await fetch(
        `/trpc/${args.procedure}`,
        args.input === undefined
          ? { credentials: "include" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args.input),
              credentials: "include",
            },
      );
      return { status: res.status, text: await res.text() };
    },
    { procedure, input },
  );
  if (outcome.status !== 200) {
    throw new E2eError(
      `${procedure} failed with HTTP ${String(outcome.status)}`,
    );
  }
  const body: unknown = JSON.parse(outcome.text);
  if (!isRecord(body) || !isRecord(body.result)) {
    throw new E2eError(`${procedure} returned an unexpected shape`);
  }
  // A mutation that returns nothing (removeQueueMember, addQueueMember)
  // serialises as a result with no data key.
  return "data" in body.result ? body.result.data : undefined;
}

/** The signed-in account's user id, from auth.me. */
async function currentUserId(page: Page): Promise<string> {
  const data = await callTrpc(page, "auth.me");
  if (
    !isRecord(data) ||
    !isRecord(data.user) ||
    typeof data.user.id !== "string"
  ) {
    throw new E2eError("auth.me returned no user id");
  }
  return data.user.id;
}

/**
 * The Crisis queue's id. Queue names are org-key sealed, so the queue is
 * found by position. The replay creates Intake, Crisis and Housing in that
 * order on emptied tables, and each new queue sorts after the last.
 */
async function crisisQueueId(page: Page): Promise<string> {
  const data = await callTrpc(page, "tickets.listQueues");
  if (!Array.isArray(data)) {
    throw new E2eError("tickets.listQueues returned no list");
  }
  const queues = data
    .filter(isRecord)
    .flatMap((q) =>
      typeof q.id === "string" && typeof q.sortOrder === "number"
        ? [{ id: q.id, sortOrder: q.sortOrder }]
        : [],
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const crisis = queues.at(1);
  if (queues.length !== 3 || crisis === undefined) {
    throw new E2eError(
      `Expected the replay's three queues, found ${String(queues.length)}`,
    );
  }
  return crisis.id;
}

/**
 * Creates LOCKED_TICKET_TITLE, a ticket the admin can see but holds no key
 * for, using only product flows.
 *
 * A new ticket's key is wrapped for its creator and for the queue's
 * onboarded members at that moment (listQueueMemberPublicKeys). The ticket
 * list shows every ticket in the viewer's queues, so a member without a
 * wrap sees the "Locked ticket" placeholder until another member's client
 * backfills a wrap for them. The flow runs in five steps.
 *
 * 1. vol.crisis signs in for the first time. The login page sets up the
 *    account's keys, the onboarding wizard enrolls TOTP, and the account
 *    waits for the org key.
 * 2. The admin signs in again, and the admin client's auto-wrap hands the
 *    org key to the new volunteer.
 * 3. The admin leaves the Crisis queue through the queue membership
 *    endpoint the admin pages use.
 * 4. vol.crisis creates the ticket in Crisis through the new-ticket sheet,
 *    so its key is wrapped for vol.crisis alone.
 * 5. The volunteer's browser context closes before the admin rejoins
 *    Crisis. Only vol.crisis holds the key, so no client is left to
 *    backfill a wrap for the admin. global-setup.ts deletes every ticket
 *    at the start of the next run.
 */
async function createLockedTicket(
  browser: Browser,
  adminPage: Page,
): Promise<void> {
  const volContext = await browser.newContext();
  let volContextOpen = true;
  const closeVolContext = async (): Promise<void> => {
    if (!volContextOpen) return;
    volContextOpen = false;
    await volContext.close();
  };
  try {
    const volPage = await volContext.newPage();
    // An administrator-created account replaces its temporary password at
    // first sign-in. On a fresh database the replay's password is still the
    // temporary one and the wizard asks for a new one; on a database that
    // has been through this setup before, the replaced password is the one
    // that works. Try the replaced password first, then fall back.
    try {
      await login(
        volPage,
        LOCKED_TICKET_VOLUNTEER,
        REPLACED_VOLUNTEER_PASSWORD,
        {
          allowOrgKeyWait: true,
        },
      );
    } catch (error) {
      if (!(
        error instanceof E2eError && error.message.startsWith("Login failed:")
      )) {
        throw error;
      }
      await login(volPage, LOCKED_TICKET_VOLUNTEER, VOLUNTEER_PASSWORD, {
        allowOrgKeyWait: true,
        replacementPassword: REPLACED_VOLUNTEER_PASSWORD,
      });
    }
    console.log("[e2e-seed] second seed account signed in");

    // A fresh admin session runs the auto-wrap for accounts that have
    // keys but no org key yet. The volunteer's key gate polls every 5s.
    await login(adminPage);
    await volPage.locator('[role="tablist"]').waitFor({
      state: "attached",
      timeout: CRYPTO_TIMEOUT * 2,
    });
    console.log("[e2e-seed] second seed account received the org key");

    const adminId = await currentUserId(adminPage);
    const queueId = await crisisQueueId(adminPage);
    await callTrpc(adminPage, "tickets.removeQueueMember", {
      queueId,
      userId: adminId,
    });
    // Creating a ticket for a caller nobody has seen runs the phone lookup
    // relay, which takes the client PII permission. The Volunteer role
    // does not hold it by default, so the admin grants it to the role for
    // this one creation and takes it back below. Whether volunteers should
    // hold it is a product question, filed separately.
    await callTrpc(adminPage, "auth.setRolePermission", {
      roleId: VOLUNTEER_ROLE_ID,
      permission: VIEW_CLIENT_PII,
      enabled: true,
    });
    try {
      await createTicket(volPage, {
        title: LOCKED_TICKET_TITLE,
        queue: "Crisis",
        priority: "urgent",
      });
      console.log("[e2e-seed] second seed account created the locked ticket");
    } finally {
      // Close before the admin rejoins. An open volunteer client could
      // backfill a wrap for the admin once the admin is a member again.
      await closeVolContext();
      await callTrpc(adminPage, "auth.setRolePermission", {
        roleId: VOLUNTEER_ROLE_ID,
        permission: VIEW_CLIENT_PII,
        enabled: false,
      });
      await callTrpc(adminPage, "tickets.addQueueMember", {
        queueId,
        userId: adminId,
      });
    }
    console.log("[e2e-seed] admin rejoined the Crisis queue");
  } finally {
    await closeVolContext();
  }
}

setup("seed crypto-dependent data", async ({ browser, page }) => {
  setup.setTimeout(CRYPTO_TIMEOUT * 12 + SEED_REPLAY_TIMEOUT);

  // On a fresh org the app shell cannot render yet: the server seed
  // creates no wrapped_org_keys row, so the (app) layout shows the
  // key-distribution gate. allowOrgKeyWait lets login() return in that
  // state; step 0 below seeds the key and the gate resolves itself.
  await login(page, undefined, undefined, { allowOrgKeyWait: true });
  await page.waitForTimeout(1_000);

  // 0. Seed the real org keypair + wrapped entry for the admin.
  // The server seed creates a throwaway org_public_key (secret zeroed)
  // but no wrapped_org_keys row. This mutation generates a real keypair,
  // wraps the secret to the admin's vol_public, and stores both.
  // Subsequent logins will find the wrapped key via getWrappedOrgKey.
  const orgKeyResult = await page.evaluate(async () => {
    const res = await fetch("/trpc/keys.devSeedOrgKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
    });
    if (!res.ok) {
      return { ok: false as const, error: await res.text() };
    }
    return { ok: true as const };
  });

  if (!orgKeyResult.ok) {
    throw new E2eError(`Org key seeding failed: ${orgKeyResult.error}`);
  }
  console.log("[e2e-seed] org keypair + wrapped key ready");

  // The gate polls getWrappedOrgKey every 5s; the seeded key ends the
  // wait and the shell renders. This also proves the seeded key is
  // unwrappable before downstream projects depend on it.
  await page.locator('[role="tablist"]').waitFor({
    state: "attached",
    timeout: CRYPTO_TIMEOUT,
  });
  console.log("[e2e-seed] app shell rendered with seeded org key");

  // 1. Open Settings in-app. A full page load would drop the in-memory
  // keys the replay encrypts with. This project runs at a desktop width
  // (Desktop Chrome in playwright.config.ts), where Settings sits in the
  // sidebar's user section.
  await page
    .getByRole("navigation", { name: "Sidebar navigation" })
    .getByRole("button", { name: "Settings" })
    .click();
  await expect(page).toHaveURL("/more/settings", { timeout: CRYPTO_TIMEOUT });

  // 2. Run the dev seed. The page shows "Seed data created." when the
  // replay finishes and the replay's error message when it throws, so
  // wait for whichever comes first.
  const seedButton = page.getByRole("button", { name: "Seed Dev Data" });
  await seedButton.click({ timeout: CRYPTO_TIMEOUT });
  console.log("[e2e-seed] seed replay started");

  const done = page.getByText("Seed data created.", { exact: true });
  const failed = page.locator(".dev-seed-error");
  await expect(done.or(failed)).toBeVisible({ timeout: SEED_REPLAY_TIMEOUT });
  if (await failed.isVisible()) {
    const reason = (await failed.textContent()) ?? "(no message)";
    throw new E2eError(`Seed replay failed: ${reason}`);
  }
  console.log("[e2e-seed] seed replay complete");

  // 3. The replay sets the org name to its own branding. Put back the name
  // global-setup.ts gives the e2e org, through the same branding mutation
  // the settings pages use.
  const nameResult = await page.evaluate(async (name) => {
    const res = await fetch("/trpc/branding.saveBrandingField", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "name", value: name }),
      credentials: "include",
    });
    if (!res.ok) {
      return { ok: false as const, error: await res.text() };
    }
    return { ok: true as const };
  }, E2E_ORG_NAME);

  if (!nameResult.ok) {
    throw new E2eError(
      `Restoring the e2e org name failed: ${nameResult.error}`,
    );
  }
  console.log("[e2e-seed] e2e org name restored");

  // 4. A ticket the admin can see but cannot open.
  await createLockedTicket(browser, page);
});
