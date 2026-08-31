/**
 * CI smoke test for the client-portal seed.
 *
 * Boots the real engine against PGlite and drives the seeded surfaces
 * through the same procedures the browser calls. The point is the parts
 * a type check cannot reach: whether the form ciphertext the seeder wrote
 * is the ciphertext the client can open, whether the published password
 * re-derives the account keys, and whether the engine's fabricated HTTP
 * surface carries a session cookie both ways.
 *
 * Uses vitest.smoke.config.ts (Node environment) because PGlite and the
 * server modules both need Node APIs.
 */

import { describe, it, expect, beforeAll } from "vitest";
import _sodium from "libsodium-wrappers-sumo";
import { Buffer } from "buffer";

import {
  decode,
  deriveAccountKey,
  deriveChannelAuth,
  deriveChannelId,
  deriveClientAccountKeys,
  derivePortalKeypairFromOprf,
  encode,
  oprfBlind,
  oprfFinalize,
  portalOprfInput,
  toRistrettoPoint,
  toSalt,
} from "@care-y/crypto";
import { decryptFieldContent } from "$lib/portal/intake-form-crypto.js";

import type { DemoEngineResult } from "./engine.js";
import { bootDemoEngine } from "./engine.js";
import type { Context } from "../../../../server/src/trpc/context.js";
import { isTrpcServerError } from "./caller-adapter.js";

/**
 * Minimal typed view of the procedures this test drives. The caller is a
 * recursive tRPC proxy with no enumerable keys, so the shape has to be
 * declared rather than inferred across the dynamic-import boundary.
 */
interface PortalCaller {
  clientPortal: {
    getIntakeForm(input?: { slug?: string }): Promise<{
      formId: string | null;
      fields:
        | readonly {
            fieldKey: string;
            encryptedLabel: string;
            encryptedConfig: string;
          }[]
        | null;
      formClosed: boolean;
      intakeDisabled: boolean;
    }>;
    portalBootstrap(input: {
      channelId: string;
      auth: string;
    }): Promise<{ messages: readonly unknown[]; ticketId: string | null }>;
    getAccountSalt(input: {
      username: string;
    }): Promise<{ salt: string; accountId: string }>;
    accountLogin(input: {
      accountId: string;
      authToken: string;
    }): Promise<unknown>;
    accountBootstrap(): Promise<{
      messages: readonly unknown[];
      accountCreatedAt: string;
    }>;
    accountLogout(): Promise<unknown>;
    openShare(input: { shareId: string }): Promise<{ status: string }>;
    evaluateChannelOprf(input: {
      channelId: string;
      blindedElement: string;
      auth?: string;
    }): Promise<{ evaluated: string }>;
  };
  intakeForms: {
    list(): Promise<readonly { id: string; slug: string | null }[]>;
    listResponses(input: { formId: string; pageSize?: number }): Promise<{
      total: number;
      // Both wraps are asserted null or non-null only, never destructured,
      // so unknown carries the whole contract this test needs.
      rows: readonly {
        ticketId: string;
        callerKeyWrap: unknown;
        orgSealWrap: unknown;
      }[];
    }>;
  };
  oprf: {
    evaluate(input: {
      kind: "volunteer" | "account";
      userId: string;
      blindedElement: string;
    }): Promise<{ evaluated: string }>;
  };
}

