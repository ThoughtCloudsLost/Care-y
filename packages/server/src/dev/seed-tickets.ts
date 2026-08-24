import { InternalError } from "../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { TicketPriority } from "@care-y/shared";
import {
  generateContentKey,
  encryptContent,
  buildContentAad,
  followupSlot,
  cursorSlot,
  blobSlot,
  filenameSlot,
  eciesEncrypt,
  toRistrettoPoint,
} from "@care-y/crypto";

export interface SeedTicketOptions {
  handcraftedOnly?: boolean;
}

export async function seedTestTickets(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  userId: string,
  orgSchema: string,
  options?: SeedTicketOptions,
): Promise<{ ticketIds: string[] }> {
  // 1. Look up vol_public for the current user
  const userKeys = await tDb
    .selectFrom("user_keys")
    .select("vol_public")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!userKeys?.vol_public) {
    throw new InternalError(
      "user_keys.vol_public not found. Run registerCrypto first.",
    );
  }

  const volPublic = toRistrettoPoint(new Uint8Array(userKeys.vol_public));

  // 2. Fetch queues + clients (created by seed script)
  // Queue names are encrypted (ADR-030), so we fetch all active
  // queues by sort_order and assign them to the seed labels by
  // position: sort_order 1 = "Intake", 2 = "Crisis", 3 = "Housing".
  const queues = await tDb
    .selectFrom("queues")
    .select(["id", "sort_order"])
    .where("is_active", "=", true)
    .orderBy("sort_order", "asc")
    .execute();
  const seedLabels = ["Intake", "Crisis", "Housing"];
  const queueMap = new Map<string, string>();
  for (const [idx, q] of queues.entries()) {
    const label = seedLabels.at(idx);
    if (label !== undefined) queueMap.set(label, q.id);
  }

  const clients = await tDb
    .selectFrom("clients")
    .select(["id"])
    .orderBy("created_at", "asc")
    .execute();

  if (clients.length === 0) {
    throw new InternalError("No clients found. Run seed first.");
  }

  // Helper: minutes ago as a Date
  function minutesAgo(m: number): Date {
    return new Date(Date.now() - m * 60_000);
  }

  // 3. Ticket definitions with varied data
  // Clients are assigned round-robin from whatever clients exist.
  interface FollowUpDef {
    content: string;
    source: string;
    type?: string; // default: "message"
    isPrivate?: boolean; // default: false
    agoMinutes: number;
    media?: MediaDef[];
    eventParams?: Record<string, unknown>;
  }

  interface MediaDef {
    kind: "recording" | "image" | "file";
    /** For recordings: duration in seconds. */
    durationSeconds?: number;
    /** For attachments: plaintext filename (encrypted at insert time). */
    filename?: string;
    /** For attachments: MIME content type. */
    contentType?: string;
  }

  interface TicketDef {
    title: string;
    description: string;
    queue: string;
    priority: TicketPriority;
    assignedTo: string | null;
    onHold: boolean;
    withKeyWrap: boolean;
    createdAgo: number; // minutes ago
    followUps: FollowUpDef[];
    /**
     * Minutes ago the seeded volunteer last read this ticket. When set
     * (and the ticket has a key wrap), a real encrypted read cursor is
     * inserted, so follow-ups by others newer than this render the
     * unread badge. Omit for never-opened tickets (no cursor row).
     */
    unreadSince?: number;
  }

  // --- Synthetic media generators ---
  // Minimal valid files for testing. Production uses real
  // Twilio recordings / user uploads, but the encryption
  // pipeline is identical.

  /** Minimal valid WAV header + sine wave (~1 second, 8kHz mono). */
  function generateWav(durationSec: number): Buffer {
    const sampleRate = 8000;
    const numSamples = sampleRate * durationSec;
    const dataSize = numSamples * 2; // 16-bit PCM
    const header = Buffer.alloc(44);
    // RIFF header
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    // fmt chunk
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // chunk size
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28); // byte rate
    header.writeUInt16LE(2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    // data chunk
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);
    const data = Buffer.alloc(dataSize);
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
      data.writeInt16LE(Math.round(sample * 16000), i * 2);
    }
    return Buffer.concat([header, data]);
  }

  /** Valid 64x64 cyan PNG (178 bytes). Visible on both light and dark. */
  function generatePng(): Buffer {
    // Generated programmatically: 64x64 RGB, solid #00CCBB.
    // CRC32 checksums computed correctly for all chunks.
    const hex =
      "89504e470d0a1a0a0000000d49484452000000400000" +
      "00400802000000250be6890000007949444154789ced" +
      "cf410900300cc0c0fab7340b1355117b1c8340045c66" +
      "eef93b2f68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4e0ad050ceb71698b8b2a940000000049454e44ae42" +
      "6082";
    return Buffer.from(hex, "hex");
  }

  /** Small text file for attachment testing. */
  function generateTextFile(): Buffer {
    return Buffer.from(
      "CARE-Y Safety Plan Template\n\n" +
        "1. Warning signs that a crisis may be developing\n" +
        "2. Internal coping strategies\n" +
        "3. People and social settings that provide distraction\n" +
        "4. People I can ask for help\n" +
        "5. Professionals or agencies I can contact during a crisis\n" +
        "6. Making the environment safe\n",
      "utf-8",
    );
  }

  const me = userId;
  const ticketDefs: TicketDef[] = [
    // --- MY TICKETS (assigned to me) ---
    {
      title: "Help with housing",
      description: "Client needs housing referral and support",
      queue: "Housing",
      priority: "normal",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 4320, // 3 days
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 4310,
        },
        {
          content: "I need help finding a place to stay",
          source: "client",
          agoMinutes: 4300,
        },
        {
          content: "I can look into shelters in your area",
          source: "volunteer",
          agoMinutes: 4200,
        },
        {
          content:
            "Client sounds stressed but stable. Shelter list sent via SMS.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 4190,
        },
        {
          content: "Thank you, any help is appreciated",
          source: "client",
          agoMinutes: 1440,
        },
        {
          content: "Priority changed to high",
          source: "system",
          type: "priority_changed",
          eventParams: { to: "high" },
          agoMinutes: 1430,
        },
        {
          content: "Status changed to closed",
          source: "system",
          type: "status_closed",
          agoMinutes: 720,
        },
        {
          content: "Status changed to open",
          source: "system",
          type: "status_opened",
          agoMinutes: 360,
        },
      ],
    },
    {
      title: "Follow-up on legal aid referral",
      description: "Client was referred to legal aid last week",
      queue: "Intake",
      priority: "normal",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 10080, // 7 days
      followUps: [
        {
          content: "Referred to legal aid org",
          source: "volunteer",
          agoMinutes: 10000,
        },
        {
          content: "They said they would call me back",
          source: "client",
          agoMinutes: 8640,
        },
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 7200,
          media: [
            {
              kind: "recording",
              durationSeconds: 12,
            },
          ],
        },
        {
          content: "Still waiting, called again",
          source: "volunteer",
          agoMinutes: 5760,
        },
        {
          content: "",
          source: "client",
          agoMinutes: 4320,
          media: [
            {
              kind: "image",
              filename: "photo.png",
              contentType: "image/png",
            },
          ],
        },
        {
          content: "They finally reached out, thank you",
          source: "client",
          agoMinutes: 2880,
        },
        {
          content: "Checking in, did the meeting happen?",
          source: "volunteer",
          agoMinutes: 1440,
        },
      ],
    },
    {
      title: "Safety planning session",
      description: "Client requested safety planning support",
      queue: "Crisis",
      priority: "high",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 180, // 3 hours
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 175,
        },
        {
          content: "I need to talk about my situation",
          source: "client",
          agoMinutes: 170,
        },
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 165,
          media: [
            {
              kind: "recording",
              durationSeconds: 47,
            },
          ],
        },
        {
          content: "I am here for you. Can you tell me more?",
          source: "volunteer",
          agoMinutes: 160,
        },
        {
          content: "High-risk situation. Follow up within 24h per protocol.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 155,
        },
      ],
    },
    {
      title: "Benefits application help",
      description: "Assistance with benefits paperwork",
      queue: "Intake",
      priority: "low",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 20160, // 14 days
      followUps: [
        {
          content: "Need help filling out forms",
          source: "client",
          agoMinutes: 20100,
        },
      ],
    },
    {
      title: "Encrypted intake note",
      description: "Intake note from phone call, key wrap pending",
      queue: "Intake",
      priority: "normal",
      assignedTo: me,
      onHold: false,
      withKeyWrap: false, // Tests decryption fallback
      createdAgo: 60,
      followUps: [],
    },

    // --- ON HOLD ---
    {
      title: "Waiting for callback from shelter",
      description: "Client requested callback when shelter has a bed",
      queue: "Housing",
      priority: "normal",
      assignedTo: me,
      onHold: true,
      withKeyWrap: true,
      createdAgo: 7200, // 5 days
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 7100,
        },
        {
          content: "Shelter said they will call when a bed opens",
          source: "volunteer",
          agoMinutes: 5760,
        },
        {
          content: "Put on hold",
          source: "system",
          type: "hold_placed",
          agoMinutes: 5750,
        },
        {
          content: "Still no word from them",
          source: "client",
          agoMinutes: 2880,
        },
        {
          content:
            "Called shelter again, they have a long waitlist. Documented in case file.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 2000,
        },
      ],
    },
    {
      title: "Pending court date documentation",
      description: "Need documents before next court appearance",
      queue: "Intake",
      priority: "high",
      assignedTo: me,
      onHold: true,
      withKeyWrap: true,
      createdAgo: 14400, // 10 days
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 14350,
        },
        {
          content: "Court date is in two weeks, need letter",
          source: "client",
          agoMinutes: 14300,
        },
        {
          content: "Working on getting the documentation together",
          source: "volunteer",
          agoMinutes: 10080,
        },
        {
          content: "Attached the safety plan template for review",
          source: "volunteer",
          agoMinutes: 10070,
          media: [
            {
              kind: "file",
              filename: "safety-plan-template.txt",
              contentType: "text/plain",
            },
          ],
        },
        {
          content: "Put on hold",
          source: "system",
          type: "hold_placed",
          agoMinutes: 8640,
        },
        {
          content: "Waiting on court clerk response. Will check back Monday.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 8630,
        },
      ],
    },

    // --- UNASSIGNED ---
    {
      title: "Emergency referral needed",
      description: "Urgent case flagged by intake volunteer",
      queue: "Crisis",
      priority: "urgent",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 45, // 45 minutes ago
      unreadSince: 45, // opened at intake; the client reply below is unread
      followUps: [
        {
          content: "Please help, I am in danger",
          source: "client",
          agoMinutes: 40,
        },
      ],
    },
    {
      title:
        "Emergency referral needed for client who is in immediate danger and requires relocation assistance as well as legal representation for upcoming court hearing",
      description: "Multi-service coordination case",
      queue: "Crisis",
      priority: "high",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 90,
      followUps: [
        {
          content: "I need help with everything, I do not know where to start",
          source: "client",
          agoMinutes: 85,
        },
      ],
    },
    {
      title: "New intake call",
      description: "Voicemail received, needs triage",
      queue: "Intake",
      priority: "normal",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 120, // 2 hours
      followUps: [],
    },
    {
      title: "Relocation assistance request",
      description: "Client needs help with relocation planning",
      queue: "Housing",
      priority: "high",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 360, // 6 hours
      unreadSince: 360, // opened at intake; the client reply below is unread
      followUps: [
        {
          content: "I need to move but I do not know where to go",
          source: "client",
          agoMinutes: 350,
        },
      ],
    },
    {
      title: "Transportation to appointment",
      description: "Client needs ride to medical appointment",
      queue: "Intake",
      priority: "normal",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 2880, // 2 days
      followUps: [
        {
          content: "I have a doctor appointment next week",
          source: "client",
          agoMinutes: 2800,
        },
        {
          content: "Can someone help me get there?",
          source: "client",
          agoMinutes: 1440,
        },
      ],
    },
    {
      title: "Food bank referral",
      description: "Client asking about food assistance",
      queue: "Intake",
      priority: "low",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 480, // 8 hours
      followUps: [
        {
          content: "Where can I get groceries?",
          source: "client",
          agoMinutes: 470,
        },
      ],
    },
  ];

  // Generate additional tickets programmatically to test
  // virtual scrolling with large lists. Uses a simple
  // deterministic seed so re-runs produce the same data.
  // Skipped when handcraftedOnly is set (E2E tests use only the 14 above).
  const GENERATED_COUNT = options?.handcraftedOnly === true ? 0 : 106;
  const queuesArr = ["Intake", "Crisis", "Housing"] as const;
  const priorities: TicketPriority[] = [
    "low",
    "normal",
    "normal",
    "high",
    "urgent",
  ];
  const titlePrefixes = [
    "Referral request",
    "Follow-up needed",
    "New intake call",
    "Callback requested",
    "Documentation help",
    "Transportation need",
    "Safety concern",
    "Benefits question",
    "Housing inquiry",
    "Medical appointment",
    "Legal consultation",
    "Emergency contact",
    "Resource request",
    "Check-in call",
    "Outreach follow-up",
  ];
  const clientMessages = [
    "I need some help please",
    "Can someone call me back?",
    "I have a question about my case",
    "When is my next appointment?",
    "I wanted to follow up on our last conversation",
    "Is there anyone available to talk?",
    "I have new information to share",
    "Things have changed since we last spoke",
  ];
  const volMessages = [
    "I will look into this for you",
    "Checking with the team now",
    "Left a voicemail, will try again tomorrow",
    "Referred to partner organization",
    "Scheduled follow-up for next week",
    "Updated case notes with new info",
  ];

  // Simple deterministic hash for reproducible "random" values.
  function seedHash(i: number, salt: number): number {
    let h = (i * 2654435761 + salt * 40503) >>> 0;
    h = ((h ^ (h >>> 16)) * 2246822507) >>> 0;
    h = ((h ^ (h >>> 13)) * 3266489909) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  for (let g = 0; g < GENERATED_COUNT; g++) {
    const h0 = seedHash(g, 0);
    const h1 = seedHash(g, 1);
    const h2 = seedHash(g, 2);
    const h3 = seedHash(g, 3);
    const h4 = seedHash(g, 4);

    const queue = queuesArr[h0 % queuesArr.length];
    const priority = priorities[h1 % priorities.length];
    const prefix = titlePrefixes[h2 % titlePrefixes.length];
    if (queue === undefined || priority === undefined || prefix === undefined)
      continue;
    const suffix = String(g + 1).padStart(3, "0");

    // 40% assigned to me, 60% unassigned
    const assigned = h3 % 5 < 2 ? me : null;
    // 15% on hold (only if assigned)
    const hold = assigned !== null && h4 % 7 === 0;

    // Created 30 min to 30 days ago
    const ageMinutes = 30 + (h0 % 43200);

    // 0-4 follow-ups (first generated ticket gets 180 for pagination/feature testing)
    const fuCount = g === 0 ? 180 : h1 % 5;
    const followUps: FollowUpDef[] = [];

    if (g === 0) {
      // 180 follow-ups matching production data shapes.
      // Client media (MMS/voicemail): no filename (Twilio
      // doesn't provide one). Volunteer attachments: filename
      // (picked from device). Voicemail content: empty or
      // transcription. System events: exact server strings.
      const totalAge = ageMinutes;
      for (let f = 0; f < 180; f++) {
        const fuAge = Math.max(
          1,
          totalAge - Math.floor((totalAge * (f + 1)) / 181),
        );
        const fh = seedHash(0, 10 + f);
        const isClient = fh % 2 === 0;
        const msgs = isClient ? clientMessages : volMessages;

        if (f === 3) {
          followUps.push({
            content: "Assigned to Alice",
            source: "system",
            type: "volunteer_assigned",
            eventParams: { userId: me },
            agoMinutes: fuAge,
          });
        } else if (f === 10) {
          followUps.push({
            content: "Priority changed to high",
            source: "system",
            type: "priority_changed",
            eventParams: { to: "high", from: "normal" },
            agoMinutes: fuAge,
          });
        } else if (f === 20) {
          followUps.push({
            content: "Put on hold",
            source: "system",
            type: "hold_placed",
            agoMinutes: fuAge,
          });
        } else if (f === 30) {
          followUps.push({
            content: "Status changed to closed",
            source: "system",
            type: "status_closed",
            agoMinutes: fuAge,
          });
        } else if (f === 31) {
          followUps.push({
            content: "Status changed to open",
            source: "system",
            type: "status_opened",
            agoMinutes: fuAge,
          });
        } else if (f === 40) {
          followUps.push({
            content: "Assigned to Bob",
            source: "system",
            type: "volunteer_assigned",
            eventParams: { userId: me },
            agoMinutes: fuAge,
          });
        } else if (f === 5 || f === 55 || f === 120) {
          const noteText =
            f === 5
              ? "Client seems anxious, approach carefully"
              : f === 55
                ? "Coordinating with housing team on this"
                : "Supervisor reviewed, approved next steps";
          followUps.push({
            content: noteText,
            source: "volunteer",
            type: "internal_note",
            isPrivate: true,
            agoMinutes: fuAge,
          });
        } else if (f === 8) {
          // Client voicemail (inbound call, no transcription)
          followUps.push({
            content: "",
            source: "client",
            type: "voicemail",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 12 }],
          });
        } else if (f === 25) {
          // Volunteer voicemail (outbound call)
          followUps.push({
            content: "",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 30 }],
          });
        } else if (f === 65) {
          // Client voicemail with transcription
          followUps.push({
            content:
              "Hi, I wanted to talk about the appointment next week, I am not sure I can make it because my ride fell through and I need to figure out another way to get there",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 90 }],
          });
        } else if (f === 12) {
          // Client MMS image only (no text, no filename from Twilio)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "image", contentType: "image/jpeg" }],
          });
        } else if (f === 35) {
          // Client MMS image with text body
          followUps.push({
            content: "Here is a photo of the document you asked for",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "image", contentType: "image/jpeg" }],
          });
        } else if (f === 50) {
          // Volunteer sends image (from device, has filename)
          followUps.push({
            content: "Attached the resource guide",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [
              {
                kind: "image",
                filename: "resource-guide.jpg",
                contentType: "image/jpeg",
              },
            ],
          });
        } else if (f === 15) {
          // Client file via MMS (no filename from Twilio)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "file", contentType: "application/pdf" }],
          });
        } else if (f === 45) {
          // Volunteer file (from device, has filename)
          followUps.push({
            content: "Here are the referral instructions",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [
              {
                kind: "file",
                filename: "referral-instructions.docx",
                contentType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              },
            ],
          });
        } else if (f === 100) {
          // Client MMS with multiple media (no filenames)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [
              { kind: "image", contentType: "image/png" },
              { kind: "file", contentType: "application/pdf" },
            ],
          });
        } else {
          const msg = msgs[fh % msgs.length] ?? "Message";
          followUps.push({
            content: msg,
            source: isClient ? "client" : "volunteer",
            agoMinutes: fuAge,
          });
        }
      }
    } else {
      for (let f = 0; f < fuCount; f++) {
        const fh = seedHash(g, 10 + f);
        const isClient = fh % 2 === 0;
        const msgs = isClient ? clientMessages : volMessages;
        const msg = msgs[fh % msgs.length] ?? "Message";
        // Space follow-ups evenly within the ticket's age
        const fuAge = Math.max(
          1,
          ageMinutes - Math.floor((ageMinutes * (f + 1)) / (fuCount + 1)),
        );
        followUps.push({
          content: msg,
          source: isClient ? "client" : "volunteer",
          agoMinutes: fuAge,
        });
      }
    }

    ticketDefs.push({
      title: `${prefix} #${suffix}`,
      description: `Generated test ticket ${suffix}`,
      queue,
      priority,
      assignedTo: assigned,
      onHold: hold,
      withKeyWrap: true,
      createdAgo: ageMinutes,
      followUps,
    });
  }

  const createdIds: string[] = [];
  const encoder = new TextEncoder();

  for (let i = 0; i < ticketDefs.length; i++) {
    const def = ticketDefs.at(i);
    if (!def) continue;
    const client = clients.at(i % clients.length);
    if (!client) continue;
    const clientId = client.id;

    const qId = queueMap.get(def.queue);
    if (qId === undefined) {
      throw new InternalError(
        `Queue "${def.queue}" not found. Run seed first.`,
      );
    }

    // Idempotency: skip if ticket already exists for this client
    const existing = await tDb
      .selectFrom("tickets")
      .select("id")
      .where("client_id", "=", clientId)
      .executeTakeFirst();

    if (existing) {
      createdIds.push(existing.id);
      continue;
    }

    // Generate ticket key and encrypt content. Ids are minted before
    // encryption so the AAD can bind them (ADR-053).
    const tk = generateContentKey();
    const ticketId = crypto.randomUUID();
    const encryptedTitle = encryptContent(
      encoder.encode(def.title),
      tk,
      buildContentAad(ticketId, "title"),
    );
    const encryptedDescription = encryptContent(
      encoder.encode(def.description),
      tk,
      buildContentAad(ticketId, "description"),
    );

    const keyGeneration = crypto.randomUUID();
    const createdAt = minutesAgo(def.createdAgo);

    const ticket = await tDb
      .insertInto("tickets")
      .values({
        id: ticketId,
        client_id: clientId,
        queue_id: qId,
        encrypted_title: Buffer.from(encryptedTitle),
        encrypted_description: Buffer.from(encryptedDescription),
        key_generation: keyGeneration,
        assigned_to: def.assignedTo,
        on_hold: def.onHold,
        priority: def.priority,
        created_at: createdAt,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // Create ECIES key wrap
    if (def.withKeyWrap) {
      const wrap = eciesEncrypt(tk, volPublic);
      await tDb
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticket.id,
          volunteer_id: userId,
          key_generation: keyGeneration,
          ephemeral_point: Buffer.from(wrap.ephemeralPoint),
          nonce: Buffer.from(wrap.nonce),
          wrapped_key: Buffer.from(wrap.ciphertext),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    // Create follow-ups (encrypted with same ticket key, except system events
    // which carry no encrypted content under the Proton model)
    for (const fu of def.followUps) {
      const isSystem = fu.source === "system";
      const followUpId = crypto.randomUUID();
      const encryptedContent = isSystem
        ? new Uint8Array(0)
        : encryptContent(
            encoder.encode(fu.content),
            tk,
            buildContentAad(ticket.id, followupSlot(followUpId)),
          );
      const followUp = await tDb
        .insertInto("followups")
        .values({
          id: followUpId,
          ticket_id: ticket.id,
          source: fu.source,
          type: fu.type ?? "message",
          is_private: fu.isPrivate ?? false,
          encrypted_content: Buffer.from(encryptedContent),
          event_params: fu.eventParams ?? null,
          created_at: minutesAgo(fu.agoMinutes),
          ...(fu.source === "volunteer" ? { created_by: userId } : {}),
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Create media records (encrypted blobs stored in BlobStore)
      if (fu.media && def.withKeyWrap) {
        for (const media of fu.media) {
          if (media.kind === "recording") {
            const raw = generateWav(media.durationSeconds ?? 5);
            const recordingId = crypto.randomUUID();
            const encrypted = encryptContent(
              raw,
              tk,
              buildContentAad(ticket.id, blobSlot(recordingId)),
            );
            const blobKey = await blobStore.put(
              orgSchema,
              "recording",
              Buffer.from(encrypted),
            );
            await tDb
              .insertInto("recordings")
              .values({
                id: recordingId,
                ticket_id: ticket.id,
                followup_id: followUp.id,
                blob_key: blobKey,
                size_bytes: encrypted.byteLength,
                duration_seconds: media.durationSeconds ?? null,
                created_at: minutesAgo(fu.agoMinutes),
              })
              .execute();
          } else {
            // image or file attachment
            const raw =
              media.kind === "image" ? generatePng() : generateTextFile();
            const attachmentId = crypto.randomUUID();
            const encrypted = encryptContent(
              raw,
              tk,
              buildContentAad(ticket.id, blobSlot(attachmentId)),
            );
            const category = "attachment" as const;
            const blobKey = await blobStore.put(
              orgSchema,
              category,
              Buffer.from(encrypted),
            );
            const encFilename =
              media.filename !== undefined
                ? Buffer.from(
                    encryptContent(
                      encoder.encode(media.filename),
                      tk,
                      buildContentAad(ticket.id, filenameSlot(attachmentId)),
                    ),
                  )
                : null;
            await tDb
              .insertInto("attachments")
              .values({
                id: attachmentId,
                ticket_id: ticket.id,
                followup_id: followUp.id,
                blob_key: blobKey,
                size_bytes: encrypted.byteLength,
                encrypted_filename: encFilename,
                content_type: media.contentType ?? null,
                created_at: minutesAgo(fu.agoMinutes),
              })
              .execute();
          }
        }
      }
    }

    // Seed a read cursor so the ticket reads as unread: the cursor
    // says the volunteer last read at `unreadSince`, and any newer
    // non-system follow-up by others counts toward the unread badge.
    // Encrypted exactly the way the client writes it (ticket key,
    // cursor slot AAD, JSON payload with an ISO readUpTo string), so
    // the client's read-state decrypt path consumes it unchanged.
    if (def.unreadSince !== undefined && def.withKeyWrap) {
      const cursorPayload = JSON.stringify({
        readUpTo: minutesAgo(def.unreadSince).toISOString(),
      });
      const encryptedCursor = encryptContent(
        encoder.encode(cursorPayload),
        tk,
        buildContentAad(ticket.id, cursorSlot(me)),
      );
      await tDb
        .insertInto("ticket_read_cursors")
        .values({
          ticket_id: ticket.id,
          user_id: me,
          encrypted_read_cursor: Buffer.from(encryptedCursor),
        })
        .execute();
    }

    createdIds.push(ticket.id);
  }

  return { ticketIds: createdIds };
}
