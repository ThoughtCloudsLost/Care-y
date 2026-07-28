<script lang="ts">
  import { Check, MousePointerClick } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    type Section,
    type SectionId,
    sectionElementId,
    subElementId,
  } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";

  interface Props {
    section: Section;
    activeSection: SectionId;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    onSubClick: (sectionId: SectionId, subSlug: string) => void;
    onSectionClick: (sectionId: SectionId) => void;
  }

  let {
    section,
    activeSection,
    activeSub,
    locale,
    seenTopics,
    onSubClick,
    onSectionClick,
  }: Props = $props();

  /** Intro clicks select the section, but clicks that originated on
   *  the TOC buttons inside it already selected a sub. */
  function handleIntroClick(ev: MouseEvent): void {
    const target = ev.target;
    if (target instanceof Element && target.closest("button") !== null) return;
    onSectionClick(section.id);
  }

  const isActive = $derived(activeSection === section.id);

  /**
   * Resolve a message key string to its translated value.
   * The lookup calls paraglide message functions at render time.
   * Reactivity depends on the locale prop (parent re-mounts via {#key}).
   */
  function msg(key: string): string {
    // Read locale prop to participate in reactive dependency tracking
    void locale;

    const lookup: Record<string, () => string> = {
      // Section titles and descriptions
      demo_section_login_title: () => m.demo_section_login_title(),
      demo_section_login_desc: () => m.demo_section_login_desc(),
      demo_section_tickets_title: () => m.demo_section_tickets_title(),
      demo_section_tickets_desc: () => m.demo_section_tickets_desc(),
      demo_section_ticket_detail_title: () =>
        m.demo_section_ticket_detail_title(),
      demo_section_ticket_detail_desc: () =>
        m.demo_section_ticket_detail_desc(),
      demo_section_search_title: () => m.demo_section_search_title(),
      demo_section_search_desc: () => m.demo_section_search_desc(),
      // Sub-section headings (login)
      demo_narrative_topic_credentials_heading: () =>
        m.demo_narrative_topic_credentials_heading(),
      demo_narrative_topic_credentials_body: () =>
        m.demo_narrative_topic_credentials_body(),
      demo_narrative_topic_twofa_heading: () =>
        m.demo_narrative_topic_twofa_heading(),
      demo_narrative_topic_twofa_body: () =>
        m.demo_narrative_topic_twofa_body(),
      demo_narrative_topic_twofa_totp_heading: () =>
        m.demo_narrative_topic_twofa_totp_heading(),
      demo_narrative_topic_twofa_totp_body: () =>
        m.demo_narrative_topic_twofa_totp_body(),
      demo_narrative_topic_twofa_passkey_heading: () =>
        m.demo_narrative_topic_twofa_passkey_heading(),
      demo_narrative_topic_twofa_passkey_body: () =>
        m.demo_narrative_topic_twofa_passkey_body(),
      demo_narrative_topic_twofa_email_heading: () =>
        m.demo_narrative_topic_twofa_email_heading(),
      demo_narrative_topic_twofa_email_body: () =>
        m.demo_narrative_topic_twofa_email_body(),
      demo_narrative_topic_twofa_sms_heading: () =>
        m.demo_narrative_topic_twofa_sms_heading(),
      demo_narrative_topic_twofa_sms_body: () =>
        m.demo_narrative_topic_twofa_sms_body(),
      demo_narrative_topic_twofa_push_heading: () =>
        m.demo_narrative_topic_twofa_push_heading(),
      demo_narrative_topic_twofa_push_body: () =>
        m.demo_narrative_topic_twofa_push_body(),
      demo_narrative_topic_twofa_backup_heading: () =>
        m.demo_narrative_topic_twofa_backup_heading(),
      demo_narrative_topic_twofa_backup_body: () =>
        m.demo_narrative_topic_twofa_backup_body(),
      demo_narrative_topic_key_derivation_heading: () =>
        m.demo_narrative_topic_key_derivation_heading(),
      demo_narrative_topic_key_derivation_body: () =>
        m.demo_narrative_topic_key_derivation_body(),
      // Sub-section headings (reused from existing keys)
      demo_narrative_topic_sort_heading: () =>
        m.demo_narrative_topic_sort_heading(),
      demo_narrative_topic_sort_body: () => m.demo_narrative_topic_sort_body(),
      demo_narrative_topic_filters_heading: () =>
        m.demo_narrative_topic_filters_heading(),
      demo_narrative_topic_filters_body: () =>
        m.demo_narrative_topic_filters_body(),
      demo_narrative_topic_view_modes_heading: () =>
        m.demo_narrative_topic_view_modes_heading(),
      demo_narrative_topic_view_modes_body: () =>
        m.demo_narrative_topic_view_modes_body(),
      demo_narrative_topic_select_mode_heading: () =>
        m.demo_narrative_topic_select_mode_heading(),
      demo_narrative_topic_select_mode_body: () =>
        m.demo_narrative_topic_select_mode_body(),
      demo_narrative_topic_new_ticket_heading: () =>
        m.demo_narrative_topic_new_ticket_heading(),
      demo_narrative_topic_new_ticket_body: () =>
        m.demo_narrative_topic_new_ticket_body(),
      demo_narrative_topic_thread_filters_heading: () =>
        m.demo_narrative_topic_thread_filters_heading(),
      demo_narrative_topic_thread_filters_body: () =>
        m.demo_narrative_topic_thread_filters_body(),
      demo_narrative_topic_compose_actions_heading: () =>
        m.demo_narrative_topic_compose_actions_heading(),
      demo_narrative_topic_compose_actions_body: () =>
        m.demo_narrative_topic_compose_actions_body(),
      demo_narrative_topic_reply_heading: () =>
        m.demo_narrative_topic_reply_heading(),
      demo_narrative_topic_reply_body: () =>
        m.demo_narrative_topic_reply_body(),
      demo_narrative_topic_notes_heading: () =>
        m.demo_narrative_topic_notes_heading(),
      demo_narrative_topic_notes_body: () =>
        m.demo_narrative_topic_notes_body(),
      demo_narrative_topic_case_fold_heading: () =>
        m.demo_narrative_topic_case_fold_heading(),
      demo_narrative_topic_case_fold_body: () =>
        m.demo_narrative_topic_case_fold_body(),
      demo_narrative_topic_timeline_heading: () =>
        m.demo_narrative_topic_timeline_heading(),
      demo_narrative_topic_timeline_body: () =>
        m.demo_narrative_topic_timeline_body(),
      demo_narrative_topic_language_heading: () =>
        m.demo_narrative_topic_language_heading(),
      demo_narrative_topic_language_body: () =>
        m.demo_narrative_topic_language_body(),
      // Search
      demo_narrative_search_heading: () => m.demo_narrative_search_heading(),
      demo_narrative_search_body: () => m.demo_narrative_search_body(),
      // Dashboard, admin, schedule, settings
      demo_section_dashboard_title: () => m.demo_section_dashboard_title(),
      demo_section_dashboard_desc: () => m.demo_section_dashboard_desc(),
      demo_narrative_dashboard_heading: () =>
        m.demo_narrative_dashboard_heading(),
      demo_narrative_dashboard_body: () => m.demo_narrative_dashboard_body(),
      demo_section_library_title: () => m.demo_section_library_title(),
      demo_section_library_desc: () => m.demo_section_library_desc(),
      demo_narrative_library_heading: () => m.demo_narrative_library_heading(),
      demo_narrative_library_body: () => m.demo_narrative_library_body(),
      demo_section_admin_title: () => m.demo_section_admin_title(),
      demo_section_admin_desc: () => m.demo_section_admin_desc(),
      demo_narrative_admin_heading: () => m.demo_narrative_admin_heading(),
      demo_narrative_admin_body: () => m.demo_narrative_admin_body(),
      demo_section_schedule_title: () => m.demo_section_schedule_title(),
      demo_section_schedule_desc: () => m.demo_section_schedule_desc(),
      demo_narrative_schedule_heading: () =>
        m.demo_narrative_schedule_heading(),
      demo_narrative_schedule_body: () => m.demo_narrative_schedule_body(),
      demo_section_settings_title: () => m.demo_section_settings_title(),
      demo_section_settings_desc: () => m.demo_section_settings_desc(),
      demo_narrative_settings_heading: () =>
        m.demo_narrative_settings_heading(),
      demo_narrative_settings_body: () => m.demo_narrative_settings_body(),
      // Settings sub-sections
      demo_narrative_settings_profile_identity_heading: () =>
        m.demo_narrative_settings_profile_identity_heading(),
      demo_narrative_settings_profile_identity_body: () =>
        m.demo_narrative_settings_profile_identity_body(),
      demo_narrative_settings_password_keys_heading: () =>
        m.demo_narrative_settings_password_keys_heading(),
      demo_narrative_settings_password_keys_body: () =>
        m.demo_narrative_settings_password_keys_body(),
      demo_narrative_settings_two_factor_methods_heading: () =>
        m.demo_narrative_settings_two_factor_methods_heading(),
      demo_narrative_settings_two_factor_methods_body: () =>
        m.demo_narrative_settings_two_factor_methods_body(),
      // Admin sub-sections
      demo_narrative_admin_people_queues_heading: () =>
        m.demo_narrative_admin_people_queues_heading(),
      demo_narrative_admin_people_queues_body: () =>
        m.demo_narrative_admin_people_queues_body(),
    };

    // eslint-disable-next-line security/detect-object-injection -- key is a message key from section config, not user input
    const fn = lookup[key];
    return fn !== undefined ? fn() : key;
  }

  function subLabel(headingKey: string): string {
    return msg(headingKey);
  }
