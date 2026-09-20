/**
* | output |
* | --- |
* | "Filter name" |
*
* @param {Saved_Filter_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_name_label: ((inputs?: Saved_Filter_Name_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_Name_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_Name_LabelInputs = {};
