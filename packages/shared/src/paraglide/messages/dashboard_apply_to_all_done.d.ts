/**
* | output |
* | --- |
* | "Filters applied to all sections" |
*
* @param {Dashboard_Apply_To_All_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_done: ((inputs?: Dashboard_Apply_To_All_DoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Apply_To_All_DoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Apply_To_All_DoneInputs = {};
