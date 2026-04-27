import { describe, expect, it } from "vitest";
import {
  authKeys,
  ticketsKeys,
  ticketKeys,
  kbKeys,
  adminKeys,
  queueKeys,
  volunteerKeys,
  noteTypeKeys,
  presetKeys,
  consultantKeys,
  orgKeyKeys,
  notificationKeys,
} from "./keys";

describe("query key factories", () => {
  describe("follow-up hierarchy (regression guard)", () => {
    const prefix = ticketKeys.followUps("t-1");

    it("followUpsByIds lives under the followUps prefix", () => {
      const key = ticketKeys.followUpsByIds("t-1", "fu-a,fu-b");
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });

    it("followUpSummary lives under the followUps prefix", () => {
      const key = ticketKeys.followUpSummary("t-1", ["type"], [], true);
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });

    it("followUpsInitial lives under the followUps prefix", () => {
      const key = ticketKeys.followUpsInitial("t-1");
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });

    it("followUpsPage lives under the followUps prefix", () => {
      const key = ticketKeys.followUpsPage("t-1", "cursor-1");
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });

    it("followUpsFiltered lives under the followUps prefix", () => {
      const key = ticketKeys.followUpsFiltered("t-1", ["sms"], true);
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });

    it("followUpsNotes lives under the followUps prefix", () => {
      const key = ticketKeys.followUpsNotes("t-1");
      expect(key.slice(0, prefix.length)).toEqual(prefix);
    });
  });

  describe("tickets vs ticket namespace separation", () => {
    it("ticketsKeys.all and ticketKeys.all produce different prefixes", () => {
      expect(ticketsKeys.all[0]).toBe("tickets");
      expect(ticketKeys.all("t-1")[0]).toBe("ticket");
    });
  });

  // Cache invalidation depends on these exact prefixes. Changing a key
  // shape without updating invalidateQueries calls causes stale-data bugs.
  describe("key shapes", () => {
    it("authKeys.me", () => {
      expect(authKeys.me()).toEqual(["auth", "me"]);
    });

    it("ticketsKeys.list includes params", () => {
      const params = { status: "open", limit: 25 };
      expect(ticketsKeys.list(params)).toEqual(["tickets", "list", params]);
    });

    it("ticketKeys.detail is an alias for ticketKeys.all", () => {
      expect(ticketKeys.detail("t-1")).toEqual(ticketKeys.all("t-1"));
    });

    it("kbKeys.vote includes articleId", () => {
      expect(kbKeys.vote("a-1")).toEqual(["kb", "vote", "a-1"]);
    });

    it("adminKeys.telephonyConfig nests under telephony", () => {
      const config = adminKeys.telephonyConfig();
      const parent = adminKeys.telephony();
      expect(config.slice(0, parent.length)).toEqual(parent);
    });

    it("queueKeys.members includes queueId", () => {
      expect(queueKeys.members("q-1")).toEqual(["queue-members", "q-1"]);
    });

    it("noteTypeKeys.full extends all", () => {
      expect(noteTypeKeys.full()).toEqual(["noteTypes", "all"]);
    });

    it("ticketKeys.followupAttachments nests under attachments", () => {
      const key = ticketKeys.followupAttachments("t-1", "fu-1");
      const parent = ticketKeys.attachments("t-1");
      expect(key.slice(0, parent.length)).toEqual(parent);
    });

    it("ticketKeys.isWatching nests under ticket", () => {
      const key = ticketKeys.isWatching("t-1");
      const parent = ticketKeys.all("t-1");
      expect(key.slice(0, parent.length)).toEqual(parent);
    });

    it("static keys", () => {
      expect(volunteerKeys.all).toEqual(["volunteers"]);
      expect(consultantKeys.all).toEqual(["consultant"]);
      expect(orgKeyKeys.wrappedOrgKey()).toEqual(["keys", "wrappedOrgKey"]);
      expect(notificationKeys.all).toEqual(["notifications"]);
      expect(presetKeys.byQueue("q-1")).toEqual(["presets", "q-1"]);
    });
  });
});
