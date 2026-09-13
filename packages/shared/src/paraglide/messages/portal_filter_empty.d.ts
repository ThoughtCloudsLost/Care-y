/**
* | output |
* | --- |
* | "No messages match this filter." |
*
* @param {Portal_Filter_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_filter_empty: ((inputs?: Portal_Filter_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_EmptyInputs = {};
