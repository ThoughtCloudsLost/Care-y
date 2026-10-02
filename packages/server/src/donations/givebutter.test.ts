/**
 * Unit tests for the Givebutter provider. The network is a fetch stub, so
 * these run on the host without credentials.
 */

import { describe, it, expect, vi, type Mock } from "vitest";
import { ErrorCode } from "@care-y/shared";
import {
  createGivebutterProvider,
  GIVEBUTTER_MAX_FUND_PAGES,
} from "./givebutter.js";
import {
  DonationProviderError,
  ForbiddenError,
  InternalError,
} from "../errors.js";

const API_KEY = "gb-test-key-0123456789abcdef";
const FUNDS_URL = "https://api.givebutter.com/v1/funds";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fundsPage(
  data: unknown[],
  next: string | null,
): Record<string, unknown> {
  return {
    data,
    links: { first: FUNDS_URL, last: FUNDS_URL, prev: null, next },
    meta: { current_page: 1, last_page: 1, per_page: 20, total: data.length },
  };
}

function fund(
  id: string | null,
  raised: number,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    code: "GAS",
    name: "Gas Cards",
    raised,
    supporters: 3,
    created_at: "2026-09-30T00:00:00Z",
    updated_at: "2026-09-30T00:00:00Z",
    ...extra,
  };
}

function stubFetch(...responses: (Response | Error)[]): Mock<typeof fetch> {
  const fetchImpl = vi.fn<typeof fetch>();
  for (const r of responses) {
    if (r instanceof Error) {
      fetchImpl.mockRejectedValueOnce(r);
    } else {
      fetchImpl.mockResolvedValueOnce(r);
    }
  }
  return fetchImpl;
}

/** The thrown value, for assertions on its class and message. */
async function caught(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (err: unknown) {
    return err;
  }
  throw new InternalError("expected the promise to reject");
}

