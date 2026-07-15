/**
* | output |
* | --- |
* | "Dark" |
*
* @param {Settings_Dark_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_dark_mode: ((inputs?: Settings_Dark_ModeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Dark_ModeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Dark_ModeInputs = {};
