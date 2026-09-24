/**
* | output |
* | --- |
* | "Categories for follow-up notes on {tickets}. Each type can require escalation, restrict visibility by role, or be marked as required when closing a {ticket}." |
*
* @param {Admin_Note_Types_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description: ((inputs: Admin_Note_Types_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_DescriptionInputs = {
    tickets: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
