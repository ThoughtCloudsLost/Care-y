/**
 * Deterministic ticket stories for the dev and demo seeders.
 *
 * The server's direct-insert seeder and the client's production-endpoint
 * seeder both build their generated tickets from these stories, so the two
 * produce the same shape of work. Tickets spread over the last 30 days, each
 * one opens with an inbound event that could have created it, and the rest
 * of the thread is worked, held or closed the way a real line handles it.
 *
 * Dev-only. Exposed through the "./dev/seed-stories.js" subpath and never
 * from the package index, so production bundles do not pull it in.
 */

import { z } from "zod";
import { ticketIdSchema, userIdSchema } from "../ids.js";
import { base64String } from "../schemas/validators.js";
import { callStatusSchema, type TicketPriority } from "../schemas/tickets.js";

export type SeedQueue = "Intake" | "Crisis" | "Housing";
/**
 * How a ticket came to exist, one per real creation path: an inbound text,
 * an inbound call (answered or missed), a missed call that left a voicemail,
 * the web intake form, a volunteer creating the ticket in the app, and an
 * admin routing a quarantined voicemail into a new ticket.
 */
export type SeedOriginKind =
  "sms" | "call" | "voicemail" | "intake" | "staff" | "quarantine";
/**
 * Channel a story's conversation runs on. Email only ever continues a
 * conversation a volunteer started by email; it never creates a ticket.
 */
export type SeedChannel = "sms" | "email" | "message";
export type SeedAssignee = "me" | "other";

export type SeedStep =
  | {
      readonly kind: "message";
      readonly from: "client" | "volunteer";
      readonly content: string;
      readonly agoMinutes: number;
    }
  | {
      readonly kind: "note";
      readonly content: string;
      readonly agoMinutes: number;
    }
  | {
      readonly kind: "priority";
      readonly to: TicketPriority;
      readonly agoMinutes: number;
    }
  | {
      readonly kind: "assign";
      readonly to: SeedAssignee;
      readonly agoMinutes: number;
    }
  | { readonly kind: "hold"; readonly agoMinutes: number }
  | { readonly kind: "close"; readonly agoMinutes: number };

export interface SeedOrigin {
  readonly kind: SeedOriginKind;
  /** sms: the text. intake: the form message. call, voicemail, quarantine: "" (the recording is the content). staff: "" (no client follow-up). */
  readonly content: string;
  /** call only: completed calls have a duration in seconds */
  readonly callDurationSeconds?: number;
  readonly agoMinutes: number;
}

export interface SeedStory {
  readonly title: string;
  readonly description: string;
  readonly queue: SeedQueue;
  /** Priority at creation; "priority" steps change it later. */
  readonly initialPriority: TicketPriority;
  readonly origin: SeedOrigin;
  /** Channel of every message step. */
  readonly channel: SeedChannel;
  /** email channel only: subject of the volunteer's first email. */
  readonly emailSubject?: string;
  /** Chronological: agoMinutes strictly decreasing, all below origin.agoMinutes, all >= 1. */
  readonly steps: readonly SeedStep[];
}

export interface SeedFollowUpShape {
  readonly type: string;
  readonly source: "client" | "volunteer" | "system";
}

/** Input for the dev-only dev.applySeedTimeline procedure. */
export const applySeedTimelineInputSchema = z.object({
  ticketId: ticketIdSchema,
  // When the ticket was opened. A ticket a volunteer opened with no
  // follow-up yet has no points, so its creation time is given directly.
  createdMinutesAgo: z.number().int().min(0).max(525_600),
  points: z
    .array(
      z.object({
        minutesAgo: z.number().int().min(0).max(525_600),
        callStatus: callStatusSchema.optional(),
        callDurationSeconds: z.number().int().min(0).max(86_400).optional(),
        // The seeding account can only write and react as itself. createdBy
        // re-stamps a volunteer follow-up's author, and reaction re-stamps
        // the reactions on a follow-up, to the volunteer the story names.
        createdBy: userIdSchema.optional(),
        reaction: z
          .object({
            userId: userIdSchema,
            minutesAgo: z.number().int().min(0).max(525_600),
          })
          .optional(),
      }),
    )
    .max(500),
});
export type ApplySeedTimelineInput = z.infer<
  typeof applySeedTimelineInputSchema
>;
/** One timeline point as the dev seed sends it. */
export type SeedTimelinePoint = z.input<
  typeof applySeedTimelineInputSchema
>["points"][number];

/**
 * Length of the seed voicemail clip (assets/seed-voicemail-en.m4a), in whole
 * seconds. Measured from the generated clip (4.48 s); keep in sync when
 * regenerating it with packages/demo/scripts/generate-voicemail-audio.sh.
 */
export const SEED_VOICEMAIL_DURATION_S = 5;

/** Base64 voicemail audio sent by the dev seed. */
const seedAudioSchema = base64String("audio").refine(
  (s) => s.length <= 400_000,
  { message: "audio must be at most 400000 base64 characters" },
);
const seedAudioDurationSchema = z.number().int().min(1).max(600);

/** Input for the dev-only dev.seedVoicemail procedure. */
export const seedVoicemailInputSchema = z.object({
  ticketId: ticketIdSchema,
  audio: seedAudioSchema,
  durationSeconds: seedAudioDurationSchema,
});
export type SeedVoicemailInput = z.infer<typeof seedVoicemailInputSchema>;

/** Input for the dev-only dev.reopenAsClient procedure. */
export const reopenAsClientInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type ReopenAsClientInput = z.infer<typeof reopenAsClientInputSchema>;

/**
 * Input for the dev-only dev.seedQuarantine procedure. Without audio the
 * entries carry synthetic audio. `routable` adds that many more pending
 * entries for the dev seed to route into new tickets.
 */
export const seedQuarantineInputSchema = z
  .object({
    audio: seedAudioSchema.optional(),
    durationSeconds: seedAudioDurationSchema.optional(),
    routable: z.number().int().min(0).max(50).optional(),
  })
  .optional();
export type SeedQuarantineInput = z.infer<typeof seedQuarantineInputSchema>;

/** Input for the dev-only dev.backdateOrgSetup procedure. */
export const backdateOrgSetupInputSchema = z.object({
  minutesAgo: z.number().int().min(0).max(525_600),
});
export type BackdateOrgSetupInput = z.infer<typeof backdateOrgSetupInputSchema>;

/** Raised only if a content pool filters down to nothing, which is a bug in the pools. */
class SeedStoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeedStoryError";
  }
}

