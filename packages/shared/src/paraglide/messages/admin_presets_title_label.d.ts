/**
* | output |
* | --- |
* | "Title" |
*
* @param {Admin_Presets_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title_label: ((inputs?: Admin_Presets_Title_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Title_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Title_LabelInputs = {};
