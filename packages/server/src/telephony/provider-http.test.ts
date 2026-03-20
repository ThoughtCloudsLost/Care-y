// Wire format contract: tests verify HTTP request shapes (auth headers, content-type, body encoding)
// required by the Twilio REST API. Changing these breaks API authentication and request parsing.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createProviderHttpClient,
  type ProviderHttpConfig,
} from "./provider-http.js";
import { TelephonyError } from "../errors.js";

const TEST_CONFIG: ProviderHttpConfig = {
  baseUrl: "https://api.example.com",
  auth: { username: "ACtest123", password: "authtoken456" },
  timeoutMs: 5000,
};

describe("createProviderHttpClient", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  const expectedAuth =
    "Basic " + Buffer.from("ACtest123:authtoken456").toString("base64");

  describe("get", () => {
    it("sends GET with Basic Auth header and Accept: application/json", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ sid: "SM123" }), { status: 200 }),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      const result = await client.get("/2010-04-01/Messages.json");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.example.com/2010-04-01/Messages.json");
      expect(init.method).toBe("GET");

      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe(expectedAuth);
      expect(headers.Accept).toBe("application/json");

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ sid: "SM123" });
    });
  });

  describe("post", () => {
    it("sends POST with form-encoded body and correct Content-Type", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ sid: "SM456" }), { status: 201 }),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      const result = await client.post("/2010-04-01/Messages.json", {
        To: "+15551234567",
        From: "+15559876543",
        Body: "Hello",
      });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("POST");

      const headers = init.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
      expect(headers.Authorization).toBe(expectedAuth);

      // Body is URLSearchParams-encoded string
      const body = init.body as string;
      const params = new URLSearchParams(body);
      expect(params.get("To")).toBe("+15551234567");
      expect(params.get("From")).toBe("+15559876543");
      expect(params.get("Body")).toBe("Hello");

      expect(result.status).toBe(201);
      expect(result.data).toEqual({ sid: "SM456" });
    });
  });

  describe("delete", () => {
    it("sends DELETE and returns status 204 for success", async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

      const client = createProviderHttpClient(TEST_CONFIG);
      const result = await client.delete("/2010-04-01/Recordings/RE123.json");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("DELETE");
      expect(result.status).toBe(204);
    });
  });

  describe("error classification", () => {
    it("throws TelephonyError with httpStatus 401 on 401 response", async () => {
      fetchSpy.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/test").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(401);
    });

    it("throws TelephonyError with httpStatus 404 on 404 response", async () => {
      fetchSpy.mockResolvedValue(new Response("Not Found", { status: 404 }));

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/missing").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(404);
    });

    it("throws TelephonyError with httpStatus 429 on 429 response", async () => {
      fetchSpy.mockResolvedValue(
        new Response("Too Many Requests", { status: 429 }),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/limited").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(429);
    });

    it("throws TelephonyError with httpStatus 502 on 500 response", async () => {
      fetchSpy.mockResolvedValue(
        new Response("Internal Server Error", { status: 500 }),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/broken").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(502);
    });
  });

  describe("network and timeout errors", () => {
    it("throws TelephonyError with httpStatus 502 on network error", async () => {
      fetchSpy.mockRejectedValue(new TypeError("fetch failed"));

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/unreachable").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(502);
      expect((err as TelephonyError).message).toContain("network error");
    });

    it("throws TelephonyError with httpStatus 504 on timeout", async () => {
      fetchSpy.mockRejectedValue(
        new DOMException("The operation was aborted", "TimeoutError"),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      const err = await client.get("/slow").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).httpStatus).toBe(504);
      expect((err as TelephonyError).message).toContain("timed out");
    });
  });

  describe("auth header encoding", () => {
    it("encodes username:password as correct Base64", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      const client = createProviderHttpClient(TEST_CONFIG);
      await client.get("/check");

      const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      const encoded = (headers.Authorization ?? "").replace("Basic ", "");
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      expect(decoded).toBe("ACtest123:authtoken456");
    });
  });
});
