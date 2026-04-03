export interface LogLine {
  id: number;
  text: string;
  level: "log" | "warn" | "error";
}

export interface NetEntry {
  id: number;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  body: string | null;
}

export const MAX_LOG_LINES = 150;
export const MAX_NET_LINES = 100;
export const BODY_PREVIEW_CHARS = 1000;

// Module-level singletons shared across all imports in the browser module graph.
// The patch in hooks.client.ts writes here; DevThemePanel reads from here.
export const logBuffer: LogLine[] = [];
export const netBuffer: NetEntry[] = [];

let _logId = 0;
let _netId = 0;

export function pushLog(level: LogLine["level"], args: unknown[]): void {
  const text = args
    .map((a) => (typeof a === "string" ? a : safeStringify(a)))
    .join(" ");
  logBuffer.push({ id: _logId++, text, level });
  if (logBuffer.length > MAX_LOG_LINES) {
    logBuffer.splice(0, logBuffer.length - MAX_LOG_LINES);
  }
}

export function pushNet(entry: Omit<NetEntry, "id">): void {
  netBuffer.push({ id: _netId++, ...entry });
  if (netBuffer.length > MAX_NET_LINES) {
    netBuffer.splice(0, netBuffer.length - MAX_NET_LINES);
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
