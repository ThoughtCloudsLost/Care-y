/**
* | output |
* | --- |
* | "Language" |
*
* @param {Language_Picker_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const language_picker_label: ((inputs?: Language_Picker_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Language_Picker_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Language_Picker_LabelInputs = {};