// --- Channel mapping and email payloads ---

/** Fixed sender for seeded inbound email, matching the example domain used elsewhere in seeds. */
const SEED_CLIENT_EMAIL = "client@example.org";

/**
 * Follow-ups that open a ticket of this origin, oldest first, all from the
 * client: sms -> sms_inbound, call -> phone_call, intake -> message,
 * quarantine -> voicemail. A voicemail origin is the missed call followed
 * by the voicemail it left. A staff-created ticket opens with none.
 */
export function originFollowUps(kind: SeedOriginKind): SeedFollowUpShape[] {
  switch (kind) {
    case "sms":
      return [{ type: "sms_inbound", source: "client" }];
    case "call":
      return [{ type: "phone_call", source: "client" }];
    case "intake":
      return [{ type: "message", source: "client" }];
    case "voicemail":
      return [
        { type: "phone_call", source: "client" },
        { type: "voicemail", source: "client" },
      ];
    case "quarantine":
      return [{ type: "voicemail", source: "client" }];
    case "staff":
      return [];
  }
}

/** Follow-up type/source for a message step on the story's channel: sms -> client sms_inbound, volunteer sms_outbound; email -> email_inbound / email_outbound; message -> message from either side. Notes are internal_note/volunteer. */
export function messageFollowUp(
  channel: SeedChannel,
  from: "client" | "volunteer",
): SeedFollowUpShape {
  switch (channel) {
    case "sms":
      return from === "client"
        ? { type: "sms_inbound", source: "client" }
        : { type: "sms_outbound", source: "volunteer" };
    case "email":
      return from === "client"
        ? { type: "email_inbound", source: "client" }
        : { type: "email_outbound", source: "volunteer" };
    case "message":
      return { type: "message", source: from };
  }
}

/**
 * Plaintext for a message step on the story's channel. On email, the
 * volunteer's first email carries the story's subject and everything after
 * it is a reply to that subject.
 */
export function messageStepContent(
  story: SeedStory,
  step: Extract<SeedStep, { kind: "message" }>,
): string {
  if (story.channel !== "email") return step.content;
  const subject = story.emailSubject ?? "";
  const first = story.steps.find((s) => s.kind === "message");
  if (first === step && step.from === "volunteer") {
    return emailOutboundPayload(subject, step.content);
  }
  const reply = `Re: ${subject}`;
  return step.from === "client"
    ? emailInboundPayload(reply, step.content)
    : emailOutboundPayload(reply, step.content);
}

/** Plaintext payload for an inbound email follow-up, the shape the inbound email handler stores. */
function emailInboundPayload(subject: string, text: string): string {
  return JSON.stringify({
    subject,
    text,
    from: SEED_CLIENT_EMAIL,
    droppedAttachments: 0,
  });
}

/** Plaintext payload for an outbound email follow-up: the subject plus the compose editor's ProseMirror doc. */
function emailOutboundPayload(subject: string, text: string): string {
  return JSON.stringify({
    subject,
    doc: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    },
  });
}

// --- Content pools ---
//
// Lines carry optional tags so a thread never contradicts itself. `area`
// keeps topic-specific lines on matching topics and ties a topic to its
// queue, `variants` keeps channel-specific lines on matching origins. "call"
// is an answered call, "missed" a call nobody picked up, "voicemail" covers
// both voicemail origins, "staff" a ticket a volunteer opened.

type Area = "general" | "housing" | "legal" | "crisis";
type Variant = "call" | "missed" | "sms" | "intake" | "voicemail" | "staff";
const VARIANTS: readonly Variant[] = [
  "call",
  "missed",
  "sms",
  "intake",
  "voicemail",
  "staff",
];

interface Tagged {
  readonly area?: Area;
  readonly variants?: readonly Variant[];
}

interface Topic extends Tagged {
  readonly title: string;
  readonly description?: string;
  /** Generic enough for any queue; the story takes the queue's area. */
  readonly anyQueue?: true;
}

interface Line extends Tagged {
  readonly text: string;
}

interface Pair extends Tagged {
  readonly client: string;
  readonly volunteer: string;
}

/** Every variant with a conversation; untagged lines fit all of them. */
const CONTACTED: readonly Variant[] = [
  "call",
  "sms",
  "intake",
  "voicemail",
  "staff",
];

