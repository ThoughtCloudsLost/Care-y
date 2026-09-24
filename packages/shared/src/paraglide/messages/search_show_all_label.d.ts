/**
* | output |
* | --- |
* | "Show all {section} results" |
*
* @param {Search_Show_All_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_show_all_label: ((inputs: Search_Show_All_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Show_All_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Show_All_LabelInputs = {
    section: NonNullable<unknown>;
};
