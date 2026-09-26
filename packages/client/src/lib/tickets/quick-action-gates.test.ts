import { describe, it, expect } from "vitest";
import {
  CLIENT_CHANNEL_PERMISSIONS,
  PROCEDURE_PERMISSIONS,
  type Permission,
} from "@care-y/shared";
import { allowedQuickActions } from "./quick-action-gates.js";

function allowed(...permissions: Permission[]): string[] {
  return [...allowedQuickActions(new Set(permissions))].sort();
}

describe("allowedQuickActions", () => {
  it("allows nothing on an empty permission set", () => {
    expect(allowed()).toEqual([]);
  });

  it.each([
    ["portal", CLIENT_CHANNEL_PERMISSIONS.portal],
    ["sms", CLIENT_CHANNEL_PERMISSIONS.sms],
    ["email", CLIENT_CHANNEL_PERMISSIONS.email],
  ])("allows reply with the %s channel alone", (_channel, permission) => {
    expect(allowed(permission)).toEqual(["reply"]);
  });

  it("does not treat the call channel as a reply channel", () => {
    expect(allowed(CLIENT_CHANNEL_PERMISSIONS.call)).toEqual(["call"]);
  });

  it("allows assign with the assign procedure's key", () => {
    expect(allowed(PROCEDURE_PERMISSIONS["tickets.assignTo"])).toEqual([
      "assign",
    ]);
  });

  it("allows hold and unhold together with the update procedure's key", () => {
    expect(allowed(PROCEDURE_PERMISSIONS["tickets.update"])).toEqual([
      "hold",
      "unhold",
    ]);
  });

  it("allows take with the take procedure's key", () => {
    expect(allowed(PROCEDURE_PERMISSIONS["tickets.take"])).toEqual(["take"]);
  });

  it("allows every action when every key is held", () => {
    expect(
      allowed(
        CLIENT_CHANNEL_PERMISSIONS.portal,
        CLIENT_CHANNEL_PERMISSIONS.call,
        PROCEDURE_PERMISSIONS["tickets.assignTo"],
        PROCEDURE_PERMISSIONS["tickets.update"],
        PROCEDURE_PERMISSIONS["tickets.take"],
      ),
    ).toEqual(["assign", "call", "hold", "reply", "take", "unhold"]);
  });
});