// Detailed topics describe what was said on a call, so they only open
// answered calls.
const TOPICS: readonly Topic[] = [
  {
    title: "Caller needs emergency housing referral",
    description:
      "Caller reports being unhoused for two weeks. Has valid ID and is currently staying at a temporary shelter. Needs connection to transitional housing program.",
    area: "housing",
    variants: ["call"],
  },
  {
    title: "Follow-up on custody hearing preparation",
    description:
      "Returning caller. Custody hearing scheduled for next month. Needs legal aid referral updated with new court date. Previously connected with family law legal aid.",
    area: "legal",
    variants: ["call"],
  },
  {
    title: "Active safety concern reported",
    description:
      "Caller describes escalating conflict at home. Safety plan was created during previous call but caller reports the situation has changed. Requesting crisis volunteer connection.",
    area: "crisis",
    variants: ["call"],
  },
  {
    title: "New caller requesting general information",
    description:
      "First-time caller asking about available services. Wants to understand what kind of help is available before deciding next steps. No immediate safety concerns reported.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Benefits application assistance needed",
    description:
      "Caller needs help navigating benefits application process. Has difficulty with online forms due to limited internet access. Requested callback with step-by-step guidance.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller requesting legal aid referral",
    description:
      "Caller was referred by a community partner. Seeking legal representation for upcoming hearing. Has documentation ready but needs help understanding the process.",
    area: "legal",
    variants: ["call"],
  },
  {
    title: "Shelter placement follow-up",
    description:
      "Caller placed in emergency shelter last week. Checking on timeline for transitional housing placement. Reports feeling safe at current location.",
    area: "housing",
    variants: ["call"],
  },
  {
    title: "Transportation assistance for medical appointment",
    description:
      "Caller has medical appointment across town next Tuesday. No personal vehicle and public transit route requires three transfers. Requesting ride assistance.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller needs help with protective order paperwork",
    description:
      "Caller needs to file a protective order but is unsure of the process. Has police report number from recent incident. Asking about court filing requirements.",
    area: "legal",
    variants: ["call"],
  },
  {
    title: "Employment program referral requested",
    description:
      "Caller recently lost employment and is seeking job placement assistance. Has previous experience in food service. Interested in job training programs.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Child care subsidy application help",
    description:
      "Caller is a single parent needing child care assistance to maintain employment. Currently on a waitlist for state subsidy. Asking about bridge programs.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller reporting landlord retaliation",
    description:
      "Caller's landlord has initiated eviction proceedings after caller reported code violations. Believes this is retaliatory. Needs tenant rights legal aid.",
    area: "housing",
    variants: ["call"],
  },
  {
    title: "Mental health crisis intervention needed",
    description:
      "Caller expressing suicidal ideation. Currently in a safe location but reports feeling overwhelmed by housing instability. Requesting immediate crisis support.",
    area: "crisis",
    variants: ["call"],
  },
  {
    title: "Insurance enrollment assistance",
    description:
      "Caller's insurance coverage lapsed during a recent move. Open enrollment is approaching and they need help understanding their options.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller needs food bank and pantry locations",
    description:
      "Caller is new to the area and has three children. Needs locations for food banks that serve families and have weekend hours.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Domestic violence safety planning",
    description:
      "Caller has left a dangerous living situation and is staying with a friend temporarily. Needs help creating a safety plan and understanding legal options.",
    area: "crisis",
    variants: ["call"],
  },
  {
    title: "Immigration legal consultation referral",
    description:
      "Caller is undocumented and seeking legal advice about available protections. Has been in the country for eight years and has US-citizen children.",
    area: "legal",
    variants: ["call"],
  },
  {
    title: "Utility shutoff prevention assistance",
    description:
      "Caller received a shutoff notice for electricity. Payment is overdue by 60 days. Asking about emergency assistance programs and payment plans.",
    area: "housing",
    variants: ["call"],
  },
  {
    title: "School enrollment help for displaced family",
    description:
      "Caller's family was displaced and children need to be enrolled in a new school district. Needs help understanding residency requirements and transfer process.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller seeking substance abuse treatment options",
    description:
      "Caller is interested in treatment options for substance use. Has tried outpatient programs before. Asking about inpatient and residential programs.",
    area: "general",
    variants: ["call"],
  },
  {
    title: "Caller in distress after an argument at home",
    description:
      "Caller reports a frightening argument at home earlier tonight. Now at a neighbor's place and safe for the moment. Wants to talk through options before going back.",
    area: "crisis",
    variants: ["call"],
  },
  {
    title: "Caller worried about a family member's safety",
    description:
      "Caller is concerned about a sibling who stopped answering calls after a hard week. Asked how to request a welfare check and what support exists for family members.",
    area: "crisis",
    variants: ["call"],
  },
  {
    title: "Caller facing eviction next week",
    description:
      "Caller received a notice to vacate with seven days to leave. Has been paying partial rent since losing hours at work. Needs tenant rights information and emergency rent resources.",
    area: "housing",
    variants: ["call"],
  },
  {
    title: "Caller staying with friends with two children",
    description:
      "Caller has moved between friends' homes for three weeks with two children. Looking for a family shelter or transitional housing that can take all three of them.",
    area: "housing",
    variants: ["call"],
  },
  // Short titles take a short description matched to the origin.
  {
    title: "Referral request",
    variants: [...CONTACTED, "missed"],
    anyQueue: true,
  },
  {
    title: "Follow-up needed",
    variants: [...CONTACTED, "missed"],
    anyQueue: true,
  },
  { title: "New intake call", variants: ["call", "missed"], anyQueue: true },
  {
    title: "Callback requested",
    variants: ["missed", "sms", "intake", "voicemail"],
    anyQueue: true,
  },
  { title: "Help with benefits paperwork" },
  { title: "Ride needed to medical appointment" },
  { title: "Safety check-in", area: "crisis" },
  { title: "Housing waitlist question", area: "housing" },
  { title: "Question about court paperwork", area: "legal" },
  { title: "Prescription refill help" },
  { title: "Utility shutoff notice", area: "housing" },
  { title: "School enrollment question" },
  { title: "Childcare resource request" },
  { title: "Job search support" },
  { title: "Food assistance question" },
  { title: "ID replacement help" },
  { title: "Counseling referral request", area: "crisis" },
  { title: "Interpreter needed for appointment" },
  { title: "Insurance paperwork question" },
  { title: "Weekly check-in call", variants: ["call"], anyQueue: true },
  {
    title: "Left voicemail after hours",
    variants: ["voicemail"],
    anyQueue: true,
  },
  { title: "Text conversation follow-up", variants: ["sms"], anyQueue: true },
  { title: "Needs updated resource list", anyQueue: true },
  { title: "Rent assistance question", area: "housing" },
  { title: "Needs someone to talk to tonight", area: "crisis" },
  { title: "Safety plan update", area: "crisis" },
  { title: "Unsafe at home, asking about options", area: "crisis" },
  { title: "Check-in after a hard week", area: "crisis" },
  { title: "Crisis line follow-up", area: "crisis" },
  { title: "Worried about a family member", area: "crisis" },
  { title: "Panic attacks getting worse", area: "crisis" },
  { title: "Eviction notice question", area: "housing" },
  { title: "Shelter bed availability", area: "housing" },
  { title: "Security deposit help", area: "housing" },
  { title: "Moving assistance request", area: "housing" },
  { title: "Transitional housing application", area: "housing" },
  { title: "Landlord repair issue", area: "housing" },
  { title: "Temporary housing after a fire", area: "housing" },
];

const SHORT_DESCRIPTIONS: readonly Line[] = [
  { text: "Phone intake from the main line", variants: ["call"] },
  { text: "Follow-up from an earlier call", variants: ["call"] },
  {
    text: "Transferred from the crisis line",
    area: "crisis",
    variants: ["call"],
  },
  { text: "Missed call on the main line", variants: ["missed"] },
  { text: "Voicemail left after hours", variants: ["voicemail"] },
  {
    text: "Client left a voicemail asking for a callback",
    variants: ["voicemail"],
  },
  {
    text: "Call came in while every volunteer was on another line",
    variants: ["missed"],
  },
  { text: "Client texted the support line", variants: ["sms"] },
  { text: "Submitted through the online intake form", variants: ["intake"] },
  {
    text: "Opened by a volunteer after a walk-in visit",
    variants: ["staff"],
  },
  {
    text: "Opened by a volunteer from a partner agency referral",
    variants: ["staff"],
  },
  { text: "Client asked about available resources", variants: CONTACTED },
  { text: "Case opened during evening shift", variants: CONTACTED },
  { text: "Client asked for a callback", variants: ["sms", "intake"] },
];

