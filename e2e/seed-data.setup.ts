/**
 * Playwright setup project: seeds crypto-dependent test data.
 *
 * The server seed (global-setup.ts) creates structural data (org, user,
 * queues, clients, KB categories) but cannot create tickets or KB articles
 * because those require crypto keys that only exist after the first login.
 *
 * This setup project runs in a real browser before the test projects. It:
 * 1. Logs in (triggers Argon2id + OPRF + key derivation, creating vol_public)
 * 2. Calls devSeedTickets with handcraftedOnly (14 tickets with ECIES wraps)
 * 3. Calls devSeedKb (6 KB articles with org-key sealing)
 *
 * Both mutations are idempotent: they skip records that already exist.
 *
 * Layer 3 test suites (3a-ticket-create, 3b-ticket-lifecycle, 3c-kb-create)
 * cover the production UI create/manage flows separately.
 */

import { test as setup } from "@playwright/test";
import { CRYPTO_TIMEOUT, login } from "./helpers";

setup("seed crypto-dependent data", async ({ page }) => {
  setup.setTimeout(CRYPTO_TIMEOUT * 4);

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
    throw new Error(`Org key seeding failed: ${orgKeyResult.error}`);
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

  // 1. Seed tickets (handcrafted only, no generated bulk data)
  const ticketResult = await page.evaluate(async () => {
    const res = await fetch("/trpc/tickets.devSeedTickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handcraftedOnly: true }),
      credentials: "include",
    });
    if (!res.ok) {
      return { ok: false as const, error: await res.text() };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- tRPC response shape is known
    const data = (await res.json()) as {
      result: { data: { ticketIds: string[] } };
    };
    return { ok: true as const, count: data.result.data.ticketIds.length };
  });

  if (!ticketResult.ok) {
    throw new Error(`Ticket seeding failed: ${ticketResult.error}`);
  }
  console.log(`[e2e-seed] ${String(ticketResult.count)} tickets ready`);

  // 2. Seed KB articles
  const kbResult = await page.evaluate(async () => {
    const res = await fetch("/trpc/kb.devSeedKb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
    });
    if (!res.ok) {
      return { ok: false as const, error: await res.text() };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- tRPC response shape is known
    const data = (await res.json()) as {
      result: { data: { articleIds: string[] } };
    };
    return { ok: true as const, count: data.result.data.articleIds.length };
  });

  if (!kbResult.ok) {
    throw new Error(`KB seeding failed: ${kbResult.error}`);
  }
  console.log(`[e2e-seed] ${String(kbResult.count)} KB articles ready`);
});
