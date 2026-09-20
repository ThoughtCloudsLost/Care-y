/**
* | output |
* | --- |
* | "Current name" |
*
* @param {Settings_Display_Name_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_current: ((inputs?: Settings_Display_Name_CurrentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_Name_CurrentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_Name_CurrentInputs = {};
