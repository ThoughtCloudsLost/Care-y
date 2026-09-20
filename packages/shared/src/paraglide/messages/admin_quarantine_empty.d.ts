/**
* | output |
* | --- |
* | "No unrouted voicemails." |
*
* @param {Admin_Quarantine_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_empty: ((inputs?: Admin_Quarantine_EmptyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_EmptyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_EmptyInputs = {};
