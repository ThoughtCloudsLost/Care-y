/**
* | output |
* | --- |
* | "This will permanently delete the recording. Are you sure?" |
*
* @param {Admin_Quarantine_Dismiss_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_confirm: ((inputs?: Admin_Quarantine_Dismiss_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Dismiss_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Dismiss_ConfirmInputs = {};
