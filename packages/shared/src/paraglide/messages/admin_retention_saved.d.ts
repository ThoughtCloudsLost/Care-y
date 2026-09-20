/**
* | output |
* | --- |
* | "Retention setting saved" |
*
* @param {Admin_Retention_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_saved: ((inputs?: Admin_Retention_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_SavedInputs = {};
