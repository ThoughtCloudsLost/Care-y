/**
* | output |
* | --- |
* | "A short name for this reply" |
*
* @param {Admin_Presets_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title_placeholder: ((inputs?: Admin_Presets_Title_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Title_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Title_PlaceholderInputs = {};
