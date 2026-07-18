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
  noteTypeId: string | null;
  eventParams: Record<string, unknown> | null;
  callStatus: string | null;
  callDurationSeconds: number | null;
  /** Non-null when this follow-up was encrypted with tk_temp (needs re-wrap). */
  keyGeneration: string | null;
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
  noteTypeId: string | null;
  eventParams: Record<string, unknown> | null;
  /** Non-null when this follow-up was encrypted with tk_temp (needs re-wrap). */
  keyGeneration: string | null;
  /** ECIES key wrap for tk_temp decryption. Present only when keyGeneration is non-null. */
  keyWrap: {
    ephemeralPoint: { type: "Buffer"; data: number[] } | string;
    nonce: { type: "Buffer"; data: number[] } | string;
    wrappedKey: { type: "Buffer"; data: number[] } | string;
  } | null;
}