// First contact from someone the line has not heard from on this ticket.
const OPENERS: readonly Line[] = [
  { text: "I need some help please" },
  { text: "I have a question about my case" },
  { text: "Is there anyone available to talk today?" },
  { text: "Is there someone available who speaks Spanish?" },
  {
    text: "The shelter gave me a referral to call this number.",
    area: "housing",
    variants: ["sms"],
  },
  { text: "Hi, someone gave me this number and said you could help" },
  { text: "I am not sure if this is the right place to ask, but I need help" },
  { text: "I need to talk to someone about my situation" },
  { text: "Can I get some information about what help is available?" },
  { text: "Please get back to me when you can, I need some advice" },
  { text: "Hello, is this the support line?", variants: ["sms"] },
];

// A second client message on a ticket nobody has picked up yet.
const NUDGES: readonly Line[] = [
  { text: "Is anyone there?", variants: ["sms", "intake"] },
  { text: "Can someone call me back when you get a chance?" },
  { text: "Just checking that my message went through" },
  { text: "Please call me back as soon as someone is free" },
  {
    text: "I just tried calling. Can someone call me back?",
    variants: ["missed", "voicemail"],
  },
  {
    text: "Sorry, I called a minute ago. Is there a better time to reach someone?",
    variants: ["missed", "voicemail"],
  },
];

// The volunteer's first message after taking the ticket.
const FIRST_REPLIES: readonly Line[] = [
  { text: "Checking with the team now, hang tight" },
  { text: "A specialist will review your case and reach out by end of day." },
  {
    text: "I left a message with the organization. They typically respond within 24 hours.",
  },
  { text: "Scheduled a follow-up call for next week, does Tuesday work?" },
  {
    text: "Connecting you with our housing team for next steps.",
    area: "housing",
  },
  {
    text: "I checked the shelter list and two places have beds open tonight. Want me to send the details?",
    area: "housing",
  },
  {
    text: "I am here with you. Are you somewhere safe right now?",
    area: "crisis",
  },
  {
    text: "Your referral has been sent to the legal aid clinic. They should contact you within 3 business days.",
    area: "legal",
  },
  {
    text: "I passed your info along to the agency we talked about",
    variants: ["call"],
  },
  {
    text: "Thanks for talking with me earlier. Text this number any time if something changes",
    variants: ["call"],
  },
  {
    text: "Got your voicemail. Is now a good time to talk, or is texting easier?",
    variants: ["voicemail"],
  },
  {
    text: "Hi, I am picking up your message now. Can you tell me a bit more about what is going on?",
    variants: ["sms", "intake", "voicemail"],
  },
];

// A client line and the volunteer reply that answers it.
const PAIRS: readonly Pair[] = [
  {
    client: "Can someone call me back when you get a chance?",
    volunteer:
      "I have scheduled a callback for tomorrow between 10am and 12pm.",
  },
  {
    client: "Can someone call me back? I have new information about my case.",
    volunteer: "Left you a voicemail, will try again tomorrow morning",
  },
  {
    client: "When is my next appointment? I lost the paper I wrote it on",
    volunteer:
      "It is next Thursday at 2pm. I will send you a reminder the day before",
  },
  {
    client: "I missed my appointment. Can it be rescheduled?",
    volunteer:
      "Your appointment has been rescheduled for next Thursday at 2pm.",
  },
  {
    client: "I wanted to follow up on what we talked about last time",
    volunteer:
      "I spoke with the partner agency and they confirmed your referral is active.",
  },
  {
    client: "Something came up and I have new information to share",
    volunteer: "Updated your file with the new details you sent",
  },
  {
    client: "Things have changed since we last spoke",
    volunteer:
      "I have updated your case file with the new information. We will follow up within 48 hours.",
  },
  {
    client: "I need to update my phone number, can someone help?",
    volunteer: "I have noted your updated contact information in the system.",
  },
  {
    client: "Thank you for the help last time. I have a follow-up question.",
    volunteer: "I will look into this for you and get back to you tomorrow",
  },
  {
    client:
      "My situation has changed since we last talked. I need to speak with someone.",
    volunteer:
      "I have documented your concern. A supervisor will review this within one business day.",
  },
  {
    client:
      "Things have gotten worse since our last call. Please call me back.",
    volunteer:
      "I have escalated your case to our crisis team for immediate attention.",
    variants: ["call"],
  },
  {
    client: "My court date was moved. I need to let my advocate know.",
    volunteer:
      "I have added the new details to your file. Your assigned advocate will follow up.",
    area: "legal",
  },
  {
    client: "I have a question about the program I was referred to.",
    volunteer:
      "The program you are asking about has openings. I will send you the enrollment information.",
  },
  {
    client: "I received a letter I do not understand. Can someone explain it?",
    volunteer:
      "Your case has been transferred to a specialist who handles this type of request.",
  },
  {
    client: "I need help filling out some forms before my deadline.",
    volunteer:
      "The documents you need are available at the courthouse on 4th Street. Ask for the self-help center.",
    area: "legal",
  },
  {
    client: "I am somewhere safe for now but I do not want to go back tonight",
    volunteer:
      "That makes sense. Let us work out where you can stay tonight, I will stay on this with you",
    area: "crisis",
  },
  {
    client: "It got bad again last night",
    volunteer:
      "I am sorry. Are you hurt, and are you safe where you are right now?",
    area: "crisis",
  },
  {
    client: "The shelter said they are full until next week",
    volunteer:
      "I will call the other two on our list and see who has space sooner",
    area: "housing",
  },
  {
    client: "My landlord says I have to be out by Friday",
    volunteer:
      "A notice like that is often not enough on its own. I am sending you the tenant rights line, they can look at it today",
    area: "housing",
  },
];

const NOTES: readonly Line[] = [
  {
    text: "Contacted partner agency directly. They confirmed availability for this week.",
  },
  {
    text: "Discussed case in team standup. Consensus is to escalate to manager review.",
  },
  { text: "Client seems anxious, approach carefully" },
  { text: "Coordinating with housing team on this", area: "housing" },
  {
    text: "Checked the shelter availability list, two openings this week.",
    area: "housing",
  },
  {
    text: "Reviewed the safety plan with the client. Crisis team is aware.",
    area: "crisis",
  },
  { text: "Supervisor reviewed, approved next steps" },
];

