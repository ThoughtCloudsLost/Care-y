/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Panel_SettingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_settings: ((inputs?: Panel_SettingsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_SettingsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_SettingsInputs = {};
