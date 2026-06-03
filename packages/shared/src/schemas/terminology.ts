import { z } from "zod";

/** Per-language labels for customizable org terminology. */
export const terminologyLabelsSchema = z.object({
  volunteer: z.string().min(1).max(40),
  volunteers: z.string().min(1).max(40),
  client: z.string().min(1).max(40),
  clients: z.string().min(1).max(40),
  ticket: z.string().min(1).max(40),
  tickets: z.string().min(1).max(40),
  manager: z.string().min(1).max(40),
  managers: z.string().min(1).max(40),
  queue: z.string().min(1).max(40),
  queues: z.string().min(1).max(40),
  knowledgeBase: z.string().min(1).max(40),
});

/** Full terminology config keyed by language code. */
export const terminologyConfigSchema = z.record(
  z.string().regex(/^[a-z]{2}$/),
  terminologyLabelsSchema,
);

export type TerminologyLabels = z.infer<typeof terminologyLabelsSchema>;
export type TerminologyConfig = z.infer<typeof terminologyConfigSchema>;

export const TERMINOLOGY_DEFAULTS_EN: TerminologyLabels = {
  volunteer: "volunteer",
  volunteers: "volunteers",
  client: "client",
  clients: "clients",
  ticket: "ticket",
  tickets: "tickets",
  manager: "manager",
  managers: "managers",
  queue: "queue",
  queues: "queues",
  knowledgeBase: "knowledge base",
};

export const TERMINOLOGY_DEFAULTS: Readonly<Record<string, TerminologyLabels>> =
  {
    en: TERMINOLOGY_DEFAULTS_EN,
    es: {
      volunteer: "voluntario",
      volunteers: "voluntarios",
      client: "cliente",
      clients: "clientes",
      ticket: "ticket",
      tickets: "tickets",
      manager: "gerente",
      managers: "gerentes",
      queue: "cola",
      queues: "colas",
      knowledgeBase: "base de conocimiento",
    },
  };

export const TERMINOLOGY_SUGGESTIONS: Readonly<
  Record<string, readonly string[]>
> = {
  volunteer: ["Volunteer", "Advocate", "Counselor", "Staff", "Team Member"],
  client: ["Client", "Survivor", "Caller", "Petitioner", "Participant"],
  ticket: [
    "Ticket",
    "Case",
    "Contact",
    "Session",
    "Call",
    "Intake",
    "Referral",
  ],
  manager: ["Manager", "Supervisor", "Coordinator", "Team Lead", "Shift Lead"],
  queue: ["Queue", "Team", "Group", "Program"],
  knowledgeBase: [
    "Knowledge Base",
    "Library",
    "Resources",
    "Handbook",
    "Guide",
  ],
};
