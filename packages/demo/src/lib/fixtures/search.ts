/**
 * Search fixture data for the demo.
 *
 * Provides an instant-tier corpus (searchable titles from ticket fixtures)
 * plus escalation-only items that appear only after the deep-search beat.
 * Both tiers include items matching the term "housing".
 */

export interface SearchFixtureItem {
  readonly ticketId: string;
  readonly title: string;
  readonly clientAlias: string;
  readonly queueName: string;
  readonly priority: "low" | "normal" | "high" | "urgent";
}

/**
 * Instant-tier search corpus. A subset of the ticket fixtures,
 * representing content already decrypted on this device.
 */
export function createInstantCorpus(): SearchFixtureItem[] {
  return [
    {
      ticketId: "search-i-001",
      title: "Help with housing",
      clientAlias: "Sparrow-7",
      queueName: "Housing",
      priority: "normal",
    },
    {
      ticketId: "search-i-002",
      title: "Follow-up on legal aid referral",
      clientAlias: "Birch-12",
      queueName: "Intake",
      priority: "normal",
    },
    {
      ticketId: "search-i-003",
      title: "Safety planning session",
      clientAlias: "Cedar-3",
      queueName: "Crisis",
      priority: "high",
    },
    {
      ticketId: "search-i-004",
      title: "Benefits application help",
      clientAlias: "Fern-21",
      queueName: "Intake",
      priority: "low",
    },
    {
      ticketId: "search-i-005",
      title: "Relocation assistance request",
      clientAlias: "Sage-11",
      queueName: "Housing",
      priority: "high",
    },
    {
      ticketId: "search-i-006",
      title: "Emergency referral needed",
      clientAlias: "River-4",
      queueName: "Crisis",
      priority: "urgent",
    },
    {
      ticketId: "search-i-007",
      title: "Food bank referral",
      clientAlias: "Lark-19",
      queueName: "Intake",
      priority: "low",
    },
  ];
}

/**
 * Escalation-only items. These represent tickets not yet decrypted
 * on this device, revealed only after the deep-search beat.
 * Includes items matching "housing" so the term hits both tiers.
 */
export function createEscalationCorpus(): SearchFixtureItem[] {
  return [
    {
      ticketId: "search-e-001",
      title: "Housing voucher application assistance",
      clientAlias: "Elm-28",
      queueName: "Housing",
      priority: "normal",
    },
    {
      ticketId: "search-e-002",
      title: "Transitional housing placement follow-up",
      clientAlias: "Aspen-33",
      queueName: "Housing",
      priority: "high",
    },
    {
      ticketId: "search-e-003",
      title: "Insurance enrollment assistance",
      clientAlias: "Pine-6",
      queueName: "Intake",
      priority: "normal",
    },
    {
      ticketId: "search-e-004",
      title: "Caller reporting landlord retaliation",
      clientAlias: "Moss-14",
      queueName: "Intake",
      priority: "high",
    },
    {
      ticketId: "search-e-005",
      title: "Child care subsidy application",
      clientAlias: "Ivy-22",
      queueName: "Intake",
      priority: "normal",
    },
  ];
}
