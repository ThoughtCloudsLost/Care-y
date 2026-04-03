/** Props for a single ticket preview item in the dashboard. */
export interface TicketPreviewItemProps {
  /** Ticket ID for navigation */
  ticketId: string;
  /** Decrypted title, or undefined if decryption is pending or key wrap is unavailable */
  title?: string;
  /** Ticket status */
  status: string;
  /** Ticket priority */
  priority: string;
  /** Whether ticket is on hold */
  onHold: boolean;
  /** Assignee user ID or null */
  assignedTo: string | null;
  /** Creation timestamp */
  createdAt: Date;
  /** Client alias (e.g., "Sparrow") */
  clientAlias: string;
  /** Queue name (e.g., "Crisis") */
  queueName: string;
  /** Timestamp of most recent follow-up, or null if none */
  lastActivityAt: Date | null;
  /** Number of follow-ups on this ticket */
  followUpCount: number;
  /** Decrypted display name of assigned volunteer, or null/undefined */
  assignedName?: string | null;
  /** Callback when item is tapped. Route file handles navigation. */
  ontap: (ticketId: string) => void;
  /** Callback when encrypted help icon is tapped. Page owns the toast. */
  onhelp?: () => void;
}
