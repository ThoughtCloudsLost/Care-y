/**
* | output |
* | --- |
* | "Save filter" |
*
* @param {Saved_Filter_Save_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_save_label: ((inputs?: Saved_Filter_Save_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_Save_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_Save_LabelInputs = {};
