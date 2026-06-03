/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Admin_Tab_TerminologyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_terminology: ((inputs?: Admin_Tab_TerminologyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_TerminologyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_TerminologyInputs = {};
