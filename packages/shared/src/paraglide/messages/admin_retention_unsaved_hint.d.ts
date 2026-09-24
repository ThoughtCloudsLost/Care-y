/**
* | output |
* | --- |
* | "Unsaved change" |
*
* @param {Admin_Retention_Unsaved_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_unsaved_hint: ((inputs?: Admin_Retention_Unsaved_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Unsaved_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Unsaved_HintInputs = {};
