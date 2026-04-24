/** Shared types for FollowUpTimeline view. */

/** Follow-up summary shape from the listFollowUpSummary endpoint. */
export interface TimelineItem {
  id: string;
  source: string;
  type: string;
  createdBy: string | null;
  createdAt: string;
  /** Present for system events and internal notes. Null for plain messages. */
  encryptedContent: unknown;
  hasRecording: boolean;
  recordingDurationSeconds: number | null;
  hasImage: boolean;
  hasFile: boolean;
  fullPosition?: number;
  totalCount?: number;
}

/** Follow-up record for expanded timeline entries. */
export interface ClusterRecord {
  id: string;
  source: string;
  type: string;
  /** Null while the fetch is in flight (placeholder shimmer). */
  encryptedContent: { type: "Buffer"; data: number[] } | string | null;
  createdBy: string | null;
  createdAt: string;
  isPrivate: boolean;
  hasRecording: boolean;
  hasImage: boolean;
  hasFile: boolean;
}
