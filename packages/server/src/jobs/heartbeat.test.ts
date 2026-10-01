import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HEARTBEAT_MIN_INTERVAL_MS, createHeartbeatPing } from "./heartbeat.js";

const HEARTBEAT_URL =
  "https://heartbeat.example.invalid/ping/placeholder-token";
const HOUR_MS = 60 * 60 * 1000;

/** Lets the ping's promise chain run to the end. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

class HeartbeatNetworkError extends Error {
  constructor() {
    super(`connect failed for ${HEARTBEAT_URL}`);
    this.name = "HeartbeatNetworkError";
  }
}

function spyOnConsoleError() {
  return vi.spyOn(console, "error").mockReturnValue(undefined);
}

describe("createHeartbeatPing", () => {
  let errorSpy: ReturnType<typeof spyOnConsoleError>;

  beforeEach(() => {
    errorSpy = spyOnConsoleError();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("sends a GET with a timeout signal and logs nothing on success", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock);

    ping();
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(HEARTBEAT_URL);
    expect(init?.method).toBe("GET");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("pings at most once a minute", async () => {
    let clock = 0;
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock, () => clock);

    ping();
    clock = HEARTBEAT_MIN_INTERVAL_MS - 1;
    ping();
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    clock = HEARTBEAT_MIN_INTERVAL_MS;
    ping();
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("swallows a rejecting fetch and logs it once", async () => {
    let clock = 0;
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new HeartbeatNetworkError());
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock, () => clock);

    expect(() => {
      ping();
      clock += HEARTBEAT_MIN_INTERVAL_MS;
      ping();
      clock += HEARTBEAT_MIN_INTERVAL_MS;
      ping();
    }).not.toThrow();
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const line = String(errorSpy.mock.calls[0]?.[0]);
    expect(line).toBe("Scheduler heartbeat ping failed: HeartbeatNetworkError");
    expect(line).not.toContain(HEARTBEAT_URL);
    expect(line).not.toContain("placeholder-token");
  });

  it("logs again once an hour has passed since the last logged failure", async () => {
    let clock = 0;
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new HeartbeatNetworkError());
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock, () => clock);

    ping();
    await settle();
    clock = HOUR_MS - HEARTBEAT_MIN_INTERVAL_MS;
    ping();
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    clock = HOUR_MS;
    ping();
    await settle();
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it("logs a non-2xx response by status only", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("not found", { status: 404 }));
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock);

    ping();
    // Cancelling the unread body can take more than one tick.
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
    expect(String(errorSpy.mock.calls[0]?.[0])).toBe(
      "Scheduler heartbeat ping failed: HTTP 404",
    );
  });

  it("swallows a fetch implementation that throws synchronously", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(() => {
      throw new HeartbeatNetworkError();
    });
    const ping = createHeartbeatPing(HEARTBEAT_URL, fetchMock);

    expect(() => {
      ping();
    }).not.toThrow();
    await settle();

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
