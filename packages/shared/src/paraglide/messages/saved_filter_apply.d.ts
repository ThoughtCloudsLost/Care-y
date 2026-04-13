/**
* | output |
* | --- |
* | "Apply saved filter" |
*
* @param {Saved_Filter_ApplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_apply: ((inputs?: Saved_Filter_ApplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_ApplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_ApplyInputs = {};
