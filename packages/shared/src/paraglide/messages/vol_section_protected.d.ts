/**
* | output |
* | --- |
* | "How You're Protected" |
*
* @param {Vol_Section_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_section_protected: ((inputs?: Vol_Section_ProtectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Section_ProtectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Section_ProtectedInputs = {};
