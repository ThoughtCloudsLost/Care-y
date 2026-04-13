/**
* | output |
* | --- |
* | "e.g. Urgent Housing" |
*
* @param {Saved_Filter_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_name_placeholder: ((inputs?: Saved_Filter_Name_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_Name_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_Name_PlaceholderInputs = {};
