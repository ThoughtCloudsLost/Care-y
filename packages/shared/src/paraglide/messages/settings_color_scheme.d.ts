/**
* | output |
* | --- |
* | "Color scheme" |
*
* @param {Settings_Color_SchemeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_color_scheme: ((inputs?: Settings_Color_SchemeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Color_SchemeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Color_SchemeInputs = {};
