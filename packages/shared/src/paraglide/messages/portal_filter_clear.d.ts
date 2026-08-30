/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Portal_Filter_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_filter_clear: ((inputs?: Portal_Filter_ClearInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_ClearInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_ClearInputs = {};
