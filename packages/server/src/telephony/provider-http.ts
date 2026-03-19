import { TelephonyError } from "../errors.js";

export interface ProviderHttpConfig {
  readonly baseUrl: string;
  readonly auth: { readonly username: string; readonly password: string };
  readonly timeoutMs?: number;
}

export interface ProviderResponse<T = unknown> {
  readonly status: number;
  readonly data: T;
}

export interface ProviderHttpClient {
  get<T = unknown>(path: string): Promise<ProviderResponse<T>>;
  post<T = unknown>(
    path: string,
    body: Record<string, string>,
  ): Promise<ProviderResponse<T>>;
  delete(path: string): Promise<{ status: number }>;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function buildAuthHeader(username: string, password: string): string {
  const encoded = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${encoded}`;
}

function classifyError(status: number, url: string): TelephonyError {
  switch (status) {
    case 401:
      return new TelephonyError(`Authentication failed for ${url}`, 401);
    case 403:
      return new TelephonyError(`Authorization denied for ${url}`, 403);
    case 404:
      return new TelephonyError(`Resource not found: ${url}`, 404);
    case 429:
      return new TelephonyError(`Rate limited by provider: ${url}`, 429);
    default:
      if (status >= 500) {
        return new TelephonyError(
          `Provider server error (${String(status)}) for ${url}`,
          502,
        );
      }
      return new TelephonyError(
        `Unexpected provider response (${String(status)}) for ${url}`,
        status,
      );
  }
}

function wrapFetchError(err: unknown): TelephonyError {
  if (
    err instanceof DOMException &&
    (err.name === "TimeoutError" || err.name === "AbortError")
  ) {
    return new TelephonyError("Provider request timed out", 504);
  }
  const message = err instanceof Error ? err.message : "Unknown network error";
  return new TelephonyError(`Provider network error: ${message}`, 502);
}

export function createProviderHttpClient(
  config: ProviderHttpConfig,
): ProviderHttpClient {
  const { baseUrl, auth, timeoutMs = DEFAULT_TIMEOUT_MS } = config;
  const authHeader = buildAuthHeader(auth.username, auth.password);

  async function request<T>(
    method: string,
    path: string,
    body?: URLSearchParams,
  ): Promise<ProviderResponse<T>> {
    const url = `${baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: authHeader,
      Accept: "application/json",
    };

    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    };

    if (body) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      init.body = body.toString();
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err: unknown) {
      throw wrapFetchError(err);
    }

    if (!response.ok) {
      throw classifyError(response.status, url);
    }

    // 204 No Content has no body
    if (response.status === 204) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- network trust boundary: 204 has no body, callers that use DELETE expect undefined
      return { status: 204, data: undefined as T };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- network trust boundary: response.json() returns unknown, caller's generic T defines the expected shape (Twilio REST API, stable since 2010)
    const data = (await response.json()) as T;
    return { status: response.status, data };
  }

  return {
    async get<T = unknown>(path: string): Promise<ProviderResponse<T>> {
      return request<T>("GET", path);
    },

    async post<T = unknown>(
      path: string,
      body: Record<string, string>,
    ): Promise<ProviderResponse<T>> {
      return request<T>("POST", path, new URLSearchParams(body));
    },

    async delete(path: string): Promise<{ status: number }> {
      const result = await request<undefined>("DELETE", path);
      return { status: result.status };
    },
  };
}
