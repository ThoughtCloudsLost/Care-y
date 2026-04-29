import { describe, it, expect } from "vitest";
import { extractMentions } from "./mentions";

describe("extractMentions", () => {
  it("returns empty array for text with no mentions", () => {
    expect(extractMentions("hello world")).toEqual([]);
  });

  it("extracts a single @mention", () => {
    expect(extractMentions("hey @alice check this")).toEqual(["alice"]);
  });

  it("extracts multiple @mentions", () => {
    expect(extractMentions("@alice and @bob please review")).toEqual([
      "alice",
      "bob",
    ]);
  });

  it("extracts @mention at start of text", () => {
    expect(extractMentions("@admin please help")).toEqual(["admin"]);
  });

  it("extracts @mention at end of text", () => {
    expect(extractMentions("forwarding to @supervisor")).toEqual([
      "supervisor",
    ]);
  });

  it("handles @mention with underscores", () => {
    expect(extractMentions("cc @team_lead")).toEqual(["team_lead"]);
  });

  it("handles @mention with numbers", () => {
    expect(extractMentions("ask @user42")).toEqual(["user42"]);
  });

  it("returns empty array for empty string", () => {
    expect(extractMentions("")).toEqual([]);
  });

  it("does not match bare @ with no following word chars", () => {
    expect(extractMentions("email: test@")).toEqual([]);
  });

  it("extracts mention from email-like patterns (word before @ ignored)", () => {
    expect(extractMentions("user@example")).toEqual(["example"]);
  });

  it("handles consecutive mentions", () => {
    expect(extractMentions("@one @two @three")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("stops mention at non-word characters", () => {
    expect(extractMentions("@alice! and @bob.")).toEqual(["alice", "bob"]);
  });
});
