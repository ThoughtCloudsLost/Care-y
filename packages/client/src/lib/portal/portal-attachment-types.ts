/** Wire shape for a portal attachment from bootstrap/polling. */
export interface PortalAttachmentWire {
  readonly attachmentId: string;
  readonly followupId: string;
  readonly direction: string;
  readonly sizeBytes: number;
  readonly contentType: string | null;
  /** ECIES triple wrapping the file key + filename. */
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
  readonly createdAt: string;
}

/**
 * Wire shape for a portal voicemail recording from bootstrap.
 * ECIES triple wraps the file key (filename is always empty for recordings).
 * Blob downloads from `/api/blobs/portal-recordings/<recordingId>`.
 */
export interface PortalRecordingWire {
  readonly recordingId: string;
  readonly followupId: string;
  readonly direction: string;
  readonly durationSeconds: number | null;
  /** ECIES triple wrapping the file key. */
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
  readonly createdAt: string;
}

/**
 * Wire shape for a plaintext call log entry from bootstrap (ADR-092).
 * No decryption required: the metadata columns are already plaintext
 * in the database.
 */
export interface PortalCallEntry {
  readonly id: string;
  readonly source: string;
  readonly callStatus: string | null;
  readonly callDurationSeconds: number | null;
  readonly createdAt: string;
}
