import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { METHOD_INFO } from "./two-factor-types.js";
import { ErrorCode } from "./error-codes.js";
import { Permission } from "./roles.js";

const dir = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(dir, "../messages");

const ALLOWED_LOCALES = new Set(["en", "es"]);

function loadMessages(locale: string): Record<string, unknown> {
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is validated against a fixed allowlist above
  const raw = readFileSync(resolve(messagesDir, `${locale}.json`), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

const en = loadMessages("en");
const es = loadMessages("es");

describe("messages/en.json", () => {
  it("is valid JSON with flat string keys", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
    }
  });

  it("has all expected namespaces", () => {
    const prefixes = [
      "nav_",
      "app_",
      "error_",
      "email_",
      "twofa_",
      "exposure_",
      "empty_",
      "shell_",
      "auth_",
      "tickets_",
      "dashboard_",
    ];
    for (const prefix of prefixes) {
      const keys = Object.keys(en).filter((k) => k.startsWith(prefix));
      expect(keys.length).toBeGreaterThan(0);
    }
  });
});

describe("messages/es.json", () => {
  it("has the same keys as en.json", () => {
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("has no empty string values", () => {
    for (const [key, value] of Object.entries(es)) {
      expect(value, `es.json key "${key}" is empty`).not.toBe("");
    }
  });
});

describe("two-factor-types i18n keys", () => {
  it("every METHOD_INFO labelKey exists in en.json", () => {
    for (const info of METHOD_INFO) {
      expect(en).toHaveProperty(info.labelKey);
    }
  });

  it("every METHOD_INFO descriptionKey exists in en.json", () => {
    for (const info of METHOD_INFO) {
      expect(en).toHaveProperty(info.descriptionKey);
    }
  });
});

describe("ErrorCode i18n keys", () => {
  it("every ErrorCode maps to an error_ key in en.json", () => {
    const errorKeys = Object.keys(en).filter((k) => k.startsWith("error_"));
    for (const code of Object.values(ErrorCode)) {
      const expectedKey = `error_${code.toLowerCase()}`;
      expect(
        errorKeys,
        `ErrorCode.${code} should map to "${expectedKey}" in en.json`,
      ).toContain(expectedKey);
    }
  });
});

describe("permission_* EN labels derived from enum key names", () => {
  /**
   * Three labels the mechanical rule cannot produce.
   * Key: Permission enum string value. Value: expected EN label.
   */
  const EXCEPTIONS: ReadonlyMap<string, string> = new Map([
    ["send_client_sms", "Send client SMS"],
    ["view_client_pii", "View client PII"],
    ["delete_others_notes", "Delete others' notes"],
  ]);

  /** Derive the expected label from a Permission enum string value. */
  function expectedLabel(enumValue: string): string {
    const exception = EXCEPTIONS.get(enumValue);
    if (exception !== undefined) return exception;
    const words = enumValue.split("_");
    return words
      .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  it("every Permission maps to a permission_* key whose label matches the rule", () => {
    for (const enumValue of Object.values(Permission)) {
      const key = `permission_${enumValue}`;
      const actual = en[key];
      expect(actual, `missing key "${key}" in en.json`).toBeDefined();
      expect(
        actual,
        `permission label "${key}" should be "${expectedLabel(enumValue)}" but was "${String(actual)}"`,
      ).toBe(expectedLabel(enumValue));
    }
  });

  it("no permission_* label keys exist without a matching Permission enum member", () => {
    const enumValues = new Set(Object.values(Permission));
    const permKeys = Object.keys(en).filter(
      (k) => k.startsWith("permission_") && !k.endsWith("_hint"),
    );
    for (const key of permKeys) {
      const value = key.replace(/^permission_/, "");
      // Skip the not_yet_built meta-key
      if (value === "not_yet_built") continue;
      expect(
        enumValues.has(value as Permission),
        `en.json has "${key}" but no matching Permission enum member`,
      ).toBe(true);
    }
  });
});

describe("es.json values differ from en.json", () => {
  /**
   * Keys whose es value is legitimately identical to en.
   * Every entry requires a reason so the allowlist stays auditable.
   */
  const IDENTICAL_ALLOWLIST: ReadonlyMap<string, string> = new Map([
    // Product name (proper noun, not translated)
    ["app_name", "product name"],
    ["demo_app_brand", "product name"],

    // Interpolation-only templates (the visible content is a variable, not translatable text)
    ["nav_tickets", "interpolation-only: {Tickets}"],
    ["tab_library", "interpolation-only: {KnowledgeBase}"],
    ["library_title", "interpolation-only: {KnowledgeBase}"],
    ["tickets_title", "interpolation-only: {Tickets}"],
    ["tickets_filter_queue", "interpolation-only: {Queue}"],
    ["tickets_filter_count", "interpolation-only: {label} ({count})"],
    ["tickets_sort_queue", "interpolation-only: {Queue}"],
    ["dashboard_msg_count", "interpolation-only: {count} msg"],
    ["dashboard_queues_heading", "interpolation-only: {Queues}"],
    ["dashboard_kb_heading", "interpolation-only: {KnowledgeBase}"],
    ["mergeCandidates_pair", "interpolation-only: {aliasA} / {aliasB}"],
    ["ticket_system_event_grouped", "interpolation-only: {label} ({count})"],
    [
      "ticket_detail_volunteers_stat",
      "interpolation-only: {count} {volunteers}",
    ],
    ["ticket_detail_one_volunteer_stat", "interpolation-only: 1 {volunteer}"],
    ["ticket_panel_queue", "interpolation-only: {Queue}"],
    ["ticket_bulk_queue", "interpolation-only: {Queue}"],
    ["reaction_count", "interpolation-only: {count} {label}"],
    ["ticket_note_hint_managers", "interpolation-only: {managers}"],
    ["search_section_tickets", "interpolation-only: {Tickets}"],
    ["search_section_kb", "interpolation-only: {KnowledgeBase}"],
    ["search_section_volunteers", "interpolation-only: {Volunteers}"],
    ["search_full_progress", "interpolation-only: {searched}/{total}"],
    ["search_deep_nav_searching", "interpolation-only: {searched}/{total}"],
    ["panel_queues", "interpolation-only: {Queues}"],
    ["admin_hub_badge_queues", "interpolation-only: {count} {queues}"],
    ["role_manager", "interpolation-only: {Manager}"],
    ["role_volunteer", "interpolation-only: {Volunteer}"],
    ["admin_tab_queues", "interpolation-only: {Queues}"],
    ["admin_role_volunteer", "interpolation-only: {Volunteer}"],
    ["admin_role_manager", "interpolation-only: {Manager}"],
    ["admin_queues_title", "interpolation-only: {Queues}"],
    ["admin_queues_stat_total", "interpolation-only: {count} {queues}"],
    ["admin_users_filter_queue", "interpolation-only: {Queue}"],
    ["onboarding_step_queue", "interpolation-only: {Queue}"],
    ["mgr_page_title", "interpolation-only: {Manager}"],
    ["admin_note_types_escalate_manager", "interpolation-only: {Manager}"],
    ["admin_note_types_summary_managers", "interpolation-only: {managers}"],
    ["ticket_new_field_queue", "interpolation-only: {Queue}"],
    ["ticket_new_field_client", "interpolation-only: {Client}"],
    ["clients_page_title", "interpolation-only: {Clients}"],
    ["client_tickets_heading", "interpolation-only: {Tickets}"],
    ["admin_clients_title", "interpolation-only: {Clients}"],
    ["clients_ticket_count_one", "interpolation-only: {count} {ticket}"],
    ["clients_ticket_count_other", "interpolation-only: {count} {tickets}"],
    ["sort_button_label", "interpolation-only: {label}, {direction}"],
    ["admin_reports_days_unit", "interpolation-only: {days}d"],
    ["admin_reports_tickets_label", "interpolation-only: {Tickets}"],
    ["ticket_sms_char_count", "interpolation-only: {count} / 1600"],
    ["demo_flow_duration_ms", "interpolation-only: {ms} ms"],
    ["demo_flow_detail_offset", "interpolation-only: +{ms} ms"],
    ["demo_flow_detail_bytes", "interpolation-only: {count} bytes"],
    ["consultant_phone_verified_tail", "interpolation-only: ***{tail}"],
    ["intake_char_count", "interpolation-only: {count} / {max}"],
    ["portal_composer_counter", "interpolation-only: {count} / {max}"],
    ["ticket_edit_message_counter", "interpolation-only: {count} / {max}"],
    ["intake_forms_field_row_subtype", "interpolation-only: {type}: {subtype}"],
    ["intake_forms_field_row_min_only", "interpolation-only: Min: {min}"],
    ["intake_forms_field_row_max_only", "interpolation-only: Max: {max}"],
    ["demo_section_tickets_title", "interpolation-only: Tickets"],
    ["demo_feature_tickets", "interpolation-only: Tickets"],
    ["demo_scene_tickets", "interpolation-only: Tickets"],

    // Loanword identical in both languages
    ["admin_terminology_singular", "identical loanword: Singular"],
    ["admin_terminology_plural", "identical loanword: Plural"],
    ["admin_role_admin", "identical loanword: Admin"],

    // Technical identifiers or format strings (not prose)
    ["library_editor_link_url", "technical label: URL"],
    ["library_editor_url_placeholder", "URL placeholder: https://"],
    [
      "admin_org_general_safe_exit_url_placeholder",
      "URL placeholder: https://weather.gov",
    ],
    ["library_editor_ordered_list_symbol", "formatting symbol: 1."],
    ["onboarding_telephony_sid_label", "technical label: Account SID"],
    [
      "onboarding_telephony_sid_placeholder",
      "technical placeholder: Twilio SID format",
    ],
    ["onboarding_telephony_token_label", "technical label: Auth Token"],

    // Alphanumeric codes and short format strings
    ["library_sort_alpha", "sort label: A-Z"],
    ["saved_filter_decrypting", "ellipsis placeholder"],
    ["dashboard_dismiss", "universal interjection: OK"],
    ["admin_rotation_done", "universal interjection: OK"],
    ["admin_users_stat_total", "universally understood: total"],

    // Single-role initials
    ["demo_role_admin_initial", "single letter initial: A"],
    ["demo_role_volunteer_initial", "single letter initial: V"],

    // Phone placeholders (locale-neutral format)
    [
      "admin_blocklist_number_placeholder",
      "phone format placeholder: 555-123-4567",
    ],
    [
      "ticket_new_field_phone_placeholder",
      "phone format placeholder: +1 (555) 123-4567",
    ],
    ["twofa_totp_code_placeholder", "numeric placeholder: 000000"],
    ["twofa_backup_codes_placeholder", "code placeholder: xxxxxxxx"],
    [
      "twofa_sms_phone_placeholder",
      "phone format placeholder: +1 (555) 000-0000",
    ],
    ["client_phone_placeholder", "phone format placeholder: +1 555 000 1234"],
    [
      "consultant_phone_number_placeholder",
      "phone format placeholder: +1 555 000 1234",
    ],
    ["consultant_phone_code_placeholder", "numeric placeholder: 000000"],
    [
      "intake_forms_preview_reference_placeholder",
      "code placeholder: XXXX-XXXX",
    ],

    // Identical short words that are the same in both languages
    ["panel_general", "identical word: General"],
    ["admin_tab_org_general", "identical word: General"],
    ["ticket_new_priority_normal", "identical word: Normal"],
    ["tickets_filter_priority_normal", "identical word: Normal"],
    ["intake_forms_config_priority_normal", "identical word: Normal"],
    ["admin_greetings_mode_audio", "identical word: Audio"],
    ["admin_queue_editor_color_label", "identical word: Color"],
    ["saved_filter_color_label", "identical word: Color"],
    ["admin_branding_color_hover", "identical word: Hover"],
    ["clients_sort_alias", "identical word: Alias"],
    ["client_alias_label", "identical word: Alias"],
    ["logs_filter_actor", "identical word: Actor"],
    ["demo_flow_lane_trpc", "technical label: API"],

    // Channel labels (proper names / abbreviations)
    ["notif_channel_push", "channel name: Push"],
    ["notif_channel_email", "channel name: Email"],
    ["notif_channel_sms", "abbreviation: SMS"],
    ["admin_channel_sms_label", "abbreviation: SMS"],
    ["intake_privacy_cookies_title", "identical word: Cookies"],

    // Roles tab label
    ["admin_tab_roles", "identical word: Roles"],
    ["roles_title", "identical word: Roles"],
  ]);

  it("no es value is identical to its en value unless explicitly allowlisted", () => {
    const unlisted: string[] = [];
    for (const [key, enVal] of Object.entries(en)) {
      if (es[key] === enVal && !IDENTICAL_ALLOWLIST.has(key)) {
        unlisted.push(key);
      }
    }
    expect(
      unlisted,
      `These keys have identical en/es values but are not on the allowlist. ` +
        `Either translate the es value or add the key to IDENTICAL_ALLOWLIST ` +
        `with a reason:\n  ${unlisted.join("\n  ")}`,
    ).toEqual([]);
  });

  it("every allowlisted key actually exists and is still identical", () => {
    for (const [key, reason] of IDENTICAL_ALLOWLIST) {
      expect(
        en,
        `allowlisted key "${key}" (${reason}) missing from en.json`,
      ).toHaveProperty(key);
      expect(
        es[key],
        `allowlisted key "${key}" (${reason}) is no longer identical, remove it from the allowlist`,
      ).toBe(en[key]);
    }
  });
});
