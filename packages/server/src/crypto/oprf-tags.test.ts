import { describe, it, expect } from "vitest";
import { volunteerTag, accountTag, channelTag, buildTag } from "./oprf-tags.js";
import type {
  UserId,
  ClientAccountId,
  OrgId,
  ChannelSecret,
} from "@care-y/shared";

const USER_A = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" as UserId;
const USER_B = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb" as UserId;
const ACCT_A = "cccccccc-cccc-4ccc-cccc-cccccccccccc" as ClientAccountId;
const ACCT_B = "dddddddd-dddd-4ddd-dddd-dddddddddddd" as ClientAccountId;
const ORG_A = "eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee" as OrgId;
const ORG_B = "ffffffff-ffff-4fff-ffff-ffffffffffff" as OrgId;
const CHAN_A = "chan-a-secret" as ChannelSecret;
const CHAN_B = "chan-b-secret" as ChannelSecret;

describe("volunteerTag", () => {
  it("produces volunteer: prefix", () => {
    expect(volunteerTag(USER_A)).toBe(`volunteer:${USER_A}`);
  });
});

describe("accountTag", () => {
  it("produces account: prefix", () => {
    expect(accountTag(ACCT_A)).toBe(`account:${ACCT_A}`);
  });
});

describe("channelTag", () => {
  it("produces channel:<org>:<channelId> format", () => {
    expect(channelTag(ORG_A, CHAN_A)).toBe(`channel:${ORG_A}:${CHAN_A}`);
  });
});

describe("tag injectivity", () => {
  it("different volunteer userIds produce different tags", () => {
    expect(volunteerTag(USER_A)).not.toBe(volunteerTag(USER_B));
  });

  it("different account ids produce different tags", () => {
    expect(accountTag(ACCT_A)).not.toBe(accountTag(ACCT_B));
  });

  it("different orgs with same channelId produce different tags", () => {
    expect(channelTag(ORG_A, CHAN_A)).not.toBe(channelTag(ORG_B, CHAN_A));
  });

  it("same org with different channelIds produce different tags", () => {
    expect(channelTag(ORG_A, CHAN_A)).not.toBe(channelTag(ORG_A, CHAN_B));
  });

  it("volunteer and account tags never collide for the same UUID", () => {
    const uuid = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
    expect(volunteerTag(uuid as UserId)).not.toBe(
      accountTag(uuid as ClientAccountId),
    );
  });

  it("channel tags never collide with volunteer or account tags", () => {
    const uuid = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
    const channelResult = channelTag(uuid as OrgId, uuid as ChannelSecret);
    expect(channelResult).not.toBe(volunteerTag(uuid as UserId));
    expect(channelResult).not.toBe(accountTag(uuid as ClientAccountId));
  });
});

describe("buildTag", () => {
  it("dispatches volunteer kind", () => {
    expect(buildTag({ kind: "volunteer", userId: USER_A })).toBe(
      volunteerTag(USER_A),
    );
  });

  it("dispatches account kind", () => {
    expect(buildTag({ kind: "account", accountId: ACCT_A })).toBe(
      accountTag(ACCT_A),
    );
  });

  it("dispatches channel kind", () => {
    expect(
      buildTag({ kind: "channel", orgUuid: ORG_A, channelId: CHAN_A }),
    ).toBe(channelTag(ORG_A, CHAN_A));
  });
});
