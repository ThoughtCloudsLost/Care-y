/**
* | output |
* | --- |
* | "Switch to light mode" |
*
* @param {Portal_Theme_To_LightInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_theme_to_light: ((inputs?: Portal_Theme_To_LightInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Theme_To_LightInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Theme_To_LightInputs = {};
