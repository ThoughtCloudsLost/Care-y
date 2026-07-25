/**
 * Conversation fixture helpers for the demo.
 *
 * Provides functions to build bubble props from DemoFollowUp
 * arrays for use by ConversationDemo.
 */

import type { DemoFollowUp, DemoTicket } from "./types.js";

/**
 * Shape consumed by ConversationBubble and FollowUpTimeline.
 * Mirrors what the real conversation view derives from decrypted data.
 */
export interface DemoBubbleProps {
  readonly id: string;
  readonly ticketId: string;
  readonly source: "client" | "volunteer" | "system";
  readonly type: string;
  readonly content: string;
  readonly isPrivate: boolean;
  readonly createdAt: Date;
  readonly eventParams: Record<string, unknown> | null;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
}

/**
 * Build bubble props from a ticket's follow-ups.
 * Uses the plaintext content directly (the stub cache is the
 * decryption layer; by the time we build bubbles, content is "decrypted").
 */
export function mapToBubbleProps(ticket: DemoTicket): DemoBubbleProps[] {
  return ticket.followUps.map((fu) => ({
    id: fu.id,
    ticketId: fu.ticketId,
    source: fu.source,
    type: fu.type,
    content: fu.content,
    isPrivate: fu.isPrivate,
    createdAt: fu.createdAt,
    eventParams: fu.eventParams,
    hasRecording: fu.hasRecording,
    hasImage: fu.hasImage,
    hasFile: fu.hasFile,
  }));
}

/**
 * Build a single scripted reply follow-up, as if typed by a volunteer.
 * Used by the TypingDock animation in ConversationDemo.
 */
export function buildScriptedReply(
  ticketId: string,
  content: string,
  replyId: string,
): DemoFollowUp {
  const fakeCipher = "x".repeat(content.length + 40);
  return {
    id: replyId,
    ticketId,
    source: "volunteer",
    type: "message",
    isPrivate: false,
    content,
    encryptedContent: fakeCipher,
    eventParams: null,
    createdAt: new Date(),
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
  };
}
