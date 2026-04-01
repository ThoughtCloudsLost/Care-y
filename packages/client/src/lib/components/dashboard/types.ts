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
  /** Callback when item is tapped. Route file handles navigation. */
  ontap: (ticketId: string) => void;
}
