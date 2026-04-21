/**
* | output |
* | --- |
* | "New display name" |
*
* @param {Settings_Display_Name_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_new: ((inputs?: Settings_Display_Name_NewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_Name_NewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_Name_NewInputs = {};
