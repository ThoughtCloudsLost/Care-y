import { describe, expect, it } from "vitest";
import { newTicketId } from "../ids.js";
import {
  emailInboundPayloadSchema,
  type TicketPriority,
} from "../schemas/tickets.js";
import {
  applySeedTimelineInputSchema,
  backdateOrgSetupInputSchema,
  buildSeedStories,
  messageFollowUp,
  messageStepContent,
  originFollowUps,
  seedVoicemailInputSchema,
  type SeedOriginKind,
  type SeedStep,
  type SeedStory,
} from "./seed-stories.js";

const DAY = 1_440;
const COUNTS = [120, 106] as const;

function stepsOf(story: SeedStory, kind: SeedStep["kind"]): SeedStep[] {
  return story.steps.filter((s) => s.kind === kind);
}

function isClosed(story: SeedStory): boolean {
  return stepsOf(story, "close").length > 0;
}

function isHeld(story: SeedStory): boolean {
  return stepsOf(story, "hold").length > 0;
}

describe("buildSeedStories", () => {
  it("is deterministic", () => {
    expect(buildSeedStories(120)).toEqual(buildSeedStories(120));
    expect(buildSeedStories(106)).toEqual(buildSeedStories(106));
  });

  it("returns the requested number of stories", () => {
    expect(buildSeedStories(0)).toEqual([]);
    expect(buildSeedStories(1)).toHaveLength(1);
    expect(buildSeedStories(120)).toHaveLength(120);
  });

  describe.each(COUNTS)("with %i stories", (count) => {
    const stories = buildSeedStories(count);

    it("places every origin within the last 30 days", () => {
      for (const story of stories) {
        expect(story.origin.agoMinutes).toBeGreaterThanOrEqual(1);
        expect(story.origin.agoMinutes).toBeLessThan(30 * DAY);
      }
    });

    it("keeps steps chronological, after the origin, and never at 0", () => {
      for (const story of stories) {
        let previous = story.origin.agoMinutes;
        for (const step of story.steps) {
          expect(step.agoMinutes).toBeLessThan(previous);
          expect(step.agoMinutes).toBeGreaterThanOrEqual(1);
          previous = step.agoMinutes;
        }
      }
    });

    it("uses all six creation paths", () => {
      const kinds = new Set(stories.map((s) => s.origin.kind));
      const all: readonly SeedOriginKind[] = [
        "sms",
        "call",
        "voicemail",
        "intake",
        "staff",
        "quarantine",
      ];
      for (const kind of all) {
        expect(kinds.has(kind)).toBe(true);
      }
    });

    it("shapes each origin for its creation path", () => {
      for (const story of stories) {
        const { origin } = story;
        const written = origin.kind === "sms" || origin.kind === "intake";
        expect(origin.content.length > 0).toBe(written);
        if (origin.kind !== "call") {
          expect(origin.callDurationSeconds).toBeUndefined();
        }
      }
    });

    it("opens routed voicemails in the intake queue at normal priority", () => {
      for (const story of stories.filter(
        (s) => s.origin.kind === "quarantine",
      )) {
        expect(story.queue).toBe("Intake");
        expect(story.initialPriority).toBe("normal");
      }
    });

    it("starts a volunteer-opened ticket with a staff action, never a client message", () => {
      for (const story of stories.filter((s) => s.origin.kind === "staff")) {
        const first = story.steps.at(0);
        if (first === undefined) continue;
        expect(first.kind).not.toBe("message");
        const firstMessage = story.steps.find((s) => s.kind === "message");
        if (firstMessage?.kind === "message") {
          expect(firstMessage.from).toBe("volunteer");
        }
      }
    });

    it("never has a client email before the volunteer's first email", () => {
      for (const story of stories.filter((s) => s.channel === "email")) {
        const first = story.steps.find((s) => s.kind === "message");
        expect(first?.kind === "message" && first.from).toBe("volunteer");
      }
    });

    it("leaves a voicemail's second minute to the voicemail and adds no call note", () => {
      const voicemails = stories.filter((s) => s.origin.kind === "voicemail");
      expect(voicemails.length).toBeGreaterThan(0);
      for (const story of voicemails) {
        const first = story.steps.at(0);
        if (first === undefined) continue;
        expect(
          story.origin.agoMinutes - first.agoMinutes,
        ).toBeGreaterThanOrEqual(2);
        expect(first.kind).not.toBe("note");
      }
    });

    it("emits only system steps that change the ticket's state", () => {
      for (const story of stories) {
        expect(stepsOf(story, "assign").length).toBeLessThanOrEqual(1);
        expect(stepsOf(story, "hold").length).toBeLessThanOrEqual(1);
        expect(stepsOf(story, "close").length).toBeLessThanOrEqual(1);
        expect(isHeld(story) && isClosed(story)).toBe(false);

        let current: TicketPriority = story.initialPriority;
        for (const step of story.steps) {
          if (step.kind !== "priority") continue;
          expect(step.to).not.toBe(current);
          current = step.to;
        }
      }
    });

    describe("the last hour", () => {
      const recent = stories.flatMap((story) => {
        const events: { story: SeedStory; at: number; what: string }[] = [];
        if (story.origin.agoMinutes < 60) {
          events.push({ story, at: story.origin.agoMinutes, what: "origin" });
        }
        for (const step of story.steps) {
          if (step.agoMinutes < 60) {
            events.push({ story, at: step.agoMinutes, what: step.kind });
          }
        }
        return events;
      });

      it("covers sms, call, voicemail, intake and staff origins", () => {
        const kinds = new Set(recent.map((e) => e.story.origin.kind));
        const wanted: readonly SeedOriginKind[] = [
          "sms",
          "call",
          "voicemail",
          "intake",
          "staff",
        ];
        for (const kind of wanted) {
          expect(kinds.has(kind)).toBe(true);
        }
      });
    });

    it("mentions a call only on threads that started with an answered call", () => {
      const callTalk =
        /last call|talking with me earlier|agency we talked about/;
      for (const story of stories) {
        if (story.origin.callDurationSeconds !== undefined) continue;
        for (const step of story.steps) {
          if (step.kind === "message") {
            expect(step.content).not.toMatch(callTalk);
          }
        }
      }
    });
  });
});

