/**
* | output |
* | --- |
* | "Switch to dark mode" |
*
* @param {Portal_Theme_To_DarkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_theme_to_dark: ((inputs?: Portal_Theme_To_DarkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Theme_To_DarkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Theme_To_DarkInputs = {};