// Written by the volunteer who answered, right after hanging up.
const CALL_NOTES: readonly Line[] = [
  {
    text: "Caller sounded distressed but confirmed they are in a safe location. Monitoring.",
  },
  {
    text: "Verified caller identity against existing records. Information matches.",
  },
  { text: "Language barrier noted. Arranged interpreter for next callback." },
  {
    text: "Talked through options on the call. Client prefers texts for follow-up.",
  },
  {
    text: "Call went well. Client is safe for now and will text if anything changes.",
  },
  {
    text: "Client mostly asked about deadlines. Agreed to send next steps by text.",
  },
  {
    text: "Short call, client had to go. Asked for a text follow-up instead.",
  },
  {
    text: "Went through the intake questions on the call. No immediate safety concerns.",
    area: "general",
  },
];

// Subjects of the volunteer's first email; the client's replies use "Re: ".
const EMAIL_SUBJECTS: readonly string[] = [
  "Following up on your request",
  "Next steps",
  "Information you asked about",
  "Checking in from the support line",
  "Your referral",
  "A few options for you",
];

// A volunteer's first message on a ticket they opened themselves.
const STAFF_FIRST_REPLIES: readonly Line[] = [
  {
    text: "Hi, this is the support line following up on your visit today. Is this a good way to reach you?",
  },
  {
    text: "Hello, a partner agency passed along your details and asked us to reach out. Is now an okay time?",
  },
  {
    text: "Hi, following up on our conversation at the front desk. I have the information you asked about.",
  },
];

// The note a volunteer leaves when opening a ticket themselves.
const STAFF_NOTES: readonly Line[] = [
  {
    text: "Met the client at the front desk. They asked for help and a way to follow up.",
  },
  {
    text: "Referral from a partner agency. Client agreed to be contacted.",
  },
  {
    text: "Opened this after a walk-in visit. Client prefers that we reach out first.",
  },
];

// --- Deterministic choice ---