describe("originFollowUps", () => {
  it.each([
    ["sms", "sms_inbound"],
    ["call", "phone_call"],
    ["intake", "message"],
    ["quarantine", "voicemail"],
  ] as const)("opens a %s origin with one client %s", (kind, type) => {
    expect(originFollowUps(kind)).toEqual([{ type, source: "client" }]);
  });

  it("opens a volunteer-created ticket with no client follow-up", () => {
    expect(originFollowUps("staff")).toEqual([]);
  });

  it("opens a voicemail origin with the missed call, then the voicemail", () => {
    expect(originFollowUps("voicemail")).toEqual([
      { type: "phone_call", source: "client" },
      { type: "voicemail", source: "client" },
    ]);
  });
});

describe("messageFollowUp", () => {
  it.each([
    ["sms", "client", "sms_inbound"],
    ["sms", "volunteer", "sms_outbound"],
    ["email", "client", "email_inbound"],
    ["email", "volunteer", "email_outbound"],
    ["message", "client", "message"],
    ["message", "volunteer", "message"],
  ] as const)(
    "keeps the %s channel for a %s message (%s)",
    (channel, from, type) => {
      expect(messageFollowUp(channel, from)).toEqual({ type, source: from });
    },
  );
});

describe("messageStepContent", () => {
  const emailStory = buildSeedStories(120).find((s) => s.channel === "email");
  const messages = (emailStory?.steps ?? []).flatMap((s) =>
    s.kind === "message" ? [s] : [],
  );

  it("sends the volunteer's first email with the story subject as a one-paragraph ProseMirror doc", () => {
    const first = messages.at(0);
    expect(emailStory).toBeDefined();
    expect(first?.from).toBe("volunteer");
    if (emailStory === undefined || first === undefined) return;
    const payload: unknown = JSON.parse(messageStepContent(emailStory, first));
    expect(payload).toEqual({
      subject: emailStory.emailSubject,
      doc: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: first.content }],
          },
        ],
      },
    });
  });

  it("builds client replies the inbound email schema accepts, under a Re: subject", () => {
    const reply = messages.find((m) => m.from === "client");
    if (emailStory === undefined || reply === undefined) return;
    const parsed = emailInboundPayloadSchema.parse(
      JSON.parse(messageStepContent(emailStory, reply)),
    );
    expect(parsed).toEqual({
      subject: `Re: ${emailStory.emailSubject ?? ""}`,
      text: reply.content,
      from: "client@example.org",
      droppedAttachments: 0,
    });
  });

  it("passes text through unchanged on text and app-message channels", () => {
    const texted = buildSeedStories(120).find(
      (s) =>
        s.channel !== "email" && s.steps.some((st) => st.kind === "message"),
    );
    const step = texted?.steps.find((st) => st.kind === "message");
    if (texted === undefined || step?.kind !== "message") return;
    expect(messageStepContent(texted, step)).toBe(step.content);
  });
});

