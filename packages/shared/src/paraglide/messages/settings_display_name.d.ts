/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {Settings_Display_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name: ((inputs?: Settings_Display_NameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Display_NameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Display_NameInputs = {};
