/**
* | output |
* | --- |
* | "Your phone service is managed for you. Contact your admin for changes." |
*
* @param {Admin_Telephony_Managed_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_managed_note: ((inputs?: Admin_Telephony_Managed_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Managed_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Managed_NoteInputs = {};
