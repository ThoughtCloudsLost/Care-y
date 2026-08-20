/**
* | output |
* | --- |
* | "Features" |
*
* @param {Demo_Feature_List_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_heading: ((inputs?: Demo_Feature_List_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Feature_List_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Feature_List_HeadingInputs = {};
