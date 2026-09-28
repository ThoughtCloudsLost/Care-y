import { describe, it, expect, afterEach } from "vitest";
import { reverifyStore } from "./reverify.svelte.js";

describe("reverifyStore", () => {
  afterEach(() => {
    reverifyStore.close();
  });

  it("starts closed", () => {
    expect(reverifyStore.opened).toBe(false);
  });

  it("opens with the given methods", () => {
    reverifyStore.open(["totp", "email"]);
    expect(reverifyStore.opened).toBe(true);
    expect(reverifyStore.methods).toEqual(["totp", "email"]);
  });

  it("closes", () => {
    reverifyStore.open(["totp"]);
    reverifyStore.close();
    expect(reverifyStore.opened).toBe(false);
  });

  it("replaces the methods when opened again", () => {
    reverifyStore.open(["totp"]);
    reverifyStore.close();
    reverifyStore.open(["sms"]);
    expect(reverifyStore.methods).toEqual(["sms"]);
  });

  it("keeps its own copy of the methods", () => {
    const methods = ["totp"];
    reverifyStore.open(methods);
    methods.push("email");
    expect(reverifyStore.methods).toEqual(["totp"]);
  });

  it("reports no sheet registered by default", () => {
    expect(reverifyStore.registered).toBe(false);
  });

  it("reports a sheet registered until it unregisters", () => {
    const unregister = reverifyStore.register();
    expect(reverifyStore.registered).toBe(true);
    unregister();
    expect(reverifyStore.registered).toBe(false);
  });

  it("stays registered while any sheet remains mounted", () => {
    const unregisterFirst = reverifyStore.register();
    const unregisterSecond = reverifyStore.register();
    unregisterFirst();
    expect(reverifyStore.registered).toBe(true);
    unregisterSecond();
    expect(reverifyStore.registered).toBe(false);
  });

  it("ignores a repeated unregister", () => {
    const unregisterFirst = reverifyStore.register();
    const unregisterSecond = reverifyStore.register();
    unregisterFirst();
    unregisterFirst();
    expect(reverifyStore.registered).toBe(true);
    unregisterSecond();
    expect(reverifyStore.registered).toBe(false);
  });
});
