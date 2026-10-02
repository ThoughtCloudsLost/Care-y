/**
* | output |
* | --- |
* | "Removing also tries to delete the webhook at Givebutter. If the webhook still appears in your Givebutter dashboard, delete it there." |
*
* @param {Admin_Donations_Remove_Webhook_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_remove_webhook_note: ((inputs?: Admin_Donations_Remove_Webhook_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Remove_Webhook_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Remove_Webhook_NoteInputs = {};
