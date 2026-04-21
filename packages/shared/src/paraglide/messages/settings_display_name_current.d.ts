/**
* | output |
* | --- |
* | "Current name" |
*
* @param {Settings_Display_Name_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_current: ((inputs?: Settings_Display_Name_CurrentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_Name_CurrentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_Name_CurrentInputs = {};
