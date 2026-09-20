/**
* | output |
* | --- |
* | "Your Access" |
*
* @param {Vol_Section_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_section_access: ((inputs?: Vol_Section_AccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Section_AccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Section_AccessInputs = {};
