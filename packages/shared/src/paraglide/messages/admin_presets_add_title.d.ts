/**
* | output |
* | --- |
* | "New Saved Reply" |
*
* @param {Admin_Presets_Add_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_add_title: ((inputs?: Admin_Presets_Add_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Add_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Add_TitleInputs = {};
