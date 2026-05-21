/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Panel_TerminologyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_terminology: ((inputs?: Panel_TerminologyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_TerminologyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_TerminologyInputs = {};
