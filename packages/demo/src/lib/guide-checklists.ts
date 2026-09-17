/**
 * Guide definitions: cross-screen task checklists.
 *
 * Each guide walks the reader through a multi-step workflow that spans
 * several handbook sections. Steps carry optional navigation targets
 * (sectionId + subSlug pairs from scroll-sections.ts) so the UI can
 * offer a "show me" affordance that jumps to the relevant sub-section.
 *
 * Prose lives in paraglide under demo_guide_<slug>_title / _step<N>.
 * This file defines structure only; Track P writes the translated text.
 */

import type { SectionId } from "./bridge.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type GuideSlug =
  | "take-a-call"
  | "assign-a-ticket"
  | "reply-to-client"
  | "secure-share"
  | "client-intake-arc"
  | "client-portal-reply"
  | "publish-kb-article"
  | "create-queue-with-escalation"
  | "invite-volunteer"
  | "configure-intake-form"
  | "export-responses"
  | "verify-server-blindness";

export interface GuideStep {
  readonly bodyKey: string;
  readonly target: { sectionId: SectionId; subSlug: string } | null;
}

export interface GuideDef {
  readonly slug: GuideSlug;
  readonly titleKey: string;
  readonly steps: readonly GuideStep[];
}

// -----------------------------------------------------------------------
// Guide definitions
// -----------------------------------------------------------------------

