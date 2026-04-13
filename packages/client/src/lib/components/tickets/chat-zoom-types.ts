/** Shared types for ChatZoom timeline view. */

/** Follow-up summary shape from the listFollowUpSummary endpoint. */
export interface TimelineItem {
  id: string;
  source: string;
  type: string;
  createdAt: string;
  /** Present for system events and internal notes. Null for plain messages. */
  encryptedContent: unknown;
  hasRecording: boolean;
  recordingDurationSeconds: number | null;
  hasImage: boolean;
  hasFile: boolean;
}

/** Raw follow-up record for expanded clusters (same shape as tRPC response). */
export interface ClusterRecord {
  id: string;
  source: string;
  /** Null while the fetch is in flight (placeholder shimmer). */
  encryptedContent: { type: "Buffer"; data: number[] } | string | null;
  createdAt: string;
}
