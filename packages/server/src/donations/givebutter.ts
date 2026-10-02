/**
 * Givebutter donation provider.
 *
 * Reads fund totals from `GET /v1/funds` and manages the webhook that tells
 * CARE-Y a donation arrived. One instance per connection; it holds that
 * connection's decrypted API key, which goes into the Authorization header
 * and nowhere else: not into an error message, not into a log line.
 *
 * Every response body is checked against a schema before use. Errors carry
 * only a shared error code, never provider response text.
 */

import { z } from "zod";
import { ErrorCode } from "@care-y/shared";
import {
  DonationProviderError,
  ForbiddenError,
  InternalError,
} from "../errors.js";
import { givebutterConfigSchema } from "./schemas.js";
import type {
  InflowProvider,
  ProviderFund,
  RegisteredWebhook,
} from "./provider.js";

const API_ORIGIN = "https://api.givebutter.com";
const BASE_URL = `${API_ORIGIN}/v1`;
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Upper bound on pages followed in one listFunds call. At Givebutter's 20
 * funds per page this is 1,000 funds, far beyond any account we expect.
 */
export const GIVEBUTTER_MAX_FUND_PAGES = 50;

/** Name the webhook carries in the Givebutter dashboard. */
const WEBHOOK_NAME = "CARE-Y";

/**
 * One fund from `GET /v1/funds`. `raised` is in whole dollars per the
 * 2026-09-30 probe (the spec gives no unit); it is converted to cents
 * below. Fields CARE-Y does not use are stripped by the parse.
 */
const fundResourceSchema = z.object({
  id: z.string().nullable(),
  code: z.string().nullable(),
  name: z.string(),
  raised: z.number().nonnegative(),
  supporters: z.number().int().nonnegative(),
});

/** One page of `GET /v1/funds` (Laravel style pagination). */
const fundsPageSchema = z.object({
  data: z.array(fundResourceSchema),
  links: z.object({
    next: z.string().nullish(),
  }),
});

/** The parts of a `WebhookResource` CARE-Y keeps. */
const webhookResourceSchema = z.object({
  id: z.string().min(1),
  /** The shared secret Givebutter sends in the `signature` header. */
  signature: z.string().nullish(),
});

function unavailable(): DonationProviderError {
  return new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE);
}

/**
 * Only follow pagination links back to the API origin. A `next` link
 * pointing anywhere else would receive the API key in its Authorization
 * header.
 */
function isApiUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.origin === API_ORIGIN && parsed.pathname.startsWith("/v1/");
}

/**
 * Build a Givebutter provider for one connection.
 *
 * @param config - decrypted connection config, checked against the schema here
 * @param fetchImpl - fetch to use; tests pass a stub
 */
export function createGivebutterProvider(
  config: unknown,
  fetchImpl: typeof fetch = fetch,
): InflowProvider {
  const parsed = givebutterConfigSchema.safeParse(config);
  if (!parsed.success) {
    // The issues would quote the offending values, so they stay out.
    throw new InternalError("Givebutter connection config failed validation");
  }
  const authorization = `Bearer ${parsed.data.apiKey}`;

  /**
   * Send one request and return the parsed JSON body, or undefined for a
   * response with no content. 401 and 403 mean the key was refused; 429,
   * 5xx, other failures, network errors and unreadable bodies mean the
   * provider is unavailable.
   */
  async function request(
    method: "GET" | "POST" | "DELETE",
    url: string,
    body?: unknown,
    allowNotFound = false,
  ): Promise<unknown> {
    const headers: Record<string, string> = {
      Authorization: authorization,
      Accept: "application/json",
    };
    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetchImpl(url, init);
    } catch {
      throw unavailable();
    }

    if (response.status === 401 || response.status === 403) {
      throw new ForbiddenError(ErrorCode.DONATION_PROVIDER_REJECTED);
    }
    if (allowNotFound && response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw unavailable();
    }
    if (response.status === 204) {
      return undefined;
    }

    try {
      const data: unknown = await response.json();
      return data;
    } catch {
      throw unavailable();
    }
  }

  return {
    async listFunds(): Promise<readonly ProviderFund[]> {
      const funds: ProviderFund[] = [];
      let next: string | null = `${BASE_URL}/funds`;
      let pages = 0;

      while (next !== null) {
        if (pages >= GIVEBUTTER_MAX_FUND_PAGES || !isApiUrl(next)) {
          // Returning the pages read so far would understate the totals
          // without saying so, so this fails instead.
          throw unavailable();
        }
        pages++;

        const page = fundsPageSchema.safeParse(await request("GET", next));
        if (!page.success) {
          throw unavailable();
        }

        for (const fund of page.data.data) {
          // A fund without an id cannot be linked or told apart.
          if (fund.id === null) continue;
          funds.push({
            externalId: fund.id,
            code: fund.code,
            name: fund.name,
            raisedMinor: Math.round(fund.raised * 100),
            supporters: fund.supporters,
          });
        }

        next = page.data.links.next ?? null;
      }

      return funds;
    },

    async registerWebhook(url: string): Promise<RegisteredWebhook> {
      const result = webhookResourceSchema.safeParse(
        await request("POST", `${BASE_URL}/webhooks`, {
          url,
          events: ["transaction.succeeded"],
          name: WEBHOOK_NAME,
          enabled: true,
        }),
      );
      if (!result.success) {
        throw unavailable();
      }
      return { id: result.data.id, secret: result.data.signature ?? null };
    },

    async deleteWebhook(id: string): Promise<void> {
      // A webhook already removed in the Givebutter dashboard is the
      // outcome the caller wanted, so a 404 is not an error.
      await request(
        "DELETE",
        `${BASE_URL}/webhooks/${encodeURIComponent(id)}`,
        undefined,
        true,
      );
    },
  };
}