</script>

<section
  id={sectionElementId(section.id)}
  class="story-section"
  class:story-section-active={isActive}
>
  <!-- Pinned intro: stays sticky while scrolling through this section.
       Pointer-only click affordance: the block is a redundant target
       for the top bar item, which remains the keyboard path. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="section-intro"
    class:section-intro-pinned={isActive}
    onclick={handleIntroClick}
  >
    <h2 class="section-title">{msg(section.titleKey)}</h2>
    <p class="section-desc">{msg(section.descKey)}</p>

    <!-- TOC of sub-sections -->
    {#if section.subs.length > 1}
      <nav class="section-toc" aria-label={msg(section.titleKey)}>
        {#each section.subs as sub (sub.slug)}
          {@const subActive = isActive && activeSub === sub.slug}
          {@const subSeen = sub.topic !== null && seenTopics.has(sub.topic)}
          <button
            class="toc-item"
            class:toc-item-active={subActive}
            class:toc-item-seen={subSeen && !subActive}
            type="button"
            onclick={() => onSubClick(section.id, sub.slug)}
          >
            <span class="toc-label">{subLabel(sub.headingKey)}</span>
            {#if subSeen}
              <Check size={12} class="toc-check" />
            {/if}
          </button>
        {/each}
      </nav>
    {/if}
  </div>

  <!-- Sub-section content blocks. The list scrolls under a fixed
       selection slot (see scroll-engine); the tip card is the first
       snap item, so it occupies the slot when nothing is selected. -->
  <div class="section-subs">
    <!-- The tip copy says "in the phone"; a device-view toggle
         (phone/desktop frame) will need a per-device message key, not
         a parameter, since the phrasing shifts per locale. -->
    <div class="snap-tip" data-snap-sub="">
      <MousePointerClick size={18} class="snap-tip-icon" />
      <p class="snap-tip-text">{m.demo_narrative_tip()}</p>
    </div>

    {#each section.subs as sub (sub.slug)}
      {@const subActive = isActive && activeSub === sub.slug}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <article
        id={subElementId(section.id, sub.slug)}
        class="sub-section"
        class:sub-section-active={subActive}
        data-snap-sub={sub.slug}
        onclick={() => onSubClick(section.id, sub.slug)}
      >
        <h3 class="sub-heading">{msg(sub.headingKey)}</h3>
        <p class="sub-body">{msg(sub.bodyKey)}</p>
      </article>
    {/each}
  </div>
</section>

<style>
  .story-section {
    padding: 0 0 3rem;
    scroll-margin-top: 64px;
  }

  .section-intro {
    cursor: pointer;
    padding: 2rem 1rem 1rem;
    margin: 0 -1rem;
    border-radius: 8px;
    transition: background 0.25s ease;
  }

  /* Background highlight for the section the phone is showing */
  .story-section-active > .section-intro {
    background: rgba(0, 122, 255, 0.05);
  }

  :global(html.dark) .story-section-active > .section-intro {
    background: rgba(100, 210, 255, 0.06);
  }

  /* Desktop pinning: intro sticks while section is active */
  @media (min-width: 900px) {
    /* Every intro is sticky so the scroll engine can measure when one
       has settled at its pinned spot (subs only become scroll-active
       after that). The active section's intro alone gets the tinted
       opaque backdrop; pinned implies active, so the tint lives on the
       backdrop (a transparent overlay would vanish behind it). */
    .section-intro {
      position: sticky;
      top: 64px;
      z-index: 2;
      padding-bottom: 1rem;
      margin-bottom: 0;
    }

    .section-intro-pinned {
      background: rgba(233, 242, 253, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    :global(html.dark) .section-intro-pinned {
      background: rgba(26, 33, 41, 0.95);
    }
  }

  /* Small screens: no sticky intro, just show title */
  @media (max-width: 899px) {
    .section-intro {
      padding: 1.5rem 0 0.75rem;
    }

    .section-desc {
      display: none;
    }
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #1d1d1f;
    line-height: 1.3;
  }

  :global(html.dark) .section-title {
    color: #f5f5f7;
  }

  .section-desc {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #636366;
    margin: 0 0 1rem;
    max-width: 36rem;
  }

  :global(html.dark) .section-desc {
    color: #a1a1a6;
  }

  .section-toc {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .toc-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3125rem 0.625rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #636366;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .toc-item:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #1d1d1f;
  }

  :global(html.dark) .toc-item {
    color: #98989d;
  }

  :global(html.dark) .toc-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f7;
  }

  .toc-item-active {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }

  .toc-item-active:hover {
    background: rgba(0, 122, 255, 0.15);
    color: #007aff;
  }

  :global(html.dark) .toc-item-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .toc-item-active:hover {
    background: rgba(0, 122, 255, 0.25);
    color: #64d2ff;
  }

  .toc-item-seen {
    color: #86868b;
  }

  .toc-label {
    flex: 0 1 auto;
    min-width: 0;
  }

  .toc-item :global(.toc-check) {
    flex-shrink: 0;
    color: #34c759;
  }

  .section-subs {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    /* Matches the engine's SLOT_GAP so the tip card's resting position
       at the top of the list sits exactly on the slot line. */
    padding-top: 28px;
  }

  /* The tip card: first snap item, so it sits in the selection slot
     when nothing is selected. The fixed slot frame (App.svelte) draws
     the highlight around whatever occupies the slot; the tip itself
     stays plain muted text. */
  .snap-tip {
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    margin: 0 -1rem;
    color: #86868b;
    /* Smooths the distance fade applied by the slot tracker */
    transition: opacity 0.2s ease;
  }

  :global(html.dark) .snap-tip {
    color: #98989d;
  }

  .snap-tip :global(.snap-tip-icon) {
    flex-shrink: 0;
  }

  .snap-tip-text {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    max-width: 36rem;
  }

  .sub-section {
    cursor: pointer;
    scroll-snap-align: start;
    /* Horizontal padding pairs with the negative margin so the active
       tint reads as a card without shifting the text column. */
    padding: 1rem;
    margin: 0 -1rem;
    border-radius: 8px;
    transition:
      background 0.25s ease,
      opacity 0.2s ease;
  }

  /* The fixed slot frame carries the highlight; the active item only
     reinforces it with an accent heading. */
  .sub-section-active .sub-heading {
    color: #007aff;
  }

  :global(html.dark) .sub-section-active .sub-heading {
    color: #64d2ff;
  }

  .sub-heading {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: #1d1d1f;
    line-height: 1.3;
  }

  :global(html.dark) .sub-heading {
    color: #f5f5f7;
  }

  .sub-body {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #424245;
    margin: 0;
    max-width: 36rem;
  }

  :global(html.dark) .sub-body {
    color: #a1a1a6;
  }
</style>
