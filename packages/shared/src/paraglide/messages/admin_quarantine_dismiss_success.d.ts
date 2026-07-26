/**
* | output |
* | --- |
* | "Voicemail dismissed" |
*
* @param {Admin_Quarantine_Dismiss_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_success: ((inputs?: Admin_Quarantine_Dismiss_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Dismiss_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Dismiss_SuccessInputs = {};
