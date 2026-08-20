/**
* | output |
* | --- |
* | "Handbook features" |
*
* @param {Demo_Feature_List_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_label: ((inputs?: Demo_Feature_List_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Feature_List_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Feature_List_LabelInputs = {};
