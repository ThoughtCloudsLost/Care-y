/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Portal_Filter_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_filter_clear: ((inputs?: Portal_Filter_ClearInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_ClearInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_ClearInputs = {};