/** Simple deterministic hash for reproducible "random" values. */
function seedHash(i: number, salt: number): number {
  let h = (i * 2654435761 + salt * 40503) >>> 0;
  h = ((h ^ (h >>> 16)) * 2246822507) >>> 0;
  h = ((h ^ (h >>> 13)) * 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function pick<T>(pool: readonly T[], n: number): T {
  const item = pool[n % pool.length];
  if (item === undefined) {
    throw new SeedStoryError("Seed content pool is empty");
  }
  return item;
}

function fits(item: Tagged, variant: Variant, area: Area): boolean {
  const variantOk =
    item.variants === undefined
      ? CONTACTED.includes(variant)
      : item.variants.includes(variant);
  const areaOk = item.area === undefined || item.area === area;
  return variantOk && areaOk;
}

function fitting<T extends Tagged>(
  pool: readonly T[],
  variant: Variant,
  area: Area,
): T[] {
  return pool.filter((item) => fits(item, variant, area));
}

/** Indices 0..n-1 in a fixed hash order, for exact-proportion allocation. */
function hashOrder(n: number, salt: number): number[] {
  return Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => seedHash(a, salt) - seedHash(b, salt) || a - b,
  );
}

// --- Story planning ---

const DAY = 1_440;
/** Everything except the recent set below stays at least this old. */
const QUIET_FLOOR = 61;
const NEW_STORY_MAX = 6;
/** Share of stories that get one early priority raise. */
const RAISE_SHARE = 0.15;
/** Share of stories with a conversation that continue by email. */
const EMAIL_SHARE = 0.15;
/** Origins whose conversation may move to email; phone origins keep texting. */
const EMAIL_ORIGINS: ReadonlySet<SeedOriginKind> = new Set<SeedOriginKind>([
  "sms",
  "intake",
  "staff",
]);
/** Stories this recent or newer never get a thread; only brand-new stories live here. */
const NEW_STORY_WINDOW = 180;
const MIN_WORKED_AGE = 360;

type Outcome = "closed" | "hold" | "me" | "other" | "new" | "waiting";

type RecentRole =
  | "newStaff"
  | "newIntake"
  | "newVoicemail"
  | "meCall"
  | "meSms"
  | "otherAssign"
  | "closed"
  | "urgentSms";

interface RecentSpec {
  readonly role: RecentRole;
  readonly outcome: Outcome;
  /** Origin kind the story must have. */
  readonly kind?: SeedOriginKind;
  /** Origin kind the story must not have. */
  readonly notKind?: SeedOriginKind;
  /** Minutes ago of the story's one last-hour event. */
  readonly at: number;
}

// The only events inside the last hour, so the dashboard's lanes and
// activity feed open on a mix of origins and event kinds: three new tickets
// (opened by a volunteer, by voicemail, by intake form), a client reply on
// my answered call, my own text reply, someone else picking up a ticket, a
// close, and an urgent unassigned text.
const RECENT_SPECS: readonly RecentSpec[] = [
  { role: "meCall", outcome: "me", kind: "call", at: 4 },
  { role: "newStaff", outcome: "new", kind: "staff", at: 8 },
  { role: "urgentSms", outcome: "waiting", kind: "sms", at: 13 },
  { role: "newVoicemail", outcome: "new", kind: "voicemail", at: 19 },
  { role: "otherAssign", outcome: "other", notKind: "call", at: 26 },
  { role: "meSms", outcome: "me", kind: "sms", at: 33 },
  { role: "closed", outcome: "closed", at: 41 },
  { role: "newIntake", outcome: "new", kind: "intake", at: 50 },
];

interface Plan {
  readonly outcome: Outcome;
  readonly kind: SeedOriginKind;
  readonly age: number;
}

const QUEUES: readonly SeedQueue[] = ["Intake", "Crisis", "Housing"];

function queueFor(area: Area): SeedQueue {
  if (area === "housing") return "Housing";
  if (area === "crisis") return "Crisis";
  return "Intake";
}

function initialPriorityFor(queue: SeedQueue, h: number): TicketPriority {
  const r = h % 20;
  if (queue === "Crisis") {
    if (r < 7) return "high";
    if (r < 11) return "urgent";
    return "normal";
  }
  if (r < 6) return "low";
  if (r < 18) return "normal";
  return "high";
}

/** Gap between messages: minutes most of the time, hours or most of a day otherwise. */
function messageGap(h: number): number {
  const r = h % 10;
  const size = h >>> 8;
  if (r < 5) return 3 + (size % 57);
  if (r < 8) return 60 + (size % 540);
  return 600 + (size % 841);
}

function planStories(n: number): Plan[] {
  // Ages: half in the last week, 30% in the week before, the rest older.
  const ages = new Map<number, number>();
  hashOrder(n, 3).forEach((idx, rank) => {
    const within = seedHash(idx, 4);
    if (rank < n * 0.5) {
      ages.set(idx, MIN_WORKED_AGE + (within % (7 * DAY - MIN_WORKED_AGE)));
    } else if (rank < n * 0.8) {
      ages.set(idx, 7 * DAY + (within % (7 * DAY)));
    } else {
      ages.set(idx, 14 * DAY + (within % (16 * DAY)));
    }
  });

  const kinds = new Map<number, SeedOriginKind>();
  hashOrder(n, 2).forEach((idx, rank) => {
    if (rank < n * 0.28) kinds.set(idx, "call");
    else if (rank < n * 0.55) kinds.set(idx, "sms");
    else if (rank < n * 0.7) kinds.set(idx, "intake");
    else if (rank < n * 0.85) kinds.set(idx, "staff");
    else if (rank < n * 0.95) kinds.set(idx, "voicemail");
    else kinds.set(idx, "quarantine");
  });

  const outcomes = new Map<number, Outcome>();
  const order = hashOrder(n, 11);
  const take = (
    outcome: Outcome,
    count: number,
    eligible: (idx: number) => boolean,
  ): void => {
    let left = count;
    for (const idx of order) {
      if (left === 0) return;
      if (outcomes.has(idx) || !eligible(idx)) continue;
      outcomes.set(idx, outcome);
      left--;
    }
  };
  take("closed", Math.round(n * 0.08), (idx) => (ages.get(idx) ?? 0) > 5 * DAY);
  take("new", Math.min(NEW_STORY_MAX, Math.floor(n / 10)), () => true);
  take("hold", Math.round(n * 0.07), () => true);
  take("me", Math.round(n * 0.17), () => true);
  take("other", Math.round(n * 0.12), () => true);

  // Brand-new stories arrive within the last three hours, just outside the
  // last hour. The recent set moves two of them inside it.
  for (const idx of order) {
    if (outcomes.get(idx) !== "new") continue;
    ages.set(idx, 70 + (seedHash(idx, 15) % (NEW_STORY_WINDOW - 72)));
  }

  return Array.from({ length: n }, (_, idx) => ({
    outcome: outcomes.get(idx) ?? "waiting",
    kind: kinds.get(idx) ?? "sms",
    age: ages.get(idx) ?? MIN_WORKED_AGE,
  }));
}

/**
 * Picks the stories that make up the recent set and fits them to it. Kinds
 * are swapped with stories outside the set, so the origin mix is unchanged.
 */
function assignRecentRoles(base: readonly Plan[]): {
  readonly plans: Plan[];
  readonly roles: Map<number, RecentSpec>;
} {
  const n = base.length;
  const kinds = new Map<number, SeedOriginKind>();
  base.forEach((plan, idx) => {
    kinds.set(idx, plan.kind);
  });
  const roles = new Map<number, RecentSpec>();
  const order = hashOrder(n, 91);
  for (const spec of RECENT_SPECS) {
    const idx = order.find(
      (i) => !roles.has(i) && base.at(i)?.outcome === spec.outcome,
    );
    if (idx !== undefined) roles.set(idx, spec);
  }

  const donors = hashOrder(n, 92);
  for (const [idx, spec] of roles) {
    const current = kinds.get(idx);
    if (current === undefined) continue;
    const want = spec.kind ?? (current === spec.notKind ? "sms" : current);
    if (want === current) continue;
    const donor = donors.find((i) => !roles.has(i) && kinds.get(i) === want);
    if (donor !== undefined) kinds.set(donor, current);
    kinds.set(idx, want);
  }

  const plans = base.map((plan, idx) => {
    const spec = roles.get(idx);
    const kind = kinds.get(idx) ?? plan.kind;
    if (spec?.outcome === "new") return { ...plan, kind, age: spec.at };
    if (spec?.role === "otherAssign") {
      // Picked up 50 to 80 minutes after it came in, with no reply yet.
      return { ...plan, kind, age: 71 + (seedHash(idx, 93) % 30) };
    }
    return { ...plan, kind };
  });
  return { plans, roles };
}

/** Recent new tickets stay out of Needs attention; the urgent text leads it. */
function recentPriority(
  spec: RecentSpec | undefined,
  priority: TicketPriority,
): TicketPriority {
  const elevated = priority === "high" || priority === "urgent";
  if (spec?.outcome === "new" && elevated) return "normal";
  if (spec?.role === "urgentSms" && !elevated) return "high";
  return priority;
}

// --- Story drafting ---

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
type StepBody = DistributiveOmit<SeedStep, "agoMinutes">;

interface Draft {
  readonly title: string;
  readonly description: string;
  readonly queue: SeedQueue;
  readonly initialPriority: TicketPriority;
  readonly origin: SeedOrigin;
  readonly channel: SeedChannel;
  readonly emailSubject?: string;
  /** Steps before assignment, placed by fixed offset from the origin. */
  readonly pre: readonly { readonly body: StepBody; readonly offset: number }[];
  /** Steps after assignment, placed by gap from the step before. */
  readonly post: readonly { readonly body: StepBody; readonly gap: number }[];
  /** Replaces the last step's time; used only to place last-hour activity. */
  lastAt?: number;
}

function isAssigned(outcome: Outcome): boolean {
  return (
    outcome === "closed" ||
    outcome === "hold" ||
    outcome === "me" ||
    outcome === "other"
  );
}

interface TopicChoice {
  readonly topic: Topic;
  readonly variant: Variant;
  readonly area: Area;
  readonly queue: SeedQueue;
  readonly initialPriority: TicketPriority;
}

/**
 * Queues split 40/30/30, allocated by hash rank so the split is exact.
 * Routing a quarantined voicemail always opens the ticket in the intake
 * queue, so quarantine stories take Intake places first.
 */
function planQueues(plans: readonly Plan[]): Map<number, SeedQueue> {
  const n = plans.length;
  const queues = new Map<number, SeedQueue>();
  const order = hashOrder(n, 33);
  const isQuarantine = (idx: number): boolean =>
    plans.at(idx)?.kind === "quarantine";
  [
    ...order.filter(isQuarantine),
    ...order.filter((idx) => !isQuarantine(idx)),
  ].forEach((idx, rank) => {
    if (rank < n * 0.4) queues.set(idx, "Intake");
    else if (rank < n * 0.7) queues.set(idx, "Crisis");
    else queues.set(idx, "Housing");
  });
  return queues;
}

/** Content variant for a story: answered and missed calls differ, and both voicemail origins read the same. */
function variantOf(plan: Plan): Variant {
  switch (plan.kind) {
    case "call":
      return isAssigned(plan.outcome) ? "call" : "missed";
    case "quarantine":
      return "voicemail";
    case "sms":
    case "intake":
    case "voicemail":
    case "staff":
      return plan.kind;
  }
}

/** Area a queue-agnostic topic takes on in each queue. */
function defaultArea(queue: SeedQueue): Area {
  if (queue === "Housing") return "housing";
  if (queue === "Crisis") return "crisis";
  return "general";
}

/**
 * Picks each story's topic from the ones that fit its queue and origin.
 * Topics cycle per queue and variant so repeats are spread as thin as
 * possible.
 */
function chooseTopics(plans: readonly Plan[]): TopicChoice[] {
  const queues = planQueues(plans);
  const cursors = new Map<string, number>();
  return plans.map((plan, idx) => {
    const variant = variantOf(plan);
    const queue = queues.get(idx) ?? "Intake";
    const topics = TOPICS.filter(
      (t) =>
        (t.variants ?? CONTACTED).includes(variant) &&
        (t.anyQueue === true || queueFor(t.area ?? "general") === queue),
    );
    const key = `${variant}:${queue}`;
    const cursor =
      cursors.get(key) ??
      seedHash(VARIANTS.indexOf(variant) * 3 + QUEUES.indexOf(queue), 5);
    cursors.set(key, cursor + 1);
    const topic = pick(topics, cursor);
    const area =
      topic.anyQueue === true ? defaultArea(queue) : (topic.area ?? "general");
    return {
      topic,
      variant,
      area,
      queue,
      // Routed voicemails open at the default priority.
      initialPriority:
        plan.kind === "quarantine"
          ? "normal"
          : initialPriorityFor(queue, seedHash(idx, 10)),
    };
  });
}

/** Whether an unassigned, client-originated story gets a second client message. */
function getsNudge(idx: number, recent: RecentSpec | undefined): boolean {
  return recent !== undefined || seedHash(idx, 8) % 2 === 0;
}

/** Channel a story's conversation starts on before any switch to email. */
function defaultChannel(kind: SeedOriginKind): SeedChannel {
  return kind === "intake" ? "message" : "sms";
}

function draftStory(
  idx: number,
  plan: Plan,
  choice: TopicChoice,
  raisePriority: boolean,
  recent: RecentSpec | undefined,
  channel: SeedChannel,
): Draft {
  const { topic, variant, area, queue, initialPriority } = choice;
  const answered = variant === "call";
  const staff = plan.kind === "staff";
  const description =
    topic.description ??
    pick(fitting(SHORT_DESCRIPTIONS, variant, area), seedHash(idx, 16)).text;

  const callDurationSeconds = answered
    ? 120 + (seedHash(idx, 7) % 1381)
    : undefined;
  const written = plan.kind === "sms" || plan.kind === "intake";
  const origin: SeedOrigin = {
    kind: plan.kind,
    content: written
      ? pick(fitting(OPENERS, variant, area), seedHash(idx, 6)).text
      : "",
    ...(callDurationSeconds !== undefined ? { callDurationSeconds } : {}),
    agoMinutes: plan.age,
  };

  const pre: { body: StepBody; offset: number }[] = [];
  const post: { body: StepBody; gap: number }[] = [];
  const base = {
    title: topic.title,
    description,
    queue,
    initialPriority,
    origin,
    channel,
    ...(channel === "email"
      ? { emailSubject: pick(EMAIL_SUBJECTS, seedHash(idx, 17)) }
      : {}),
  };
  const staffNote = (): StepBody => ({
    kind: "note",
    content: pick(fitting(STAFF_NOTES, variant, area), seedHash(idx, 34)).text,
  });

  if (plan.outcome === "new") return { ...base, pre, post };

  if (plan.outcome === "waiting") {
    // A ticket a volunteer opened has no client contact to follow up on;
    // its one step is the note the volunteer left.
    if (staff) {
      post.push({ body: staffNote(), gap: 1 + (seedHash(idx, 35) % 10) });
      return { ...base, pre, post };
    }
    if (getsNudge(idx, recent)) {
      post.push({
        body: {
          kind: "message",
          from: "client",
          content: pick(fitting(NUDGES, variant, area), seedHash(idx, 18)).text,
        },
        gap: 5 + (seedHash(idx, 19) % 596),
      });
    }
    return { ...base, pre, post };
  }

  const assignee: SeedAssignee =
    plan.outcome === "me"
      ? "me"
      : plan.outcome === "other"
        ? "other"
        : seedHash(idx, 9) % 2 === 0
          ? "me"
          : "other";

  // Just picked up by someone else: the assignment is the last event.
  if (recent?.role === "otherAssign") {
    pre.push({
      body: { kind: "assign", to: assignee },
      offset: plan.age - recent.at,
    });
    return { ...base, pre, post };
  }

  // Worked stories: a call or staff note and an optional priority raise,
  // then the one assignment, then the conversation. A voicemail origin
  // takes its first minute (the voicemail follows the missed call), so
  // steps start later.
  let lastPre = plan.kind === "voicemail" ? 1 : 0;
  if (staff) {
    lastPre = 1 + (seedHash(idx, 35) % 4);
    pre.push({ body: staffNote(), offset: lastPre });
  }
  if (callDurationSeconds !== undefined) {
    lastPre = 2 + (seedHash(idx, 23) % 8);
    pre.push({
      body: {
        kind: "note",
        content: pick(fitting(CALL_NOTES, variant, area), seedHash(idx, 24))
          .text,
      },
      offset: lastPre,
    });
  }
  const assignOffset = Math.max(5 + (seedHash(idx, 25) % 116), lastPre + 2);
  if (raisePriority) {
    const to: TicketPriority =
      initialPriority === "high" || seedHash(idx, 13) % 10 >= 7
        ? "urgent"
        : "high";
    pre.push({
      body: { kind: "priority", to },
      offset: lastPre + 1 + (seedHash(idx, 26) % (assignOffset - lastPre - 1)),
    });
  }
  pre.push({ body: { kind: "assign", to: assignee }, offset: assignOffset });

  const firstReplies = fitting(
    staff ? STAFF_FIRST_REPLIES : FIRST_REPLIES,
    variant,
    area,
  );
  const pairs = fitting(PAIRS, variant, area);
  const pairStart = seedHash(idx, 27);
  const notes = fitting(NOTES, variant, area);
  const exchanges = 1 + (seedHash(idx, 28) % 5);
  // The recent "me" stories end on a client reply (unread) and on my own
  // reply respectively.
  const trailingClient =
    recent?.role === "meCall"
      ? true
      : recent?.role === "meSms"
        ? false
        : seedHash(idx, 14) % 2 === 0;
  let noteUsed = false;

  post.push({
    body: {
      kind: "message",
      from: "volunteer",
      content: pick(firstReplies, seedHash(idx, 29)).text,
    },
    gap: 2 + (seedHash(idx, 30) % 30),
  });
  for (let j = 0; j < exchanges; j++) {
    const isLastExchange = j === exchanges - 1;
    if (isLastExchange && !trailingClient) break;
    const pair = pick(pairs, pairStart + j);
    // An occasional note between messages, never the final step.
    if (!noteUsed && seedHash(idx, 40 + j) % 4 === 0) {
      noteUsed = true;
      post.push({
        body: {
          kind: "note",
          content: pick(notes, seedHash(idx, 50 + j)).text,
        },
        gap: 1 + (seedHash(idx, 60 + j) % 20),
      });
    }
    post.push({
      body: { kind: "message", from: "client", content: pair.client },
      gap: messageGap(seedHash(idx, 70 + j)),
    });
    if (isLastExchange) break;
    post.push({
      body: { kind: "message", from: "volunteer", content: pair.volunteer },
      gap: messageGap(seedHash(idx, 80 + j)),
    });
  }

  if (plan.outcome === "hold") {
    post.push({ body: { kind: "hold" }, gap: 5 + (seedHash(idx, 31) % 600) });
  } else if (plan.outcome === "closed") {
    post.push({
      body: { kind: "close" },
      gap: 60 + (seedHash(idx, 32) % 2880),
    });
  }
  return { ...base, pre, post };
}

/** Converts a draft's offsets and gaps to minutes-ago, compressing the tail to stay above the quiet floor. */
function finalize(draft: Draft): SeedStory {
  const age = draft.origin.agoMinutes;
  const pre = [...draft.pre].sort((a, b) => a.offset - b.offset);
  const postBase = pre.at(-1)?.offset ?? 0;
  const gapSum = draft.post.reduce((sum, p) => sum + p.gap, 0);
  const room = age - QUIET_FLOOR - postBase;
  const gaps =
    postBase + gapSum <= age - QUIET_FLOOR
      ? draft.post.map((p) => p.gap)
      : draft.post.map(
          (p) => 1 + Math.floor((p.gap * (room - draft.post.length)) / gapSum),
        );

  const steps: SeedStep[] = pre.map((p) => ({
    ...p.body,
    agoMinutes: age - p.offset,
  }));
  let offset = postBase;
  draft.post.forEach((p, k) => {
    offset += gaps.at(k) ?? 1;
    steps.push({ ...p.body, agoMinutes: age - offset });
  });

  const last = steps.at(-1);
  if (draft.lastAt !== undefined && last !== undefined) {
    steps[steps.length - 1] = { ...last, agoMinutes: draft.lastAt };
  }

  return {
    title: draft.title,
    description: draft.description,
    queue: draft.queue,
    initialPriority: draft.initialPriority,
    origin: draft.origin,
    channel: draft.channel,
    ...(draft.emailSubject !== undefined
      ? { emailSubject: draft.emailSubject }
      : {}),
    steps,
  };
}

/** Deterministic: same count, same stories. No Math.random, no Date. */
export function buildSeedStories(count: number): SeedStory[] {
  const n = Math.max(0, Math.floor(count));
  const { plans, roles } = assignRecentRoles(planStories(n));
  const choices = chooseTopics(plans).map((choice, idx) => ({
    ...choice,
    initialPriority: recentPriority(roles.get(idx), choice.initialPriority),
  }));

  // Priority raises go to worked stories that still have room to rise.
  const raiseCount = Math.round(n * RAISE_SHARE);
  const raised = new Set<number>();
  for (const idx of hashOrder(n, 12)) {
    if (raised.size === raiseCount) break;
    const plan = plans.at(idx);
    const choice = choices.at(idx);
    if (plan === undefined || choice === undefined) continue;
    // The just-assigned story has no steps before its assignment.
    if (roles.get(idx)?.role === "otherAssign") continue;
    if (isAssigned(plan.outcome) && choice.initialPriority !== "urgent") {
      raised.add(idx);
    }
  }

  // About 15% of the stories with a conversation continue by email. Email
  // only follows a volunteer's first email, so only worked stories qualify
  // (their first message is always the volunteer's), and phone origins and
  // the recent text and call stories keep texting.
  const withMessages = plans.filter((plan, idx) => {
    const spec = roles.get(idx);
    if (isAssigned(plan.outcome)) return spec?.role !== "otherAssign";
    return (
      plan.outcome === "waiting" &&
      plan.kind !== "staff" &&
      getsNudge(idx, spec)
    );
  }).length;
  const emailCount = Math.round(withMessages * EMAIL_SHARE);
  const emailed = new Set<number>();
  for (const idx of hashOrder(n, 94)) {
    if (emailed.size === emailCount) break;
    const plan = plans.at(idx);
    if (plan === undefined || !isAssigned(plan.outcome)) continue;
    if (roles.has(idx)) continue;
    if (EMAIL_ORIGINS.has(plan.kind)) emailed.add(idx);
  }

  const drafts: Draft[] = [];
  plans.forEach((plan, idx) => {
    const choice = choices.at(idx);
    if (choice !== undefined) {
      const channel = emailed.has(idx) ? "email" : defaultChannel(plan.kind);
      drafts.push(
        draftStory(idx, plan, choice, raised.has(idx), roles.get(idx), channel),
      );
    }
  });

  // Move the one last-hour event of each recent story into place. New
  // tickets and the just-assigned one are already placed by their plan.
  for (const [idx, spec] of roles) {
    const draft = drafts.at(idx);
    if (draft === undefined) continue;
    if (spec.outcome === "new" || spec.role === "otherAssign") continue;
    draft.lastAt = spec.at;
  }

  return drafts.map(finalize);
}
