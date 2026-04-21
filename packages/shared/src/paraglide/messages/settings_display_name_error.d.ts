/**
* | output |
* | --- |
* | "Could not update display name" |
*
* @param {Settings_Display_Name_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_error: ((inputs?: Settings_Display_Name_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_Name_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_Name_ErrorInputs = {};
