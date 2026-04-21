/**
* | output |
* | --- |
* | "Display name updated" |
*
* @param {Settings_Display_Name_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_saved: ((inputs?: Settings_Display_Name_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_Name_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_Name_SavedInputs = {};