const GUIDES: readonly GuideDef[] = [
  {
    slug: "take-a-call",
    titleKey: "demo_guide_take_a_call_title",
    steps: [
      {
        bodyKey: "demo_guide_take_a_call_step1",
        target: { sectionId: "client-intake", subSlug: "form" },
      },
      {
        bodyKey: "demo_guide_take_a_call_step2",
        target: { sectionId: "client-intake", subSlug: "contact-method" },
      },
      {
        bodyKey: "demo_guide_take_a_call_step3",
        target: { sectionId: "client-intake", subSlug: "submit" },
      },
      {
        bodyKey: "demo_guide_take_a_call_step4",
        target: { sectionId: "tickets", subSlug: "new-ticket" },
      },
    ],
  },
  {
    slug: "assign-a-ticket",
    titleKey: "demo_guide_assign_a_ticket_title",
    steps: [
      {
        bodyKey: "demo_guide_assign_a_ticket_step1",
        target: { sectionId: "dashboard", subSlug: "unassigned" },
      },
      {
        bodyKey: "demo_guide_assign_a_ticket_step2",
        target: { sectionId: "ticket-detail", subSlug: "case-header" },
      },
      {
        bodyKey: "demo_guide_assign_a_ticket_step3",
        target: { sectionId: "ticket-detail", subSlug: "case-fold" },
      },
      {
        bodyKey: "demo_guide_assign_a_ticket_step4",
        target: { sectionId: "dashboard", subSlug: "my-tickets" },
      },
    ],
  },
  {
    slug: "reply-to-client",
    titleKey: "demo_guide_reply_to_client_title",
    steps: [
      {
        bodyKey: "demo_guide_reply_to_client_step1",
        target: { sectionId: "tickets", subSlug: "decryption" },
      },
      {
        bodyKey: "demo_guide_reply_to_client_step2",
        target: { sectionId: "ticket-detail", subSlug: "conversation" },
      },
      {
        bodyKey: "demo_guide_reply_to_client_step3",
        target: { sectionId: "ticket-detail", subSlug: "reply" },
      },
    ],
  },
  {
    slug: "secure-share",
    titleKey: "demo_guide_secure_share_title",
    steps: [
      {
        bodyKey: "demo_guide_secure_share_step1",
        target: { sectionId: "ticket-detail", subSlug: "share-link" },
      },
      {
        bodyKey: "demo_guide_secure_share_step2",
        target: { sectionId: "client-share", subSlug: "view" },
      },
      {
        bodyKey: "demo_guide_secure_share_step3",
        target: { sectionId: "client-share", subSlug: "one-time" },
      },
      {
        bodyKey: "demo_guide_secure_share_step4",
        target: { sectionId: "ticket-detail", subSlug: "share-status" },
      },
    ],
  },
  {
    slug: "client-intake-arc",
    titleKey: "demo_guide_client_intake_arc_title",
    steps: [
      {
        bodyKey: "demo_guide_client_intake_arc_step1",
        target: { sectionId: "client-intake", subSlug: "form" },
      },
      {
        bodyKey: "demo_guide_client_intake_arc_step2",
        target: { sectionId: "client-intake", subSlug: "fields" },
      },
      {
        bodyKey: "demo_guide_client_intake_arc_step3",
        target: { sectionId: "client-intake", subSlug: "how-protected" },
      },
      {
        bodyKey: "demo_guide_client_intake_arc_step4",
        target: { sectionId: "client-intake", subSlug: "submit" },
      },
      {
        bodyKey: "demo_guide_client_intake_arc_step5",
        target: { sectionId: "client-privacy", subSlug: "notice" },
      },
    ],
  },
  {
    slug: "client-portal-reply",
    titleKey: "demo_guide_client_portal_reply_title",
    steps: [
      {
        bodyKey: "demo_guide_client_portal_reply_step1",
        target: { sectionId: "client-portal", subSlug: "passphrase" },
      },
      {
        bodyKey: "demo_guide_client_portal_reply_step2",
        target: { sectionId: "client-portal", subSlug: "thread" },
      },
      {
        bodyKey: "demo_guide_client_portal_reply_step3",
        target: { sectionId: "client-portal", subSlug: "composer" },
      },
    ],
  },
  {
    slug: "publish-kb-article",
    titleKey: "demo_guide_publish_kb_article_title",
    steps: [
      {
        bodyKey: "demo_guide_publish_kb_article_step1",
        target: { sectionId: "library", subSlug: "browse" },
      },
      {
        bodyKey: "demo_guide_publish_kb_article_step2",
        target: { sectionId: "library", subSlug: "editor" },
      },
      {
        bodyKey: "demo_guide_publish_kb_article_step3",
        target: { sectionId: "library", subSlug: "detail" },
      },
    ],
  },
  {
    slug: "create-queue-with-escalation",
    titleKey: "demo_guide_create_queue_with_escalation_title",
    steps: [
      {
        bodyKey: "demo_guide_create_queue_with_escalation_step1",
        target: { sectionId: "admin-people", subSlug: "queues" },
      },
      {
        bodyKey: "demo_guide_create_queue_with_escalation_step2",
        target: { sectionId: "admin-people", subSlug: "roles" },
      },
      {
        bodyKey: "demo_guide_create_queue_with_escalation_step3",
        target: { sectionId: "dashboard", subSlug: "queues" },
      },
    ],
  },
  {
    slug: "invite-volunteer",
    titleKey: "demo_guide_invite_volunteer_title",
    steps: [
      {
        bodyKey: "demo_guide_invite_volunteer_step1",
        target: { sectionId: "admin-people", subSlug: "people" },
      },
      {
        bodyKey: "demo_guide_invite_volunteer_step2",
        target: { sectionId: "admin-people", subSlug: "roster-tools" },
      },
      {
        bodyKey: "demo_guide_invite_volunteer_step3",
        target: { sectionId: "admin-people", subSlug: "roles" },
      },
      {
        bodyKey: "demo_guide_invite_volunteer_step4",
        target: { sectionId: "admin-people", subSlug: "role-permissions" },
      },
    ],
  },
  {
    slug: "configure-intake-form",
    titleKey: "demo_guide_configure_intake_form_title",
    steps: [
      {
        bodyKey: "demo_guide_configure_intake_form_step1",
        target: { sectionId: "admin-org", subSlug: "intake-forms" },
      },
      {
        bodyKey: "demo_guide_configure_intake_form_step2",
        target: { sectionId: "admin-forms", subSlug: "builder" },
      },
      {
        bodyKey: "demo_guide_configure_intake_form_step3",
        target: { sectionId: "admin-forms", subSlug: "field-config" },
      },
      {
        bodyKey: "demo_guide_configure_intake_form_step4",
        target: { sectionId: "admin-forms", subSlug: "preview" },
      },
      {
        bodyKey: "demo_guide_configure_intake_form_step5",
        target: { sectionId: "admin-forms", subSlug: "form-settings" },
      },
    ],
  },
  {
    slug: "export-responses",
    titleKey: "demo_guide_export_responses_title",
    steps: [
      {
        bodyKey: "demo_guide_export_responses_step1",
        target: { sectionId: "admin-org", subSlug: "intake-forms" },
      },
      {
        bodyKey: "demo_guide_export_responses_step2",
        target: { sectionId: "admin-responses", subSlug: "responses" },
      },
      {
        bodyKey: "demo_guide_export_responses_step3",
        target: { sectionId: "admin-responses", subSlug: "key-not-held" },
      },
      {
        bodyKey: "demo_guide_export_responses_step4",
        target: { sectionId: "admin-responses", subSlug: "export" },
      },
    ],
  },
  {
    slug: "verify-server-blindness",
    titleKey: "demo_guide_verify_server_blindness_title",
    steps: [
      {
        bodyKey: "demo_guide_verify_server_blindness_step1",
        target: { sectionId: "ticket-detail", subSlug: "conversation" },
      },
      {
        bodyKey: "demo_guide_verify_server_blindness_step2",
        target: { sectionId: "ticket-detail", subSlug: "reply" },
      },
      {
        bodyKey: "demo_guide_verify_server_blindness_step3",
        target: null,
      },
      {
        bodyKey: "demo_guide_verify_server_blindness_step4",
        target: { sectionId: "admin-org", subSlug: "keys" },
      },
    ],
  },
] as const;

// -----------------------------------------------------------------------
// Lookup
// -----------------------------------------------------------------------

const guideIndex = new Map<GuideSlug, GuideDef>(GUIDES.map((g) => [g.slug, g]));

export { GUIDES };

export function getGuide(slug: GuideSlug): GuideDef | undefined {
  return guideIndex.get(slug);
}

/**
 * Whether a guide's title resolves to a real translated string. In DEV
 * mode all guides are "ready" so their raw keys are visible for prose
 * authoring. In production a guide without prose is hidden from menus.
 */
export function guideIsReady(
  slug: GuideSlug,
  locale: string,
  resolve: (key: string, locale: string) => string | null,
): boolean {
  if (import.meta.env.DEV) return true;
  const guide = guideIndex.get(slug);
  if (guide === undefined) return false;
  return resolve(guide.titleKey, locale) !== null;
}
