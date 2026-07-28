import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  trpc,
  demoTrpcMock,
  demoResetTrpc,
  isDevDelayEnabled,
  setDevDelay,
  isDemoAuthed,
  setDemoAuthed,
  armPushChallenge,
  setEngineTrpc,
  resetEngineTrpc,
  DemoEngineNotReadyError,
} from "./trpc.js";

/** Retrieve a value from a record, throwing if the key is absent. */
function mustGet<V>(record: Record<string, V | undefined>, key: string): V {
  const value = record[key];
  if (value === undefined) {
    throw new TypeError(`Expected key "${key}" to be present in record`);
  }
  return value;
}

describe("trpc stub", () => {
  beforeEach(() => {
    demoResetTrpc();
    resetEngineTrpc();
  });

  describe("engine delegation", () => {
    it("throws DemoEngineNotReadyError before setEngineTrpc is called", async () => {
      const tickets = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "tickets",
      );
      await expect(
        (tickets.list as { query: (o: unknown) => Promise<unknown> }).query({
          limit: 10,
        }),
      ).rejects.toThrow(DemoEngineNotReadyError);
    });

    it("awaits a resolved engine promise and delegates", async () => {
      const fakeResult = [{ id: "t-1" }];
      const fakeEngine = {
        tickets: {
          list: { query: vi.fn().mockResolvedValue(fakeResult) },
        },
      };
      setEngineTrpc(fakeEngine);

      const tickets = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "tickets",
      );
      const result = await (
        tickets.list as { query: (o: unknown) => Promise<unknown> }
      ).query({ limit: 10 });
      expect(result).toBe(fakeResult);
      expect(fakeEngine.tickets.list.query).toHaveBeenCalledWith({ limit: 10 });
    });

    it("awaits a pending engine promise before delegating", async () => {
      const fakeResult = { status: "ok" };
      let resolveEngine: (v: unknown) => void = () => {
        // Replaced synchronously by the Promise executor below.
      };
      const pending = new Promise<unknown>((r) => {
        resolveEngine = r;
      });

      setEngineTrpc(pending);

      const tickets = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "tickets",
      );
      const callPromise = (
        tickets.list as { query: (o: unknown) => Promise<unknown> }
      ).query({});

      // Engine hasn't resolved yet, so the call is still pending
      const raceResult = await Promise.race([
        callPromise.then(() => "resolved" as const),
        new Promise<"pending">((r) =>
          setTimeout(() => {
            r("pending");
          }, 50),
        ),
      ]);
      expect(raceResult).toBe("pending");

      // Now resolve the engine
      resolveEngine({
        tickets: {
          list: {
            query: () => Promise.resolve(fakeResult),
          },
        },
      });

      const result = await callPromise;
      expect(result).toBe(fakeResult);
    });

    it("delegates non-mocked procedures on partially mocked routers", async () => {
      const fakeListUsers = {
        query: vi.fn().mockResolvedValue([{ id: "u-1" }]),
      };
      setEngineTrpc({ auth: { listUsers: fakeListUsers } });

      const authProxy = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "auth",
      );
      const result = await (
        authProxy.listUsers as { query: () => Promise<unknown> }
      ).query();
      expect(result).toEqual([{ id: "u-1" }]);
    });

    it("rejects auth.me before login completes (pre-login gate)", async () => {
      const engineQuery = vi.fn();
      setEngineTrpc({ auth: { me: { query: engineQuery } } });

      const authProxy = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "auth",
      );
      await expect(
        (authProxy.me as { query: () => Promise<unknown> }).query(),
      ).rejects.toThrow("Not authenticated");
      expect(engineQuery).not.toHaveBeenCalled();
    });

    it("delegates auth.me to the engine once authed", async () => {
      const meResult = {
        user: { id: "u-1", roleId: "admin" },
        permissions: [],
        twofaVerified: true,
      };
      const fakeEngine = {
        auth: {
          me: { query: vi.fn().mockResolvedValue(meResult) },
        },
      };
      setEngineTrpc(fakeEngine);
      setDemoAuthed(true);

      const authProxy = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "auth",
      );
      const result = await (
        authProxy.me as { query: () => Promise<unknown> }
      ).query();
      expect(result).toBe(meResult);
    });

    it("delegates branding.getPublicBranding to the engine", async () => {
      const brandingResult = {
        orgPublicKey: "abc",
        clientEncryptedBranding: null,
        hasIcons: false,
        iconVersion: null,
        orgSlug: "demo",
      };
      const fakeEngine = {
        branding: {
          getPublicBranding: {
            query: vi.fn().mockResolvedValue(brandingResult),
          },
        },
      };
      setEngineTrpc(fakeEngine);

      const branding = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "branding",
      );
      const result = await (
        branding.getPublicBranding as { query: () => Promise<unknown> }
      ).query();
      expect(result).toBe(brandingResult);
    });

    it("delegates onboarding.getStatus to the engine", async () => {
      const statusResult = { needsSetup: false };
      const fakeEngine = {
        onboarding: {
          getStatus: { query: vi.fn().mockResolvedValue(statusResult) },
        },
      };
      setEngineTrpc(fakeEngine);

      const onboarding = mustGet(
        trpc as unknown as Record<string, Record<string, unknown>>,
        "onboarding",
      );
      const result = await (
        onboarding.getStatus as { query: () => Promise<unknown> }
      ).query();
      expect(result).toBe(statusResult);
    });
  });

  describe("auth.login wrapper", () => {
    it("delegates to the engine and sets login stage to twofa-picker", async () => {
      const loginResult = {
        user: { id: "u-1" },
        requiresTwoFactor: true,
        enrolledMethods: ["totp", "webauthn"],
        needsEnrollment: false,
        hasKeys: true,
      };
      const fakeEngine = {
        auth: {
          login: { mutate: vi.fn().mockResolvedValue(loginResult) },
        },
      };
      setEngineTrpc(fakeEngine);

      const login = demoTrpcMock.auth?.login as {
        mutate: (opts: {
          identifier: string;
          password: string;
        }) => Promise<unknown>;
      };
      const result = await login.mutate({
        identifier: "jdoe",
        password: "DemoPassword2026",
      });

      expect(result).toBe(loginResult);
      expect(fakeEngine.auth.login.mutate).toHaveBeenCalledWith({
        identifier: "jdoe",
        password: "DemoPassword2026",
      });
    });

    it("throws when engine is not set", async () => {
      const login = demoTrpcMock.auth?.login as {
        mutate: (opts: {
          identifier: string;
          password: string;
        }) => Promise<unknown>;
      };
      await expect(
        login.mutate({ identifier: "jdoe", password: "test" }),
      ).rejects.toThrow(DemoEngineNotReadyError);
    });
  });

  describe("twoFactor.verify", () => {
    it("totp marks authed on success", async () => {
      expect(isDemoAuthed()).toBe(false);
      const verify = demoTrpcMock.twoFactor?.verify as {
        totp: {
          mutate: (opts: { code: string }) => Promise<{ success: boolean }>;
        };
      };
      const result = await verify.totp.mutate({ code: "123456" });
      expect(result.success).toBe(true);
      expect(isDemoAuthed()).toBe(true);
    });

    it("emailSend returns sent true", async () => {
      const verify = demoTrpcMock.twoFactor?.verify as {
        emailSend: { mutate: () => Promise<{ sent: boolean }> };
      };
      const result = await verify.emailSend.mutate();
      expect(result.sent).toBe(true);
    });

    it("smsSend returns sent true", async () => {
      const verify = demoTrpcMock.twoFactor?.verify as {
        smsSend: { mutate: () => Promise<{ sent: boolean }> };
      };
      const result = await verify.smsSend.mutate();
      expect(result.sent).toBe(true);
    });

    it("webauthnOptions returns valid base64url strings", async () => {
      const verify = demoTrpcMock.twoFactor?.verify as {
        webauthnOptions: {
          mutate: () => Promise<{
            rpId: string;
            challenge: string;
            allowCredentials: { id: string; transports: string[] }[];
          }>;
        };
      };
      const result = await verify.webauthnOptions.mutate();
      expect(result.rpId).toBe("demo.local");
      expect(result.challenge).toBeTruthy();
      expect(result.allowCredentials.length).toBeGreaterThan(0);
    });

    it("unarmed push challenges never approve (scroll-driven opens)", async () => {
      const verify = demoTrpcMock.twoFactor?.verify as {
        pushSend: { mutate: () => Promise<unknown> };
        pushPoll: {
          query: (opts: { challengeId: string }) => Promise<{ status: string }>;
        };
      };
      await verify.pushSend.mutate();
      for (let i = 0; i < 8; i += 1) {
        const poll = await verify.pushPoll.query({
          challengeId: "demo-push-challenge",
        });
        expect(poll.status).toBe("pending");
      }
      expect(isDemoAuthed()).toBe(false);
    });

    it("armed push stays pending for four polls then approves", async () => {
      armPushChallenge();
      const verify = demoTrpcMock.twoFactor?.verify as {
        pushSend: { mutate: () => Promise<unknown> };
        pushPoll: {
          query: (opts: { challengeId: string }) => Promise<{ status: string }>;
        };
      };
      await verify.pushSend.mutate();
      for (let i = 0; i < 4; i += 1) {
        const pending = await verify.pushPoll.query({
          challengeId: "demo-push-challenge",
        });
        expect(pending.status).toBe("pending");
      }
      const resolved = await verify.pushPoll.query({
        challengeId: "demo-push-challenge",
      });
      expect(resolved.status).toBe("approved");
      expect(isDemoAuthed()).toBe(true);
    });
  });

  describe("demoResetTrpc", () => {
    it("resets auth state", () => {
      setDemoAuthed(true);
      expect(isDemoAuthed()).toBe(true);
      demoResetTrpc();
      expect(isDemoAuthed()).toBe(false);
    });
  });

  describe("setDemoAuthed", () => {
    it("sets auth state directly", () => {
      expect(isDemoAuthed()).toBe(false);
      setDemoAuthed(true);
      expect(isDemoAuthed()).toBe(true);
    });
  });

  describe("dev delay toggle", () => {
    it("defaults to false", () => {
      expect(isDevDelayEnabled()).toBe(false);
    });

    it("can be toggled", () => {
      setDevDelay(true);
      expect(isDevDelayEnabled()).toBe(true);
      setDevDelay(false);
      expect(isDevDelayEnabled()).toBe(false);
    });
  });

  describe("symbol property access", () => {
    it("returns undefined for symbol properties on the proxy", () => {
      const sym = Symbol("test");
      const result = (trpc as unknown as Record<symbol, unknown>)[sym];
      expect(result).toBeUndefined();
    });
  });
});
