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
