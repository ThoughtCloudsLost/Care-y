export type LogsTab = "calls" | "audit";

export function isLogsTab(v: string): v is LogsTab {
  return v === "calls" || v === "audit";
}

export function defaultTab(): LogsTab {
  return "calls";
}