describe("client portal seed", () => {
  let engine: DemoEngineResult;
  let caller: PortalCaller;

  beforeAll(async () => {
    engine = await bootDemoEngine();
    caller = (engine.callerFactory as (ctx: Context) => PortalCaller)(
      engine.adminCtx,
    );
  }, 180_000);

  it("seeds a custom form the real client can decrypt", async () => {
    const form = await caller.clientPortal.getIntakeForm({
      slug: "ask-for-help",
    });

    expect(form.intakeDisabled).toBe(false);
    expect(form.formClosed).toBe(false);
    expect(form.formId).toBe(engine.portal.customFormId);
    expect(form.fields).not.toBeNull();

    const fields = form.fields ?? [];
    // Every field opens under the public-branding key with the AAD the
    // client uses. A drift in either would fail here rather than showing
    // a visitor an empty form.
    const decrypted = fields.map((f) =>
      decryptFieldContent(
        {
          encryptedLabel: f.encryptedLabel,
          encryptedConfig: f.encryptedConfig,
        },
        engine.seedResult.orgPublicKey,
      ),
    );

    // Both locales on every label, so the language picker has something
    // to switch between.
    for (const d of decrypted) {
      expect(d.label.en).toBeDefined();
      expect(d.label.es).toBeDefined();
    }

    const types = decrypted.map((d) => d.config.type);
    expect(types).toContain("richText");
    expect(types).toContain("pageBreak");
    expect(types).toContain("select");
    expect(types).toContain("textarea");

    // At least one grouped visibility condition survives the round trip.
    const gated = decrypted.filter((d) => d.visibleWhen !== undefined);
    expect(gated.length).toBeGreaterThanOrEqual(2);
    expect(gated[0]?.visibleWhen?.version).toBe(2);
  }, 60_000);

  it("reports the sibling form as closed", async () => {
    const form = await caller.clientPortal.getIntakeForm({
      slug: "winter-shelter",
    });
    expect(form.formClosed).toBe(true);
  }, 30_000);

  it("opens the seeded Secure Link thread from its fragment alone", async () => {
    // The fragment is the whole credential: derive the channel id and the
    // auth token from it exactly as the portal page does on load.
    const seed = decode(engine.portal.portalFragment);
    expect(deriveChannelId(seed)).toBe(engine.portal.portalChannelId);

    const auth = deriveChannelAuth(seed);
    const result = await caller.clientPortal.portalBootstrap({
      channelId: engine.portal.portalChannelId,
      auth: encode(auth),
    });

    // One message each way.
    expect(result.messages).toHaveLength(2);
    expect(result.ticketId).not.toBeNull();

    // The key check opens under the OPRF-derived keypair: blind the seed,
    // evaluate through the channel OPRF procedure, finalize, derive.
    const oprfInput = portalOprfInput(seed);
    const { blindedElement, blindState } = oprfBlind(oprfInput);
    const channelEvalResult = await caller.clientPortal.evaluateChannelOprf({
      channelId: engine.portal.portalChannelId,
      blindedElement: encode(blindedElement),
      auth: encode(auth),
    });
    const channelOprfOutput = oprfFinalize(
      blindState,
      toRistrettoPoint(decode(channelEvalResult.evaluated)),
      oprfInput,
    );
    const keypair = derivePortalKeypairFromOprf(channelOprfOutput);
    expect(keypair.clientPublic).toHaveLength(32);
    _sodium.memzero(oprfInput);
    _sodium.memzero(channelOprfOutput);
    _sodium.memzero(keypair.clientPrivate);
  }, 60_000);

  it("signs in to the seeded account and reads the thread back", async () => {
    const authToken = await deriveSeededAccountAuthToken(engine, caller);

    await caller.clientPortal.accountLogin({
      accountId: engine.portal.accountId,
      authToken: encode(authToken),
    });

    // The cookie the login wrote has to come back on the next call, which
    // is the whole reason the engine's fabricated request carries a jar.
    const bootstrap = await caller.clientPortal.accountBootstrap();
    expect(bootstrap.accountCreatedAt).toEqual(expect.any(String));
    expect(Array.isArray(bootstrap.messages)).toBe(true);
  }, 120_000);

  it("clears the session cookie on logout", async () => {
    // Ordering note: this runs after the sign-in case above and consumes
    // the session it established.
    await caller.clientPortal.accountLogout();

    await expect(caller.clientPortal.accountBootstrap()).rejects.toSatisfy(
      (err: unknown) => isTrpcServerError(err) && err.code === "UNAUTHORIZED",
    );
  }, 60_000);

  it("seeds intake responses including one nobody holds a key for", async () => {
    const page = await caller.intakeForms.listResponses({
      formId: engine.portal.customFormId,
      pageSize: 50,
    });

    expect(page.total).toBe(engine.portal.responseTicketIds.length);

    const denied = page.rows.find(
      (r) => r.ticketId === engine.portal.keyNotHeldTicketId,
    );
    expect(denied).toBeDefined();
    expect(denied?.callerKeyWrap).toBeNull();
    expect(denied?.orgSealWrap).toBeNull();

    // Every other row is readable, so the viewer shows a real contrast
    // rather than a page of failures.
    const readable = page.rows.filter(
      (r) => r.ticketId !== engine.portal.keyNotHeldTicketId,
    );
    expect(readable.length).toBeGreaterThan(0);
    for (const row of readable) {
      expect(row.orgSealWrap).not.toBeNull();
    }
  }, 60_000);

  it("seeds a share link that has not been opened", async () => {
    const result = await caller.clientPortal.openShare({
      shareId: engine.portal.shareId,
    });
    expect(result.status).toBe("ready");

    // One-time by construction: the second read finds it consumed.
    const second = await caller.clientPortal.openShare({
      shareId: engine.portal.shareId,
    });
    expect(second.status).toBe("opened");
  }, 60_000);
});

/**
 * Re-run the browser's account login derivation against the published
 * credentials: salt from the server, Argon2id, blind, evaluate through the
 * real OPRF procedure, finalize, derive.
 *
 * Deliberately goes through getAccountSalt and oprf.evaluate rather than
 * reusing anything the seeder computed, so a seed that wrote the wrong
 * salt or evaluated under a different scalar fails here.
 */
async function deriveSeededAccountAuthToken(
  engine: DemoEngineResult,
  caller: PortalCaller,
): Promise<Uint8Array> {
  await _sodium.ready;

  const { salt, accountId } = await caller.clientPortal.getAccountSalt({
    username: engine.portal.accountUsername,
  });
  expect(accountId).toBe(engine.portal.accountId);

  const stretched = deriveAccountKey(
    new TextEncoder().encode(engine.portal.accountPassword),
    toSalt(Buffer.from(salt, "base64url")),
  );
  const { blindedElement, blindState } = oprfBlind(stretched);
  const { evaluated } = await caller.oprf.evaluate({
    kind: "account",
    userId: accountId,
    blindedElement: encode(blindedElement),
  });
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(decode(evaluated)),
    stretched,
  );
  return deriveClientAccountKeys(oprfOutput).authToken;
}