describe("applySeedTimelineInputSchema", () => {
  const ticketId = newTicketId();

  it("accepts points with optional call fields", () => {
    const result = applySeedTimelineInputSchema.safeParse({
      ticketId,
      createdMinutesAgo: 600,
      points: [
        { minutesAgo: 600, callStatus: "completed", callDurationSeconds: 300 },
        { minutesAgo: 0 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty point list for a ticket with no follow-ups", () => {
    expect(
      applySeedTimelineInputSchema.safeParse({
        ticketId,
        createdMinutesAgo: 30,
        points: [],
      }).success,
    ).toBe(true);
  });

  it("rejects out-of-range values and unknown call statuses", () => {
    const parse = (point: Record<string, unknown>): boolean =>
      applySeedTimelineInputSchema.safeParse({
        ticketId,
        createdMinutesAgo: 600,
        points: [point],
      }).success;
    expect(parse({ minutesAgo: -1 })).toBe(false);
    expect(parse({ minutesAgo: 525_601 })).toBe(false);
    expect(parse({ minutesAgo: 1.5 })).toBe(false);
    expect(parse({ minutesAgo: 1, callStatus: "ringing" })).toBe(false);
    expect(parse({ minutesAgo: 1, callDurationSeconds: 86_401 })).toBe(false);
  });

  it("rejects a malformed ticket id", () => {
    expect(
      applySeedTimelineInputSchema.safeParse({
        ticketId: "not-a-uuid",
        createdMinutesAgo: 1,
        points: [{ minutesAgo: 1 }],
      }).success,
    ).toBe(false);
  });
});

describe("backdateOrgSetupInputSchema", () => {
  it("accepts whole minutes within a year", () => {
    expect(
      backdateOrgSetupInputSchema.safeParse({ minutesAgo: 0 }).success,
    ).toBe(true);
    expect(
      backdateOrgSetupInputSchema.safeParse({ minutesAgo: 43_500 }).success,
    ).toBe(true);
  });

  it("rejects negative, fractional and out-of-range values", () => {
    for (const minutesAgo of [-1, 1.5, 525_601]) {
      expect(
        backdateOrgSetupInputSchema.safeParse({ minutesAgo }).success,
      ).toBe(false);
    }
  });
});

describe("seedVoicemailInputSchema", () => {
  const ticketId = newTicketId();

  it("accepts base64 audio with a whole-second duration", () => {
    expect(
      seedVoicemailInputSchema.safeParse({
        ticketId,
        audio: "AAAAGGZ0eXBNNEEg",
        durationSeconds: 5,
      }).success,
    ).toBe(true);
  });

  it("rejects non-base64 audio, oversized audio and out-of-range durations", () => {
    const parse = (audio: string, durationSeconds: number): boolean =>
      seedVoicemailInputSchema.safeParse({ ticketId, audio, durationSeconds })
        .success;
    expect(parse("not base64!", 5)).toBe(false);
    expect(parse("A".repeat(400_001), 5)).toBe(false);
    expect(parse("AAAA", 0)).toBe(false);
    expect(parse("AAAA", 601)).toBe(false);
    expect(parse("AAAA", 2.5)).toBe(false);
  });
});
