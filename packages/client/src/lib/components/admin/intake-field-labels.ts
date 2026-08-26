/**
 * Shared label helpers for intake field types and roles.
 * Extracted from IntakeFormEditor and IntakeFieldConfigSheet to deduplicate.
 * Calls paraglide message functions, so this is a plain TS module.
 */

import type { IntakeFieldType, IntakeFieldRole } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";

/** Human-readable label for an intake field type. */
export function getFieldTypeLabel(type: IntakeFieldType): string {
  switch (type) {
    case "text":
      return m.intake_forms_field_type_text();
    case "textarea":
      return m.intake_forms_field_type_textarea();
    case "select":
      return m.intake_forms_field_type_select();
    case "multiselect":
      return m.intake_forms_field_type_multiselect();
    case "checkbox":
      return m.intake_forms_field_type_checkbox();
    case "availability":
      return m.intake_forms_field_type_availability();
    case "date":
      return m.intake_forms_field_type_date();
    case "pageBreak":
      return m.intake_forms_field_type_page_break();
  }
}

/** Human-readable description for an intake field type (add-field picker). */
export function getFieldTypeDesc(type: IntakeFieldType): string {
  switch (type) {
    case "text":
      return m.intake_forms_field_type_text_desc();
    case "textarea":
      return m.intake_forms_field_type_textarea_desc();
    case "select":
      return m.intake_forms_field_type_select_desc();
    case "multiselect":
      return m.intake_forms_field_type_multiselect_desc();
    case "checkbox":
      return m.intake_forms_field_type_checkbox_desc();
    case "availability":
      return m.intake_forms_field_type_availability_desc();
    case "date":
      return m.intake_forms_field_type_date_desc();
    case "pageBreak":
      return m.intake_forms_field_type_page_break_desc();
  }
}

/** Human-readable label for an intake field role. */
export function getRoleLabel(role: IntakeFieldRole): string {
  switch (role) {
    case "queue-routing":
      return m.intake_forms_config_role_queue_routing();
    case "urgency":
      return m.intake_forms_config_role_urgency();
    case "escalation":
      return m.intake_forms_config_role_escalation();
    case "phone-contact":
      return m.intake_forms_config_role_phone_contact();
    case "email-contact":
      return m.intake_forms_config_role_email_contact();
    case "real-name":
      return m.intake_forms_config_role_real_name();
    case "pronouns":
      return m.intake_forms_config_role_pronouns();
    case "contact-safety":
      return m.intake_forms_config_role_contact_safety();
    case "consent":
      return m.intake_forms_config_role_consent();
    case "language-preference":
      return m.intake_forms_config_role_language_preference();
  }
}
