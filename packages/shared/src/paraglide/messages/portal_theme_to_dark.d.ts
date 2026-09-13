/**
* | output |
* | --- |
* | "Switch to dark mode" |
*
* @param {Portal_Theme_To_DarkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_theme_to_dark: ((inputs?: Portal_Theme_To_DarkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Theme_To_DarkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Theme_To_DarkInputs = {};