describe("createGivebutterProvider", () => {
  it("rejects a config without an API key", () => {
    expect(() => createGivebutterProvider({}, stubFetch())).toThrow(
      InternalError,
    );
  });

  describe("listFunds", () => {
    it("sends the key as a bearer token", async () => {
      const fetchImpl = stubFetch(jsonResponse(fundsPage([], null)));
      await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).listFunds();

      const [url, init] = fetchImpl.mock.calls[0] ?? [];
      expect(url).toBe(FUNDS_URL);
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${API_KEY}`,
      });
    });

    it("follows links.next across pages", async () => {
      const page2 = `${FUNDS_URL}?page=2`;
      const fetchImpl = stubFetch(
        jsonResponse(fundsPage([fund("fund-aaaaaaaaaaaa", 15)], page2)),
        jsonResponse(fundsPage([fund("fund-bbbbbbbbbbbb", 25)], null)),
      );

      const funds = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).listFunds();

      expect(fetchImpl).toHaveBeenCalledTimes(2);
      expect(fetchImpl.mock.calls[1]?.[0]).toBe(page2);
      expect(funds.map((f) => f.externalId)).toEqual([
        "fund-aaaaaaaaaaaa",
        "fund-bbbbbbbbbbbb",
      ]);
    });

    it("converts whole-dollar raised totals to cents", async () => {
      const fetchImpl = stubFetch(
        jsonResponse(
          fundsPage(
            [fund("fund-a", 40), fund("fund-b", 12.34), fund("fund-c", 0)],
            null,
          ),
        ),
      );

      const funds = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).listFunds();

      expect(funds).toEqual([
        {
          externalId: "fund-a",
          code: "GAS",
          name: "Gas Cards",
          raisedMinor: 4000,
          supporters: 3,
        },
        {
          externalId: "fund-b",
          code: "GAS",
          name: "Gas Cards",
          raisedMinor: 1234,
          supporters: 3,
        },
        {
          externalId: "fund-c",
          code: "GAS",
          name: "Gas Cards",
          raisedMinor: 0,
          supporters: 3,
        },
      ]);
    });

    it("skips funds without an id", async () => {
      const fetchImpl = stubFetch(
        jsonResponse(fundsPage([fund(null, 10), fund("fund-a", 5)], null)),
      );

      const funds = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).listFunds();

      expect(funds.map((f) => f.externalId)).toEqual(["fund-a"]);
    });

    it("keeps a null fund code", async () => {
      const fetchImpl = stubFetch(
        jsonResponse(fundsPage([fund("fund-a", 5, { code: null })], null)),
      );

      const [only] = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).listFunds();

      expect(only?.code).toBeNull();
    });

    it.each([401, 403])("treats HTTP %d as a refused key", async (status) => {
      const fetchImpl = stubFetch(jsonResponse({ message: "nope" }, status));

      const err = await caught(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      );

      expect(err).toBeInstanceOf(ForbiddenError);
      expect((err as ForbiddenError).message).toBe(
        ErrorCode.DONATION_PROVIDER_REJECTED,
      );
    });

    it.each([429, 500, 503])(
      "treats HTTP %d as the provider being unavailable",
      async (status) => {
        const fetchImpl = stubFetch(jsonResponse({}, status));

        const err = await caught(
          createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
        );

        expect(err).toBeInstanceOf(DonationProviderError);
        expect((err as DonationProviderError).message).toBe(
          ErrorCode.DONATION_PROVIDER_UNAVAILABLE,
        );
      },
    );

    it("treats a network failure as unavailable", async () => {
      const fetchImpl = stubFetch(new TypeError("fetch failed"));

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      ).rejects.toBeInstanceOf(DonationProviderError);
    });

    it("treats a body that is not JSON as unavailable", async () => {
      const fetchImpl = stubFetch(new Response("<html>", { status: 200 }));

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      ).rejects.toBeInstanceOf(DonationProviderError);
    });

    it("treats a body of the wrong shape as unavailable", async () => {
      const fetchImpl = stubFetch(
        jsonResponse({ data: [{ id: "fund-a", raised: "fifteen" }] }),
      );

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      ).rejects.toBeInstanceOf(DonationProviderError);
    });

    it("refuses to follow a next link off the API origin", async () => {
      const fetchImpl = stubFetch(
        jsonResponse(fundsPage([fund("fund-a", 5)], "https://evil.test/v1/x")),
      );

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      ).rejects.toBeInstanceOf(DonationProviderError);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it("stops at the page cap instead of returning a partial list", async () => {
      const fetchImpl = vi.fn<typeof fetch>(async () =>
        jsonResponse(fundsPage([fund("fund-a", 1)], `${FUNDS_URL}?page=n`)),
      );

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).listFunds(),
      ).rejects.toBeInstanceOf(DonationProviderError);
      expect(fetchImpl).toHaveBeenCalledTimes(GIVEBUTTER_MAX_FUND_PAGES);
    });

    it("never puts the API key in a thrown error message", async () => {
      for (const response of [
        jsonResponse({ key: API_KEY }, 401),
        jsonResponse({ key: API_KEY }, 500),
        jsonResponse({ data: API_KEY }),
        new TypeError(`fetch failed for ${API_KEY}`),
      ]) {
        const err = await caught(
          createGivebutterProvider(
            { apiKey: API_KEY },
            stubFetch(response),
          ).listFunds(),
        );
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).not.toContain(API_KEY);
        expect(String(err)).not.toContain(API_KEY);
      }
    });
  });

  describe("registerWebhook", () => {
    it("posts the donation webhook and maps the response", async () => {
      const fetchImpl = stubFetch(
        jsonResponse({
          id: "wh_123",
          name: "CARE-Y",
          signature: "shared-secret",
          events: ["transaction.succeeded"],
          enabled: true,
          url: "https://care-y.app/webhooks/givebutter/a/b",
          last_status: "",
          last_status_description: "",
          last_used_at: "",
          created_at: "2026-10-02T00:00:00Z",
          updated_at: "2026-10-02T00:00:00Z",
        }),
      );

      const result = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).registerWebhook("https://care-y.app/webhooks/givebutter/a/b");

      expect(result).toEqual({ id: "wh_123", secret: "shared-secret" });
      const [url, init] = fetchImpl.mock.calls[0] ?? [];
      expect(url).toBe("https://api.givebutter.com/v1/webhooks");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      });
      const body = init?.body;
      if (typeof body !== "string") throw new Error("body is not a string");
      expect(JSON.parse(body)).toEqual({
        url: "https://care-y.app/webhooks/givebutter/a/b",
        events: ["transaction.succeeded"],
        name: "CARE-Y",
        enabled: true,
      });
    });

    it("returns a null secret when the provider reports none", async () => {
      const fetchImpl = stubFetch(
        jsonResponse({ id: "wh_1", signature: null }),
      );

      const result = await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).registerWebhook("https://care-y.app/x");

      expect(result).toEqual({ id: "wh_1", secret: null });
    });

    it("treats a response without an id as unavailable", async () => {
      const fetchImpl = stubFetch(jsonResponse({ name: "CARE-Y" }));

      await expect(
        createGivebutterProvider(
          { apiKey: API_KEY },
          fetchImpl,
        ).registerWebhook("https://care-y.app/x"),
      ).rejects.toBeInstanceOf(DonationProviderError);
    });
  });

  describe("deleteWebhook", () => {
    it("deletes by id", async () => {
      const fetchImpl = stubFetch(new Response(null, { status: 204 }));

      await createGivebutterProvider(
        { apiKey: API_KEY },
        fetchImpl,
      ).deleteWebhook("wh_123");

      const [url, init] = fetchImpl.mock.calls[0] ?? [];
      expect(url).toBe("https://api.givebutter.com/v1/webhooks/wh_123");
      expect(init?.method).toBe("DELETE");
    });

    it("accepts a webhook that is already gone", async () => {
      const fetchImpl = stubFetch(jsonResponse({}, 404));

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).deleteWebhook(
          "wh_123",
        ),
      ).resolves.toBeUndefined();
    });

    it("surfaces a server error as unavailable", async () => {
      const fetchImpl = stubFetch(jsonResponse({}, 502));

      await expect(
        createGivebutterProvider({ apiKey: API_KEY }, fetchImpl).deleteWebhook(
          "wh_123",
        ),
      ).rejects.toBeInstanceOf(DonationProviderError);
    });
  });
});
