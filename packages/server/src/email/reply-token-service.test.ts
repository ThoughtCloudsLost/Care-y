import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  mintToken,
  resolveToken,
  revokeTokensForTicket,
} from "./reply-token-service.js";
import {
  createReplyTokenHasher,
  deriveReplyTokenIndexKey,
} from "../crypto/field-encryptor.js";
import {
  createTestDb,
  createTestTicketFixture,
  TEST_OPS_KEY,
  type TestTicketFixture,
} from "../test-utils.js";
import { ReplyTokenError } from "../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

describe.skipIf(!process.env.DATABASE_URL)("reply-token-service", () => {
  let db: Kysely<TenantDatabase>;
  let cleanup: () => Promise<void>;
  let fixture: TestTicketFixture;
  const hasher = createReplyTokenHasher(deriveReplyTokenIndexKey(TEST_OPS_KEY));

  beforeAll(async () => {
    const t = await createTestDb();
    db = t.db;
    cleanup = t.cleanup;
    fixture = await createTestTicketFixture(db);
  });

  afterAll(async () => {
    await cleanup();
  });

  it("mintToken returns a 26-char lowercase base32 token", async () => {
    const result = await mintToken(db, fixture.ticketId, hasher);
    expect(result.token).toMatch(/^[a-z2-7]{26}$/);
    expect(result.tokenId).toBeDefined();
  });

  it("resolveToken round-trips a freshly minted token", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const ticketId = await resolveToken(token, db, hasher);
    expect(ticketId).toBe(fixture.ticketId);
  });

  it("resolveToken rejects an unknown token", async () => {
    await expect(
      resolveToken("aaaaaaaabbbbbbbbccccccccdd", db, hasher),
    ).rejects.toThrow(ReplyTokenError);
  });

  it("re-minting revokes the prior row", async () => {
    const first = await mintToken(db, fixture.ticketId, hasher);
    const second = await mintToken(db, fixture.ticketId, hasher);

    // The old token is now revoked
    await expect(resolveToken(first.token, db, hasher)).rejects.toThrow(
      ReplyTokenError,
    );

    // The new token resolves
    const ticketId = await resolveToken(second.token, db, hasher);
    expect(ticketId).toBe(fixture.ticketId);
  });

  it("revokeTokensForTicket revokes all live tokens", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);

    const count = await revokeTokensForTicket(db, fixture.ticketId);
    expect(count).toBe(1);

    await expect(resolveToken(token, db, hasher)).rejects.toThrow(
      ReplyTokenError,
    );
  });

  it("revokeTokensForTicket returns 0 when no live tokens exist", async () => {
    // All tokens were revoked in the previous test
    const count = await revokeTokensForTicket(db, fixture.ticketId);
    expect(count).toBe(0);
  });
});
