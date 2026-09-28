import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { createPushNotificationSender } from "./push.js";
import { generateVapidKeyPair } from "./push-crypto.js";
import type { UserId } from "@care-y/shared";

const USER_ID = "00000000-0000-4000-8000-000000000001" as UserId;
const ENDPOINT_A = "https://push-a.example.com/sub-a";
const ENDPOINT_B = "https://push-b.example.com/sub-b";

/**
 * Tenant DB stub serving the given subscription endpoints and recording the
 * endpoint lists passed to the expired-subscription cleanup.
 */
function stubTenantDb(endpoints: readonly string[]): {
  tDb: Kysely<TenantDatabase>;
  deleted: string[][];
} {
  const deleted: string[][] = [];
  const stub = {
    selectFrom: () => ({
      select: () => ({
        where: () => ({
          execute: async (): Promise<unknown[]> =>
            endpoints.map((endpoint) => ({ endpoint, user_id: USER_ID })),
        }),
      }),
    }),
    deleteFrom: () => ({
      where: (_column: string, _op: string, values: string[]) => ({
        execute: async (): Promise<unknown[]> => {
          deleted.push(values);
          return [];
        },
      }),
    }),
  };
  return { tDb: stub as unknown as Kysely<TenantDatabase>, deleted };
}

class FetchStubError extends Error {}

describe("createPushNotificationSender", () => {
  const vapidKeys = generateVapidKeyPair();
  const sender = createPushNotificationSender(vapidKeys, "admin@care-y.app");
  type FetchStub = (url: string, init: RequestInit) => Promise<Response>;
  let fetchStub: Mock<FetchStub>;

  beforeEach(() => {
    fetchStub = vi.fn<FetchStub>();
    vi.stubGlobal("fetch", fetchStub);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reports zero delivered without fetching when no users are given", async () => {
    const { tDb } = stubTenantDb([ENDPOINT_A]);

    const result = await sender.sendToUsers(tDb, []);

    expect(result).toEqual({ delivered: 0 });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("counts only endpoints that answer with a success status", async () => {
    fetchStub.mockImplementation(async (url: string) =>
      url === ENDPOINT_A
        ? new Response(null, { status: 201 })
        : new Response(null, { status: 500 }),
    );
    const { tDb, deleted } = stubTenantDb([ENDPOINT_A, ENDPOINT_B]);

    const result = await sender.sendToUsers(tDb, [USER_ID]);

    expect(result).toEqual({ delivered: 1 });
    expect(deleted).toHaveLength(0);
  });

  it("counts a rejected request as not delivered and still cleans up expired endpoints", async () => {
    fetchStub.mockImplementation(async (url: string) => {
      if (url === ENDPOINT_A) throw new FetchStubError("connection refused");
      return new Response(null, { status: 410 });
    });
    const { tDb, deleted } = stubTenantDb([ENDPOINT_A, ENDPOINT_B]);

    const result = await sender.sendToUsers(tDb, [USER_ID]);

    expect(result).toEqual({ delivered: 0 });
    expect(deleted).toEqual([[ENDPOINT_B]]);
  });

  it("abandons a stalled push service after the send timeout", async () => {
    vi.useFakeTimers();
    // Node's AbortSignal.timeout runs on internal timers the fake clock does
    // not reach, so drive the timeout from the faked global setTimeout.
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockImplementation((ms: number) => {
        const controller = new AbortController();
        setTimeout(() => {
          controller.abort(new DOMException("timed out", "TimeoutError"));
        }, ms);
        return controller.signal;
      });
    // A push service that never answers: the request only settles when its
    // signal aborts.
    fetchStub.mockImplementation(
      (_url: string, init: RequestInit): Promise<Response> =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(new FetchStubError("aborted"));
          });
        }),
    );
    const { tDb } = stubTenantDb([ENDPOINT_A]);

    let settled = false;
    const pending = sender.sendToUsers(tDb, [USER_ID]).finally(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(4999);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ delivered: 0 });
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });
});
